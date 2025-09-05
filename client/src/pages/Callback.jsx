import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('✅ Callback 컴포넌트 마운트됨');

    const fetchToken = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      console.log('🔍 현재 URL:', window.location.href);
      console.log('🔍 추출된 code:', code);

      if (!code) {
        alert('❌ 인증 코드가 없습니다.');
        console.error('❌ URL에 ?code=가 없습니다.');
        return;
      }

      try {
        console.log('📡 /api/cafe24/token 요청 시작');
        const res = await axios.post('/api/cafe24/token', { code });

        console.log('📦 서버 응답 전체:', res.data);

        const access_token = res.data.access_token;
        const mall_id = res.data.mall_id;

        console.log('✅ 받은 access_token:', access_token);
        console.log('✅ 받은 mall_id:', mall_id);

        if (!access_token || !mall_id) {
          console.warn('⚠️ access_token 또는 mall_id가 비어 있습니다.');
          alert('❌ access_token 또는 mall_id가 없습니다. 다시 시도해주세요.');
          return;
        }

        // 👉 로컬 스토리지에 저장
        localStorage.setItem('cafe24_access_token', access_token);
        localStorage.setItem('cafe24_mall_id', mall_id);
        console.log('💾 localStorage 저장 완료');
        console.log('📌 저장된 access_token:', localStorage.getItem('cafe24_access_token'));
        console.log('📌 저장된 mall_id:', localStorage.getItem('cafe24_mall_id'));

        alert('✅ 인증 완료! 이제 상품을 전송할 수 있어요.');
        navigate('/my-products');
      } catch (err) {
        console.error('❌ 토큰 발급 실패:', err.response?.data || err.message);
        alert('❌ 인증 실패. 다시 시도해주세요.');
      }
    };

    fetchToken();
  }, [navigate]);

  return (
    <div className="text-center p-10 text-gray-600">
      ⏳ 인증 처리 중입니다. 잠시만 기다려주세요...
    </div>
  );
}
