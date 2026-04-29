import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const socketUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:5000' 
      : window.location.origin;

    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('🔌 Socket connected:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Join user room when authenticated
  useEffect(() => {
    if (socket && user) {
      socket.emit('join-user', user._id);

      socket.on('notification', (data) => {
        setNotifications((prev) => [
          { ...data, id: Date.now(), read: false, timestamp: new Date() },
          ...prev
        ].slice(0, 50));
      });

      return () => {
        socket.emit('leave-user', user._id);
        socket.off('notification');
      };
    }
  }, [socket, user]);

  const joinService = (serviceId) => {
    if (socket) socket.emit('join-service', serviceId);
  };

  const leaveService = (serviceId) => {
    if (socket) socket.emit('leave-service', serviceId);
  };

  const clearNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        notifications,
        joinService,
        leaveService,
        clearNotification,
        markAllRead
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
