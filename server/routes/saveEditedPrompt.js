// routes/saveEditedPrompt.js
import express from "express";
import { savePromptResult } from "../utils/savePromptResult.js";

const router = express.Router();

router.post("/save-edited-prompt", async (req, res) => {
  const { editedPrompt } = req.body;

  if (!editedPrompt || editedPrompt.length < 10) {
    return res.status(400).json({ error: "프롬프트 내용이 부족합니다." });
  }

  try {
    await savePromptResult({
      userId: req.user?.id || "guest",
      gptReply: editedPrompt,
      generatedPrompt: editedPrompt,
      categories: {},
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ 저장 오류:", error.message);
    res.status(500).json({ error: "프롬프트 저장 실패" });
  }
});

export default router;
