// src/pages/admin/TemplateUpload.jsx
import React, { useState } from 'react';

export default function TemplateUpload() {
  const [templateName, setTemplateName] = useState('');
  const [file, setFile] = useState(null);

  const handleUpload = (e) => {
    e.preventDefault();

    // ✅ 여기에 Supabase나 서버로 업로드하는 로직 추가 가능
    alert(`📝 템플릿명: ${templateName}\n📎 파일: ${file?.name}`);
    setTemplateName('');
    setFile(null);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🧩 템플릿 등록</h1>
      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">템플릿 이름</label>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
            placeholder="예: 여성 의류 상세페이지 기본형"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">파일 업로드</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            required
            className="w-full"
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          등록하기
        </button>
      </form>
    </div>
  );
}
