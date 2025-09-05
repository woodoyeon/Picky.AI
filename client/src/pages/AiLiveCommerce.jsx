import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AiLiveCommerce() {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  // 단계별 상태
  const [productInfo, setProductInfo] = useState({
    name: "",
    price: "",
    features: "",
    description: ""
  });
  const [character, setCharacter] = useState({
    image: null,
    voice: "korean_female",
    style: "friendly"
  });
  const [background, setBackground] = useState({
    platform: "youtube",
    file: null
  });
  const [platform, setPlatform] = useState({
    type: "youtube",
    rtmpUrl: "",
    streamKey: ""
  });

  // 리허설 모드
  const [isRehearsal, setIsRehearsal] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [sessionId, setSessionId] = useState("");

  // 입력 핸들러
  const handleProductChange = (e) =>
    setProductInfo({ ...productInfo, [e.target.name]: e.target.value });

  const handleCharacterImage = (e) =>
    setCharacter({ ...character, image: e.target.files[0] });

  const handleBackgroundFile = (e) =>
    setBackground({ ...background, file: e.target.files[0] });

  const handlePlatformChange = (e) =>
    setPlatform({ ...platform, [e.target.name]: e.target.value });

  // 리허설 시작
  const startRehearsal = async () => {
    setIsRehearsal(true);

    try {
      // 1. D-ID 세션 생성
      const res = await axios.post("/api/live-commerce/create-session", {
        imageUrl: "https://your-cdn.com/ai-host.jpg"
      });

      const { sessionId } = res.data;
      setSessionId(sessionId);

      // 2. WebRTC 연결
      const pc = new RTCPeerConnection();
      pc.ontrack = (event) => {
        videoRef.current.srcObject = event.streams[0];
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpRes = await axios.post(
        `https://api.d-id.com/talks/streams/${sessionId}/sdp`,
        { offer },
        {
          headers: {
            Authorization: `Basic ${btoa(import.meta.env.VITE_DID_API_KEY + ":")}`,
            "Content-Type": "application/json"
          }
        }
      );

      const { answer } = sdpRes.data;
      await pc.setRemoteDescription(answer);

      // 3. 기본 인사말 발화
      await axios.post("/api/live-commerce/send-script", {
        sessionId,
        text: `안녕하세요! ${productInfo.name || "제품"} 소개를 시작합니다.`
      });
    } catch (err) {
      console.error("❌ 리허설 시작 실패:", err);
    }
  };

  // 채팅 전송 + AI 응답
  const sendChat = async () => {
    if (!chatInput.trim()) return;

    // 시청자 채팅 표시
    setChatMessages((prev) => [...prev, `👤 시청자: ${chatInput}`]);

    try {
      const res = await axios.post("/api/live-commerce/chat-to-ai", {
        sessionId,
        message: chatInput,
        productInfo
      });

      const aiReply = res.data.aiScript;
      setChatMessages((prev) => [...prev, `🤖 쇼호스트: ${aiReply}`]);
    } catch (err) {
      console.error("❌ AI 응답 실패:", err);
    }

    setChatInput("");
  };

  // 방송 송출 시작
  const startBroadcast = async () => {
    console.log("📦 방송 설정:", {
      productInfo,
      character,
      background,
      platform
    });

    if (!platform.streamKey) {
      alert("스트림 키를 입력하세요.");
      return;
    }

    try {
      await axios.post("/api/stream/start-stream", {
        rtmpUrl: platform.rtmpUrl,
        streamKey: platform.streamKey
      });
      alert("🚀 방송 송출이 시작됩니다.");
    } catch (err) {
      console.error("❌ 방송 송출 실패:", err);
      alert("방송 송출 실패");
    }
  };

  // 방송 중단
  const stopBroadcast = async () => {
    try {
      await axios.post("/api/stream/stop-stream");
      alert("🛑 방송이 중단되었습니다.");
    } catch (err) {
      console.error("❌ 방송 중단 실패:", err);
      alert("방송 중단 실패");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold mb-4">📺 AI 라이브커머스 방송 준비</h1>

      {/* 1단계: 상품 정보 입력 */}
      <section className="bg-white shadow rounded-lg p-6 space-y-4">
        <h2>① 상품 정보 입력</h2>
        <input
          name="name"
          placeholder="상품명"
          value={productInfo.name}
          onChange={handleProductChange}
          className="w-full border rounded px-3 py-2"
        />
        <input
          name="price"
          placeholder="가격"
          value={productInfo.price}
          onChange={handleProductChange}
          className="w-full border rounded px-3 py-2"
        />
        <input
          name="features"
          placeholder="특징 (쉼표로 구분)"
          value={productInfo.features}
          onChange={handleProductChange}
          className="w-full border rounded px-3 py-2"
        />
        <textarea
          name="description"
          placeholder="상품 설명"
          value={productInfo.description}
          onChange={handleProductChange}
          className="w-full border rounded px-3 py-2"
        />
      </section>

      {/* 2단계: AI 캐릭터 설정 */}
      <section className="bg-white shadow rounded-lg p-6 space-y-4">
        <h2>② AI 캐릭터 설정</h2>
        <input type="file" accept="image/*" onChange={handleCharacterImage} />
        <select
          value={character.voice}
          onChange={(e) => setCharacter({ ...character, voice: e.target.value })}
          className="w-full border rounded px-3 py-2"
        >
          <option value="korean_female">한국어 여성</option>
          <option value="korean_male">한국어 남성</option>
        </select>
      </section>

      {/* 3단계: 배경 선택 */}
      <section className="bg-white shadow rounded-lg p-6 space-y-4">
        <h2>③ 플랫폼별 배경 선택</h2>
        <select
          value={background.platform}
          onChange={(e) => setBackground({ ...background, platform: e.target.value })}
          className="w-full border rounded px-3 py-2"
        >
          <option value="youtube">유튜브 (16:9)</option>
          <option value="naver">네이버 라이브 (9:16)</option>
        </select>
        <input type="file" accept="image/*,video/*" onChange={handleBackgroundFile} />
      </section>

      {/* 4단계: 리허설 */}
      <section className="bg-white shadow rounded-lg p-6">
        <h2>④ 리허설 / 미리보기</h2>
        {!isRehearsal ? (
          <button
            onClick={startRehearsal}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            리허설 시작
          </button>
        ) : (
          <div>
            {/* 배경 + 캐릭터 영상 */}
            <div className="relative w-full bg-black rounded overflow-hidden">
              {background.file && (
                <img
                  src={URL.createObjectURL(background.file)}
                  alt="배경"
                  className="absolute w-full h-full object-cover"
                />
              )}
              <video ref={videoRef} autoPlay playsInline muted className="relative w-full" />
            </div>
            {/* 채팅 */}
            <div className="mt-4 bg-white rounded shadow p-3">
              <div className="h-32 overflow-y-auto border p-2 mb-2 bg-gray-50">
                {chatMessages.map((msg, i) => (
                  <div key={i} className="text-sm">{msg}</div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 border rounded px-2 py-1"
                  placeholder="메시지 입력"
                />
                <button
                  onClick={sendChat}
                  className="bg-green-500 text-white px-3 rounded"
                >
                  전송
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 5단계: 송출 */}
      <section className="bg-white shadow rounded-lg p-6 space-y-4">
        <h2>⑤ 송출 플랫폼 설정</h2>
        <select
          value={platform.type}
          onChange={(e) => setPlatform({ ...platform, type: e.target.value })}
          className="w-full border rounded px-3 py-2"
        >
          <option value="youtube">유튜브</option>
          <option value="naver">네이버 쇼핑라이브</option>
        </select>
        <input
          name="rtmpUrl"
          placeholder="RTMP 주소"
          value={platform.rtmpUrl}
          onChange={handlePlatformChange}
          className="w-full border rounded px-3 py-2"
        />
        <input
          name="streamKey"
          placeholder="스트림 키"
          value={platform.streamKey}
          onChange={handlePlatformChange}
          className="w-full border rounded px-3 py-2"
        />
      </section>

      {/* 방송 시작 / 중단 */}
      <div className="text-center flex gap-4 justify-center">
        <button
          onClick={startBroadcast}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          🚀 방송 시작하기
        </button>
        <button
          onClick={stopBroadcast}
          className="bg-red-600 text-white px-6 py-3 rounded-lg"
        >
          🛑 방송 중단
        </button>
      </div>
    </div>
  );
}
