// ✅ server/routes/generate-qna.js
import express from "express";
import { OpenAI } from "openai";
import crypto from "crypto";
import { supabase } from "../supabaseClient.js";

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function hashProductKey({ title, description, imageUrl }) {
  return crypto
    .createHash("sha256")
    .update(`${title}|${description}|${imageUrl ?? ""}`)
    .digest("hex");
}

// ⚠️ 여기서는 '/generate-qna' (app.use('/api', router)로 마운트하면 최종 '/api/generate-qna')
router.post("/generate-qna", async (req, res) => {
  const { title, description, imageUrl, qnaText } = req.body;
  const productHash = hashProductKey({ title, description, imageUrl });

  try {
    // 1) 저장 요청 (사용자 편집 반영)
    if (qnaText) {
      const { error: upsertError } = await supabase.from("product_qna").upsert(
        [
          {
            product_title: title,
            product_description: description,
            product_image: imageUrl,
            product_hash: productHash,
            qna_text: qnaText,
            source: "user",
          },
        ],
        { onConflict: "product_hash" }
      );
      if (upsertError) throw upsertError;
      return res.status(200).json({ message: "저장 완료", source: "user" });
    }

    // 2) 캐시 조회
    const { data: existing, error: fetchError } = await supabase
      .from("product_qna")
      .select("*")
      .eq("product_hash", productHash)
      .maybeSingle();
    if (fetchError) throw fetchError;

    if (existing?.qna_text) {
      return res.json({ qnaText: existing.qna_text, source: "supabase" });
    }

    // 3) GPT 생성
    const system = "너는 제품 상세페이지용 QnA를 자동으로 작성해주는 AI입니다.";
    const userPrompt =
      `다음 상품에 대해 고객이 자주 할 만한 질문과 답변을 10개 작성해줘. ` +
      `마크다운 형식으로.\n\n상품명: ${title}\n설명: ${description}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: system },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    });

    const output = completion.choices?.[0]?.message?.content;
    if (!output) throw new Error("GPT 생성 실패");

    const { error: insertError } = await supabase.from("product_qna").insert([
      {
        product_title: title,
        product_description: description,
        product_image: imageUrl,
        product_hash: productHash,
        qna_text: output,
        source: "gpt",
      },
    ]);
    if (insertError) throw insertError;

    return res.json({ qnaText: output, source: "gpt" });
  } catch (err) {
    console.error("❌ QnA 처리 실패:", err?.message || err);
    return res.status(500).json({ error: "QnA 생성/저장 실패" });
  }
});

export default router;
