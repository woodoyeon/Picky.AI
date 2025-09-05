// src/components/StoryBlock.jsx
import React from "react";

export default function StoryBlock({ story = "", onChange, editable = false }) {
  return (
    <div className="mt-8 bg-white rounded-md p-4 shadow-sm border">
      <h3 className="font-semibold text-gray-700 mb-2">🌱 제품 탄생 스토리</h3>
      {editable ? (
        <textarea
          value={story}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full h-40 border rounded px-3 py-2 text-gray-700"
          placeholder="예) 왜 이 제품을 만들었는지, 만든 사람/브랜드의 철학, 시행착오, 고객 피드백, 원재료/제작 비하인드 등"
        />
      ) : (
        <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{story}</p>
      )}
    </div>
  );
}
