import React from 'react';

export default function PreviewSection() {
  return (
    <div className="w-full max-w-4xl mx-auto mt-12 p-6 border rounded-lg shadow bg-gray-50">
      <h2 className="text-lg font-bold mb-4 text-gray-700">AI가 생성한 상세페이지 미리보기</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-md p-4 shadow-sm bg-white">
            <div className="w-full h-40 bg-gray-200 rounded mb-2" />
            <p className="text-sm text-gray-600">여기에 AI가 생성한 설명글이 들어갑니다.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
