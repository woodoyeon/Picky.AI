import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL || "http://localhost:5000";
const DID_API_KEY = import.meta.env.VITE_DID_API_KEY;

export default function AiLiveRoom() {
  const { roomName } = useParams();
  const videoRef = useRef(null);
  const socketRef = useRef(null); // ✅ 소켓 재사용
  const [sessionId, setSessionId] = useState("");
  const [scriptText, setScriptText] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [product] = useState({
    name: "여름 린넨 셔츠",
    price: "₩39,000",
    image: "https://your-cdn.com/linen-shirt.jpg",
    buyLink: "https://your-shop.com/product/linen-shirt"
  });

  // ✅ 채팅 연결 (한 번만)
  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);

    socketRef.current.on("chat-message", (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // ✅ 채팅 전송 (기존 연결 재사용)
  const sendChat = () => {
    if (!chatInput.trim()) return;
    socketRef.current.emit("chat-message", chatInput);
    setChatInput("");
  };

  // ✅ 방송 시작 (세션 생성 + WebRTC 연결)
  useEffect(() => {
    let pc;

    const initLive = async () => {
      try {
        // 1. AI 세션 생성
        const res = await axios.post("/api/live-commerce/create-session", {
          imageUrl: "https://your-cdn.com/ai-host.jpg"
        });

        const newSessionId = res.data.sessionId;
        setSessionId(newSessionId);

        // 2. WebRTC 연결
        pc = new RTCPeerConnection();
        pc.ontrack = (event) => {
          videoRef.current.srcObject = event.streams[0];
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // 3. D-ID에 SDP 전송
        const sdpRes = await axios.post(
          `https://api.d-id.com/talks/streams/${newSessionId}/sdp`,
          { offer },
          {
            headers: {
              Authorization: `Basic ${btoa(DID_API_KEY + ':')}`,
              'Content-Type': 'application/json'
            }
          }
        );

        await pc.setRemoteDescription(sdpRes.data.answer);
      } catch (err) {
        console.error("❌ 라이브 초기화 실패:", err);
        alert("AI 캐릭터를 불러오는 데 실패했습니다.");
      }
    };

    initLive();

    return () => {
      if (pc) {
        pc.close();
      }
      // TODO: 필요 시 백엔드에서 D-ID 세션 종료 API 호출
    };
  }, []);

  // ✅ 대본 전송 → AI 말하기
  const sendScript = async () => {
    if (!scriptText.trim() || !sessionId) return;
    try {
      await axios.post("/api/live-commerce/send-script", {
        sessionId,
        text: scriptText
      });
      setScriptText("");
    } catch (err) {
      console.error("❌ 대본 전송 실패:", err);
      alert("대본 전송에 실패했습니다.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 bg-gray-100 min-h-screen">
      {/* 왼쪽: 영상 + 대본 입력 */}
      <div className="flex-1 bg-white rounded-lg shadow p-4 flex flex-col">
        <h1 className="text-lg font-bold mb-2">🎥 {decodeURIComponent(roomName)} 방송 중</h1>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full flex-1 bg-black rounded-lg"
        />
        <div className="flex mt-2 gap-2">
          <input
            type="text"
            value={scriptText}
            onChange={(e) => setScriptText(e.target.value)}
            placeholder="AI 대본 입력..."
            className="flex-1 border rounded px-3"
          />
          <button
            onClick={sendScript}
            className="bg-blue-600 text-white px-4 rounded"
          >
            말하기
          </button>
        </div>
      </div>

      {/* 오른쪽: 상품 정보 + 채팅 */}
      <div className="w-full lg:w-96 flex flex-col gap-4">
        {/* 상품 정보 패널 */}
        <div className="bg-white rounded-lg shadow p-4">
          <img src={product.image} alt={product.name} className="w-full rounded-lg mb-2" />
          <h2 className="font-bold text-lg">{product.name}</h2>
          <p className="text-red-500 font-semibold">{product.price}</p>
          <a
            href={product.buyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-green-600 text-white text-center py-2 rounded mt-2"
          >
            🛒 지금 구매하기
          </a>
        </div>

        {/* 채팅창 */}
        <div className="bg-white rounded-lg shadow flex flex-col flex-1">
          <div className="p-2 border-b font-bold">💬 실시간 채팅</div>
          <div className="flex-1 overflow-y-auto p-2">
            {chatMessages.map((msg, i) => (
              <div key={i} className="p-1 border-b">{msg}</div>
            ))}
          </div>
          <div className="p-2 border-t flex gap-2">
            <input
              type="text"
              placeholder="메시지 입력"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 border rounded px-2"
            />
            <button
              onClick={sendChat}
              className="bg-green-600 text-white px-3 rounded"
            >
              전송
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
