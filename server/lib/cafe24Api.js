import axios from 'axios';

export async function uploadProductToCafe24(accessToken, mallId, productData) {
  const mall = mallId || process.env.DEFAULT_MALL_ID;
  const url = `https://${mall}.cafe24api.com/api/v2/admin/products`;

  try {
    // ✅ 요청 디버깅 로그
    console.log('🛰️ [카페24 전송 요청] ⬇️');
    console.log('🔗 URL:', url);
    console.log('🛒 Mall ID:', mall);
    console.log('🔐 Access Token (앞자리):', accessToken?.slice(0, 10) + '...');
    console.log('📦 Product Data:', productData);

    const response = await axios.post(
      url,
      { product: productData },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // ✅ 성공 시 응답 로그
    console.log('✅ [카페24 등록 성공] 응답 데이터:', response.data);

    return response.data;
  } catch (error) {
    // ❌ 에러 로그
    console.error('❌ [카페24 상품 등록 실패]');
    console.error('🔗 요청 URL:', url);
    console.error('🧾 응답 에러:', error.response?.data || error.message);

    throw error;
  }
}
