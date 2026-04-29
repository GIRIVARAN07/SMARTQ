const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join a service room to receive updates for that service
    socket.on('join-service', (serviceId) => {
      socket.join(`service-${serviceId}`);
      console.log(`📡 Socket ${socket.id} joined service-${serviceId}`);
    });

    // Leave a service room
    socket.on('leave-service', (serviceId) => {
      socket.leave(`service-${serviceId}`);
      console.log(`📡 Socket ${socket.id} left service-${serviceId}`);
    });

    // Join user-specific room for notifications
    socket.on('join-user', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`👤 Socket ${socket.id} joined user-${userId}`);
    });

    // Leave user room
    socket.on('leave-user', (userId) => {
      socket.leave(`user-${userId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
