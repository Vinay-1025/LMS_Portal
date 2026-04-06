import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocketContext = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5000', {
        query: { userId: user._id }
      });

      setSocket(newSocket);

      newSocket.on('receive_message', (message) => {
        // Only show notification if message is NOT from the user themselves
        if (message.sender !== user._id && message.sender?._id !== user._id) {
          toast(`New message: ${message.content.substring(0, 30)}${message.content.length > 30 ? '...' : ''}`, {
            icon: '💬',
            duration: 4000,
            position: 'top-right',
            style: {
              background: 'var(--bg2)',
              color: 'var(--text)',
              border: '1px solid var(--accent)',
              borderRadius: '12px'
            }
          });
        }
      });

      return () => newSocket.close();
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
