import React, { useState, useEffect } from 'react';

export default function UploadBox({ label, onImageUpload, previewUrl }) {
  const [internalPreview, setInternalPreview] = useState(previewUrl || null);

  useEffect(() => {
    if (previewUrl) {
      setInternalPreview(previewUrl); // 외부 preview 적용
    }
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setInternalPreview(reader.result); // 내부 preview 업데이트
      onImageUpload(file);               // 부모로 전달
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-[280px] sm:w-[300px] md:w-[340px] lg:w-[360px] bg-white rounded-2xl shadow-xl p-6 text-center">
      <label className="bg-gradient-to-r from-pink-400 to-blue-400 text-white font-semibold px-4 py-2 rounded-full mb-4 shadow hover:opacity-90 transition cursor-pointer inline-block">
        {label || '이미지 업로드'}
        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </label>
      <p className="text-pink-500 font-semibold text-sm mb-1">또는 파일을 드래그 하세요</p>
      <p className="text-xs text-gray-400">
        붙여넣기 또는 <span className="text-pink-400 underline cursor-pointer">URL 입력</span>
      </p>
      {internalPreview && (
        <img src={internalPreview} alt="미리보기" className="mt-4 w-full max-w-xs mx-auto rounded-md" />
      )}
    </div>
  );
}
