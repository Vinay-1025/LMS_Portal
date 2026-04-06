const { Server } = require('socket.io');
const Message = require('./models/Message');
const Channel = require('./models/Channel');

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", 
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.handshake.query.userId;
    console.log('A user connected:', socket.id, 'User ID:', userId);

    if (userId) {
      socket.join(userId);
      try {
        const userChannels = await Channel.find({ members: userId });
        userChannels.forEach(channel => {
          socket.join(channel._id.toString());
        });
      } catch (err) {
        console.error('Error joining rooms:', err);
      }
    }

    socket.on('join_room', (roomId) => {
      socket.join(roomId);
    });

    socket.on('send_message', async (data) => {
      try {
        const { sender, content, channel, recipient, messageType } = data;
        
        const newMessage = new Message({
          sender,
          content,
          channel,
          recipient,
          messageType,
          status: 'sent'
        });

        await newMessage.save();
        const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'name email');

        const room = channel || recipient;
        io.to(room).emit('receive_message', populatedMessage);
        
        if (channel) {
          await Channel.findByIdAndUpdate(channel, { lastMessage: newMessage._id });
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    // New: Handle message receipt (Delivered)
    socket.on('message_received', async ({ messageId, senderId }) => {
      try {
        const message = await Message.findByIdAndUpdate(messageId, { status: 'delivered' }, { new: true });
        if (message) {
          io.to(senderId).emit('message_status_update', { messageId, status: 'delivered' });
        }
      } catch (err) {
        console.error('Error updating delivery status:', err);
      }
    });

    // New: Mark all messages in a room as read
    socket.on('mark_as_read', async ({ roomId, userId }) => {
      try {
        // Update all messages in this room not sent by this user
        const result = await Message.updateMany(
          { 
            $or: [{ channel: roomId }, { recipient: userId, sender: roomId }, { recipient: roomId, sender: userId }],
            sender: { $ne: userId },
            status: { $ne: 'read' }
          },
          { status: 'read' }
        );

        if (result.modifiedCount > 0) {
          // Notify the other party (either the channel room or the specific sender)
          socket.to(roomId).emit('messages_read_update', { roomId, userId });
        }
      } catch (err) {
        console.error('Error marking as read:', err);
      }
    });

    socket.on('typing', (data) => {
      const { room, user } = data;
      socket.to(room).emit('user_typing', { user, room });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

module.exports = initSocket;
