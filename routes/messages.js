const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Send a message
router.post('/', auth, async (req, res) => {
  try {
    const { recipient, content, subject, booking, listing, messageType, parentMessage } = req.body;
    
    if (!recipient || !content) {
      return res.status(400).json({ message: req.t('errors.validation') });
    }
    
    const message = new Message({
      sender: req.user.id,
      recipient,
      content,
      subject: subject || '',
      booking,
      listing,
      messageType: messageType || 'regular',
      parentMessage
    });
    
    await message.save();
    
    // Populate sender and recipient details
    await message.populate('sender', 'name email');
    await message.populate('recipient', 'name email');
    if (parentMessage) {
      await message.populate('parentMessage');
    }
    
    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Get user's inbox (received messages)
router.get('/inbox', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { recipient: req.user.id };
    if (unreadOnly === 'true') {
      query.read = false;
    }
    
    const messages = await Message.find(query)
      .populate('sender', 'name email')
      .populate('recipient', 'name email')
      .populate('parentMessage', 'subject content')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Message.countDocuments(query);
    
    res.json({
      message: 'Inbox retrieved successfully',
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Get inbox error:', err);
    res.status(500).json({ message: 'Failed to retrieve inbox' });
  }
});

// Get user's sent messages
router.get('/sent', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const messages = await Message.find({ sender: req.user.id })
      .populate('sender', 'name email')
      .populate('recipient', 'name email')
      .populate('parentMessage', 'subject content')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Message.countDocuments({ sender: req.user.id });
    
    res.json({
      message: 'Sent messages retrieved successfully',
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Get sent messages error:', err);
    res.status(500).json({ message: 'Failed to retrieve sent messages' });
  }
});

// Get conversation with another user
router.get('/with/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, recipient: userId },
        { sender: userId, recipient: req.user.id }
      ]
    })
    .populate('sender', 'name email')
    .populate('recipient', 'name email')
    .populate('parentMessage', 'subject content')
    .sort('createdAt');
    
    res.json({
      message: 'Conversation retrieved successfully',
      data: messages
    });
  } catch (err) {
    console.error('Get conversation error:', err);
    res.status(500).json({ message: 'Failed to retrieve conversation' });
  }
});

// Get all conversations for current user
router.get('/conversations', auth, async (req, res) => {
  try {
    // Get unique conversation partners
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user.id },
            { recipient: req.user.id }
          ]
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', req.user.id] },
              '$recipient',
              '$sender'
            ]
          },
          lastMessage: { $last: '$$ROOT' },
          messageCount: { $sum: 1 },
          unreadCount: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ['$recipient', req.user.id] },
                    { $eq: ['$read', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);
    
    // Populate user details for each conversation
    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const user = await User.findById(conv._id).select('name email');
        return {
          ...conv,
          user
        };
      })
    );
    
    res.json({
      message: 'Conversations retrieved successfully',
      data: populatedConversations
    });
  } catch (err) {
    console.error('Get conversations error:', err);
    res.status(500).json({ message: 'Failed to retrieve conversations' });
  }
});

// Get all users for messaging
router.get('/users/available', auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select('name email')
      .sort('name');
    
    res.json({
      message: 'Available users retrieved successfully',
      data: users
    });
  } catch (err) {
    console.error('Get available users error:', err);
    res.status(500).json({ message: 'Failed to retrieve available users' });
  }
});

// Get unread messages count for current user
router.get('/unread-count', auth, async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({
      recipient: req.user.id,
      read: false
    });
    
    res.json({ unreadCount });
  } catch (err) {
    console.error('Get unread count error:', err);
    res.status(500).json({ message: 'Failed to get unread count' });
  }
});

// Get a single message by ID
router.get('/:messageId', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId)
      .populate('sender', 'name email')
      .populate('recipient', 'name email')
      .populate('parentMessage', 'subject content sender recipient')
      .populate('forwardedFrom', 'subject content sender recipient');
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user is authorized to view this message
    if (message.sender._id.toString() !== req.user.id && 
        message.recipient._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this message' });
    }
    
    // Mark as read if recipient is viewing
    if (message.recipient._id.toString() === req.user.id && !message.read) {
      message.read = true;
      await message.save();
    }
    
    res.json({
      message: 'Message retrieved successfully',
      data: message
    });
  } catch (err) {
    console.error('Get message error:', err);
    res.status(500).json({ message: 'Failed to retrieve message' });
  }
});

// Delete a message
router.delete('/:messageId', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user is authorized to delete this message
    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }
    
    await Message.findByIdAndDelete(req.params.messageId);
    
    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error('Delete message error:', err);
    res.status(500).json({ message: 'Failed to delete message' });
  }
});

// Mark messages as read
router.put('/read/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    await Message.updateMany(
      {
        sender: userId,
        recipient: req.user.id,
        read: false
      },
      { read: true }
    );
    
    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    console.error('Mark as read error:', err);
    res.status(500).json({ message: 'Failed to mark messages as read' });
  }
});

// Mark a single message as read
router.put('/:messageId/read', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    if (message.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to mark this message as read' });
    }
    
    message.read = true;
    await message.save();
    
    res.json({ message: 'Message marked as read' });
  } catch (err) {
    console.error('Mark message as read error:', err);
    res.status(500).json({ message: 'Failed to mark message as read' });
  }
});

module.exports = router; 