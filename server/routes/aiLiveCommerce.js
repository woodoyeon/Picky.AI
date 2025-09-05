// server/routes/aiLiveCommerce.js
import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const DID_API_KEY = process.env.DID_API_KEY;

// ✅ AI 캐릭터 세션 생성
router.post('/create-session', async (req, res) => {
  try {
    const { imageUrl } = req.body;

    const response = await axios.post(
      'https://api.d-id.com/talks/streams',
      {
        source_url: imageUrl || "https://yourcdn.com/ai-host.jpg",
        voice: { provider: "microsoft", voice_id: "ko-KR-SunHiNeural" },
        driver_url: "bank://lively"
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(DID_API_KEY + ':').toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ sessionId: response.data.id });
  } catch (err) {
    console.error("❌ 세션 생성 실패:", err.response?.data || err.message);
    res.status(500).json({ error: 'AI 캐릭터 세션 생성 실패' });
  }
});

// ✅ AI 캐릭터 대본 전송
router.post('/send-script', async (req, res) => {
  try {
    const { sessionId, text } = req.body;

    const response = await axios.post(
      `https://api.d-id.com/talks/streams/${sessionId}`,
      { script: { type: 'text', input: text } },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(DID_API_KEY + ':').toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("❌ 대본 전송 실패:", err.response?.data || err.message);
    res.status(500).json({ error: 'AI 캐릭터 대본 전송 실패' });
  }
});

export default router;
