// routes/productStory.js
import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
router.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/", async (req, res) => {
  try {
    const { prompt = "", imageUrls = [] } = req.body || {};
    console.log("🔥 [요청 수신] prompt:", prompt);
    console.log("🖼️ imageUrls:", imageUrls);

    const gptPrompt = `
🪧 제품 소개 문구를 작성할 거야.
다음 정보를 바탕으로, 감성적이고 진정성 있게 느껴지는 "제품 탄생 스토리"를 300~500자 내외로 써줘.

---
📝 입력된 설명:
${prompt}

🖼️ 이미지 개수: ${imageUrls.length}
(이미지가 있다면 촬영, 제품 특징, 질감 등에 대한 추정도 함께 반영해줘)
---

📌 스타일 예시:
- 초심자의 문제의식에서 출발해 만든 이야기
- 시행착오나 고객 피드백으로 개선된 배경
- 창작자나 브랜드의 철학이 느껴지는 문장
- 소재/제조/현장의 고집과 노력
- 1인 창업자 또는 팀의 열정과 기록 등

응답은 스토리 본문만 보내줘. "제품 탄생 스토리:" 같은 말은 생략해.
`;

    // 📡 GPT-4o API 호출
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            // 이미지 URL을 시각 정보로 전달
            ...imageUrls.map((url) => ({
              type: "image_url",
              image_url: {
                url,
                detail: "low",
              },
            })),
            {
              type: "text",
              text: gptPrompt,
            },
          ],
        },
      ],
    });

    const story = response.choices?.[0]?.message?.content?.trim();
    if (!story) throw new Error("No story generated");

    return res.json({ story });
  } catch (e) {
    console.error("❌ product-story error:", e.message);
    return res.status(500).json({ error: "story_generation_failed" });
  }
});

export default router;
