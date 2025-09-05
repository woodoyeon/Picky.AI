// components/ProductCard.jsx
import React from 'react';

export default function ProductCard({ product, onApprove, onReject }) {
  return (
    <div className="border p-4 rounded shadow bg-white">
      <img
        src={product.fitted_image_url}
        alt={product.title}
        className="w-full h-48 object-cover rounded mb-3"
      />
      <h2 className="text-lg font-semibold">{product.title}</h2>
      <p className="text-sm text-gray-600">{product.short_description}</p>

      {/* 관리자 승인 버튼이 있는 경우에만 보여줌 */}
      {onApprove && (
        <>
          <textarea
            placeholder="반려 사유 (선택)"
            className="w-full mt-2 border rounded p-1 text-sm"
          />
          <div className="flex gap-2 mt-2">
            <button onClick={() => onApprove(product.id)} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">승인</button>
            <button onClick={() => onReject(product.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">반려</button>
          </div>
        </>
      )}
    </div>
  );
}
