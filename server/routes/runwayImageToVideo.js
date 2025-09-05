// /routes/runwayImageToVideo.js
import express from 'express';
import axios from 'axios';
import RunwayML from '@runwayml/sdk';
import { uploadBufferToSupabase } from '../utils/uploadBufferToSupabase.js';

const router = express.Router();
const client = new RunwayML({ apiKey: process.env.RUNWAYML_API_SECRET });

function getPromptByCategory(category) {
  switch (category) {
    case "의류":
      return "A fashion model showcasing the outfit, walking and turning in a studio";
    case "농수산물":
      return "Hands presenting fresh agricultural products on a wooden table";
    case "전자제품":
      return "A tech gadget rotating on a white background with cinematic lighting";
    case "화장품":
      return "A woman applying cosmetic products in a beauty studio with soft lighting";
    default:
      return "A product being demonstrated professionally";
  }
}

router.post('/', async (req, res) => {
  const { imageUrl, category } = req.body;
  if (!imageUrl || !category) {
    return res.status(400).json({ error: 'imageUrl과 category는 필수입니다.' });
  }

  try {
    const promptText = getPromptByCategory(category);

    const task = await client.imageToVideo.create({
      model: 'gen4_turbo',
      promptImage: imageUrl,
      promptText,
      ratio: '720:1280',
      duration: 10,  //비디오 길이로 5초 또는 10초 선택가능
    }).waitForTaskOutput();

    if (!task?.output?.[0]) {
      throw new Error('Runway 영상 생성 실패: 출력 결과 없음');
    }

    const rawVideoUrl = task.output[0];

    const response = await axios.get(rawVideoUrl, { responseType: 'arraybuffer' });
    const savedUrl = await uploadBufferToSupabase(response.data, `video-${Date.now()}.mp4`, 'generated-videos');

    if (!savedUrl) throw new Error("Supabase 업로드 실패");
    res.json({ videoUrl: savedUrl });

  } catch (err) {
    console.error("❌ 영상 생성 실패:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
