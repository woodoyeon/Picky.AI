// src/pages/docs/ApiListPage.jsx

import React from 'react';

const apiFeatures = [
  '🧠 모델 생성',
  '🖼️ 이미지 합성',
  '✍️ 글 작성',
  '🎞️ 움직이는 동영상 제작',
  '📐 템플릿 툴 제작',
  '📤 업로드',
  '📺 광고 영상 제작',
  '💬 챗봇',
  '📊 매출 대시보드',
];

export default function ApiListPage() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">🔌 제공되는 API 목록</h2>
      <ul className="list-disc pl-6 space-y-1 text-lg">
        {apiFeatures.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
