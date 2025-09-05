import React, { useState } from 'react';
import Footer from '../components/Footer';

export default function Settings() {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  const handleChangePassword = () => {
    if (newPw !== confirmPw) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    // 실제 변경 로직 연결 예정
    alert('비밀번호가 성공적으로 변경되었습니다.');
  };

  const handleDeactivateAccount = () => {
    if (window.confirm('정말 계정을 비활성화하시겠습니까?')) {
      // 계정 비활성화 로직
      alert('계정이 비활성화되었습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 pt-24 px-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-700 mb-8">⚙️ 사용자 설정</h1>

      {/* 비밀번호 변경 */}
      <div className="mb-12">
        <h2 className="text-lg font-semibold mb-4">🔑 비밀번호 변경</h2>
        <input
          type="password"
          placeholder="현재 비밀번호"
          value={currentPw}
          onChange={(e) => setCurrentPw(e.target.value)}
          className="w-full border px-4 py-2 mb-3 rounded"
        />
        <input
          type="password"
          placeholder="새 비밀번호"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
          className="w-full border px-4 py-2 mb-3 rounded"
        />
        <input
          type="password"
          placeholder="새 비밀번호 확인"
          value={confirmPw}
          onChange={(e) => setConfirmPw(e.target.value)}
          className="w-full border px-4 py-2 mb-3 rounded"
        />
        <button
          onClick={handleChangePassword}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          비밀번호 변경
        </button>
      </div>

      {/* 계정 비활성화 */}
      <div className="mb-20">
        <h2 className="text-lg font-semibold mb-3 text-red-600">🚫 계정 비활성화</h2>
        <p className="text-sm text-gray-600 mb-2">계정을 비활성화하면 더 이상 서비스를 이용하실 수 없습니다.</p>
        <button
          onClick={handleDeactivateAccount}
          className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition"
        >
          계정 비활성화
        </button>
      </div>

      <Footer />
    </div>
  );
}
