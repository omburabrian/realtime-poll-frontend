import { io } from "socket.io-client";

let socketInstance = null;

export function useSocketIO() {
  if (!socketInstance) {
    const user = JSON.parse(localStorage.getItem("user"));

    //  ToDo:  Am I not using the same port for both the backend REST API and messaging?
    //  Connect to the Node.js/Socket.IO server
    //  The URL must point to your new backend.

    //  Make sure this matches the backend port
    //  socketInstance = io("http://localhost:3001", {
    socketInstance = io("http://localhost:3201", {
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