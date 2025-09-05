import React from 'react';

export default function ChatAnalysis() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">💬 챗봇 대화 분석</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">사용자 선택</label>
        <select className="border rounded px-3 py-2 w-full">
          {[1, 2, 3].map((i) => (
            <option key={i}>user{i}@example.com</option>
          ))}
        </select>
      </div>

      <div className="mb-6 border rounded p-4 shadow">
        <h2 className="font-semibold mb-2">전체 대화 요약</h2>
        <p className="text-sm text-gray-600">고객이 환불을 요청했습니다. 시스템은 자동 응답으로 환불 안내를 제공했습니다.</p>
      </div>

      <div className="mb-6 border rounded p-4 shadow">
        <h2 className="font-semibold mb-2">감정 통계 요약</h2>
        <ul className="text-sm text-gray-600">
          <li>긍정: 5건</li>
          <li>부정: 2건</li>
          <li>환불 요청: 1건</li>
          <li>욕설 탐지: 0건</li>
        </ul>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">프롬프트 수정</label>
        <textarea className="w-full border rounded px-3 py-2 text-sm" placeholder="프롬프트 내용을 수정하세요..." rows={4}></textarea>
        <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">저장</button>
      </div>
    </div>
  );
} 
