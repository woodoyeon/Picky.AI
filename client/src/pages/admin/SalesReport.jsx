// src/pages/admin/SalesReport.jsx
import React from 'react';

export default function SalesReport() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">📈 관리자 매출 통계</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">사용자 검색</label>
        <input type="text" className="w-full border rounded px-3 py-2" placeholder="사용자 이메일 또는 ID" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="border rounded p-4 shadow">
          <h2 className="font-semibold mb-2">월별 매출</h2>
          <div className="text-sm text-gray-600">2025년 4월: ₩1,200,000</div>
        </div>
        <div className="border rounded p-4 shadow">
          <h2 className="font-semibold mb-2">일별 매출</h2>
          <div className="text-sm text-gray-600">4/16: ₩200,000<br/>4/17: ₩180,000</div>
        </div>
        <div className="border rounded p-4 shadow">
          <h2 className="font-semibold mb-2">인기 상품</h2>
          <ul className="text-sm text-gray-600">
            <li>상품 A - 56회</li>
            <li>상품 B - 34회</li>
          </ul>
        </div>
        <div className="border rounded p-4 shadow">
          <h2 className="font-semibold mb-2">비인기 상품</h2>
          <ul className="text-sm text-gray-600">
            <li>상품 X - 1회</li>
            <li>상품 Y - 3회</li>
          </ul>
        </div>
        <div className="border rounded p-4 shadow col-span-1 md:col-span-2">
          <h2 className="font-semibold mb-2">광고비 대비 수익률</h2>
          <div className="text-sm text-gray-600">광고비: ₩300,000 / 순이익: ₩900,000 → 수익률: 300%</div>
        </div>
      </div>

      <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
        전체 리포트 다운로드
      </button>
    </div>
  );
}
