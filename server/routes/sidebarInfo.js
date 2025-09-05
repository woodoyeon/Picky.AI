// server/routes/sidebarInfo.js
import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

// 공통 체크
const requireUserId = (req, res, next) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ error: "userId가 필요합니다." });
  next();
};

// ─────────────────────────────────────────────────────────────
// GET /api/sidebar-info/:userId
// 회사정보, 배송정책, 최근 이미지(최대 5), 프롬프트 가이드, 최근 프롬프트(3개)
// ─────────────────────────────────────────────────────────────
router.get("/:userId", requireUserId, async (req, res) => {
  const { userId } = req.params;

  try {
    const [
      { data: companyInfo, error: companyErr },
      { data: shippingPolicy, error: shippingErr },
      { data: recentImages, error: imagesErr },
      { data: promptGuides, error: guidesErr },
      { data: recentPrompts, error: promptsErr },
    ] = await Promise.all([
      supabase.from("company_info").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("shipping_policy").select("*").eq("user_id", userId).maybeSingle(),
      supabase
        .from("model_images")
        .select("id, image_url, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("prompt_guide")
        .select("id, title, content, language, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("easy_prompt_results")
        .select("id, generated_prompt, gpt_reply, created_at")
        .in("user_id", [userId, "guest"])              // 임시코드
        //.eq("user_id", userId)   // ⬅️ 나중에 필수로 할 일 (근본 해결)
        .order("created_at", { ascending: false })
        .limit(3),

    ]);
    // console.log("🧪 sidebar-info lens:", {
    //   userId,
    //   images: recentImages?.length || 0,
    //   guides: promptGuides?.length || 0,
    //   prompts: recentPrompts?.length || 0,
    // });

    
    if (companyErr) throw companyErr;
    if (shippingErr) throw shippingErr;
    if (imagesErr) throw imagesErr;
    if (guidesErr) throw guidesErr;
    if (promptsErr) throw promptsErr;

    res.json({
      companyInfo: companyInfo || null,
      shippingPolicy: shippingPolicy || null,
      recentImages: recentImages || [],
      promptGuides: promptGuides || [],
      recentPrompts: recentPrompts || [], // ✅ 추가
    });
  } catch (err) {
    console.error("[GET /sidebar-info] error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/sidebar-info/:userId
// body에 포함된 것만 저장 (upsert)
// { companyInfo, shippingPolicy, promptGuides }
// ※ prompt_guide 스키마엔 user_id 컬럼이 없으므로 user_id 넣지 마세요!
// ─────────────────────────────────────────────────────────────
router.put("/:userId", requireUserId, async (req, res) => {
  const { userId } = req.params;
  const { companyInfo, shippingPolicy, promptGuides } = req.body || {};

  try {
    const tasks = [];

    if (companyInfo && typeof companyInfo === "object") {
      tasks.push(
        supabase
          .from("company_info")
          .upsert({ user_id: userId, ...companyInfo }, { onConflict: "user_id" })
          .select()
          .maybeSingle()
      );
    }

    if (shippingPolicy && typeof shippingPolicy === "object") {
      tasks.push(
        supabase
          .from("shipping_policy")
          .upsert({ user_id: userId, ...shippingPolicy }, { onConflict: "user_id" })
          .select()
          .maybeSingle()
      );
    }

    if (Array.isArray(promptGuides)) {
      // id 있으면 update, 없으면 insert
      for (const g of promptGuides) {
        if (g?.id) {
          tasks.push(
            supabase
              .from("prompt_guide")
              .update({
                ...(typeof g.title === "string" ? { title: g.title } : {}),
                ...(typeof g.content === "string" ? { content: g.content } : {}),
                ...(g.language ? { language: g.language } : {}),
              })
              .eq("id", g.id)
              .select("id")
              .single()
          );
        } else {
          tasks.push(
            supabase
              .from("prompt_guide")
              .insert([
                {
                  title: g?.title || "",
                  content: g?.content || "",
                  language: g?.language || "ko",
                },
              ])
              .select("id")
              .single()
          );
        }
      }
    }

    // 실행
    const results = await Promise.all(tasks);

    // 에러 체크
    for (const r of results) {
      if (r?.error) throw r.error;
    }

    res.json({ success: true });
  } catch (err) {
    console.error("[PUT /sidebar-info] error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// ─────────────────────────────────────────────────────────────
// DELETE /api/sidebar-info/images/:userId/:id
// 최근 이미지 삭제 (스토리지 파일도 있으면 제거 시도)
// ─────────────────────────────────────────────────────────────
router.delete("/images/:userId/:id", requireUserId, async (req, res) => {
  const { userId, id } = req.params;

  try {
    const { data: row, error: getErr } = await supabase
      .from("model_images")
      .select("image_url")
      .eq("user_id", userId)
      .eq("id", id)
      .single();
    if (getErr) throw getErr;

    const { error: delErr } = await supabase
      .from("model_images")
      .delete()
      .eq("user_id", userId)
      .eq("id", id);
    if (delErr) throw delErr;

    // 스토리지 삭제(가능할 때만)
    try {
      const m = row?.image_url?.match(/\/object\/public\/([^/]+)\/(.+)$/);
      if (m) await supabase.storage.from(m[1]).remove([m[2]]);
    } catch (e) {
      // 스토리지 삭제 실패는 무시(로그만)
      console.warn("[storage remove warn]", e?.message);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("[DELETE /sidebar-info/images] error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// ─────────────────────────────────────────────────────────────
// DELETE /api/sidebar-info/prompts/:userId/:id
// 프롬프트 삭제
// ─────────────────────────────────────────────────────────────
router.delete("/prompts/:userId/:id", requireUserId, async (req, res) => {
  console.log("🟢 삭제 요청 ID 체크:", req.params);
  const { userId, id } = req.params;
  try {
    const { error } = await supabase
      .from("easy_prompt_results")
      .delete()
      //.eq("user_id", userId)  // ⬅️ 나중에 필수로 할 일 (근본 해결)
      .in("user_id", [userId, "guest"]) // 🔧 임시: guest 행도 허용
      .select("id")                     // 지워진 행 반환
      .eq("id", id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error("[DELETE /sidebar-info/prompts] error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// ─────────────────────────────────────────────────────────────
/* PUT /api/sidebar-info/prompts/:userId/:id
   수정: generated_prompt / gpt_reply 동시 갱신
   body: { content: string(최소 10자) } */
// ─────────────────────────────────────────────────────────────
router.put("/prompts/:userId/:id", requireUserId, async (req, res) => {
  const { userId, id } = req.params;
  const { content } = req.body || {};
  if (typeof content !== "string" || content.trim().length < 10) {
    return res.status(400).json({ error: "내용이 부족합니다(최소 10자)." });
  }
  try {
    const { data, error } = await supabase
      .from("easy_prompt_results")
      .update({
        generated_prompt: content.trim(),
        gpt_reply: content.trim(),
      })
      //.eq("user_id", userId)  // ⬅️ 나중에 필수로 할 일 (근본 해결)
      .eq("id", id)
      .in("user_id", [userId, "guest"]) // 🔧 임시: guest 행도 허용
      .select("id, generated_prompt, gpt_reply, created_at")
      .single();
    if (error) throw error;
    res.json({ success: true, row: data });
  } catch (err) {
    console.error("[PUT /sidebar-info/prompts] error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

export default router;
