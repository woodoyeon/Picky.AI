// routes/promptGuideWithUpload.js
import express from "express";
import multer from "multer";
import fs from "fs";
import OpenAI from "openai";
import dotenv from "dotenv";
import axios from "axios";

import { uploadBufferToSupabase } from "../utils/uploadBufferToSupabase.js";
import { savePromptResult } from "../utils/savePromptResult.js";
import { pickyAiSystemPrompt_v3_ko_optimized as pickyAiSystemPrompt } from "../prompts/systemPrompt.js";

dotenv.config();
const router = express.Router();
router.use(express.json());

// ✅ 여러 장 받기 (최대 10장)
const upload = multer({ dest: "uploads/" });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ────────────────────────────────────────────────────────────
// POST /api/prompt-guide
// - 이미지 1~10장 + 텍스트 1개 → 답변 1개
// - 각 이미지는 Supabase에 업로드 후 public URL도 함께 반환
// ────────────────────────────────────────────────────────────
router.post("/prompt-guide", upload.array("image", 10), async (req, res) => {
  const { action } = req.body || {};
  const files = Array.isArray(req.files) ? req.files : [];

  // ───────────────────────────────────────────
  // A) 합성 모드 (모델이미지 + 제품이미지 + 프롬프트)
  // 프론트가 JSON으로 { action:"compose", prompt, modelImageUrl, productImageUrls } 전송
  // ───────────────────────────────────────────
  // A) 합성 모드 (내부 runway-fitting 엔드포인트 재사용)
  console.log("📥 req.body 전체:", req.body);
  console.log("📥 action:", action);
  if (action === "compose") {
     console.log("📥 req.body 전체:", req.body);
     console.log("📥 modelImageUrl:", req.body.modelImageUrl);
     console.log("📥 productImageUrls:", req.body.productImageUrls);
     console.log("📥 prompt:", req.body.prompt);
    try {
      const { prompt = "", modelImageUrl = null, productImageUrls = [] } = req.body;

      if (!modelImageUrl || !productImageUrls?.length) {
        return res.status(400).json({ error: "modelImageUrl 과 productImageUrls[0] 이 필요합니다." });
      }

      // runway-fitting 라우트를 그대로 재사용
      // - styleImageUrl은 productImageUrls[0] 사용 (필요하면 배열 처리 로직 확장)
      const payload = {
        modelImageUrl,
        styleImageUrl: productImageUrls[0],
        fittingMeta: { promptTextOverride: prompt }, // 기존 generatePromptText 대신 프롬프트 오버라이드
      };
      console.log("📤 runway-fitting 요청 payload:", payload);

      // 서버 내부 호출 (동일 서버라면 절대경로 URL 또는 BASE_URL 환경변수 사용)
      const runwayResp = await axios.post(
        `${process.env.BASE_URL || "http://localhost:5000"}/runway-fitting`,
        payload
      );

      const composedImageUrl = runwayResp.data?.imageUrl;
      if (!composedImageUrl) {
        return res.status(502).json({ error: "compose_failed", detail: "runway-fitting 결과 URL 누락" });
      }

      // (선택) 로그/이력 저장
      await savePromptResult({
        userId: req.user?.id || "guest",
        imageUrl: composedImageUrl,
        gptReply: prompt,
        generatedPrompt: prompt,
        categories: { compose: { modelImageUrl, productImageUrls } },
      });

      return res.status(200).json({ composedImageUrl });
    } catch (e) {
      return res.status(500).json({ error: "compose_failed", detail: e.message });
    }
  }


  // ───────────────────────────────────────────
  // B) 기존 분석 모드 (multipart : image[] + userMessage)
  // ───────────────────────────────────────────
  const { userMessage } = req.body;

  const systemMsg = { role: "system", content: pickyAiSystemPrompt.trim() };
  const imageUrls = [];

  const safeUnlink = (p) => {
    try {
      if (p && fs.existsSync(p)) fs.unlinkSync(p);
    } catch {}
  };

  try {
    // 이미지가 1장 이상이면: 이미지들 + 텍스트 1개를 합쳐서 "하나의 user 메시지"를 구성
    if (files.length > 0) {
      const userContent = [];

      for (const file of files) {
        try {
          const buffer = fs.readFileSync(file.path);

          // 1) Supabase Storage 업로드
          const publicUrl = await uploadBufferToSupabase(
            buffer,
            `uploaded-${Date.now()}-${file.originalname || "image"}.png`,
            "user-uploads" // detail-images 버킷의 user-uploads 폴더
          );
          if (publicUrl) imageUrls.push(publicUrl);

          // 2) OpenAI에 넘길 이미지(base64) 추가
          const base64 = buffer.toString("base64");
          userContent.push({
            type: "image_url",
            image_url: {
              url: `data:${file.mimetype || "image/png"};base64,${base64}`,
              detail: "low",
            },
          });
        } finally {
          // 임시 파일 정리
          safeUnlink(file.path);
        }
      }

      // 3) 마지막에 텍스트 1개 추가(전체 이미지를 종합 분석하도록 요청)
      userContent.push({
        type: "text",
        text:
          userMessage ||
          "첨부된 모든 이미지를 종합해 한 개의 요약/분석을 만들어 주세요.",
      });

      const messages = [systemMsg, { role: "user", content: userContent }];

      // 4) OpenAI 호출 (답변 1개)
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        temperature: 0.5,
      });
      const gptReply = completion.choices?.[0]?.message?.content || "";

      // 5) 결과 저장(필요 시 배열도 함께 기록)
      await savePromptResult({
        userId: req.user?.id || "guest",
        imageUrl: imageUrls[0] || null, // 단일 칼럼엔 첫 번째만
        gptReply,
        generatedPrompt: gptReply,
        categories: { all_image_urls: imageUrls }, // 전체 URL은 categories에 보관
      });

      return res.status(200).json({
        reply: gptReply,    // ✅ 단일 답변
        imageUrls,          // 업로드된 전체 이미지 public URL
      });
    }

    // 이미지가 없는 경우: 텍스트만 단일 메시지
    const messages = [
      systemMsg,
      {
        role: "user",
        content:
          userMessage ||
          "상품 상세페이지 작성을 위한 분석을 시작해 주세요.",
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.5,
    });
    const gptReply = completion.choices?.[0]?.message?.content || "";

    return res.status(200).json({
      reply: gptReply,
      imageUrls: [],
    });
  } catch (error) {
    console.error("❌ /prompt-guide error:", error.message);
    // 실패 시 남아있을 수 있는 임시파일 정리
    for (const f of files) safeUnlink(f.path);
    return res.status(500).json({
      error: "프롬프트 생성 중 오류가 발생했습니다.",
      detail: error.message,
    });
  }
});



export default router;
