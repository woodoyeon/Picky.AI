// ✅ src/components/ShippingPolicyEditor.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ShippingPolicyEditor({ title, description, imageUrl, onSave }) {
  const [policyText, setPolicyText] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const API = import.meta.env.VITE_EXPRESS_URL;

  // ✅ GPT로 정책 생성
  // imageUrl만 존재하기 때문에 title, description도 생성되도록 코드를 수정해야작동한다.
  const handleGeneratePolicy = async () => {
    console.log("DEBUG:", { title, description, imageUrl });
    if (!title || !description) {
      alert("상품명과 설명이 필요합니다.");
      //return;
    }

    setStatus("loading");
    setMessage("🚀 GPT로 정책 생성 중…");

    try {
      const res = await axios.post(`${API}/api/generate-policy`, {
        title,
        description,
        imageUrl,
      });

      if (res.data?.policy) {
        setPolicyText(res.data.policy);
        setStatus("done");
        setMessage("✅ 정책 생성 완료");
      } else {
        setStatus("error");
        setMessage("❌ 정책 생성 실패");
      }
    } catch (e) {
      console.error(e);
      setStatus("error");
      setMessage("❌ 서버 오류");
    }
  };

  // ✅ Supabase 저장
  const handleSavePolicy = async () => {
    if (!policyText.trim()) {
      alert("정책 내용이 비어 있습니다.");
      return;
    }

    setIsSaving(true);
    setMessage("💾 저장 중...");

    try {
      const res = await axios.post(`${API}/api/generate-policy`, {
        title,
        description,
        imageUrl,
        policyText,
      });

      if (res.status === 200) {
        setMessage("✅ 저장 완료!");
        onSave?.(policyText);
      } else {
        setMessage("❌ 저장 실패");
      }
    } catch (e) {
      console.error(e);
      setMessage("❌ 서버 오류");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="my-6 bg-white border rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-3">🚚 배송 · 교환 · 환불 정책</h3>

      <div className="flex gap-2 mb-3">
        <button
          onClick={handleGeneratePolicy}
          disabled={status === "loading"}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ✨ GPT로 자동 생성
        </button>

        <button
          onClick={handleSavePolicy}
          disabled={isSaving}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          💾 저장하기
        </button>
      </div>

      {message && <p className="text-sm text-gray-600 mb-2">{message}</p>}

      <textarea
        rows={14}
        value={policyText}
        onChange={(e) => setPolicyText(e.target.value)}
        className="w-full border p-3 rounded text-sm font-mono bg-gray-50"
        placeholder="GPT가 생성한 정책이 여기에 표시됩니다. 직접 수정도 가능해요."
      />
    </div>
  );
}
