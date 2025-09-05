import React from 'react';

export default function DetailPreview({ model, image }) {
  if (!image) return <p className="text-gray-500">👈 의류 이미지를 업로드하면 여기에 상세페이지가 미리보기로 생성됩니다.</p>;

  return (
    <div className="text-center">
      <img src={`/models/${model}.png`} alt="모델" className="w-40 mx-auto mb-3" />
      <img src={image} alt="의류" className="w-40 h-40 mx-auto border rounded" />
      <p className="mt-2 text-sm text-gray-700">상세페이지 자동 미리보기</p>
    </div>
  );
}
