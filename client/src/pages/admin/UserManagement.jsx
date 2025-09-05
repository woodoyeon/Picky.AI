import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { supabaseAdmin } from '../../supabaseAdminClient';

export default function UserManagement() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) return null;

  if (!user || user.user_metadata?.role !== 'admin') {
    return <div className="p-8 text-red-500 font-semibold">🚫 관리자 전용 페이지입니다</div>;
  }

  const makeAdmin = async () => {
    const userId = '79969306-d3f8-4b97-bc0c-cc20cc67ffe5';
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: { role: 'admin' }
    });

    if (error) {
      alert('❌ 관리자 지정 실패: ' + error.message);
    } else {
      alert('✅ 관리자 지정 완료!');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">👤 사용자 계정 관리</h1>

      <div className="mb-6 border rounded p-4 shadow bg-yellow-50">
        <h2 className="font-semibold mb-2">관리자 직접 지정 (개발용)</h2>
        <button
          onClick={makeAdmin}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          dydy1212qwqw@naver.com 관리자로 지정
        </button>
      </div>

      {/* 기존 사용자 리스트 UI 유지 */}
    </div>
  );
}
