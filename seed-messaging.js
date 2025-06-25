const mongoose = require('mongoose');
const Message = require('./models/Message');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/nu3pbnb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function seedMessages() {
  try {
    // Get some users to create messages between
    const users = await User.find().limit(10);
    if (users.length < 6) {
      console.log('Need at least 6 users to create conversations');
      return;
    }

    // Clear existing messages
    await Message.deleteMany({});
    console.log('Cleared existing messages');

    // --- Conversation 1: users[0] <-> users[1] ---
    const conv1 = [
      {
        sender: users[0]._id,
        recipient: users[1]._id,
        subject: 'Booking Inquiry',
        content: 'Hi! Is your property available next weekend?',
        messageType: 'regular',
        read: true
      },
      {
        sender: users[1]._id,
        recipient: users[0]._id,
        subject: 'Re: Booking Inquiry',
        content: 'Yes, it is available. Would you like to book?',
        messageType: 'reply',
        read: true
      },
      {
        sender: users[0]._id,
        recipient: users[1]._id,
        subject: 'Re: Booking Inquiry',
        content: 'Yes, please! Can you send me the details?',
        messageType: 'reply',
        read: false
      },
      {
        sender: users[1]._id,
        recipient: users[0]._id,
        subject: 'Re: Booking Inquiry',
        content: 'Sure, here are the details for your booking.',
        messageType: 'reply',
        read: false
      },
      {
        sender: users[0]._id,
        recipient: users[1]._id,
        subject: 'Re: Booking Inquiry',
        content: 'Thank you! I have completed the booking.',
        messageType: 'reply',
        read: false
      }
    ];

    // --- Conversation 2: users[2] <-> users[3] ---
    const conv2 = [
      {
        sender: users[2]._id,
        recipient: users[3]._id,
        subject: 'Host Question',
        content: 'Hi, I am interested in becoming a host. What should I know?',
        messageType: 'regular',
        read: true
      },
      {
        sender: users[3]._id,
        recipient: users[2]._id,
        subject: 'Re: Host Question',
        content: 'Welcome! You should prepare great photos and a detailed description.',
        messageType: 'reply',
        read: true
      },
      {
        sender: users[2]._id,
        recipient: users[3]._id,
        subject: 'Re: Host Question',
        content: 'Thank you! How do I set my price?',
        messageType: 'reply',
        read: false
      },
      {
        sender: users[3]._id,
        recipient: users[2]._id,
        subject: 'Re: Host Question',
        content: 'You can set your price in the listing form. Consider local competition.',
        messageType: 'reply',
        read: false
      },
      {
        sender: users[2]._id,
        recipient: users[3]._id,
        subject: 'Re: Host Question',
        content: 'Got it, thanks for your help!',
        messageType: 'reply',
        read: false
      }
    ];

    // --- Conversation 3: users[4] <-> users[5] ---
    const conv3 = [
      {
        sender: users[4]._id,
        recipient: users[5]._id,
        subject: 'Payment Issue',
        content: 'Hi, I had an issue with my payment.',
        messageType: 'regular',
        read: true
      },
      {
        sender: users[5]._id,
        recipient: users[4]._id,
        subject: 'Re: Payment Issue',
        content: 'Sorry to hear that! Can you provide more details?',
        messageType: 'reply',
        read: true
      },
      {
        sender: users[4]._id,
        recipient: users[5]._id,
        subject: 'Re: Payment Issue',
        content: 'The payment was declined by my bank.',
        messageType: 'reply',
        read: false
      },
      {
        sender: users[5]._id,
        recipient: users[4]._id,
        subject: 'Re: Payment Issue',
        content: 'Please try another card or contact your bank.',
        messageType: 'reply',
        read: false
      },
      {
        sender: users[4]._id,
        recipient: users[5]._id,
        subject: 'Re: Payment Issue',
        content: 'I will do that, thank you!',
        messageType: 'reply',
        read: false
      },
      {
        sender: users[5]._id,
        recipient: users[4]._id,
        subject: 'Re: Payment Issue',
        content: 'You are welcome. Let us know if you need more help.',
        messageType: 'reply',
        read: false
      }
    ];

    // Add timestamps to all messages, spread over the last 10 days
    const now = Date.now();
    let allMessages = [];
    [conv1, conv2, conv3].forEach((conv, idx) => {
      conv.forEach((msg, mIdx) => {
        allMessages.push({
          ...msg,
          createdAt: new Date(now - ((idx * 3 + mIdx) * 24 * 60 * 60 * 1000)),
          updatedAt: new Date(now - ((idx * 3 + mIdx) * 24 * 60 * 60 * 1000))
        });
      });
    });

    await Message.insertMany(allMessages);
    console.log(`Created ${allMessages.length} conversation messages`);

    console.log('Conversation seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding messages:', error);
    process.exit(1);
  }
}

seedMessages(); 