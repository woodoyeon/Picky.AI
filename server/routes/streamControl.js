// /server/routes/streamControl.js
// 송출 시작/중단 API (Express 라우터)
import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const CONFIG_PATH = path.join(process.cwd(), 'streamConfig.json');

/**
 * 방송 송출 설정 변경 (RTMP URL + 스트림 키)
 */
router.post('/start-stream', (req, res) => {
  const { rtmpUrl, streamKey } = req.body;

  if (!rtmpUrl || !streamKey) {
    return res.status(400).json({ error: 'RTMP 주소와 스트림 키가 필요합니다.' });
  }

  const newConfig = { rtmpUrl, streamKey };

  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(newConfig, null, 2));
    console.log(`✅ 방송 송출 설정 변경: ${rtmpUrl}/${streamKey}`);
    res.json({ success: true, message: '방송 송출 설정 완료' });
  } catch (err) {
    console.error('❌ 설정 저장 실패:', err);
    res.status(500).json({ error: '설정 저장 실패' });
  }
});

/**
 * 방송 중단 요청
 */
router.post('/stop-stream', (req, res) => {
  console.log('🛑 방송 중단 요청');
  // 실제 RTMP 송출 중단 로직이 필요하다면 NodeMediaServer 인스턴스 제어 필요
  res.json({ success: true, message: '방송 중단 요청 완료' });
});

export default router;
