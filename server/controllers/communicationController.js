const Message = require('../models/Message');
const Channel = require('../models/Channel');
const User = require('../models/User');

// Get all channels/DMs for a user
exports.getUserChannels = async (req, res) => {
  try {
    const userId = req.user._id;
    const channels = await Channel.find({
      $or: [
        { members: userId },
        { type: 'broadcast' }
      ]
    }).populate('lastMessage').sort({ updatedAt: -1 });

    res.json(channels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get message history for a channel/DM
exports.getMessages = async (req, res) => {
  try {
    const { channelId, recipientId } = req.query;
    let query = {};
    
    if (channelId) {
      query = { channel: channelId };
    } else if (recipientId) {
      query = {
        $or: [
          { sender: req.user._id, recipient: recipientId },
          { sender: recipientId, recipient: req.user._id }
        ]
      };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: 1 })
      .limit(50); // Add pagination logic if needed

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new channel
exports.createChannel = async (req, res) => {
  try {
    const { name, type, members, courseId } = req.body;
    const newChannel = new Channel({
      name,
      type,
      members: [...members, req.user._id],
      course: courseId
    });

    const savedChannel = await newChannel.save();
    res.status(201).json(savedChannel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get or Create Direct Message channel
exports.getOrCreateDM = async (req, res) => {
  const { recipientId } = req.body;
  const senderId = req.user._id;

  try {
    // 1. Check if a DM already exists
    let channel = await Channel.findOne({
      type: 'direct',
      members: { $all: [senderId, recipientId], $size: 2 }
    }).populate('members', 'name email role');

    // 2. If not, create a new one
    if (!channel) {
      const recipient = await User.findById(recipientId);
      if (!recipient) {
        return res.status(404).json({ message: 'Recipient not found' });
      }

      channel = new Channel({
        name: `${req.user.name} & ${recipient.name}`,
        type: 'direct',
        members: [senderId, recipientId]
      });

      await channel.save();
      channel = await Channel.findById(channel._id).populate('members', 'name email role');
    }

    res.json(channel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

