// server/index.js

// 환경변수 로딩
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
//app.use(express.json());
app.use(express.json({ limit: "10mb" })); // multipart가 아닐 때 req.body 파싱
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ QnA
import qnaRoutes from "./routes/generate-qna.js";

// ✅ 교환/환불/배송 정책
import shippingPolicyRoutes from "./routes/shipping-policy.js";

// ✅ 리뷰 작성 (PromptEditor.jsx)
import makeReviewRouter from "./routes/MakeReview.js"; 

// ✅ 4컷 디테일 이미지 설명글 작성 (Prompt Create)
import detailImageDescriptionsRoute from "./routes/detail-image-descriptions.js"; // 신규

// ✅ 4컷 생성 이미지 설명글 작성 (Prompt Create)
import imageDescriptionsRoute from './routes/imageDescriptions.js';

// ✅ 제품 탄생스토리 (Prompt Create)
import productStoryRouter from "./routes/productStory.js";

// ✅ 업로드(Prompt Create)
import promptGuideRouter from "./routes/promptGuideWithUpload.js";
import saveEditedPrompt from "./routes/saveEditedPrompt.js";
import generateCompositeImage from './routes/generateCompositeImage.js';
import sidebarInfoRoutes from "./routes/sidebarInfo.js";  // PromptCreate.jsx의 사이드바


// ✅ 업로드(상세페이지제작)
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

// ✅ QnA
app.use("/api", qnaRoutes); // 최종 경로: /api/generate-qna

// ✅ 교환/환불/배송 정책
app.use("/api", shippingPolicyRoutes);

// ✅ 리뷰 작성 (PromptEditor.jsx)
app.use("/api", makeReviewRouter);

// ✅ 4컷 디테일 이미지 설명글 작성 (Prompt Create)
app.use("/api/detail-image-descriptions", detailImageDescriptionsRoute);  // 신규 추가

// ✅ 4컷 생성 이미지 설명글 작성 (Prompt Create)
app.use('/api/image-descriptions', imageDescriptionsRoute);

// ✅ 제품 탄생스토리 (Prompt Create)
app.use("/api/product-story", productStoryRouter);

// ✅ 업로드(Prompt Create)
app.use("/api", promptGuideRouter);
app.use("/api", saveEditedPrompt);
app.use('/api', generateCompositeImage);
app.use("/api/sidebar-info", sidebarInfoRoutes); // PromptCreate.jsx의 사이드바

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

// 서버 시작
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
