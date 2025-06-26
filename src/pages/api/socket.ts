import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';
import { NextApiResponseServerIO } from '@/types/next';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    console.log('⚡ New Socket.IO server...');
    const io = new SocketIOServer(res.socket.server as NetServer, {
      path: '/api/socketio',
    });

    io.on('connection', (socket) => {
      console.log('✅ Socket connected:', socket.id);

      socket.on('send-message', (data) => {
        socket.broadcast.emit('receive-message', data);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
}
