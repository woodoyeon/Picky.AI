// components/Step5DetailUpload.jsx
import React, { useState, useEffect } from 'react';
import { uploadDetailImageToSupabase } from '../utils/uploadDetailImageToSupabase';
import { supabase } from '../supabaseClient';

const imageLabels = ['front', 'side', 'back', 'point'];

export default function Step5DetailUpload({ detailImages, setDetailImages, userId = 'guest' }) {
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [uploadedList, setUploadedList] = useState([]);

  // ✅ 업로드 후 Supabase에서 최신 파일 목록 가져오기
  const fetchUploadedImages = async () => {
    try {
      const { data, error } = await supabase
        .storage
        .from('detail-images')
        .list(`${userId}/detail-images`, {
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) throw error;

      // Public URL 변환
      const urls = data.map(item => {
        const { data: urlData } = supabase
          .storage
          .from('detail-images')
          .getPublicUrl(`${userId}/detail-images/${item.name}`);
        return urlData.publicUrl;
      });

      setUploadedList(urls);
    } catch (err) {
      console.error('❌ 파일 목록 가져오기 실패:', err);
    }
  };

  useEffect(() => {
    fetchUploadedImages();
  }, []);

  const handleImageUpload = async (file, index) => {
    if (!file) {
      console.warn(`⚠️ ${imageLabels[index]} 업로드할 파일이 없습니다.`);
      return;
    }

    try {
      setUploadingIndex(index);

      const url = await uploadDetailImageToSupabase(file, imageLabels[index], userId);
      if (!url) throw new Error(`❌ ${imageLabels[index]} Supabase 업로드 실패`);

      // ✅ 상태를 URL 문자열 배열로 저장 (객체 X)
      setDetailImages(prev => {
        const newState = [...prev];
        newState[index] = url; // 문자열만 저장
        return newState;
      });

      // 목록 갱신
      await fetchUploadedImages();

      alert(`✅ ${imageLabels[index]} 이미지 업로드 완료`);
    } catch (err) {
      console.error(`🔥 ${imageLabels[index]} 업로드 중 오류:`, err);
      alert(`❌ ${imageLabels[index]} 이미지 업로드 실패`);
    } finally {
      setUploadingIndex(null);
    }
  };

  return (
    <section className="bg-white p-6 rounded-xl shadow-lg space-y-6 border border-yellow-300">
      <h2 className="text-2xl font-bold text-yellow-600 text-center">
        STEP 5. 상품 디테일 이미지 추가
      </h2>
      <p className="text-center text-gray-600">
        정면, 측면, 후면, 포인트컷 등 총 4장의 실제 상품 디테일 이미지를 등록하세요.
      </p>

      {/* 업로드 입력 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {imageLabels.map((label, index) => (
          <div key={index} className="text-center space-y-2">
            <label className="font-medium text-gray-700">{label}</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files[0], index)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2"
            />
            {uploadingIndex === index && (
              <p className="text-sm text-yellow-500">업로드 중...</p>
            )}
            {detailImages[index] && (
              <img
                src={detailImages[index]}
                alt={`${label} 미리보기`}
                className="w-full max-w-xs mx-auto rounded-lg shadow"
              />
            )}
          </div>
        ))}
      </div>

      {/* 업로드된 이미지 목록 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mt-6">
          📂 업로드된 이미지 (최신순)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          {uploadedList.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`업로드 이미지 ${i}`}
              className="w-full rounded-lg shadow"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
