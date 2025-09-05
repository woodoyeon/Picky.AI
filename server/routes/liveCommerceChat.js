//server/routes/liveCommerceChat.js
import express from "express";
import axios from "axios";

const router = express.Router();

/**
 * 시청자 채팅 → GPT → AI 대본 생성 → D-ID 캐릭터 발화
 */
router.post("/chat-to-ai", async (req, res) => {
  const { sessionId, message, productInfo } = req.body;

  if (!sessionId || !message) {
    return res.status(400).json({ error: "세션 ID와 메시지가 필요합니다." });
  }

  try {
    // 1. GPT로 답변 생성
    const gptRes = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini", // 빠르고 저렴한 모델
        messages: [
          {
            role: "system",
            content: `당신은 쇼핑호스트입니다. 아래의 상품 정보를 참고하여 시청자의 질문에 친근하고 판매 유도하는 말투로 답변하세요.
상품 정보: ${JSON.stringify(productInfo)}`
          },
          { role: "user", content: message }
        ],
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const aiScript = gptRes.data.choices[0].message.content.trim();

    // 2. D-ID API로 발화 요청
    await axios.post(
      `${process.env.DID_API_BASE_URL}/talks/streams/${sessionId}`,
      { script: { type: "text", input: aiScript } },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(process.env.DID_API_KEY + ":").toString("base64")}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({ success: true, aiScript });
  } catch (err) {
    console.error("❌ AI 응답 실패:", err.response?.data || err.message);
    res.status(500).json({ error: "AI 응답 생성 실패" });
  }
});

export default router;
