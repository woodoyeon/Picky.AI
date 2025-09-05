// src/components/DetailCutsUpload.jsx
import React, { useMemo, useRef, useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { uploadDetailImageToSupabase } from "../utils/uploadDetailImageToSupabase";
//import { saveDetailCuts } from "../utils/saveDetailCuts";
import { saveDetailCutsWithDescriptions } from "../utils/saveDetailCutsWithDescriptions";

/**
 * props
 * - apiPost: (path, data, cfg) => Promise  // 부모의 axios post 헬퍼
 * - value: Array<{ url: string, desc?: string }>
 * - onChange: (next) => void               // 부모 state 업데이트
 * - userId?: string                        // 기본 guest
 */
export default function DetailCutsUpload({
  apiPost,
  value = [],
  onChange,
  userId = "guest",
}) {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isWritingDesc, setIsWritingDesc] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef(null);

  const previews = useMemo(
    () => files.map((f) => URL.createObjectURL(f)),
    [files]
  );

  const handlePick = (e) => {
    const list = Array.from(e.target.files || []).slice(0, 4);
    setFiles(list);
  };

  // ✅ Supabase 스토리지 업로드 (유틸 사용)
  const handleUpload = async () => {
    if (!files.length) return alert("업로드할 파일을 선택하세요.");
    try {
      setIsUploading(true);
      const uploaded = [];

      let idx = 0;
      for (const f of files.slice(0, 4)) {
        const label = `cut${idx + 1}`;
        const publicUrl = await uploadDetailImageToSupabase(f, label, userId, "detail-images");
        if (!publicUrl) throw new Error("업로드 실패: public URL 생성 실패");
        uploaded.push({ url: publicUrl });
        idx += 1;
      }

      // 부모로 반영 (기존 값 + 새 업로드) → 최대 4개 유지
      const next = [...(value || []), ...uploaded].slice(0, 4);
      onChange?.(next);

      // 선택 초기화
      setFiles([]);
      if (inputRef.current) inputRef.current.value = "";
      alert("업로드 완료!");
    } catch (e) {
      console.error(e);
      alert("업로드 실패. 콘솔을 확인하세요.");
    } finally {
      setIsUploading(false);
    }
  };

  // 설명글을 생성후에 출력해주는 코드가없다.
  // ✅ 이미지 설명 자동 생성 (서버 라우트 재사용)
  const handleWriteDescriptions = async () => {
    const urls = (value || []).map((v) => v.url).filter(Boolean);
    if (urls.length === 0) return alert("설명 생성할 이미지가 없습니다.");
    try {
      setIsWritingDesc(true);

      // 서버는 detailImages || multiFittedImages || images 중 하나를 받아 처리하도록 구현
      const { data } = await apiPost("/api/detail-image-descriptions", {
        detailImages: urls,
      });

      if (data?.imgDescs && Array.isArray(data.imgDescs)) {
        const next = (value || []).map((item, i) => ({
          ...item,
          desc: data.imgDescs[i] || item.desc,
        }));
        onChange?.(next);
        alert("디테일컷 설명 생성 완료!");
      } else {
        alert("설명이 충분히 생성되지 않았습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("설명 생성 실패");
    } finally {
      setIsWritingDesc(false);
    }
  };

  // ✅ Supabase 테이블에 현재 value 저장 (URL/설명 포함) — JSONB로 한 번에 저장하는 MVP 방식
  const handleSaveToSupabase = async () => {
    try {
      if (!(value || []).length) return alert("저장할 디테일컷이 없습니다.");
      setIsSaving(true);
      //await saveDetailCuts({ userId, items: (value || []).slice(0, 4) });
      await saveDetailCutsWithDescriptions({ userId, items: (value || []).slice(0, 4) });
      alert("디테일컷 저장 완료!");
    } catch (e) {
      console.error(e);
      alert("디테일컷 저장 실패");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = (idx) => {
    const next = (value || []).filter((_, i) => i !== idx);
    onChange?.(next);
  };

  return (
    <div className="mt-8 border rounded-lg p-4 bg-white">
      <h4 className="font-semibold text-gray-800 mb-2">📸 디테일컷 4장 업로드</h4>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handlePick}
        className="mb-3"
      />

      {/* 로컬 미리보기(선택만) */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          {previews.map((src, i) => (
            <div key={i} className="border rounded overflow-hidden">
              <img src={src} alt={`preview-${i}`} className="w-full object-cover" />
              <div className="p-2 text-xs text-gray-500">선택됨 (업로드 전)</div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!files.length || isUploading}
        className={`px-4 py-2 text-sm font-semibold rounded text-white ${
          !files.length || isUploading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        {isUploading ? "업로드 중..." : "선택 파일 업로드"}
      </button>

      {/* 업로드 완료된 항목들 */}
      {(value || []).length > 0 && (
        <>
          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4">
            {value.map((it, i) => (
              <div key={i} className="border rounded overflow-hidden">
                <img src={it.url} alt={`detail-${i}`} className="w-full object-cover" />
                <div className="p-2 text-xs text-gray-600">
                  {it.desc ? it.desc : "📝 설명 없음"}
                </div>
                <div className="p-2 flex justify-between">
                  <button
                    className="text-xs text-red-600 hover:underline"
                    onClick={() => handleRemove(i)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleWriteDescriptions}
              disabled={isWritingDesc}
              className={`px-4 py-2 text-sm font-semibold rounded text-white ${
                isWritingDesc ? "bg-gray-400" : "bg-amber-600 hover:bg-amber-700"
              } flex items-center gap-1`}
            >
              {isWritingDesc && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
              디테일컷 설명글 쓰기
            </button>

            <button
              onClick={handleSaveToSupabase}
              disabled={isSaving}
              className={`px-4 py-2 text-sm font-semibold rounded text-white ${
                isSaving ? "bg-gray-400" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {isSaving ? "저장 중..." : "Supabase에 저장"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
