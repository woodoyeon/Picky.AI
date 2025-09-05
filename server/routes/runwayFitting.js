// /routes/runwayfitting.js
import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import RunwayML, { TaskFailedError } from '@runwayml/sdk';
import { uploadBufferToSupabase } from '../utils/uploadBufferToSupabase.js';


dotenv.config();
const router = express.Router();
const client = new RunwayML({ apiKey: process.env.RUNWAYML_API_SECRET });
router.use(express.json());

function generatePromptText(fittingMeta) {
  console.log("🔍 [generatePromptText] 입력된 fittingMeta:", fittingMeta);

  const { background, category, position, size } = fittingMeta || {};

  let actionPhrase = 'interacting with';
  if (category?.includes('의류') || category?.includes('패션')) {
    actionPhrase = 'wearing';
  } else if (category?.includes('농수산물') || category?.includes('식품')) {
    actionPhrase = 'holding or displaying';
  } else if (category?.includes('전자제품')) {
    actionPhrase = 'using or showcasing';
  }

  const result = `@model ${actionPhrase} @style in a ${background || 'studio'} setting for a ${category || 'product'}, ${position || 'standing'}, size is ${size || 'normal'}, styled for a promotional catalog.`;

  console.log("🧠 [generatePromptText] 생성된 promptText:", result);
  return result;
}

async function convertImageToBase64(url) {
  try {
    console.log("🌐 이미지 URL 요청:", url);
    const response = await axios.get(url, { responseType: 'arraybuffer' });

    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    const base64DataUrl = `data:image/png;base64,${base64}`;
    console.log(`📦 변환 완료: ${url} → base64 길이: ${base64.length}`);
    return base64DataUrl;
  } catch (err) {
    console.error("❌ 이미지 변환 실패:", err.message);
    throw new Error(`이미지 다운로드 또는 변환 실패: ${url}`);
  }
}

router.post('/', async (req, res) => {
  const { modelImageUrl, styleImageUrl, fittingMeta } = req.body;

  console.log("🧾 수신된 전체 payload:", req.body);
  console.log("🧾 수신된 fittingMeta:", fittingMeta);
  if (!fittingMeta) {
    console.warn("⚠️ fittingMeta가 누락되었거나 undefined입니다.");
  }

  try {
    if (!modelImageUrl || !styleImageUrl) {
      console.warn("❌ 이미지 URL 누락:", { modelImageUrl, styleImageUrl });
      return res.status(400).json({ error: 'modelImageUrl, styleImageUrl 모두 필요합니다.' });
    }

    console.log("📥 Runway 요청 수신");
    console.log("🔹 modelImageUrl:", modelImageUrl);
    console.log("🔹 styleImageUrl:", styleImageUrl);

    const modelBase64 = await convertImageToBase64(modelImageUrl);
    const styleBase64 = await convertImageToBase64(styleImageUrl);

    //const promptText = generatePromptText(fittingMeta);
    // 변경(프롬프트 오버라이드 지원):
    const promptText = fittingMeta?.promptTextOverride || generatePromptText(fittingMeta);

    console.log("🚀 Runway API 호출 준비");
    console.log("📝 promptText:", promptText);
    console.log("🧱 modelBase64 길이:", modelBase64.length);
    console.log("🧱 styleBase64 길이:", styleBase64.length);

    const task = await client.textToImage.create({
      model: 'gen4_image',
      ratio: '1024:1024',
      promptText,
      referenceImages: [
        { uri: modelBase64, tag: 'model' },
        { uri: styleBase64, tag: 'style' },
      ],
    }).waitForTaskOutput();

    console.log("🧪 Runway 전체 task 응답:", JSON.stringify(task, null, 2));

    if (!task?.output?.[0]) {
      console.error("❌ Runway 작업 성공했지만 출력 결과 없음");
      throw new Error('Runway 이미지 생성 실패: 출력 결과 없음');
    }

    const imageUrl = task.output[0];
    console.log("✅ 생성된 이미지 URL:", imageUrl);

    // ✅ Supabase 업로드 디버깅
    console.log("📤 Supabase 업로드 시작...");
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const fittedImageBuffer = imageResponse.data;

    const fileName = `fitted-${Date.now()}.png`;
    const publicUrl = await uploadBufferToSupabase(fittedImageBuffer, fileName, 'fitted-images');

    if (!publicUrl) {
      console.error("❌ Supabase 업로드 실패: publicUrl이 없습니다.");
      throw new Error("Supabase에 이미지 업로드 실패");
    }

    console.log("📦 Supabase에 저장된 최종 이미지:", publicUrl);
    res.json({ imageUrl: publicUrl });

  } catch (err) {
    console.error("❌ Runway 처리 오류 발생");

    if (err instanceof TaskFailedError) {
      console.error("🧨 Runway TaskFailedError 발생");
      console.error("🔍 실패 상세 내용:", JSON.stringify(err.taskDetails, null, 2));
      return res.status(500).json({
        error: 'Runway 작업 실패',
        detail: err.taskDetails || 'Runway 측 실패 원인 미제공'
      });
    }

    console.error("🛑 일반 에러 메시지:", err.message);
    console.error("📚 에러 스택:", err.stack);
    return res.status(500).json({
      error: err.message || '서버 내부 오류',
      stack: err.stack
    });
  }
});

export default router;
