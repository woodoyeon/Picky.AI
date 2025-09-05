// ✅ src/components/QnAGeneration.jsx
import React, { useState } from "react";
import axios from "axios";

export default function QnAGeneration({ title, description, imageUrl, onSave }) {
  const [qnaText, setQnaText] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const API = import.meta.env.VITE_EXPRESS_URL;

  // ✅ GPT로 QnA 생성 (캐시 재사용 포함)
  const handleGenerateQnA = async () => {
    if (!title || !description) {
      alert("상품명과 설명이 필요합니다.");
      return;
    }
    setStatus("loading");
    setMessage("🧠 GPT로 QnA 생성 중…");
    try {
      const res = await axios.post(`${API}/api/generate-qna`, {
        title,
        description,
        imageUrl,
      });
      if (res.data?.qnaText) {
        setQnaText(res.data.qnaText);
        setStatus("done");
        setMessage(res.data.source === "supabase" ? "✅ 캐시 불러옴" : "✅ QnA 생성 완료");
      } else {
        setStatus("error");
        setMessage("❌ 응답 없음");
      }
    } catch (e) {
      console.error(e);
      setStatus("error");
      setMessage("❌ 서버/GPT 오류");
    }
  };

  // ✅ Supabase 저장
  const handleSaveQnA = async () => {
    if (!qnaText.trim()) {
      alert("QnA 내용이 비어 있습니다.");
      return;
    }
    setIsSaving(true);
    setMessage("💾 저장 중...");
    try {
      const res = await axios.post(`${API}/api/generate-qna`, {
        title,
        description,
        imageUrl,
        qnaText,
      });
      if (res.status === 200) {
        setMessage("✅ 저장 완료!");
        onSave?.(qnaText);
      } else {
        setMessage("❌ 저장 실패");
      }
    } catch (e) {
      console.error(e);
      setMessage("❌ 저장 오류");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="my-6 bg-white border rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-3">🤔 자주 묻는 질문 (QnA) 자동 생성 (10개)</h3>

      <div className="flex gap-2 mb-3">
        <button
          onClick={handleGenerateQnA}
          disabled={status === "loading"}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ✨ GPT 생성
        </button>
        <button
          onClick={handleSaveQnA}
          disabled={isSaving}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          💾 저장
        </button>
      </div>

      {message && <p className="text-sm text-gray-600 mb-2">{message}</p>}

      <textarea
        rows={12}
        value={qnaText}
        onChange={(e) => setQnaText(e.target.value)}
        className="w-full border p-3 rounded text-sm font-mono bg-gray-50"
        placeholder="GPT가 생성한 QnA가 여기에 표시됩니다. 직접 수정도 가능해요."
      />
    </div>
  );
}
