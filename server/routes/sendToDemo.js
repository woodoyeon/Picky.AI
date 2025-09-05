import express from 'express';
import axios from 'axios';
import supabaseAdmin from '../lib/supabaseAdminClient.js';

const router = express.Router();

// ✅ 자동화 서버 → 더미 쇼핑몰로 상세페이지 전송
router.post('/', async (req, res) => {
  const { detailId } = req.body;

  const { data, error } = await supabaseAdmin
    .from('product_details')
    .select('*')
    .eq('id', detailId)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: '❌ 상품을 찾을 수 없습니다.' });
  }

  const payload = {
    detailId: data.id,
    title: data.title,
    summary: data.short_description || data.description1 || '',
    image_url: data.fitted_image_url || data.model_image_url || '',
  };

  // console.log("🔥 demo 전송 payload:", payload);

  try {
    // ✅ 더미 서버로 전송
    await axios.post('http://localhost:5050/api/demo/upload', payload);
    res.json({ message: '✅ 더미 쇼핑몰로 전송 완료' });
  } catch (err) {
    res.status(500).json({ error: '❌ 전송 실패', detail: err.message });
  }
});

export default router;
