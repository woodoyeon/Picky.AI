import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ✅ 고객이 상담 요청
router.post('/request', async (req, res) => {
  const { seller_id, customer_name } = req.body;

  const { error } = await supabase
    .from('chat_requests')
    .upsert({ seller_id, customer_name, status: 'requested' });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: '상담 요청 완료' });
});

// ✅ 판매자가 상담 수락
router.post('/accept', async (req, res) => {
  const { seller_id, customer_name } = req.body;

  const { error } = await supabase
    .from('chat_requests')
    .update({ status: 'accepted' })
    .eq('seller_id', seller_id)
    .eq('customer_name', customer_name);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: '상담 수락 완료' });
});

// ✅ 상태 확인 API (클라이언트용)
router.get('/status', async (req, res) => {
  const { seller_id, customer_name } = req.query;

  const { data, error } = await supabase
    .from('chat_requests')
    .select('status')
    .eq('seller_id', seller_id)
    .eq('customer_name', customer_name)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;
