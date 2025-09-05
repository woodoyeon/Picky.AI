// server/routes/MakeReview.js
import express from "express";
import { OpenAI } from "openai";
import crypto from "crypto";
import { supabase } from "../supabaseClient.js"; // 백엔드용 클라이언트

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function hashProductKey({ title, description, imageUrl }) {
  return crypto
    .createHash("sha256")
    .update(`${title}|${description}|${imageUrl}`)
    .digest("hex");
}

// ✅ 리뷰 테이블 이름: 'generated_reviews'
router.post("/generate-reviews", async (req, res) => {
  const { title, description, imageUrl } = req.body;
  const hashKey = hashProductKey({ title, description, imageUrl });

  try {
    // ✅ Supabase에서 기존 리뷰 검색 (캐시처럼 활용)
    const { data: existing, error: fetchError } = await supabase
      .from("generated_reviews")
      .select("*")
      .eq("product_hash", hashKey)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existing) {
      return res.json({ reviews: existing.reviews, source: "supabase" });
    }

    // ✅ GPT 프롬프트 설정
    const systemPrompt = `너는 실제 제품 리뷰어입니다. 다음 제품에 대해 사용자 리뷰를 10개 작성하세요.
- 별점 (1~5)
- 작성자 이름
- 리뷰 본문 (정직하고 구체적으로)
- 주요 키워드
- 날짜

제품명: ${title}
제품 요약: ${description}
제품 이미지 요약: ${imageUrl ? "이미지 참조 가능" : "없음"}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content:
            "JSON 배열 형식으로 반환해줘 (author, rating, content, tags, date)",
        },
      ],
      temperature: 0.8,
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    if (!Array.isArray(parsed)) throw new Error("Invalid format from GPT");

    // ✅ Supabase에 저장
    const { error: insertError } = await supabase
      .from("generated_reviews")
      .insert([
        {
          product_title: title,
          product_description: description,
          product_image: imageUrl,
          product_hash: hashKey,
          reviews: parsed, // JSONB 컬럼
        },
      ]);

    if (insertError) throw insertError;

    return res.json({ reviews: parsed, source: "gpt" });
  } catch (err) {
    console.error("❌ 리뷰 생성 실패:", err.message);
    return res.status(500).json({ error: "리뷰 생성 실패" });
  }
});

export default router;
