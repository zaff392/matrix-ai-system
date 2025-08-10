import { Server } from 'socket.io';

export const setupSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('🟢 Client connected:', socket.id);
    
    // Send welcome message
    socket.emit('message', {
      type: 'system_status',
      payload: {
        status: 'connected',
        message: 'Welcome to Matrix AI System Socket.IO Server!',
        timestamp: new Date().toISOString(),
        socketId: socket.id
      },
      timestamp: Date.now(),
      id: `welcome_${socket.id}`
    });

    // Handle chat messages
    socket.on('message', (msg: { type: string; payload: any; timestamp: number; id: string }) => {
      console.log('📨 Message received:', msg);
      
      // Echo back the message for testing
      socket.emit('message', {
        type: 'echo',
        payload: msg.payload,
        timestamp: Date.now(),
        id: `echo_${msg.id}`
      });

      // Handle specific message types
      switch (msg.type) {
        case 'chat_message':
          console.log('💬 Chat message:', msg.payload);
          
          // Simulate agent typing
          socket.emit('typing_start', {
            agentId: msg.payload.agentId,
            timestamp: Date.now()
          });

          // Simulate agent response after a delay
          setTimeout(() => {
            socket.emit('typing_end', {
              agentId: msg.payload.agentId,
              timestamp: Date.now()
            });

            socket.emit('agent_response', {
              agentId: msg.payload.agentId,
              response: `Echo: ${msg.payload.message}`,
              timestamp: new Date().toISOString()
            });
          }, 2000);
          break;
          
        default:
          console.log('📨 Unknown message type:', msg.type);
      }
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log('🔴 Client disconnected:', socket.id, 'Reason:', reason);
    });
  });
};