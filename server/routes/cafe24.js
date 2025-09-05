// ✅ cafe24.js (통합 유지 + 수정)
import express from 'express';
import axios from 'axios';
import supabaseAdmin from '../lib/supabaseAdminClient.js';
import { uploadProductToCafe24 } from '../lib/cafe24Api.js';

const router = express.Router();

// ✅ [1] 상품 등록
router.post('/upload', async (req, res) => {
  const { detailId, accessToken, mallId } = req.body;

  try {
    const { data, error } = await supabaseAdmin
      .from('product_details')
      .select('*')
      .eq('id', detailId)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: '상세페이지를 찾을 수 없습니다.' });
    }

    const productData = {
      product_name: data.title,
      selling: 'T',
      display: 'T',
      price: data.price || '10000',
      summary_description: data.summary || data.description1 || '상품 요약 없음',
      description: `
        ${data.description1 ? `<h3>${data.description1}</h3>` : ''}
        ${data.image1 ? `<img src="${data.image1}" />` : ''}
        ${data.description2 ? `<h3>${data.description2}</h3>` : ''}
        ${data.image2 ? `<img src="${data.image2}" />` : ''}
        ${data.description3 ? `<h3>${data.description3}</h3>` : ''}
        ${data.image3 ? `<img src="${data.image3}" />` : ''}
        <p>배송정보: ${data.delivery_info || '기본 배송안내'}</p>
        <p>환불정책: ${data.refund_info || '기본 환불정책'}</p>
      `,
    };

    const result = await uploadProductToCafe24(accessToken, mallId, productData);
    res.status(200).json({ message: '상품 등록 성공', result });
  } catch (err) {
    console.error('❌ 카페24 등록 실패 상세:', err.response?.data || err.message);
    res.status(500).json({ message: '카페24 등록 실패', error: err.response?.data || err.message });
  }
});

// ✅ [2] 토큰 발급 + mall_id 강제 포함
router.post('/token', async (req, res) => {
  const { code } = req.body;

  try {
    const response = await axios.post(
      `https://${process.env.DEFAULT_MALL_ID}.cafe24api.com/api/v2/oauth/token`,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.CAFE24_CLIENT_ID,
        client_secret: process.env.CAFE24_CLIENT_SECRET,
        redirect_uri: process.env.CAFE24_REDIRECT_URI,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    res.status(200).json({
      ...response.data,
      mall_id: process.env.DEFAULT_MALL_ID, // ✅ 누락 방지
    });
  } catch (err) {
    console.error('❌ 토큰 발급 실패:', err.response?.data || err.message);
    res.status(500).json({ error: '토큰 발급 실패', detail: err.response?.data });
  }
});

export default router;
