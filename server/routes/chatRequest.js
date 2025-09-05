// ✅ server/routes/chatRequest.js
import express from 'express';
import supabaseAdmin from '../lib/supabaseAdminClient.js';

const router = express.Router();

// ✅ 상담원 연결 요청 API
router.post('/request', async (req, res) => {
  const { customer_name, seller_id } = req.body;

  // ✅ 입력값 검증
  if (!customer_name?.trim() || !seller_id?.trim()) {
    return res.status(400).json({ error: '❌ 고객명과 판매자 ID는 필수입니다.' });
  }

  try {
    // ✅ 중복 방지: 동일한 고객-판매자 조합은 1번만 생성
    const { error } = await supabaseAdmin
      .from('chat_requests')
      .upsert(
        {
          customer_name: customer_name.trim(),
          seller_id: seller_id.trim(),
          status: 'requested',  // ✅ 핵심: requested 로 저장해야 버튼 활성화됨
        },
        {
          onConflict: ['seller_id', 'customer_name'], // ✅ 복합키 기준 중복 방지
        }
      );

    if (error) {
      console.error('❌ Supabase upsert 실패:', error.message);
      return res.status(500).json({ error: 'Supabase 에러', detail: error.message });
    }

    console.log(`📨 상담 요청 등록됨 → 고객명: ${customer_name}, 판매자: ${seller_id}`);
    res.status(200).json({ message: '✅ 상담 요청이 판매자에게 성공적으로 전달되었습니다.' });

  } catch (err) {
    console.error('❌ 서버 처리 중 예외 발생:', err);
    res.status(500).json({ error: '서버 내부 오류', detail: err.message });
  }
});

export default router;
