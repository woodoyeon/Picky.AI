import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setUser(null);

      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        setUser(null);
      } else {
        setUser(user);
      }

      setLoading(false);
    };

    fetchUserAndRole();
  }, []);

  if (loading) return null;

  if (!user) {
    return (
      <div className="p-8 text-red-500 font-semibold">
        🚫 관리자 전용 페이지입니다. 접근 권한이 없습니다.
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">📊 관리자 대시보드</h1>
      <p className="text-lg text-gray-700">
        이곳은 관리자만 접근 가능한 메인 페이지입니다. 기능은 추후 추가될 예정입니다.
      </p>
    </div>
  );
}
