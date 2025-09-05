import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [mode, setMode] = useState('login');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    setMessage('');

    if (mode === 'signup' && pw !== pwConfirm) {
      setMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    const role = email === 'dydy1212qwqw@naver.com' ? 'admin' : 'user';

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pw,
        options: {
          data: { role },
        },
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      const user = data.user;
      if (user) {
        await supabase.from('users').insert({
          id: user.id,
          email: user.email,
          role,
          status: 'active',
        });
      }

      setMessage('회원가입 메일을 확인해주세요.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pw,
      });

      if (error) return setMessage(error.message);
      setMessage('로그인 성공!');
      window.location.href = '/';
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto mt-10 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">{mode === 'signup' ? '회원가입' : '로그인'}</h2>
      <input type="email" placeholder="이메일" className="border p-2 w-full mb-2" value={email} onChange={(e) => setEmail(e.target.value)} />
      <div className="relative mb-2">
        <input type={showPw ? 'text' : 'password'} placeholder="비밀번호" className="border p-2 w-full pr-10" value={pw} onChange={(e) => setPw(e.target.value)} />
        <span onClick={() => setShowPw(!showPw)} className="absolute right-2 top-2 cursor-pointer text-sm text-blue-600">{showPw ? '숨기기' : '보기'}</span>
      </div>
      {mode === 'signup' && (
        <div className="relative mb-2">
          <input type={showPw ? 'text' : 'password'} placeholder="비밀번호 확인" className="border p-2 w-full pr-10" value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} />
          <span onClick={() => setShowPw(!showPw)} className="absolute right-2 top-2 cursor-pointer text-sm text-blue-600">{showPw ? '숨기기' : '보기'}</span>
        </div>
      )}
      <button onClick={handleSubmit} className="bg-blue-600 text-white w-full p-2 rounded">{mode === 'signup' ? '회원가입' : '로그인'}</button>
      <p className="text-sm text-center mt-2 text-gray-600 cursor-pointer" onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setMessage(''); }}>{mode === 'signup' ? '이미 계정이 있나요? 로그인' : '계정이 없나요? 회원가입'}</p>
      {message && <p className="mt-3 text-center text-red-500">{message}</p>}
    </div>
  );
}
