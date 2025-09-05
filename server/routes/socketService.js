// routes/aiLiveCommerceSocket.js
import { Server } from 'socket.io';

export default function initAiLiveCommerceSocket(server) {
  const io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log("📡 라이브커머스 시청자 접속");

    // 채팅 메시지
    socket.on("chat-message", (msg) => {
      io.emit("chat-message", msg);
    });

    // 시청자 수 카운트 예시
    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      const viewers = io.sockets.adapter.rooms.get(roomId)?.size || 0;
      io.to(roomId).emit("viewer-count", viewers);
    });

    socket.on("disconnect", () => {
      console.log("❌ 시청자 퇴장");
    });
  });

  return io;
}
