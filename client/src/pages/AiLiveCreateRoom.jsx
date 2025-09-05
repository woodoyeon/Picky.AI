import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AiLiveCreateRoom() {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState("");

  const handleCreate = () => {
    if (!roomName.trim()) return alert("방 이름을 입력하세요.");
    navigate(`/ai-live-commerce/live/${encodeURIComponent(roomName)}`);
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">🛠 방송 방 만들기</h1>
      <input
        type="text"
        placeholder="방 이름"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        className="border px-3 py-2 w-full mb-4 rounded"
      />
      <button
        onClick={handleCreate}
        className="bg-green-600 text-white px-6 py-2 rounded-lg"
      >
        📡 방송 시작
      </button>
    </div>
  );
}
