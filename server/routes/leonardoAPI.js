import express from 'express';
import axios from 'axios';

const router = express.Router();
const API_KEY = process.env.LEONARDO_API_KEY;

router.post('/', async (req, res) => {
  const { prompt } = req.body;

  const HEADERS = {
    accept: 'application/json',
    'content-type': 'application/json',
    authorization: `Bearer ${API_KEY}`,
  };

  try {
    // ✅ 1단계: 이미지 생성 요청
    const res1 = await axios.post(
      'https://cloud.leonardo.ai/api/rest/v1/generations',
      {
        prompt,
        modelId: 'b2614463-296c-462a-9586-aafdb8f00e36',
        width: 1536,
        height: 1536,
        num_images: 1,
        scheduler: 'LEONARDO',
        alchemy: false,
      },
      { headers: HEADERS }
    );

    if (res1.status !== 200) {
      return res.status(500).json({ error: '이미지 요청 실패' });
    }

    const generationId = res1.data?.sdGenerationJob?.generationId;
    if (!generationId) {
      return res.status(500).json({ error: 'generationId 없음' });
    }

    // ✅ 2단계: 이미지 생성 대기 (25초)
    await new Promise((resolve) => setTimeout(resolve, 25000));

    // ✅ 3단계: 생성된 이미지 결과 조회
    const res2 = await axios.get(
      `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`,
      { headers: HEADERS }
    );

    if (res2.status !== 200) {
      return res.status(500).json({ error: '이미지 결과 조회 실패' });
    }

    console.log('✅ 전체 응답 구조 확인:', JSON.stringify(res2.data, null, 2));

    // ✅ 4단계: 이미지 추출
    const imagesFromByPk = res2.data?.generations_by_pk?.generated_images;
    const imagesFromList = res2.data?.generations?.[0]?.generated_images;
    const images = imagesFromByPk || imagesFromList;

    if (!images || images.length === 0) {
      return res
        .status(500)
        .json({ error: '이미지는 생성되었지만 결과가 비어 있음' });
    }

    // ✅ 5단계: React에 이미지 배열 전달
    res.json({ images });
  } catch (error) {
    console.error(
      '❌ Leonardo API 오류:',
      error.response?.data || error.message
    );
    res.status(500).json({ error: '이미지 생성 실패' });
  }
});

export default router;
