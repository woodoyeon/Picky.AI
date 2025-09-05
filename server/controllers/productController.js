import { supabase } from '../supabaseClient.js';

/**
 * 내 승인된 상세페이지 리스트 불러오기
 * @param {*} req 
 * @param {*} res 
 * @returns JSON 배열
 */
export const getApprovedProductDetails = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'userId가 필요합니다.' });
  }

  try {
    const { data, error } = await supabase
      .from('product_details')
      .select('*')
      .eq('user_id', userId)
     // .eq('status', 'approved')  // 👉 승인된 상품만 필터링할 때 사용
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase 오류:', error.message);
      return res.status(500).json({ message: '데이터를 불러오지 못했습니다.' });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('서버 오류:', err.message);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};
