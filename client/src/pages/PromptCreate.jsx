// ✅ src/pages/PromptCreate.jsx (Slim + Modern ReviewModal + Sidebar 연동 + 전문가 모드 상태전달)
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { PaperAirplaneIcon, PhotoIcon, XCircleIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import PromptEditor from "./PromptEditor";
import { supabase } from "../supabaseClient";
import SidebarEditable from "../components/SidebarEditable";

/* 미리보기 (간단 마크다운 강조) */
function PreviewBox({ text = "" }) {
  const html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br/>");
  return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
}

/** ---------- Modern Review Modal helpers ---------- */
function Toggle({ checked, onChange, label, hint }) {
  return (
    <label className="flex items-start gap-3 select-none">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${checked ? "bg-green-600" : "bg-gray-300"}`}
        aria-pressed={checked}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${checked ? "translate-x-6" : "translate-x-1"}`} />
      </button>
      <div className="text-sm">
        <div className="font-medium">{label}</div>
        {hint && <div className="text-gray-500">{hint}</div>}
      </div>
    </label>
  );
}

function Progress({ current, total }) {
  const percent = Math.min(100, Math.round((current / total) * 100) || 0);
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm font-semibold">검수 진행</div>
        <div className="text-xs text-gray-500">
          {current}/{total} ({percent}%)
        </div>
      </div>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-green-600 transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function ReviewField({ index, item, onChange }) {
  const invalid = !(item.edit && item.edit.trim().length > 0) || !item.ok;
  return (
    <div className={`rounded-xl border p-3 transition ${invalid ? "border-amber-300 bg-amber-50/50" : "border-gray-200 bg-white"}`}>
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="text-sm font-semibold">{item.key}</div>
        {item.ok ? (
          <span className="inline-flex items-center gap-1 text-xs text-green-700">
            <CheckCircleIcon className="w-4 h-4" /> 확인됨
          </span>
        ) : (
          <span className="text-xs text-gray-400">확인 필요</span>
        )}
      </div>

      <input
        value={item.edit ?? ""}
        onChange={(e) => onChange(index, { ...item, edit: e.target.value })}
        placeholder={item.value?.trim() ? "값을 수정하거나 그대로 두세요" : "(기타) 직접 입력"}
        className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
      />

      <div className="mt-2 flex items-center justify-between">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!item.ok}
            onChange={(e) => onChange(index, { ...item, ok: e.target.checked })}
          />
          확인했습니다
        </label>
        {!item.value?.trim() && (
          <p className="text-xs text-amber-600">
            값이 비어 있어요. 위 입력란에 <b>기타</b> 값을 작성해주세요.
          </p>
        )}
      </div>
    </div>
  );
}

/** ---------- Modern Review Modal (drop-in) ---------- */
function ReviewModal({
  showReview,
  setShowReview,
  reviewItems,
  setReviewItems,
  currentIndex,
  setCurrentIndex,
  GROUP_SIZE,
  includeModel,
  setIncludeModel,
  includeUploads,
  setIncludeUploads,
  selectedModelImage,
  lastBatchImageUrls,
  orderPrompt,
  setOrderPrompt,
  setReplyText,
  setLastBatchImageUrls,
  setIsEditable,
  addMessage,
  requestCompose,
}) {
  const overlayRef = React.useRef(null);

  const pageSlice = React.useMemo(
    () => reviewItems.slice(currentIndex, currentIndex + GROUP_SIZE),
    [reviewItems, currentIndex, GROUP_SIZE]
  );

  const isLastPage = currentIndex + GROUP_SIZE >= reviewItems.length;
  const progressCurrent = Math.min(currentIndex + GROUP_SIZE, reviewItems.length);
  const total = reviewItems.length;

  // ESC / Enter / ⌘+Enter
  React.useEffect(() => {
    if (!showReview) return;
    const onKey = (e) => {
      if (e.key === "Escape") setShowReview(false);
      if (e.key === "Enter" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleNext();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "enter") {
        e.preventDefault();
        if (isLastPage) handleComplete();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showReview, currentIndex, reviewItems, includeModel, includeUploads, orderPrompt]);

  const closeIfBackdrop = (e) => {
    if (e.target === overlayRef.current) setShowReview(false);
  };

  const updateItem = (absoluteIndex, next) => {
    setReviewItems((prev) => prev.map((it, i) => (i === absoluteIndex ? next : it)));
  };

  const handleNext = () => {
    const slice = pageSlice;
    const allOk = slice.every((it) => (it.edit && it.edit.trim().length > 0) && it.ok === true);
    if (!allOk) {
      alert("모든 항목 값 입력 + '확인했습니다' 체크가 필요합니다.");
      return;
    }
    if (isLastPage) handleComplete();
    else setCurrentIndex(currentIndex + GROUP_SIZE);
  };

  const handleComplete = () => {
    const baseText = reviewItems.map((it) => `${it.key}: ${it.edit?.trim() || ""}`).join("\n");
    const finalImages = [
      ...(includeUploads ? (lastBatchImageUrls || []) : []),
      ...(includeModel && selectedModelImage ? [selectedModelImage] : []),
    ];
    const finalText = [baseText, "", (orderPrompt || "").trim()].filter(Boolean).join("\n");

    setReplyText(finalText);
    setLastBatchImageUrls(finalImages);
    setShowReview(false);
    setIsEditable(true);
    addMessage("assistant", "✅ 검수/옵션 반영 완료. 편집기로 이동합니다.");
    requestCompose(finalText, { useModel: includeModel, useUploads: includeUploads });
  };

  if (!showReview) return null;

  return (
    <div
      ref={overlayRef}
      onMouseDown={(e) => { if (e.target === overlayRef.current) setShowReview(false); }}
      className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-rows-[auto,1fr,auto] max-h-[88vh]">
        {/* 헤더 */}
        <div className="px-5 py-4 border-b bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-lg">검수 & 합성 옵션</h3>
              <span className="text-xs text-gray-500 hidden sm:inline">Enter: 다음, ⌘/Ctrl+Enter: 완료, ESC: 닫기</span>
            </div>
            <button onClick={() => setShowReview(false)} className="text-gray-500 hover:text-gray-800" aria-label="닫기">
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="mt-3">
            <Progress current={progressCurrent} total={total} />
          </div>
        </div>

        {/* 본문 */}
        <div className="overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-5">
            {/* 좌: 항목 검수 */}
            <div className="space-y-3">
              {pageSlice.map((it, i) => {
                const absoluteIndex = currentIndex + i;
                return (
                  <ReviewField
                    key={absoluteIndex}
                    index={absoluteIndex}
                    item={it}
                    onChange={updateItem}
                  />
                );
              })}
            </div>

            {/* 우: 옵션 & 썸네일 & 주문문구 */}
            <div className="space-y-4">
              <div className="rounded-xl border p-4">
                <div className="text-sm font-semibold mb-3">합성 옵션</div>
                <div className="space-y-3">
                  <Toggle
                    checked={includeModel}
                    onChange={setIncludeModel}
                    label={`모델 이미지 포함 ${selectedModelImage ? "(선택됨)" : "(없음)"}`}
                    hint="선택된 모델 이미지를 합성에 포함합니다."
                  />
                  <Toggle
                    checked={includeUploads}
                    onChange={setIncludeUploads}
                    label={`업로드한 제품 이미지 포함 (${lastBatchImageUrls?.length || 0}장)`}
                    hint="업로드한 제품 컷을 합성에 포함합니다."
                  />
                </div>

                <div className="mt-3 flex gap-2 flex-wrap">
                  {includeModel && selectedModelImage && (
                    <img src={selectedModelImage} alt="model" className="w-16 h-16 object-cover rounded-lg border" />
                  )}
                  {includeUploads &&
                    (lastBatchImageUrls || []).slice(0, 8).map((u, i) => (
                      <img key={u + i} src={u} alt={"up-" + i} className="w-16 h-16 object-cover rounded-lg border" />
                    ))}
                </div>
              </div>

              <div className="rounded-xl border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold">최종 주문 메시지</div>
                  <span className="text-xs text-gray-400">합성 프롬프트와 함께 전송됩니다</span>
                </div>
                <textarea
                  value={orderPrompt}
                  onChange={(e) => setOrderPrompt(e.target.value)}
                  rows={6}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="명확한 주문 내용을 입력하세요. 비워두면 기본 요청사항이 사용됩니다."
                />
              </div>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-5 py-4 border-t bg-white sticky bottom-0 flex items-center justify-between">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - GROUP_SIZE))}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            disabled={currentIndex === 0}
          >
            이전
          </button>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Enter: 다음</span>
            <span>·</span>
            <span>⌘/Ctrl+Enter: 완료</span>
          </div>

          <button
            onClick={isLastPage ? handleComplete : handleNext}
            className={`px-4 py-2 rounded-lg text-white ${isLastPage ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {isLastPage ? "완료" : "다음"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */

export default function PromptCreate() {
  // ──상수
  const MAX_FILES = 10;
  const MAX_MB = 5;
  const GROUP_SIZE = 4;
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
  const API = import.meta.env.VITE_EXPRESS_URL;

  // ──공용 상태
  const [userId, setUserId] = useState(null);

  // (선택) 사이드바 상단 '최근 모델 이미지' 표시용
  const [sidebarData, setSidebarData] = useState(null);
  const [storageImages, setStorageImages] = useState([]);

  // 모델 이미지 선택
  const [selectedModelImage, setSelectedModelImage] = useState(null);

  // 채팅/입력/에디터
  const [messages, setMessages] = useState([
    { role: "assistant", content: "안녕하세요! ✏️ Prompt Create 모드입니다.\n이미지를 업로드하면 분석 후 상세페이지 제작을 도와드려요." }
  ]);
  const [input, setInput] = useState("");
  const [isEditable, setIsEditable] = useState(false);
  const [replyText, setReplyText] = useState("");

  // 업로드
  const [pendingFiles, setPendingFiles] = useState([]);
  const [pendingPreviews, setPendingPreviews] = useState([]);
  const [lastBatchImageUrls, setLastBatchImageUrls] = useState([]);

  // 검수/합성
  const [showReview, setShowReview] = useState(false);
  const [reviewItems, setReviewItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [includeModel, setIncludeModel] = useState(false);
  const [includeUploads, setIncludeUploads] = useState(true);
  const [orderPrompt, setOrderPrompt] = useState("");

  // 최근 프롬프트 수정 모달
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [editValue, setEditValue] = useState("");

  // refs/util
  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);
  const navigate = useNavigate();
  const addMessage = (role, content) => setMessages((prev) => [...prev, { role, content }]);

  const isValidSupabasePublicUrl = (url) => {
    try {
      return Boolean(url && SUPABASE_URL && url.startsWith(SUPABASE_URL) && url.includes("/storage/v1/object/public/"));
    } catch {
      return false;
    }
  };

  // ──세션/초기값
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!error && data.session?.user?.id) setUserId(data.session.user.id);
    })();
    const saved = localStorage.getItem("selectedModelImageUrl");
    if (saved) setSelectedModelImage(saved);
  }, []);

  // ──사이드바 로드 (+ 스토리지 폴백)
  const fetchImagesFromStorage = async (limit = 4) => {
    try {
      const bucket = "detail-images";
      const folder = "model-images";
      const listRes = await supabase.storage.from(bucket).list(folder, { limit: 200 });
      if (listRes.error) throw listRes.error;
      const files = (listRes.data || [])
        .filter((f) => f?.name && !f.name.endsWith("/"))
        .sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0))
        .slice(0, limit);
      const images = files.map((f) => {
        const path = `${folder}/${f.name}`;
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return { id: path, image_url: data?.publicUrl };
      });
      setStorageImages(images);
    } catch {
      setStorageImages([]);
    }
  };

  const refreshSidebar = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`${API}/api/sidebar-info/${userId}`);
      setSidebarData(res.data);
      const validRecent = (res.data?.recentImages || []).filter((img) => isValidSupabasePublicUrl(img?.image_url));
      if (!validRecent.length) await fetchImagesFromStorage(4);
      else setStorageImages([]);
    } catch {
      await fetchImagesFromStorage(4);
    }
  };

  useEffect(() => {
    if (userId) refreshSidebar();
  }, [userId]);

  // ──스크롤 유지
  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  // ──사이드바 이미지 표시 소스 (상단 '최근 모델 이미지' 섹션에서 사용)
  const imagesToShow = useMemo(() => {
    const dbValid = (sidebarData?.recentImages || []).filter((img) => isValidSupabasePublicUrl(img?.image_url));
    return dbValid.length ? dbValid : storageImages;
  }, [sidebarData, storageImages]);

  const handlePickModelImage = (img) => {
    const url = img.image_url || img;
    setSelectedModelImage(url);
    localStorage.setItem("selectedModelImageUrl", url);
    localStorage.setItem("selectedModelImageId", img.id || "");
    setIncludeModel(true);
    // PromptEditor에도 쓰일 수 있도록 리스트에 포함
    setLastBatchImageUrls((prev) => (prev?.includes(url) ? prev : [...(prev || []), url]));
    addMessage("assistant", "✅ 모델 이미지를 선택했어요.");
  };

  // 🔹 SidebarEditable → PromptCreate로 전달된 "적용" 콜백
  const handleApplyImageFromSidebar = (imageUrl) => {
    handlePickModelImage({ id: imageUrl, image_url: imageUrl });
  };
  const handleApplyTextFromSidebar = (text) => {
    setReplyText(text || "");
    setIsEditable(true);
    addMessage("assistant", "📝 왼쪽 사이드바에서 글을 적용했어요. 아래 편집기에서 바로 수정 가능합니다.");
  };

  // ──업로드
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const accepted = [];
    const previews = [];
    for (const f of files) {
      if (f.type.startsWith("image/") && f.size <= MAX_MB * 1024 * 1024) {
        accepted.push(f);
        previews.push(URL.createObjectURL(f));
      }
    }
    if (!accepted.length) return alert(`이미지 파일(최대 ${MAX_MB}MB)만 업로드 가능`);
    const merged = [...pendingFiles, ...accepted].slice(0, MAX_FILES);
    const mergedPrev = [...pendingPreviews, ...previews].slice(0, MAX_FILES);
    setPendingFiles(merged);
    setPendingPreviews(mergedPrev);
    addMessage("assistant", `📥 ${accepted.length}장 추가 (총 ${merged.length}/${MAX_FILES})`);
    e.target.value = "";
  };

  // ──GPT 분석/파싱/검수 진입
  const parseReplyToItems = (text) =>
    text
      .split("\n")
      .filter((l) => l.includes(":") && !l.trim().startsWith("[") && !l.trim().startsWith("→"))
      .map((l) => {
        const [k, ...rest] = l.split(":");
        const v = (rest.join(":") || "").trim();
        return { key: k.trim().replace(/^-\s*/, ""), value: v, edit: v, ok: false };
      });

  const startReview = (reply) => {
    const items = parseReplyToItems(reply);
    if (!items.length) {
      setIsEditable(true);
      return;
    }
    setOrderPrompt(
      [
        "요청사항:",
        "- 위 키워드(키:값)를 반영해 고품질 영문 프롬프트를 작성하세요.",
        "- 모델 이미지와 제품 이미지를 자연스럽게 합성한 미리보기 1장을 생성하세요.",
        "- 모델/제품 이미지가 업로드되어 있으면 해당 업로드를 우선 사용하세요.",
        "- 제품 중심의 클로즈업, 질감 강조 조명.",
        "- 배경/구도는 키워드 조건 우선.",
        "",
        "반환 형식:",
        "- 최종 출력 (제품+모델 합성 이미지)",
      ].join("\n")
    );
    setIncludeModel(!!selectedModelImage);
    setIncludeUploads(true);
    setReviewItems(items);
    setCurrentIndex(0);
    setShowReview(true);
    setIsEditable(false);
  };

  const handleAnalyzeFormData = async (formData, preMsg) => {
    try {
      if (preMsg) addMessage("assistant", preMsg);
      const res = await axios.post(`${API}/api/prompt-guide`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      const { reply } = res.data || {};
      const urls = Array.isArray(res.data?.imageUrls) ? res.data.imageUrls : res.data?.imageUrl ? [res.data.imageUrl] : [];
      if (reply) {
        addMessage("assistant", "아래는 분석된 상품 정보입니다. 확인해주세요.");
        addMessage("assistant", reply);
        setReplyText(reply);
        startReview(reply);
      }
      if (urls.length) {
        setLastBatchImageUrls((prev) => {
          const merged = new Set([...(prev || []), ...urls]);
          return Array.from(merged);
        });
        urls.forEach((u) => addMessage("assistant", `📸 업로드 완료: ${u}`));
      }
    } catch (e) {
      console.error(e);
      alert("❌ 분석 중 오류가 발생했습니다.");
    }
  };

  const handleBatchAnalyze = async () => {
    if (!pendingFiles.length) return alert("분석할 이미지가 없습니다.");
    const fd = new FormData();
    fd.append("userMessage", input || "이미지들을 업로드했습니다. 분석해 주세요.");
    pendingFiles.forEach((f) => fd.append("image", f));
    await handleAnalyzeFormData(fd, `🚀 ${pendingFiles.length}장 분석 요청을 보냈습니다…`);
    setPendingFiles([]); setPendingPreviews([]); setInput("");
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    addMessage("user", input);
    const fd = new FormData();
    fd.append("userMessage", input);
    await handleAnalyzeFormData(fd);
    setInput("");
  };

  // ──합성 요청
  const requestCompose = async (finalText, { useModel, useUploads }) => {
    const productOnly = (lastBatchImageUrls || []).filter((u) => !selectedModelImage || u !== selectedModelImage);
    const payload = {
      action: "compose",
      prompt: finalText,
      modelImageUrl: useModel ? selectedModelImage : null,
      productImageUrls: useUploads ? productOnly : [],
    };
    try {
      const res = await axios.post(`${API}/api/prompt-guide`, payload);
      const { composedImageUrl } = res.data || {};
      if (composedImageUrl) {
        addMessage("assistant", `🖼️ 합성 완료:\n${composedImageUrl}`);
        setLastBatchImageUrls((prev) => [...(prev || []), composedImageUrl]);
      } else addMessage("assistant", "⚠️ 합성 결과 URL을 받지 못했습니다.");
    } catch (e) {
      console.error(e);
      addMessage("assistant", "❌ 합성 호출 중 오류가 발생했습니다.");
    }
  };

  // ──최근 프롬프트 수정/삭제
  const handleDeletePrompt = async (id) => {
    if (!userId) return;
    if (!confirm("이 프롬프트를 삭제할까요?")) return;
    try {
      await axios.delete(`${API}/api/sidebar-info/prompts/${userId}/${id}`);
      await refreshSidebar();
    } catch {
      alert("삭제 실패");
    }
  };
  const handleEditPrompt = (p) => {
    setEditingPrompt(p);
    setEditValue(p?.generated_prompt || p?.gpt_reply || "");
    setEditModalOpen(true);
  };
  const submitEditPrompt = async () => {
    if (!userId || !editingPrompt) return;
    if (editValue.trim().length < 10) return alert("내용이 너무 짧습니다(최소 10자).");
    try {
      await axios.put(`${API}/api/sidebar-info/prompts/${userId}/${editingPrompt.id}`, { content: editValue.trim() });
      setEditModalOpen(false); setEditingPrompt(null);
      await refreshSidebar();
    } catch {
      alert("수정 실패");
    }
  };

  // 🔹 전문가 모드 이동 (현재 상태 그대로 전달)
  const goExpertMode = () => {
    navigate("/product-upload", {
      state: {
        from: "PromptCreate",
        initialPrompt: replyText || "",
        imageUrls: lastBatchImageUrls || [],
        modelImageUrl: selectedModelImage || null,
      },
    });
  };

  // ──UI
  return (
    <div className="flex h-screen">
      {/* 프롬프트 수정 모달 (최근 저장 프롬프트 항목 수정) */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold">프롬프트 수정</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-gray-500 hover:text-gray-800"><XCircleIcon className="w-6 h-6" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              <div className="border rounded-xl">
                <div className="flex items-center gap-2 border-b px-3 py-2">
                  <button onClick={() => setEditValue((v) => `**${v}**`)} className="text-sm px-2 py-1 rounded hover:bg-gray-100">B</button>
                  <button onClick={() => setEditValue((v) => `*${v}*`)} className="text-sm px-2 py-1 rounded hover:bg-gray-100">i</button>
                  <button onClick={() => setEditValue((v) => `\`${v}\``)} className="text-sm px-2 py-1 rounded hover:bg-gray-100">{"</>"}</button>
                </div>
                <textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-full h-[260px] p-3 outline-none resize-none" placeholder="프롬프트 내용을 입력하세요…" />
              </div>
              <div className="border rounded-xl p-3 overflow-auto h-[320px]">
                <h4 className="font-semibold mb-2">미리보기</h4>
                <PreviewBox text={editValue} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t">
              <button onClick={() => setEditModalOpen(false)} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">취소</button>
              <button onClick={submitEditPrompt} className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white">저장</button>
            </div>
          </div>
        </div>
      )}

      {/* 검수 모달 (Modern) */}
      {showReview && (
        <ReviewModal
          showReview={showReview}
          setShowReview={setShowReview}
          reviewItems={reviewItems}
          setReviewItems={setReviewItems}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          GROUP_SIZE={GROUP_SIZE}
          includeModel={includeModel}
          setIncludeModel={setIncludeModel}
          includeUploads={includeUploads}
          setIncludeUploads={setIncludeUploads}
          selectedModelImage={selectedModelImage}
          lastBatchImageUrls={lastBatchImageUrls}
          orderPrompt={orderPrompt}
          setOrderPrompt={setOrderPrompt}
          setReplyText={setReplyText}
          setLastBatchImageUrls={setLastBatchImageUrls}
          setIsEditable={setIsEditable}
          addMessage={addMessage}
          requestCompose={requestCompose}
        />
      )}

      {/* 왼쪽 사이드바 */}
      <aside className="w-[300px] bg-white border-r p-4 space-y-6 overflow-y-auto">
        <h2 className="text-lg font-bold mb-2">🧭 네비게이션</h2>

        {/* (옵션) 상단: 최근 모델 이미지 픽커 - Supabase 폴백 포함 */}
        <section>
          <h3 className="font-semibold mb-1">📸 최근 모델 이미지</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(imagesToShow || []).slice(0, 6).map((img) => (
              <button
                key={img.id || img.image_url}
                type="button"
                onClick={() => handlePickModelImage(img)}
                className={`relative aspect-square rounded-md overflow-hidden border transition hover:opacity-90 ${selectedModelImage === img.image_url ? "ring-2 ring-green-500" : ""}`}
                title="이 이미지를 선택"
              >
                <img src={img.image_url} alt="preview" loading="lazy" className="h-full w-full object-cover" />
                {selectedModelImage === img.image_url && (
                  <span className="absolute bottom-1 right-1 text-[10px] bg-green-600 text-white px-1.5 py-0.5 rounded">선택됨</span>
                )}
              </button>
            ))}
          </div>
          {!imagesToShow?.length && <div className="text-xs text-gray-500 mt-2">표시할 이미지가 없습니다.</div>}
          {selectedModelImage && (
            <div className="pt-2 text-xs text-gray-600">
              선택됨 ✅
              <div className="mt-1">
                <img src={selectedModelImage} alt="selected" className="rounded border w-full object-cover" />
              </div>
            </div>
          )}
        </section>

        {/* 회사정보/정책 + 생성 자산(이미지/글) 미리보기·적용·저장 */}
        <section>
          <SidebarEditable
            userId={userId}
            onRefresh={refreshSidebar}
            onApplyImage={handleApplyImageFromSidebar}
            onApplyText={handleApplyTextFromSidebar}
          />
        </section>
      </aside>

      {/* 메인 */}
      <div className="flex flex-col flex-1 bg-[#f9f9f9]">
        <header className="bg-white shadow px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold">✏️ Prompt Create</h1>
          <button onClick={goExpertMode} className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">
            🎨 전문가 모드
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          {pendingPreviews.length > 0 && (
            <div className="bg-white border rounded-lg p-3">
              <div className="text-sm text-gray-700 mb-2">대기 중 이미지 ({pendingFiles.length}/{MAX_FILES})</div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {pendingPreviews.map((url, idx) => (
                  <img key={`${url}-${idx}`} src={url} alt={`pending-${idx}`} className="w-full aspect-square object-cover rounded border" />
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`rounded-lg px-4 py-2 max-w-[75%] whitespace-pre-line ${m.role === "user" ? "bg-[#DCF8C6]" : "bg-white border"} text-black`}>
                {m.content}
              </div>
            </div>
          ))}

          {/* PromptEditor를 출력 — Sidebar 적용 글/이미지, 분석 결과 모두 반영 */}
          {isEditable && <PromptEditor initialPrompt={replyText} imageUrls={lastBatchImageUrls} />}
          <div ref={bottomRef} />
        </main>

        <footer className="bg-white border-t px-4 py-3 flex items-center gap-2">
          <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full hover:bg-gray-100" title="이미지 추가">
            <PhotoIcon className="w-5 h-5 text-gray-500" />
          </button>
          <input type="file" accept="image/*" multiple ref={fileInputRef} className="hidden" onChange={handleImageUpload} />

          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="메시지를 입력하세요..."
            className="flex-1 resize-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          <button onClick={handleSend} className="p-2 rounded-full bg-green-500 hover:bg-green-600" title="텍스트만 전송">
            <PaperAirplaneIcon className="w-5 h-5 text-white rotate-90" />
          </button>

          <button
            onClick={handleBatchAnalyze}
            disabled={!pendingFiles.length}
            className={`px-3 py-2 rounded-md text-sm font-medium ${!pendingFiles.length ? "bg-gray-200 text-gray-400" : "bg-blue-600 text-white hover:bg-blue-700"}`}
            title="대기 중 이미지를 한 번에 분석"
          >
            일괄 분석 ({pendingFiles.length}/{MAX_FILES})
          </button>
        </footer>
      </div>
    </div>
  );
}
