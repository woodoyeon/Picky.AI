import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// __dirname 대체 (ESM에서는 직접 사용 불가)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ uploads 폴더 자동 생성
const uploadsPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
}

const upload = multer({ dest: uploadsPath });

// ✅ OpenAI 설정
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const imagePath = req.file.path;
    const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
                detail: "low",
              },
            },
            {
              type: 'text',
              text: `
이 의류 이미지를 보고 아래 형식에 맞게 쇼핑몰 상세페이지용 글을 작성해줘.
각 항목은 반드시 한 줄씩 작성하고, ':' 뒤에 내용이 나오게 해줘.
글자수는 **길고 구체적으로 작성하고**, 구매를 유도하는 문구를 포함해줘.  
**행동 경제학적인 요소**를 고려해서 **구매자가 구매하고 싶도록 유도**하는 문구를 포함시켜줘.  
**긴 텍스트**로 구매자의 **감정을 자극하고 관심을 끌 수 있는 설명**을 작성해줘.

제목: [상품 이름]  
간략 설명: [상품의 주요 특징과 장점]  
이미지 설명1: [첫 번째 이미지의 내용과 특징]  
이미지 설명2: [두 번째 이미지의 내용과 특징]  
이미지 설명3: [세 번째 이미지의 내용과 특징]  
상세설명: [상품의 장점, 사용법, 구매자의 필요를 자극하는 이유 등을 **상세하고 길게** 작성. 구매자가 이 제품을 소유하고 싶은 이유를 강조하고, 댄 애니얼리 행동 경제학적으로 **구매를 유도하는 문구** 추가]
`,
            },
          ],
        },
      ],
    });

    const output = response.choices[0].message.content;
    const result = output.trim();
    res.json({ result });

    fs.unlinkSync(imagePath); // ✅ 임시 파일 삭제
  } catch (error) {
    console.error('❌ GPT Vision 오류:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
