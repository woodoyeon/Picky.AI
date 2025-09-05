// /server/routes/streamControl.js
// ✅ FFmpeg 송출 설정만 담당하는 간단한 라우터 (D-ID, WebRTC 없음)

import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();
const CONFIG_PATH = path.join(process.cwd(), "streamConfig.json");

/**
 * 방송 송출 설정 저장 (RTMP URL + 스트림 키)
 */
router.post("/start-stream", (req, res) => {
  const { rtmpUrl, streamKey } = req.body;

  if (!rtmpUrl || !streamKey) {
    return res.status(400).json({ error: "RTMP 주소와 스트림 키가 필요합니다." });
  }

  const config = { rtmpUrl, streamKey };

  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    console.log(`✅ 방송 송출 설정 저장됨: ${rtmpUrl}/${streamKey}`);
    res.json({ success: true, message: "방송 설정 저장 완료" });
  } catch (err) {
    console.error("❌ 설정 저장 실패:", err);
    res.status(500).json({ error: "설정 저장 실패" });
  }
});

/**
 * 방송 중단 요청 로그
 */
router.post("/stop-stream", (req, res) => {
  console.log("🛑 방송 중단 요청 (실제 FFmpeg 종료 로직 없음)");
  res.json({ success: true, message: "방송 중단 요청 처리 완료" });
});

export default router;
