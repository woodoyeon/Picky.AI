// ✅ server/routes/shipping-policy.js
import express from "express";
import { OpenAI } from "openai";
import crypto from "crypto";
import { supabase } from "../supabaseClient.js";

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function hashProductKey({ title, description, imageUrl }) {
  return crypto
    .createHash("sha256")
    .update(`${title}|${description}|${imageUrl}`)
    .digest("hex");
}

// ✅ POST /api/generate-policy
router.post("/generate-policy", async (req, res) => {
  const { title, description, imageUrl, policyText } = req.body;
  const productHash = hashProductKey({ title, description, imageUrl });

  try {
    // 1️⃣ 이미 존재하는 정책이 있으면 가져오기
    const { data: existing, error: fetchError } = await supabase
      .from("shipping_policies")
      .select("*")
      .eq("product_hash", productHash)
      .maybeSingle();

    if (fetchError) throw fetchError;

    // 요청이 policyText 없이 오면 → GPT 생성
    if (!policyText) {
      if (existing?.policy_text) {
        return res.json({ policy: existing.policy_text, source: "supabase" });
      }

      // 2️⃣ GPT 프롬프트
      const systemPrompt = `너는 쇼핑몰 고객센터 운영자야. 다음 제품에 대한 배송·교환·환불 정책과 주의사항을 작성해줘.

- 상품명: ${title}
- 요약 설명: ${description}
- 제품 이미지: ${imageUrl ? "참조 가능" : "없음"}

작성 기준:
1. 배송 기간, 배송비, 택배사 등
2. 교환 가능한 상황과 조건
3. 환불 정책 및 유의사항
4. 주의사항 (예: 세탁, 보관)
5. 전체를 마크다운 형식으로 (소제목 포함)
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "마크다운 형식으로 정책 전체를 작성해줘." },
        ],
        temperature: 0.7,
      });

      const policy = completion.choices[0].message.content;
      if (!policy) throw new Error("GPT 생성 실패");

      // 3️⃣ 생성된 정책을 Supabase에 저장
      await supabase.from("shipping_policies").insert([
        {
          product_title: title,
          product_description: description,
          product_image: imageUrl,
          product_hash: productHash,
          policy_text: policy,
          source: "gpt",
        },
      ]);

      return res.json({ policy, source: "gpt" });
    }

    // 요청이 policyText 포함이면 → 사용자 저장 요청
    const { error: insertError } = await supabase.from("shipping_policies").upsert([
      {
        product_title: title,
        product_description: description,
        product_image: imageUrl,
        product_hash: productHash,
        policy_text: policyText,
        source: "user",
      },
    ]);

    if (insertError) throw insertError;

    return res.status(200).json({ message: "저장 완료", source: "user" });
  } catch (err) {
    console.error("❌ 정책 처리 실패:", err.message);
    return res.status(500).json({ error: "정책 생성 또는 저장 실패" });
  }
});

export default router;
