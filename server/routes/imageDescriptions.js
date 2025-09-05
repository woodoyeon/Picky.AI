// routes/imageDescriptions.js
import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/', async (req, res) => {
  const { multiFittedImages = [], modelImageUrl } = req.body;

  try {
    const imageInputs = multiFittedImages.slice(0, 4).map((url) => ({
      type: "image_url",
      image_url: { url, detail: "low" },
    }));

    const prompt = `
다음은 다양한 포즈의 패션 이미지입니다. 각 이미지를 보고 어떤 각도인지 설명하고, 해당 이미지가 강조하는 제품 특성을 간결하게 작성해주세요. 행동경제학적으로 설득력 있게 작성해주세요. (예: "깔끔한 뒷태로 활동성을 강조한 컷" 등)

설명 1:
설명 2:
설명 3:
설명 4:
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [...imageInputs, { type: "text", text: prompt }],
        },
      ],
    });

    const resultText = response.choices?.[0]?.message?.content || "";

    const descs = resultText
      .split("\n")
      .filter(line => line.trim().startsWith("설명"))
      .map(line => line.split(":")[1]?.trim() || "");

    // 빈칸 보정
    while (descs.length < 4) descs.push("");

    res.json({ imgDescs: descs });
  } catch (err) {
    console.error("GPT 설명 오류:", err);
    res.status(500).json({ error: "GPT 설명 생성 실패" });
  }
});

export default router;
