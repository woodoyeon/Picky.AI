// /routes/runwayFittingCut.js
import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import axios from 'axios';
import RunwayML, { TaskFailedError } from '@runwayml/sdk';
import { uploadBufferToSupabase } from '../utils/uploadBufferToSupabase.js';

dotenv.config();
const router = express.Router();
const client = new RunwayML({ apiKey: process.env.RUNWAYML_API_SECRET });

const storage = multer.memoryStorage();
const upload = multer({ storage });

function getPromptByCut(cut) {
  switch (cut) {
    case 'full-body':
      return '@model wearing @style in a full-body catalog photo';
    case 'side-view':
      return '@model wearing @style in a side profile view';
    case 'back-view':
      return '@model wearing @style with back turned';
    case 'half-body':
      return '@model wearing @style in a close-up half-body shot';
    default:
      return '@model wearing @style in a fashion scene';
  }
}

function fileToBase64(fileBuffer) {
  const base64 = fileBuffer.toString('base64');
  return `data:image/png;base64,${base64}`;
}

router.post('/', upload.none(), async (req, res) => {
  try {
    const { cut, model, referenceImages } = req.body;

    if (!cut || !referenceImages) {
      return res.status(400).json({ error: 'cut과 referenceImages는 필수입니다.' });
    }

    const parsedImages = JSON.parse(referenceImages);

    const promptText = getPromptByCut(cut);
    console.log(`🖼️ Runway 요청 - cut: ${cut}, prompt: ${promptText}`);

    // ✅ referenceImages의 uri(URL 또는 DataURL)를 base64로 변환
    const runwayInputImages = [];

    for (const ref of parsedImages) {
      const { uri, tag } = ref;
      let base64 = uri;

      if (!uri.startsWith('data:')) {
        // URL인 경우 → base64로 변환
        const imageRes = await axios.get(uri, { responseType: 'arraybuffer' });
        base64 = `data:image/png;base64,${Buffer.from(imageRes.data).toString('base64')}`;
      }

      runwayInputImages.push({ uri: base64, tag });
    }

    // ✅ Runway 호출
    const task = await client.textToImage.create({
      model: 'gen4_image',
      ratio: '1024:1024',
      promptText,
      referenceImages: runwayInputImages,
    }).waitForTaskOutput();

    if (!task?.output?.[0]) {
      throw new Error('Runway 결과 없음');
    }

    const generatedImageUrl = task.output[0];
    console.log(`✅ 이미지 생성 완료: ${generatedImageUrl}`);

    // ✅ Supabase 업로드
    const imageBuffer = await axios.get(generatedImageUrl, { responseType: 'arraybuffer' }).then(r => r.data);
    const supabaseUrl = await uploadBufferToSupabase(imageBuffer, `fitted-${cut}-${Date.now()}.png`, 'fitted-cuts');

    return res.json({ outputUrl: supabaseUrl || generatedImageUrl });

  } catch (err) {
    console.error('❌ 이미지 생성 실패:', err.message);

    if (err instanceof TaskFailedError) {
      return res.status(500).json({ error: 'Runway Task 실패', detail: err.taskDetails });
    }

    return res.status(500).json({ error: err.message });
  }
});

export default router;
