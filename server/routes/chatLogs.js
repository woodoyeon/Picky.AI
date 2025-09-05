import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET /chat-logs/:seller_id
router.get('/:seller_id', async (req, res) => {
  const { seller_id } = req.params;

  try {
    const { data, error } = await supabase
      .from('chat_logs')
      .select('*')
      .eq('seller_id', seller_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase 조회 실패:', error);
      return res.status(500).json({ error: '로그 조회 실패' });
    }

    res.json({ logs: data });
  } catch (err) {
    console.error('❌ 전체 에러:', err.message);
    res.status(500).json({ error: '서버 에러' });
  }
});

export default router;
