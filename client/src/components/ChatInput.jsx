import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export default function ChatInput({ sellerId, customerName }) {
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [liveChat, setLiveChat] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const scrollBoxRef = useRef(null);
  const bottomRef = useRef(null);

  // 과거 채팅 불러오기
  useEffect(() => {
    const fetchHistory = async () => {
      const { data } = await supabase
        .from('chat_logs')
        .select('messages')
        .eq('seller_id', sellerId)
        .eq('customer_name', customerName)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(); // ❗ .single() → .maybeSingle()

      if (data?.messages) {
        try {
          const parsed = typeof data.messages === 'string' ? JSON.parse(data.messages) : data.messages;
          setChatLog(parsed);
        } catch (e) {
          console.error('❌ messages 파싱 실패:', e);
        }
      }
    };
    fetchHistory();
  }, [sellerId, customerName]);

  // 실시간 채팅 로그 수신
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${sellerId}-${customerName}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_logs'
      }, payload => {
        if (
          payload.new.seller_id === sellerId &&
          payload.new.customer_name === customerName
        ) {
          try {
            const parsed = typeof payload.new.messages === 'string'
              ? JSON.parse(payload.new.messages)
              : payload.new.messages;
            setChatLog(parsed);
          } catch (e) {
            console.error('💥 실시간 파싱 오류:', e);
          }
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [sellerId, customerName]);

  // 실시간 상담 상태 수신
  useEffect(() => {
    const channel = supabase
      .channel(`chat-req-${sellerId}-${customerName}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_requests'
      }, payload => {
        if (
          payload.new.seller_id === sellerId &&
          payload.new.customer_name === customerName &&
          payload.new.status === 'accepted'
        ) {
          setLiveChat(true);
          setRequesting(false);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [sellerId, customerName]);

  // 채팅창 자동 스크롤
  useEffect(() => {
    if (bottomRef.current && scrollBoxRef.current) {
      scrollBoxRef.current.scrollTop = scrollBoxRef.current.scrollHeight;
    }
  }, [chatLog]);

  // 메시지 전송
  const handleSend = async () => {
    if (!message.trim()) return;

    const newMsg = { sender: '고객', text: message };
    const updatedLog = [...chatLog, newMsg];
    setMessage('');
    setChatLog(updatedLog);

    // 상담 상태 확인
    const { data: request } = await supabase
      .from('chat_requests')
      .select('status')
      .eq('seller_id', sellerId)
      .eq('customer_name', customerName)
      .maybeSingle(); // ❗ .single() → .maybeSingle()

    const isLive = request?.status === 'accepted';
    setLiveChat(isLive);

    if (isLive) {
      await supabase.from('chat_logs').insert([{
        seller_id: sellerId,
        customer_name: customerName,
        messages: JSON.stringify(updatedLog),
        sentiment: null,
        ai_advice: null
      }]);
    } else {
      const res = await fetch('http://localhost:5000/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seller_id: sellerId, customer_name: customerName, message })
      });

      const data = await res.json();
      const aiMsg = { sender: 'AI', text: data.reply, sentiment: data.sentiment };
      const fullLog = [...updatedLog, aiMsg];
      setChatLog(fullLog);

      const adviceRes = await fetch('http://localhost:5000/generate-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: fullLog })
      });

      const { advice } = await adviceRes.json();

      await supabase.from('chat_logs').insert([{
        seller_id: sellerId,
        customer_name: customerName,
        messages: JSON.stringify(fullLog),
        sentiment: data.sentiment,
        ai_advice: advice
      }]);
    }
  };

  // 상담 요청 버튼
  const handleLiveChatRequest = async () => {
    await supabase.from('chat_requests').upsert({
      seller_id: sellerId,
      customer_name: customerName,
      status: 'requested'
    });
    setRequesting(true);
  };

  return (
    <div className="flex flex-col h-[520px] w-full max-w-md mx-auto bg-white border rounded-lg shadow">
      <div className="p-2 border-b flex justify-between items-center bg-gray-50">
        <span className="text-sm text-gray-600">고객: {customerName}</span>
        <button
          onClick={handleLiveChatRequest}
          disabled={liveChat || requesting}
          className={`text-xs px-3 py-1 rounded-full font-semibold transition ${
            liveChat ? 'bg-green-500 text-white' :
            requesting ? 'bg-yellow-400 text-white' :
            'bg-gray-200 text-gray-700'
          }`}
        >
          {liveChat ? `${customerName} 연결 중...` :
          requesting ? `${customerName} 채팅 요청 중...` :
          '상담원과 채팅하기'}
        </button>
      </div>

      <div ref={scrollBoxRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {chatLog.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === '고객' ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-4 py-2 rounded-lg max-w-xs text-sm shadow ${
              msg.sender === '고객' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
            }`}>
              {msg.text}
              {msg.sentiment && <div className="text-xs text-gray-500 mt-1">감정: {msg.sentiment}</div>}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t p-3 flex items-center space-x-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={liveChat ? '상담원에게 메시지 전송' : '챗봇에게 메시지 전송'}
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <button onClick={handleSend} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-full">전송</button>
      </div>
    </div>
  );
}
