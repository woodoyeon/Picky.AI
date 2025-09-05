// 환경변수 로딩
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import http from 'http'; // ✅ Socket.io 사용을 위해 http 모듈 추가

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ 라우터 연결 AI라이브커머스
import liveCommerceRoutes from './routes/liveCommerce.js'; // ✅ 새로 만든 리허설/채팅 API
import streamControl from './routes/streamControl.js';

// ✅ 라우터 연결 제품이미지 업로드(상세페이지제작)
import generateTextFromUrls from './routes/generate-text-from-urls.js';
import runwayFittingCutRouter from './routes/runwayFittingCut.js';
import runwayFittingRoute from './routes/runwayFitting.js';
import runwayImageToVideoRouter from './routes/runwayImageToVideo.js';
import generateTextFromImage from './routes/generateTextFromImage.js';
import leonardoRoute from './routes/leonardoAPI.js';
import fashnFittingRoute from './routes/fashnFitting.js';
import chatbotRoute from './routes/chatbot.js';
import chatLogsRoute from './routes/chatLogs.js';
import chatStatusRoute from './routes/chatStatus.js';
import generateAdviceRoute from './routes/generateAdvice.js';
import adminRoutes from './routes/adminRoutes.js';
import cafe24Routes from './routes/cafe24.js';
import productsRoutes from './routes/products.js';
import sendToDemo from './routes/sendToDemo.js';
import chatRequestRouter from './routes/chatRequest.js';
import dalle3Router from './routes/dalle3.js';

// ✅ 사용 라우터 등록
// AI 라이브커머스 API
app.use("/api/live-commerce", liveCommerceRoutes);     // ✅ 새 리허설/채팅 API
app.use('/api/stream', streamControl); //✅  송출 제어 API

// ✅ 상세페이지 제작 API
app.use('/generate-text-from-urls', generateTextFromUrls);
app.use('/runway-fitting-cut', runwayFittingCutRouter);
app.use('/runway-fitting', runwayFittingRoute);
app.use('/runway-image-to-video', runwayImageToVideoRouter);
app.use('/leonardo', leonardoRoute);
app.use('/generate-text', generateTextFromImage);
app.use('/fashn-fitting', fashnFittingRoute);
app.use('/chatbot', chatbotRoute);
app.use('/chat-logs', chatLogsRoute);
app.use('/chat-status', chatStatusRoute);
app.use('/generate-advice', generateAdviceRoute);
app.use('/api/admin', adminRoutes);
app.use('/api/cafe24', cafe24Routes);
app.use('/api/products', productsRoutes);
app.use('/api/send-to-demo', sendToDemo);
app.use('/api/chat-request', chatRequestRouter);
app.use('/dalle3', dalle3Router);

// 기본 라우터
app.get('/', (req, res) => {
  res.send('✅ 서버 작동 중입니다.');
});

// ✅ HTTP 서버 생성 (Socket.io용)
const server = http.createServer(app);

// 서버 시작
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
