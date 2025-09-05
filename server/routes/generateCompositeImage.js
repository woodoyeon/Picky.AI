// routes/generateCompositeImage.js
import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import RunwayML from '@runwayml/sdk';
import { uploadBufferToSupabase } from '../utils/uploadBufferToSupabase.js';

dotenv.config();
const router = express.Router();
const client = new RunwayML({ apiKey: process.env.RUNWAYML_API_SECRET });

router.post('/generate-composite-image', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'prompt 필드가 필요합니다.' });
  }

  try {
    console.log("📨 수신된 프롬프트:", prompt);

    const task = await client.textToImage
      .create({
        model: 'gen4_image', // 필요에 따라 gen2, gen3도 가능
        promptText: prompt,
        ratio: '1024:1024',
      })
      .waitForTaskOutput();

    if (!task?.output?.[0]) {
      throw new Error('Runway 응답에 이미지 URL 없음');
    }

    const imageUrl = task.output[0];
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });

    const buffer = imageResponse.data;
    const fileName = `composite-${Date.now()}.png`;

    const publicUrl = await uploadBufferToSupabase(buffer, fileName, 'generated-composite');

    if (!publicUrl) throw new Error('Supabase 업로드 실패');

    console.log("✅ 최종 업로드 URL:", publicUrl);
    res.json({ imageUrl: publicUrl });
  } catch (err) {
    console.error("❌ Runway 합성 오류:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
