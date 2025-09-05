// components/SidebarEditable.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function SidebarEditable({
  userId,
  onRefresh,
  onApplyImage,   // 🔹 PromptCreate에서 내려주는 콜백
  onApplyText,    // 🔹 PromptCreate에서 내려주는 콜백
}) {
  const baseUrl = import.meta.env.VITE_EXPRESS_URL;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    companyInfo: { brand_name: "", cs_contact: "", homepage: "", logo_url: "" },
    shippingPolicy: { delivery_fee: "", delivery_time: "", return_policy: "", address: "" },
    promptGuides: [],
    recentImages: [],     // 🔹 추가
    recentPrompts: [],    // 🔹 추가
  });

  useEffect(() => {
    if (!userId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${baseUrl}/api/sidebar-info/${userId}`);
        setData({
          companyInfo: res.data.companyInfo || {},
          shippingPolicy: res.data.shippingPolicy || {},
          promptGuides: res.data.promptGuides || [],
          recentImages: res.data.recentImages || [],
          recentPrompts: res.data.recentPrompts || [],
        });
      } catch (err) {
        console.error("❌ 데이터 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const handleChange = (section, key, value) => {
    setData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await axios.put(`${baseUrl}/api/sidebar-info/${userId}`, {
        companyInfo: data.companyInfo,
        shippingPolicy: data.shippingPolicy,
      });
      onRefresh && onRefresh();
      alert("✅ 저장 완료!");
    } catch (err) {
      console.error("❌ 저장 실패:", err);
      alert("저장 실패");
    } finally {
      setSaving(false);
    }
  };

  const savePrompt = async (text) => {
    try {
      await axios.post(`${baseUrl}/api/sidebar-info/prompts/${userId}`, { content: text });
      onRefresh && onRefresh();
      alert("✅ 글 저장 완료!");
    } catch (e) {
      console.error(e);
      alert("❌ 글 저장 실패");
    }
  };

  const saveImage = async (image_url) => {
    try {
      await axios.post(`${baseUrl}/api/sidebar-info/images/${userId}`, { image_url });
      onRefresh && onRefresh();
      alert("✅ 이미지 저장 완료!");
    } catch (e) {
      console.error(e);
      alert("❌ 이미지 저장 실패");
    }
  };

  if (loading) return <div>⏳ 로딩중...</div>;

  return (
    <div className="p-3 border rounded bg-gray-50 space-y-4">
      <div>
        <h2 className="font-bold text-lg mb-2">회사 정보</h2>
        <input
          className="w-full mb-1 border rounded px-2 py-1"
          type="text"
          placeholder="브랜드명"
          value={data.companyInfo.brand_name || ""}
          onChange={(e) => handleChange("companyInfo", "brand_name", e.target.value)}
        />
        <input
          className="w-full mb-1 border rounded px-2 py-1"
          type="text"
          placeholder="CS 연락처"
          value={data.companyInfo.cs_contact || ""}
          onChange={(e) => handleChange("companyInfo", "cs_contact", e.target.value)}
        />
        <input
          className="w-full mb-2 border rounded px-2 py-1"
          type="text"
          placeholder="홈페이지"
          value={data.companyInfo.homepage || ""}
          onChange={(e) => handleChange("companyInfo", "homepage", e.target.value)}
        />

        <h2 className="font-bold text-lg mt-4 mb-2">배송 정책</h2>
        <input
          className="w-full mb-1 border rounded px-2 py-1"
          type="text"
          placeholder="배송비"
          value={data.shippingPolicy.delivery_fee || ""}
          onChange={(e) => handleChange("shippingPolicy", "delivery_fee", e.target.value)}
        />
        <input
          className="w-full mb-2 border rounded px-2 py-1"
          type="text"
          placeholder="배송 소요시간"
          value={data.shippingPolicy.delivery_time || ""}
          onChange={(e) => handleChange("shippingPolicy", "delivery_time", e.target.value)}
        />

        <button
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>

      {/* 생성한 사진 */}
      <div>
        <h3 className="font-semibold mt-6 mb-2">📸 생성한 사진</h3>
        <div className="grid grid-cols-2 gap-2">
          {(data.recentImages || []).slice(0, 8).map((img) => (
            <div key={img.id || img.image_url} className="border rounded p-2">
              <img src={img.image_url} alt="gen" className="w-full h-24 object-cover rounded" />
              <div className="flex gap-1 mt-2">
                <button
                  className="text-xs px-2 py-1 bg-gray-200 rounded"
                  onClick={() => window.open(img.image_url, "_blank")}
                >
                  미리보기
                </button>
                <button
                  className="text-xs px-2 py-1 bg-emerald-500 text-white rounded"
                  onClick={() => onApplyImage && onApplyImage(img.image_url)}
                >
                  적용
                </button>
                <button
                  className="text-xs px-2 py-1 bg-blue-500 text-white rounded"
                  onClick={() => saveImage(img.image_url)}
                >
                  저장
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 생성한 글 */}
      <div>
        <h3 className="font-semibold mt-6 mb-2">📝 생성한 글</h3>
        <ul className="text-xs space-y-2">
          {(data.recentPrompts || []).slice(0, 10).map((p) => {
            const txt = p.generated_prompt || p.gpt_reply || "";
            return (
              <li key={p.id} className="border rounded p-2">
                <div className="line-clamp-3 whitespace-pre-wrap text-gray-700">{txt}</div>
                <div className="flex gap-1 mt-2">
                  <button
                    className="text-xs px-2 py-1 bg-emerald-500 text-white rounded"
                    onClick={() => onApplyText && onApplyText(txt)}
                  >
                    적용
                  </button>
                  <button
                    className="text-xs px-2 py-1 bg-blue-500 text-white rounded"
                    onClick={() => savePrompt(txt)}
                  >
                    저장
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
