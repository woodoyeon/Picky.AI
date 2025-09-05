// routes/detail-image-descriptions.js
import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * POST /api/image-descriptions
 * body: {
 *   detailImages?: string[],        // ✅ DetailCutsUpload.jsx가 보내는 기본 키
 *   multiFittedImages?: string[],   // (옵션) 다른 화면과 호환
 *   images?: string[],              // (옵션) 제3의 키 지원
 *   modelImageUrl?: string          // (옵션) 문맥 보강용
 * }
 * res: { imgDescs: string[] }       // 입력 이미지 수와 동일 길이로 반환
 */
router.post("/", async (req, res) => {
  try {
    const {
      detailImages = [],
      multiFittedImages = [],
      images = [],
      modelImageUrl,
    } = req.body || {};

    // 1) 어떤 키로 들어와도 하나의 배열로 통합
    const urls = (detailImages.length ? detailImages : (multiFittedImages.length ? multiFittedImages : images))
      .filter(Boolean)
      .slice(0, 4); // 최대 4장

    if (!urls.length) {
      return res.status(400).json({ error: "이미지 URL이 없습니다.(detailImages|multiFittedImages|images)" });
    }

    // 2) Vision 입력 구성
    const imageInputs = urls.map((url) => ({
      type: "image_url",
      image_url: { url, detail: "low" },
    }));

    const prompt = `
다음은 패션 상품의 디테일컷입니다. 각 이미지를 보고:
1) 어떤 각도/포인트의 컷인지(예: 정면/측면/후면/포인트)
2) 제품 특성(소재감, 봉제/마감, 실루엣, 사용성 등)
3) 설득 포인트를 1문장(최대 25자)으로 간결하게 작성해주세요.
톤은 간결·명확·신뢰감. 출력은 아래 형식으로만.

설명 1: ...
설명 2: ...
설명 3: ...
설명 4: ...
`;

    const messages = [
      {
        role: "user",
        content: [
          ...imageInputs,
          ...(modelImageUrl
            ? [{ type: "text", text: `참고: 이 상품은 모델 착용 컷(${modelImageUrl})과 함께 제공됩니다. 디테일 특성에 집중해서 작성하세요.` }]
            : []),
          { type: "text", text: prompt },
        ],
      },
    ];

    // gpt-4o 외에 gpt-4o-mini로도 충분합니다.
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.4,
    });

    const resultText = response.choices?.[0]?.message?.content || "";

    // 3) "설명 N:" 라인만 추출
    const lines = resultText
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => /^설명\s*\d+\s*:/.test(s));

    const descs = lines.map((line) => {
      const idx = line.indexOf(":");
      return idx >= 0 ? line.slice(idx + 1).trim() : "";
    });

    // 4) 개수 보정: 입력 이미지 수에 맞춰 pad/trim
    const normalized = Array.from({ length: urls.length }).map((_, i) => descs[i] || "");

    return res.json({ imgDescs: normalized });
  } catch (err) {
    console.error("GPT 설명 생성 오류:", err);
    return res.status(500).json({ error: "GPT 설명 생성 실패" });
  }
});

export default router;
