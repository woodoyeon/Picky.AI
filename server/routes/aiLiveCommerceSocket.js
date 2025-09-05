// server/routes/aiLiveCommerceSocket.js
import { Server } from 'socket.io';

export default function initAiLiveCommerceSocket(server) {
  const io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log("📡 시청자 접속:", socket.id);

    socket.on("chat-message", (msg) => {
      io.emit("chat-message", msg);
    });

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      const viewers = io.sockets.adapter.rooms.get(roomId)?.size || 0;
      io.to(roomId).emit("viewer-count", viewers);
    });

    socket.on("start-live", (roomId) => {
      io.to(roomId).emit("live-status", true);
    });

    socket.on("end-live", (roomId) => {
      io.to(roomId).emit("live-status", false);
    });

    socket.on("disconnect", () => {
      console.log("❌ 시청자 퇴장:", socket.id);
    });
  });

  return io;
}
