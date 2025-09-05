import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import axios from 'axios';

export default function MyProducts() {
  const [userId, setUserId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  const [accessToken, setAccessToken] = useState('');
  const [mallId, setMallId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  
  useEffect(() => {
  const fetchUserAndProducts = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const currentUser = userData?.user;
    setUserId(currentUser?.id || null);

    
    if (currentUser) {
      try {
        const response = await axios.post('/api/products/mine', {
          userId: currentUser.id,
        });
        setProducts(response.data);
      } catch (error) {
        console.error('❌ 승인된 상세페이지 불러오기 실패:', error.message);
      }
    }
    
    // ✅ localStorage에서 cafe24 정보 가져오기
    const savedToken = localStorage.getItem('cafe24_access_token');
    const savedMallId = localStorage.getItem('cafe24_mall_id');

    console.log('📦 저장된 access_token:', savedToken);
    console.log('📦 저장된 mall_id:', savedMallId);

    if (!savedToken || !savedMallId) {
      //alert('❗access_token 또는 mall_id가 저장되어 있지 않습니다. 다시 인증을 진행해주세요.');
    }

    setAccessToken(savedToken || '');
    setMallId(savedMallId || '');

    setLoading(false);
  };

  fetchUserAndProducts();
}, []);




  const handleUpload = async (detailId) => {
    setUploadingId(detailId);
    setErrorMsg('');

    console.log('📦 업로드 시도:');
    console.log('🧩 accessToken:', accessToken);
    console.log('🧩 mallId:', mallId);
    console.log('🧩 detailId:', detailId);

    if (!accessToken || !mallId) {
      alert('❗️accessToken이나 mallId가 비어있습니다.');
      setUploadingId(null);
      return;
    }

    try {
      const res = await axios.post('/api/cafe24/upload', {
        detailId,
        accessToken,
        mallId,
      });

      const productNo = res.data.result.product.product_no;

      await supabase
        .from('product_details')
        .update({ cafe24_product_id: productNo })
        .eq('id', detailId);

      setProducts((prev) =>
        prev.map((p) =>
          p.id === detailId ? { ...p, cafe24_product_id: productNo } : p
        )
      );

      alert('✅ 카페24 등록 완료! 상품번호: ' + productNo);
    } catch (err) {
      console.error('❌ 등록 실패:', err.response?.data || err.message);
      setErrorMsg('전송 실패: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-500">⏳ 로딩 중...</div>;
  }

  const filteredProducts = products.filter((p) => {
    if (statusFilter === 'all') return true;
    return p.status === statusFilter;
  });

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">🛍️ 나의 상세페이지 목록</h1>

      <div className="flex gap-4 mb-4 justify-center">
        <input
          className="border px-3 py-1 rounded w-60"
          placeholder="엑세스 토큰"
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value)}
        />
        <input
          className="border px-3 py-1 rounded w-60"
          placeholder="Mall ID (예: yourmall)"
          value={mallId}
          onChange={(e) => setMallId(e.target.value)}
        />
      </div>

      <div className="flex justify-center gap-4 mb-6">
        {['all', 'approved', 'pending', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1 rounded text-sm border transition ${
              statusFilter === status
                ? status === 'approved'
                  ? 'bg-green-600 text-white'
                  : status === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : status === 'rejected'
                  ? 'bg-red-500 text-white'
                  : 'bg-black text-white'
                : 'hover:bg-gray-100'
            }`}
          >
            {status === 'all' && '전체'}
            {status === 'approved' && '승인 완료'}
            {status === 'pending' && '승인 대기'}
            {status === 'rejected' && '반려됨'}
          </button>
        ))}
      </div>

      {errorMsg && (
        <div className="text-red-600 text-sm text-center mb-4">❌ {errorMsg}</div>
      )}

      {filteredProducts.length === 0 ? (
        <p className="text-center text-gray-500">표시할 상세페이지가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProducts.map((p) => (
            <div key={p.id} className="border rounded-lg shadow p-4 bg-white">
              <img
                src={p.fitted_image_url}
                alt="미리보기"
                className="w-full h-48 object-cover rounded mb-3"
              />
              <h2 className="text-lg font-semibold mb-1">{p.title}</h2>
              <p className="text-sm text-gray-600">{p.short_description}</p>

              <div className="mt-2 text-sm">
                <span className="font-semibold">상태:</span>{' '}
                {p.status === 'approved' && (
                  <span className="text-green-600">승인 완료</span>
                )}
                {p.status === 'pending' && (
                  <span className="text-yellow-600">승인 대기 중</span>
                )}
                {p.status === 'rejected' && (
                  <span className="text-red-600">반려됨</span>
                )}
              </div>

              {p.status === 'rejected' && p.reject_reason && (
                <p className="text-xs text-red-500 mt-1">
                  🔍 반려 사유: {p.reject_reason}
                </p>
              )}

              {p.status === 'approved' && !p.cafe24_product_id && (
                <button
                  onClick={() => handleUpload(p.id)}
                  disabled={uploadingId === p.id}
                  className={`mt-4 px-4 py-2 text-white text-sm rounded 
                    ${uploadingId === p.id ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {uploadingId === p.id ? '⏳ 전송 중...' : '📦 카페24에 상품 등록'}
                </button>
              )}

              {p.cafe24_product_id && (
                <p className="text-sm mt-2 text-blue-600">
                  ☑️ 등록됨 (상품번호: {p.cafe24_product_id})
                </p>
              )}

              <div className="text-right mt-4 text-xs text-gray-400">
                생성일: {new Date(p.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
