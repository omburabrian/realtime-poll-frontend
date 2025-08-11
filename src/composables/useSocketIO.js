import { io } from "socket.io-client";

let socketInstance = null;

export function useSocketIO() {
  if (!socketInstance) {
    const user = JSON.parse(localStorage.getItem("user"));

    // Connect to the Node.js/Socket.IO server
    // The URL must point to your new backend.
    socketInstance = io("http://localhost:3001", { // Make sure this matches your backend port
      // Send auth token with the connection request
      auth: {
        token: user?.token,
      },
    });

    socketInstance.on('connect', () => {
      console.log('Connected to Socket.IO server!');
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server.');
    });

    socketInstance.on('connect_error', (err) => {
        console.error('Socket.IO connection error:', err.message);
    });
  }

  return { socket: socketInstance };
}