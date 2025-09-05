// server/routes/chatbot.js
import express from 'express';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Supabase 연결
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// OpenAI 연결
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 감정 분석 함수
function analyzeSentiment(text) {
  if (text.includes('환불') || text.includes('불만') || text.includes('짜증')) return '부정';
  if (text.includes('감사') || text.includes('좋아요') || text.includes('최고')) return '긍정';
  return '중립';
}

// 어시스트 조언 생성 함수
async function generateAdvice(message) {
  const prompt = `
당신은 고객 응대 어시스턴트입니다.
다음은 고객과의 대화입니다:

"${message}"

공감, 사과, 해결책, 혜택 제안을 포함한 단 하나의 응대 문장을 작성해주세요.
예: "불편을 드려 죄송합니다. 바로 환불 도와드릴게요! 5,000원 쿠폰도 적용해드렸습니다."
`;

  const res = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7
  });

  return res.choices[0]?.message?.content?.trim() || '죄송합니다. 최선을 다해 도와드릴게요!';
}

// POST /chatbot
router.post('/', async (req, res) => {
  const { seller_id, customer_name, message } = req.body;

  try {
    const { data: chatStatus } = await supabase
      .from('chat_requests')
      .select('status')
      .eq('seller_id', seller_id)
      .eq('customer_name', customer_name)
      .maybeSingle();

    const isLive = chatStatus?.status === 'accepted';

    const { data: prevLog } = await supabase
      .from('chat_logs')
      .select('messages')
      .eq('seller_id', seller_id)
      .eq('customer_name', customer_name)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let messages = [];
    if (prevLog?.messages) {
      try {
        messages = JSON.parse(prevLog.messages);
      } catch (e) {
        console.warn('⚠️ 이전 메시지 파싱 실패:', e.message);
      }
    }

    // 고객 메시지 추가
    messages.push({ sender: '고객', text: message });

    // 구매이력 조회
    const { data: orders } = await supabase
      .from('sales')
      .select('product_title, delivery_status, purchased_at')
      .eq('seller_id', seller_id)
      .eq('customer_name', customer_name)
      .order('purchased_at', { ascending: false });

    const deliverySummary = orders?.map(order =>
      `- ${order.product_title} (상태: ${order.delivery_status}, 구매일: ${order.purchased_at})`
    ).join('\n') || '📦 최근 배송 내역이 없습니다.';

    const sentiment = analyzeSentiment(message);

    // 상담원 연결 전 → GPT 응답
    if (!isLive) {
      const gptRes = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: '당신은 친절한 쇼핑몰 챗봇입니다. 고객 질문과 배송정보를 참고해 응답하세요.' },
          { role: 'user', content: `고객 질문: ${message}\n\n최근 배송 정보:\n${deliverySummary}` }
        ],
        temperature: 0.7
      });

      const reply = gptRes.choices[0]?.message?.content?.trim();

      messages.push({ sender: 'AI', text: reply, sentiment });

      await supabase.from('chat_logs').insert([{
        seller_id,
        customer_name,
        messages: JSON.stringify(messages),
        sentiment,
        ai_advice: null
      }]);

      return res.json({ reply, sentiment, aiAdvice: null });
    }

    // 상담원 연결됨 → 어드바이스 생성만
    const aiAdvice = await generateAdvice(message);

    await supabase.from('chat_logs').insert([{
      seller_id,
      customer_name,
      messages: JSON.stringify(messages),
      sentiment,
      ai_advice: aiAdvice
    }]);

    return res.json({ reply: null, sentiment, aiAdvice });
  } catch (err) {
    console.error('❌ 오류 발생:', err.message || err);
    res.status(500).json({ error: 'GPT 처리 실패' });
  }
});

export default router;