import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Footer from '../components/Footer';
import ChatInput from '../components/ChatInput';
import UserChatInput from '../components/UserChatInput';

export default function ChatLogs() {
  const [customerName, setCustomerName] = useState('홍길동');
  const [logs, setLogs] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user?.id) {
        console.error('❌ 로그인 유저 없음:', userError);
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", user.email)
        .single();

      if (!existingUser) {
        await supabase.from("users").insert({
          id: user.id,
          email: user.email,
          role: "user",
          status: "active"
        });
      }

      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      let query = supabase
        .from("chat_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (profile?.role !== "admin") {
        query = query.eq("seller_id", user.id);
      }

      const { data: chatData, error: chatError } = await query;
      if (chatError) {
        console.error('❌ 채팅 로그 로딩 실패:', chatError);
      } else {
        setLogs(chatData);
      }

      setLoading(false);
    };

    fetchLogs();
  }, []);

  if (loading) return <div className="text-center mt-32">🔐 로그인 확인 중...</div>;
  if (!userId) return <div className="text-center mt-32 text-red-600">❌ 로그인 정보를 가져올 수 없습니다.</div>;

  const latest = logs[0];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 pt-24 px-6">
      <h2 className="text-2xl font-bold mb-8 text-center">
        💬 고객 상담창 (고객 ↔ 사용자 실시간 채팅)
      </h2>

      {/* 실시간 채팅창 */}
      <div className="flex flex-col items-center space-y-6">
        <div className="flex flex-col md:flex-row gap-8 w-full justify-center">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2 text-center">👥 고객 채팅창</h3>
            <ChatInput sellerId={userId} customerName={customerName} />
          </div>

          <div className="flex-1 flex items-center justify-center flex-col">
            <h3 className="text-lg font-semibold mb-2 text-center">👤 사용자 응답창</h3>
            <UserChatInput sellerId={userId} customerName={customerName} />
          </div>
        </div>
      </div>

      {/* 최신 상담 요약 */}
      <h1 className="text-2xl font-bold text-blue-600 mt-16 mb-6 text-center">📋 최근 상담 요약</h1>

      {latest ? (
        <div className="max-w-3xl mx-auto p-6 bg-white border rounded-lg shadow space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-lg font-semibold text-gray-700">
              👤 고객명: {latest.customer_name}
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
              latest.sentiment === '긍정' ? 'bg-green-100 text-green-700' :
              latest.sentiment === '부정' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              감정: {latest.sentiment || '분석 중'}
            </span>
          </div>

          {/* 어드바이스 항상 표시 */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-sm rounded-md space-y-3">
            <p className="font-bold text-yellow-800">💬 상담 어시스턴트의 조언</p>

            {latest.ai_advice ? (
              <>
                <p className="text-gray-800">
                  현재 고객님은 <strong className="underline">{latest.sentiment || '감정 분석 중'}</strong> 상태로 보입니다.
                  아래처럼 응답하시면 더 좋은 결과를 이끌 수 있어요.
                </p>

                <div className="bg-white border border-yellow-200 p-3 rounded shadow-sm leading-relaxed relative">
                  <p className="mb-2 text-gray-700">📌 <strong>추천 응대 문장</strong></p>
                  <blockquote className="italic text-blue-800 border-l-4 border-blue-400 pl-3 whitespace-pre-line">
                    {latest.ai_advice}
                  </blockquote>

                  <div className="flex justify-end mt-3 space-x-2 text-sm">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(latest.ai_advice);
                        alert('📋 응대 문장이 복사되었습니다!');
                      }}
                      className="px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                    >복사하기</button>

                    <button
                      onClick={() => {
                        const input = document.querySelector('input.user-response-input');
                        if (input) {
                          input.value = latest.ai_advice;
                          input.dispatchEvent(new Event('input', { bubbles: true }));
                          input.focus();
                        } else {
                          alert("❌ 상담원 입력창을 찾을 수 없습니다.");
                        }
                      }}
                      className="px-3 py-1 rounded bg-green-100 text-green-800 hover:bg-green-200"
                    >응답창에 넣기</button>
                  </div>
                </div>

                <p className="text-gray-600 text-xs">
                  💡 공감 → 해결책 → 사후 조치의 순서로 응답해보세요.
                </p>
              </>
            ) : (
              <p className="text-gray-500">
                🤖 아직 어드바이스 문장이 생성되지 않았어요. 고객 메시지가 더 필요할 수 있어요.
              </p>
            )}
          </div>

          {/* 대화 메시지 리스트 */}
          <div className="space-y-2 max-h-64 overflow-y-auto border-t pt-4">
            {(() => {
              try {
                const messages = typeof latest.messages === 'string'
                  ? JSON.parse(latest.messages)
                  : latest.messages;
                return messages.map((msg, i) => (
                  <div key={i} className={`p-2 rounded ${
                    msg.sender === '고객'
                      ? 'bg-white border-l-4 border-pink-300'
                      : 'bg-blue-50 border-l-4 border-blue-300'
                  }`}>
                    <strong>{msg.sender}</strong>: {msg.text}
                  </div>
                ));
              } catch (e) {
                return <p className="text-red-500 text-sm">❌ 대화 파싱 실패</p>;
              }
            })()}
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 my-12">📭 대화 기록이 없습니다.</p>
      )}

      <Footer />
    </div>
  );
}
