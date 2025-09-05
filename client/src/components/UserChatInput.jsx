import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export default function UserChatInput({ sellerId, customerName }) {
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [connected, setConnected] = useState(false);
  const [advice, setAdvice] = useState('');
  const [requestStatus, setRequestStatus] = useState('idle');
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);

  const fetchLatestChat = async () => {
    const { data, error } = await supabase
      .from('chat_logs')
      .select('messages, ai_advice')
      .eq('seller_id', sellerId)
      .eq('customer_name', customerName)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) return console.error('❌ chat_logs 불러오기 실패:', error.message);

    try {
      const parsed = typeof data?.messages === 'string' ? JSON.parse(data.messages) : data.messages || [];
      setChatLog(parsed);
      setAdvice(data?.ai_advice || '');
    } catch (e) {
      console.error('❌ 메시지 파싱 오류:', e);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    const newMsg = { sender: '사용자', text: message };
    const updatedLog = [...chatLog, newMsg];
    setChatLog(updatedLog);
    setMessage('');

    await supabase.from('chat_logs').insert([{
      seller_id: sellerId,
      customer_name: customerName,
      messages: JSON.stringify(updatedLog),
      sentiment: null,
      ai_advice: advice
    }]);
  };

  const handleAccept = async () => {
    await supabase
      .from('chat_requests')
      .update({ status: 'accepted' })
      .eq('seller_id', sellerId)
      .eq('customer_name', customerName);
    setConnected(true);
    setRequestStatus('accepted');
    fetchLatestChat();
  };

  const handleEndChat = async () => {
    await supabase
      .from('chat_requests')
      .delete()
      .eq('seller_id', sellerId)
      .eq('customer_name', customerName);
    setConnected(false);
    setRequestStatus('idle');
    setChatLog([]);
  };

  useEffect(() => {
    const checkStatus = async () => {
      const { data, error } = await supabase
        .from('chat_requests')
        .select('status')
        .eq('seller_id', sellerId)
        .eq('customer_name', customerName)
        .maybeSingle();

      if (error) return console.error('❌ chat_requests 조회 실패:', error.message);

      if (data?.status === 'accepted') {
        setConnected(true);
        setRequestStatus('accepted');
        fetchLatestChat();
      } else if (data?.status === 'pending' || data?.status === 'requested') {
        setRequestStatus('requested');
      }
    };

    checkStatus();

    const channel = supabase
      .channel(`chat-req-${sellerId}-${customerName}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_requests' }, payload => {
        const status = payload.new?.status;
        if (status === 'pending' || status === 'requested') setRequestStatus('requested');
        else if (status === 'accepted') {
          setConnected(true);
          setRequestStatus('accepted');
          fetchLatestChat();
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [sellerId, customerName]);

  useEffect(() => {
    if (!connected) return;

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
            setAdvice(payload.new.ai_advice || '');
          } catch (e) {
            console.error('💥 실시간 파싱 오류:', e);
          }
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [connected, sellerId, customerName]);

  useEffect(() => {
    if (bottomRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatLog]);

  return (
    <div className="w-full max-w-md p-4 border rounded shadow bg-white">
      <div className="flex justify-between mb-2">
        <h2 className="text-lg font-semibold">💬 {customerName} 대화</h2>
        {!connected && (
          <button
            onClick={handleAccept}
            disabled={requestStatus !== 'requested'}
            className={`px-3 py-1 rounded text-white font-semibold transition duration-150 ${
              requestStatus === 'accepted'
                ? 'bg-gray-400 cursor-not-allowed'
                : requestStatus === 'requested'
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {requestStatus === 'requested' && `${customerName} 대화 요청...`}
            {requestStatus === 'accepted' && `${customerName} 연결 중...`}
            {requestStatus === 'idle' && '대화 수락하기'}
          </button>
        )}
      </div>

      <div ref={scrollRef} className="h-64 overflow-y-auto mb-3 space-y-2">
        {chatLog.map((msg, idx) => (
          <div key={idx} className={`p-2 rounded ${msg.sender === '사용자' ? 'bg-blue-100 text-right' : 'bg-gray-100 text-left'}`}>
            <strong>{msg.sender}</strong>: {msg.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {advice && (
        <div className="mb-3 p-2 text-sm bg-yellow-50 border-l-4 border-yellow-400">
          💡 상담 어드바이스: {advice}
        </div>
      )}

      {connected && (
        <div className="flex space-x-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="user-response-input flex-1 border px-3 py-2 rounded"
            placeholder="고객에게 답변하기..."
          />
          <button onClick={handleSend} className="bg-blue-600 text-white px-4 py-2 rounded">전송</button>
          <button onClick={handleEndChat} className="bg-red-500 text-white px-4 py-2 rounded">대화 종료</button>
        </div>
      )}
    </div>
  );
}
