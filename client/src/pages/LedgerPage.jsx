import React from 'react';
import Footer from '../components/Footer';

export default function LedgerPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 pt-24 px-6">
      <h1 className="text-2xl font-bold text-green-600 mb-8">📊 매출 대시보드</h1>

      {/* 월별 매출 차트 (Placeholder) */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold mb-2">🗓️ 월별 매출 차트</h2>
        <div className="bg-gray-100 border h-52 rounded flex items-center justify-center text-gray-500">
          (여기에 월별 차트 삽입 예정)
        </div>
      </div>

      {/* 일별 매출 추이 차트 */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold mb-2">📈 일별 매출 추이</h2>
        <div className="bg-gray-100 border h-40 rounded flex items-center justify-center text-gray-500">
          (여기에 일별 추이 그래프 삽입 예정)
        </div>
      </div>

      {/* 매출 관련 요약 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 text-center">
        <div className="bg-green-100 p-4 rounded shadow">
          <p className="text-sm">총 매출</p>
          <p className="text-xl font-bold text-green-700">₩4,200,000</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded shadow">
          <p className="text-sm">총 원가</p>
          <p className="text-xl font-bold text-yellow-700">₩1,200,000</p>
        </div>
        <div className="bg-blue-100 p-4 rounded shadow">
          <p className="text-sm">광고비</p>
          <p className="text-xl font-bold text-blue-700">₩500,000</p>
        </div>
        <div className="bg-purple-100 p-4 rounded shadow">
          <p className="text-sm">순이익</p>
          <p className="text-xl font-bold text-purple-700">₩2,500,000</p>
        </div>
      </div>

      {/* 인기 상품 TOP5 */}
      <div className="mb-12">
        <h2 className="text-lg font-semibold mb-2">🔥 인기 상품 TOP 5</h2>
        <ol className="list-decimal pl-6 text-gray-700 space-y-1">
          {['슬림 자켓', '와이드 팬츠', '루즈핏 후드', '기모 맨투맨', '반팔 셔츠'].map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      </div>

      {/* 재고 부족 알림 */}
      <div className="mb-20">
        <h2 className="text-lg font-semibold mb-2 text-red-600">⚠️ 재고 부족 상품</h2>
        <ul className="list-disc pl-6 text-sm text-red-500">
          <li>데님 팬츠 (재고: 2개)</li>
          <li>오버핏 티셔츠 (재고: 4개)</li>
        </ul>
      </div>

      <Footer />
    </div>
  );
}
