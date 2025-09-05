import express from 'express';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// 메모리 저장소 사용
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /fashn-fitting
router.post(
  '/',
  upload.fields([
    { name: 'modelImageFile', maxCount: 1 },
    { name: 'clothesImageFile', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const modelFile = req.files['modelImageFile']?.[0];
      const clothesFile = req.files['clothesImageFile']?.[0];

      if (!modelFile || !clothesFile) {
        return res
          .status(400)
          .json({ error: '이미지 2장이 모두 필요합니다.' });
      }

      const modelBase64 = `data:${modelFile.mimetype};base64,${modelFile.buffer.toString('base64')}`;
      const clothesBase64 = `data:${clothesFile.mimetype};base64,${clothesFile.buffer.toString('base64')}`;

      const response = await axios.post(
        'https://api.fashn.ai/v1/run',
        {
          model_image: modelBase64,
          garment_image: clothesBase64,
          category: 'auto',
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.FASHN_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const predictionId = response.data?.id;
      if (!predictionId)
        return res.status(500).json({ error: '예측 ID를 받지 못했습니다.' });

      let resultUrl = null;
      let status = 'starting';
      const maxTry = 10;

      for (let i = 0; i < maxTry; i++) {
        await new Promise((resolve) => setTimeout(resolve, 4000));

        const statusRes = await axios.get(
          `https://api.fashn.ai/v1/status/${predictionId}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.FASHN_API_KEY}`,
            },
          }
        );

        status = statusRes.data?.status;
        if (status === 'completed') {
          resultUrl = statusRes.data.output?.[0];
          break;
        } else if (status === 'failed') {
          return res.status(500).json({ error: '피팅 실패' });
        }
      }

      if (resultUrl) {
        return res.json({ outputUrl: resultUrl });
      } else {
        return res
          .status(504)
          .json({ error: '타임아웃: 결과 수신 실패' });
      }
    } catch (err) {
      console.error('Fashn API 오류:', err.message);
      res.status(500).json({ error: '서버 내부 오류 발생' });
    }
  }
);

export default router;
