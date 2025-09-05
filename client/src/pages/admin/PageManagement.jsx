// src/pages/admin/PageManagement.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

export default function PageManagement() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPages = async () => {
      const { data, error } = await supabase
        .from('product_details')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ 상세페이지 불러오기 오류:', error.message);
      } else {
        setPages(data);
      }

      setLoading(false);
    };

    fetchPages();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🗂️ 상세페이지 관리</h1>
      {loading ? (
        <p>불러오는 중...</p>
      ) : pages.length === 0 ? (
        <p>등록된 상세페이지가 없습니다.</p>
      ) : (
        <table className="min-w-full text-sm border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">ID</th>
              <th className="p-2 border">제목</th>
              <th className="p-2 border">상태</th>
              <th className="p-2 border">생성일</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id} className="text-center">
                <td className="p-2 border">{page.id}</td>
                <td className="p-2 border">{page.title || '제목 없음'}</td>
                <td className="p-2 border">{page.status}</td>
                <td className="p-2 border">{new Date(page.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
