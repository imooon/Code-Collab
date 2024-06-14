import io from 'socket.io-client';

const socket = io(process.env.NODE_ENV === 'production' 
  ? 'https://code-collab-3q14.onrender.com' 
  : 'http://localhost:5051', {
  withCredentials: true,
});

export default socket;
