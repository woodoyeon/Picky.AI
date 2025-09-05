// pages/products/[id].jsx

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('product_details')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ 상품 조회 실패:', error.message);
      } else {
        setProduct(data);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  if (loading) return <div className="p-10 text-center">⏳ 로딩 중...</div>;
  if (!product) return <div className="p-10 text-red-500 text-center">🚫 상품을 찾을 수 없습니다</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-lg mt-10">
      <img src={product.fitted_image_url} alt="상품 이미지" className="w-full mb-4 rounded" />

      <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.title}</h1>
      <p className="text-gray-600 mb-4">{product.short_description}</p>

      {[product.section1_text, product.section2_text, product.section3_text].map((text, idx) => (
        <div key={idx} className="border-t pt-4 mt-4">
          <p className="text-sm text-gray-700">이미지 설명 {idx + 1}</p>
          <p className="text-gray-800 font-medium">{text}</p>
        </div>
      ))}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
        <h2 className="text-lg font-semibold text-gray-700">📦 상세 설명</h2>
        <p className="mt-2 text-gray-800 whitespace-pre-line">{product.long_description}</p>
      </div>
    </div>
  );
}
