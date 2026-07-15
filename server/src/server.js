import "dotenv/config";
import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initSockets } from "./sockets/index.js";

const PORT = process.env.PORT || 5001;

await connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

initSockets(io);

server.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
});
