// routes/dalle3.js
import express from 'express';
import axios from 'axios';
import { uploadBufferToSupabase } from '../utils/uploadBufferToSupabase.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { prompt } = req.body;

  try {
    // ✅ DALL·E 3 이미지 생성
    const dalleRes = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const imageUrl = dalleRes.data?.data?.[0]?.url;
    if (!imageUrl) throw new Error('❌ DALL·E 이미지 URL 없음');

    // ✅ 서버에서 이미지 다운로드
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = imageResponse.data;

    // ✅ Supabase에 업로드
    const fileName = `model-${Date.now()}.png`;
    const folder = 'model-images';
    const publicUrl = await uploadBufferToSupabase(buffer, fileName, folder);

    // ✅ 클라이언트에 public URL 응답
    res.json({ url: publicUrl });
  } catch (err) {
    console.error('❌ DALL·E API 또는 업로드 실패:', err.message);
    res.status(500).json({ error: '이미지 생성 실패' });
  }
});

export default router;
