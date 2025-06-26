import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket} from 'net';  // this is for clients
import type { Server as IOServer } from 'socket.io'; // 👈 for the server instance
import type { NextApiResponse } from 'next';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: NextApiResponse['socket'] & {
    server: HTTPServer & {
      io: IOServer;
    };
  };
};
