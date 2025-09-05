import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

export default function PageApproval() {
  const [user, setUser] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reasons, setReasons] = useState({});

  useEffect(() => {
    const fetchUserAndPages = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user;
      setUser(currentUser);

      if (currentUser?.user_metadata?.role === 'admin') {
        const { data, error } = await supabase
          .from('product_details')
          .select(`
            *,
            user:users!product_details_user_id_fkey (
              email
            )
          `)
          .eq('status', 'pending')
          .order('created_at', { ascending: false }); // ✅ 추가된 정렬

        if (!error) setPages(data);
        else console.error('❌ 상세페이지 불러오기 실패:', error.message);
      }

      setLoading(false);
    };

    fetchUserAndPages();
  }, []);

  const handleApprove = async (id) => {
    try {
      // ✅ 1. 승인 처리
      await fetch(`http://localhost:5000/api/admin/approval/approve/${id}`, {
        method: 'POST',
      });

      // ✅ 2. 더미 쇼핑몰로 전송
      await fetch(`http://localhost:5000/api/send-to-demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ detailId: id }),
      });

      setPages((prev) => prev.filter((p) => p.id !== id));
      alert('✅ 승인 및 전송 완료!');
    } catch (err) {
      console.error('❌ 승인 실패:', err.message);
      alert('❌ 승인 또는 전송 실패');
    }
  };

  const handleReject = async (id) => {
    const reason = reasons[id]?.trim();
    if (!reason) return alert('❌ 반려 사유를 입력해주세요.');

    try {
      await fetch(`http://localhost:5000/api/admin/approval/reject/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      setPages((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('❌ 반려 요청 실패:', err.message);
    }
  };

  if (loading) return null;
  if (!user || user.user_metadata?.role !== 'admin') {
    return <div className="p-8 text-red-500 font-semibold">🚫 관리자 전용 페이지입니다</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">✅ 상세페이지 승인 관리</h1>

      {pages.length === 0 ? (
        <p className="text-gray-500">대기 중인 상세페이지가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pages.map((page) => (
            <div key={page.id} className="border p-4 rounded shadow bg-white">
              <img
                src={page.fitted_image_url}
                alt="미리보기"
                className="w-full h-48 object-cover rounded mb-3"
              />
              <h2 className="text-lg font-semibold mb-1">{page.title}</h2>
              <p className="text-xs text-gray-400">👤 요청자 ID: {page.user_id}</p>
              <p className="text-sm text-gray-600 mb-2">{page.short_description}</p>

              <textarea
                className="w-full border rounded p-2 text-sm mb-2"
                placeholder="반려 사유 입력"
                value={reasons[page.id] || ''}
                onChange={(e) =>
                  setReasons((prev) => ({ ...prev, [page.id]: e.target.value }))
                }
              />

              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(page.id)}
                  className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                >
                  승인
                </button>
                <button
                  onClick={() => handleReject(page.id)}
                  className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                >
                  반려
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
