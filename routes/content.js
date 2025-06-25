const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const { auth } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Get all content (admin only)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const { section, language, page = 1, limit = 20 } = req.query;
    const query = {};
    
    if (section) query.section = section;
    if (language) query.language = language;
    
    const skip = (page - 1) * limit;
    
    const content = await Content.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('history.modifiedBy', 'name email');
    
    const total = await Content.countDocuments(query);
    
    res.json({
      content,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ message: 'Error fetching content' });
  }
});

// Get content by key and language
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const language = req.query.language || 'en';
    
    const content = await Content.getContent(key, language);
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    res.json(content);
  } catch (error) {
    console.error('Get content by key error:', error);
    res.status(500).json({ message: 'Error fetching content' });
  }
});

// Get content by section
router.get('/section/:section', async (req, res) => {
  try {
    const { section } = req.params;
    const language = req.query.language || 'en';
    
    const content = await Content.getSectionContent(section, language);
    res.json(content);
  } catch (error) {
    console.error('Get section content error:', error);
    res.status(500).json({ message: 'Error fetching section content' });
  }
});

// Create new content (admin only)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { key, title, content, type, section, language, metadata } = req.body;
    
    // Check if content with same key and language already exists
    const existingContent = await Content.findOne({ key, language });
    if (existingContent) {
      return res.status(400).json({ message: 'Content with this key and language already exists' });
    }
    
    const newContent = new Content({
      key,
      title,
      content,
      type: type || 'html',
      section,
      language: language || 'en',
      metadata: {
        ...metadata,
        author: req.user.id,
        lastModified: new Date()
      }
    });
    
    await newContent.save();
    
    res.status(201).json(newContent);
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({ message: 'Error creating content' });
  }
});

// Update content (admin only)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { title, content, type, isActive, metadata, comment } = req.body;
    
    const contentDoc = await Content.findById(req.params.id);
    if (!contentDoc) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    // Add current version to history before updating
    contentDoc.addToHistory(req.user.id, comment);
    
    // Update fields
    if (title !== undefined) contentDoc.title = title;
    if (content !== undefined) contentDoc.content = content;
    if (type !== undefined) contentDoc.type = type;
    if (isActive !== undefined) contentDoc.isActive = isActive;
    if (metadata) {
      contentDoc.metadata = { ...contentDoc.metadata, ...metadata };
    }
    
    await contentDoc.save();
    
    res.json(contentDoc);
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ message: 'Error updating content' });
  }
});

// Delete content (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    await Content.findByIdAndDelete(req.params.id);
    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ message: 'Error deleting content' });
  }
});

// Get content history (admin only)
router.get('/:id/history', auth, adminAuth, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id)
      .populate('history.modifiedBy', 'name email');
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    res.json(content.history);
  } catch (error) {
    console.error('Get content history error:', error);
    res.status(500).json({ message: 'Error fetching content history' });
  }
});

// Restore content version (admin only)
router.post('/:id/restore/:version', auth, adminAuth, async (req, res) => {
  try {
    const { version } = req.params;
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    const historyEntry = content.history.find(h => h.version === parseInt(version));
    if (!historyEntry) {
      return res.status(404).json({ message: 'Version not found' });
    }
    
    // Add current version to history
    content.addToHistory(req.user.id, `Restored from version ${version}`);
    
    // Restore the old content
    content.content = historyEntry.content;
    await content.save();
    
    res.json(content);
  } catch (error) {
    console.error('Restore content error:', error);
    res.status(500).json({ message: 'Error restoring content' });
  }
});

// Bulk update content (admin only)
router.post('/bulk-update', auth, adminAuth, async (req, res) => {
  try {
    const { updates } = req.body;
    const results = [];
    
    for (const update of updates) {
      try {
        const content = await Content.findById(update.id);
        if (!content) {
          results.push({ id: update.id, success: false, error: 'Content not found' });
          continue;
        }
        
        content.addToHistory(req.user.id, update.comment || 'Bulk update');
        
        if (update.title !== undefined) content.title = update.title;
        if (update.content !== undefined) content.content = update.content;
        if (update.isActive !== undefined) content.isActive = update.isActive;
        
        await content.save();
        results.push({ id: update.id, success: true });
      } catch (error) {
        results.push({ id: update.id, success: false, error: error.message });
      }
    }
    
    res.json({ results });
  } catch (error) {
    console.error('Bulk update content error:', error);
    res.status(500).json({ message: 'Error performing bulk update' });
  }
});

module.exports = router; 