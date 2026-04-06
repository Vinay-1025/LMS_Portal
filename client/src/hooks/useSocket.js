import { useEffect, useState, useCallback } from 'react';
import { useSocketContext } from '../context/SocketContext';
import { useSelector } from 'react-redux';

export const useSocket = (roomId) => {
  const { socket } = useSocketContext();
  const { user } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);

  const markAsRead = useCallback((targetRoomId) => {
    if (socket && targetRoomId && user) {
      socket.emit('mark_as_read', { roomId: targetRoomId, userId: user._id });
    }
  }, [socket, user]);

  useEffect(() => {
    if (!socket) return;

    if (roomId) {
      socket.emit('join_room', roomId);
      // Auto-mark as read when joining a room
      markAsRead(roomId);
    }

    const handleReceiveMessage = (message) => {
      // If the message is for the current room
      if (message.channel === roomId || (!message.channel && (message.recipient === roomId || message.sender?._id === roomId || message.sender === roomId))) {
        setMessages((prev) => [...prev, message]);

        // Acknowledge receipt if message is NOT from us
        if (message.sender?._id !== user?._id && message.sender !== user?._id) {
          socket.emit('message_received', { 
            messageId: message._id, 
            senderId: message.sender?._id || message.sender 
          });

          // If this is the active room, also mark it as read immediately
          if (roomId) {
            markAsRead(roomId);
          }
        }
      }
    };

    const handleStatusUpdate = ({ messageId, status }) => {
      setMessages((prev) => 
        prev.map(msg => msg._id === messageId ? { ...msg, status } : msg)
      );
    };

    const handleReadUpdate = ({ roomId: readRoomId, userId: readerId }) => {
      // If someone read messages in our current room and it's not us
      if (readRoomId === roomId && readerId !== user?._id) {
        setMessages((prev) => 
          prev.map(msg => (msg.sender?._id === user?._id || msg.sender === user?._id) ? { ...msg, status: 'read' } : msg)
        );
      }
    };

    const handleUserTyping = (data) => {
      if (data.room === roomId) {
        setTypingUser(data.user);
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_status_update', handleStatusUpdate);
    socket.on('messages_read_update', handleReadUpdate);
    socket.on('user_typing', handleUserTyping);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_status_update', handleStatusUpdate);
      socket.off('messages_read_update', handleReadUpdate);
      socket.off('user_typing', handleUserTyping);
    };
  }, [socket, roomId, user?._id, markAsRead]);

  const sendMessage = (data) => {
    if (socket) {
      socket.emit('send_message', data);
    }
  };

  const emitTyping = (data) => {
    if (socket) {
      socket.emit('typing', { ...data, room: roomId });
    }
  };

  return { socket, messages, setMessages, sendMessage, emitTyping, isTyping, typingUser, markAsRead };
};
