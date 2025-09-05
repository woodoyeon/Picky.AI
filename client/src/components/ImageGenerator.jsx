import React, { useState } from 'react';
import axios from 'axios';

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    if (!prompt) return alert('프롬프트를 입력해주세요!');
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/generate`, { prompt });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert('이미지 생성 실패');
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🎨 Leonardo AI 이미지 생성기</h1>
      <input
        className="w-full border p-2 mb-4"
        placeholder="예: 20대 남성 모델이 옷을 입고 걷는 장면"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button onClick={handleGenerate} className="bg-blue-600 text-white px-4 py-2 rounded">
        이미지 생성 요청
      </button>

      {result && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">API 응답:</h2>
          <pre className="bg-gray-100 p-4 text-sm">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
