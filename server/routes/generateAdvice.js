import express from 'express';
import OpenAI from 'openai';

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ✅ 대화 기록 기반 응대 문장 생성
router.post('/', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: '유효하지 않은 messages 데이터입니다.' });
  }

  // 메시지 형식 정리
  const convo = messages.map(msg => `${msg.sender}: ${msg.text}`).join('\n');

  // GPT에 보낼 프롬프트 구성
  const prompt = `
당신은 온라인 쇼핑몰 고객 응대 어시스턴트입니다.
아래는 고객과 상담원 간의 실제 대화 내용입니다.

"${convo}"

이 고객이 느끼는 감정을 파악하고,
상담원이 공감과 사과, 해결책, 혜택 제안을 포함해 응답할 수 있는 "한 문장짜리" 예시 응대 문장을 작성해주세요.

예:
"안녕하세요 고객님~ 불편을 드려 정말 죄송합니다. 바로 환불 처리 도와드리고, 다음 주문 시 사용 가능한 5,000원 쿠폰도 함께 적용해드릴게요!"

단 하나의 응대 문장만 정확하게 작성해주세요.
`;

  try {
    const gptRes = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });

    const advice = gptRes.choices[0]?.message?.content?.trim();
    if (!advice) return res.status(500).json({ error: 'GPT 응답 없음' });

    res.json({ advice });
  } catch (err) {
    console.error('❌ 추천 문장 생성 실패:', err?.response?.data || err.message);
    res.status(500).json({ error: '추천 문장 생성 실패' });
  }
});

export default router;
