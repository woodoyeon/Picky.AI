// server/routes/admin/approval.js
import express from 'express';
import supabase from '../../lib/supabaseAdminClient.js';

const router = express.Router();

// ✅ 승인 처리
router.post('/approve/:id', async (req, res) => {
  const { id } = req.params;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: '유효하지 않은 id입니다.' });
  }

  const { error } = await supabase
    .from('product_details')
    .update({ status: 'approved', reject_reason: null })
    .eq('id', id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ msg: '✅ 승인 완료' });
});


// ✅ 반려 처리
router.post('/reject/:id', async (req, res) => {

  console.log('📦 요청받은 반려 사유:', req.body.reason);

  const { id } = req.params;
  const { reason } = req.body;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: '유효하지 않은 id입니다.' });
  }

  if (!reason || typeof reason !== 'string') {
    return res.status(400).json({ error: '반려 사유(reason)는 필수입니다.' });
  }

  const { error } = await supabase
    .from('product_details')
    .update({ status: 'rejected', reject_reason: reason })
    .eq('id', id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ msg: '❌ 반려 처리 완료' });
});

export default router;
