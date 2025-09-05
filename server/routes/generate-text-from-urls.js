import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// ✅ OpenAI 클라이언트 생성
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ GPT 텍스트 생성 요청
router.post('/', async (req, res) => {
  const {
    modelImageUrl,
    fittedImageUrl,
    multiFittedImages = [],
    detailImages = [],
    generatedVideoUrl,
  } = req.body;

  try {
    const allImageUrls = [
      modelImageUrl,
      fittedImageUrl,
      ...multiFittedImages,
      ...detailImages,
    ].filter(Boolean); // null/undefined 제거

    const videoDesc = generatedVideoUrl
      ? `또한 아래의 영상은 제품의 실제 착용 모습을 보여주며, 제품의 장점을 강조하는 데 사용됩니다:\n${generatedVideoUrl}`
      : '';

    const prompt = `
다음은 쇼핑몰 상세페이지에 사용될 이미지들입니다. 이 이미지들을 참고해서 각 항목을 작성해주세요:

- 첫 번째 이미지는 모델 이미지
- 두 번째 이미지는 착용된 상품 이미지 (합성된 이미지)
- 다음 3~4개의 이미지는 다양한 포즈의 피팅 이미지
- 마지막 4개의 이미지는 상품 디테일 이미지입니다.
${videoDesc}

👉 아래 형식을 따라 글을 작성해주세요. 각 항목은 꼭 한 줄 이상, 구체적이고 설득력 있게 작성해주세요. **행동 경제학적으로 구매를 유도하는 문구도 포함해주세요.**

제목:  
간략 설명:  
이미지 설명1:  
이미지 설명2:  
이미지 설명3:  
이미지 설명4:  
이미지 설명5:  
이미지 설명6:  
이미지 설명7:  
이미지 설명8:  
상세설명: (길고 구체적으로! 구매 욕구를 자극하게)
`;

    // ✅ GPT 호출
    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            ...allImageUrls.map(url => ({
              type: 'image_url',
              image_url: {
                url,
                detail: 'low',
              },
            })),
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    });

    const resultText = gptResponse.choices?.[0]?.message?.content || "";

    // ✅ GPT 응답 문자열을 JSON으로 파싱
    const titleMatch = resultText.match(/제목:\s*(.+)/);
    const shortDescMatch = resultText.match(/간략 설명:\s*(.+)/);
    const detailDescsMatch = resultText.match(/이미지 설명[1-8]:\s*((.|\n)*?)상세설명:/);
    const longDescMatch = resultText.match(/상세설명:\s*((.|\n)*)/);

    const title = titleMatch?.[1]?.trim() || "";
    const shortDesc = shortDescMatch?.[1]?.trim() || "";

    let imgDescs = [];
    if (detailDescsMatch) {
      imgDescs = detailDescsMatch[1]
        .split("\n")
        .filter(line => line.trim() !== "")
        .map(line => line.replace(/이미지 설명[1-8]:/, '').trim());

      // 이미지 설명이 부족한 경우 빈칸 채우기 (8개 고정)
      while (imgDescs.length < 8) imgDescs.push("");
    }

    const longDesc = longDescMatch?.[1]?.trim() || "";

    // ✅ 최종 응답
    res.json({
      result: {
        title,
        shortDesc,
        imgDescs,
        longDesc,
      },
    });

  } catch (err) {
    console.error('❌ GPT 텍스트 생성 실패:', err.message);
    res.status(500).json({ error: '텍스트 생성에 실패했습니다.' });
  }
});

export default router;
