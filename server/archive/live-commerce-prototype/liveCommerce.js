// /server/routes/liveCommerce.js
import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// 환경변수에서 D-ID API 정보 로드
const DID_API_KEY = process.env.DID_API_KEY; // 서버에서만 보관
if (!DID_API_KEY) {
  console.error("❌ DID_API_KEY 환경변수가 없습니다.");
}

/**
 * 📌 에이전트(세션) 생성
 * 프론트에서 WebRTC 연결 시 사용할 에이전트 생성
 */
router.post("/create-agent", async (req, res) => {
  try {
    const { imageUrl, voice } = req.body;

    // D-ID Agents API 호출
    const response = await fetch("https://api.d-id.com/agents", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${Buffer.from(DID_API_KEY + ":").toString("base64")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: "AI Live Host",
        image_url: imageUrl,
        voice
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Agent 생성 실패:", errorText);
      return res.status(response.status).json({ success: false, error: errorText });
    }

    const agentData = await response.json();

    // 프론트에서 연결할 때 필요한 정보만 반환
    res.json({
      success: true,
      agentId: agentData.id,
      // 프론트에서 SDK 연결 시 필요한 key는 백엔드에서 발급하거나 고정값 사용 가능
      clientKey: process.env.DID_CLIENT_KEY || null
    });

  } catch (err) {
    console.error("❌ Agent 생성 중 에러:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 📌 (선택) 에이전트 삭제
 * 필요할 경우 세션 종료 시 에이전트 삭제
 */
router.delete("/delete-agent/:agentId", async (req, res) => {
  const { agentId } = req.params;

  try {
    const response = await fetch(`https://api.d-id.com/agents/${agentId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Basic ${Buffer.from(DID_API_KEY + ":").toString("base64")}`
      }
    });

    if (response.status === 204) {
      return res.json({ success: true, message: "에이전트 삭제 완료" });
    } else {
      const errorText = await response.text();
      return res.status(response.status).json({ success: false, error: errorText });
    }
  } catch (err) {
    console.error("❌ 에이전트 삭제 실패:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
