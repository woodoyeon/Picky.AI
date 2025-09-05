// ✅ src/pages/PromptEditor.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ClockIcon,
  PhotoIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/solid";

import TemplateBasic from "../components/templates/TemplateBasic";
import TemplateModern from "../components/templates/TemplateModern";
import TemplateImageFocus from "../components/templates/TemplateImageFocus";
import TemplateTextHeavy from "../components/templates/TemplateTextHeavy";

import DetailCutsUpload from "../components/DetailCutsUpload"; // 디테일컷 4장 업로드
import MakeReview from "../components/MakeReview";
import ShippingPolicyEditor from "../components/ShippingPolicyEditor"; // 배송·교환·환불
import QnAGeneration from "../components/QnAGeneration"; // QnA

// ✅ 내보내기 유틸
import { exportAsPng, exportAsPdf, exportAsZip } from "../utils/export-utils";

/* ─────────────────────────────────────────────────────────────
   임시 미니 템플릿 2개 (사진1장, 사진2장배열) — 외부파일 없이 바로 사용
   ───────────────────────────────────────────────────────────── */
function TemplateOneImage({ modelImageUrl, title, shortDesc, textColorClass }) {
  return (
    <div className={`w-full mx-auto rounded-xl overflow-hidden shadow ${textColorClass}`}>
      <div className="grid md:grid-cols-2 gap-4 items-center">
        <div className="aspect-[4/5] w-full bg-gray-100 rounded-lg overflow-hidden">
          {modelImageUrl ? (
            <img src={modelImageUrl} alt="main" className="w-full h-full object-cover" />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">이미지 없음</div>
          )}
        </div>
        <div className="px-2 md:px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">{title || "제품명"}</h2>
          <p className="text-sm md:text-base opacity-80 leading-relaxed">{shortDesc || "요약 설명이 여기에 표시됩니다."}</p>
        </div>
      </div>
    </div>
  );
}

function TemplateTwoImageGrid({ images = [], title, shortDesc, textColorClass }) {
  const pair = images.slice(0, 2);
  return (
    <div className={`w-full mx-auto rounded-xl overflow-hidden shadow ${textColorClass}`}>
      <div className="grid md:grid-cols-3 gap-4 items-start">
        <div className="md:col-span-1">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">{title || "제품명"}</h2>
          <p className="text-sm md:text-base opacity-80 leading-relaxed">{shortDesc || "요약 설명이 여기에 표시됩니다."}</p>
        </div>
        <div className="md:col-span-2 grid grid-cols-2 gap-3">
          {pair.map((u, i) => (
            <div key={u + i} className="aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden">
              <img src={u} alt={`grid-${i}`} className="w-full h-full object-cover" />
            </div>
          ))}
          {pair.length < 2 && (
            <div className="col-span-2 text-gray-400 text-sm">이미지를 2장 이상 선택하면 더 보기 좋아요.</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────── */

export default function PromptEditor({ initialPrompt = "", imageUrls = [] }) {
  // 🟡 리뷰 (제목, 설명글) 연동 + 직접 편집 가능
  const [productTitle, setProductTitle] = useState("");
  const [productDesc, setProductDesc] = useState("");

  // ✅ 모든 이미지의 캡션(설명글)
  // - multiFittedImages(4컷), detailCuts, previewImage 전부를 위한 통합 캡션 편집 지원
  const [imgDescriptions, setImgDescriptions] = useState([]); // 4컷/디테일 등 공용 설명

  const [detailCuts, setDetailCuts] = useState([]); // [{url, desc}] | [string]
  const [multiFittedImages, setMultiFittedImages] = useState([]); // [{cut,url}]
  const [isMultiGenerating, setIsMultiGenerating] = useState(false);

  const API = import.meta.env.VITE_EXPRESS_URL;
  const apiPost = (path, data, cfg) => axios.post(`${API}${path}`, data, cfg);

  const [editedPrompt, setEditedPrompt] = useState(initialPrompt);
  const [originStory, setOriginStory] = useState(""); // 제품 스토리
  const [status, setStatus] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegen, setIsRegen] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [history, setHistory] = useState(() =>
    initialPrompt ? [initialPrompt] : []
  );

  // ✅ 디자인/템플릿 상태
  //   -> 6가지: Basic, Modern, ImageFocus, TextHeavy, OneImage, TwoImageGrid
  const [selectedTemplate, setSelectedTemplate] = useState("TemplateModern");

  // 테마 & 배경 & 글자색
  const [theme, setTheme] = useState("modern"); // classic | modern | dark | gradient
  const [previewBg, setPreviewBg] = useState("bg-white"); // 배경 클래스 (확장)
  const [textColor, setTextColor] = useState("text-gray-900"); // 글자색

  // 섹션 순서/토글
  const [sectionOrder, setSectionOrder] = useState([
    "title", "model", "multi", "detail", "story", "long", "reviews",
  ]);
  const [sections, setSections] = useState({
    title: true,
    model: true,
    fitted: false, // (레거시, 필요시 사용)
    multi: true,
    detail: true,
    video: false,
    story: true,
    long: true,
    reviews: true,
  });

  // ✅ 미리보기 이미지
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  // ✅ 내보내기: 버튼/패널 제외하고 "실제 상세페이지"만 1장으로 출력되도록 pageRef만 export
  const pageRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

  // ✅ 프롬프트 채팅 조작 (요청 3번)
  const [tweakInput, setTweakInput] = useState("");
  const [promptChatLog, setPromptChatLog] = useState([]);

  // ✅ 현재 카테고리 (4컷 커스텀)
  const [productCategory, setProductCategory] = useState("clothing"); // clothing | others

  const canSave = useMemo(() => editedPrompt.trim().length > 0, [editedPrompt]);
  const busy = isSaving || isRegen || isComposing || isMultiGenerating || isExporting;

  // ─────────────────────────────────────────────────────────
  // 보조: 프롬프트 파서
  // ─────────────────────────────────────────────────────────
  const extractTitleDesc = (text) => {
    const out = { title: "", desc: "" };
    if (!text) return out;
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const tryMatch = (line, keys) => keys.some((k) => new RegExp(`^${k}\\s*[:：]`, "i").test(line));
    for (const line of lines) {
      if (!out.title && tryMatch(line, ["상품명", "제품명", "title", "product", "name"])) {
        out.title = line.replace(/^[^:：]+[:：]/, "").trim();
      } else if (!out.desc && tryMatch(line, ["요약\\s*설명", "설명", "description", "desc", "summary"])) {
        out.desc = line.replace(/^[^:：]+[:：]/, "").trim();
      }
      if (out.title && out.desc) break;
    }
    if (!out.title) out.title = (lines[0] || "AI 생성 상품").slice(0, 60);
    if (!out.desc) out.desc = (lines.slice(1).join(" ") || lines[0] || "").replace(/\s+/g, " ").slice(0, 120);
    return out;
  };

  // 리뷰 연동 + 제목/설명 자동 추출
  useEffect(() => {
    if (!initialPrompt) return;
    let title = "", desc = "";
    const lines = initialPrompt.split("\n");
    for (const line of lines) {
      if (line.startsWith("상품명:")) title = line.replace("상품명:", "").trim();
      else if (line.startsWith("요약 설명:") || line.startsWith("설명:"))
        desc = line.replace("요약 설명:", "").replace("설명:", "").trim();
    }
    if (!title || !desc) {
      const fallback = extractTitleDesc(initialPrompt);
      title = title || fallback.title;
      desc = desc || fallback.desc;
    }
    setProductTitle(title);
    setProductDesc(desc);
  }, [initialPrompt]);

  // 초기 프롬프트 없고 이미지만 있을 때 기본값
  useEffect(() => {
    if (!initialPrompt && Array.isArray(imageUrls) && imageUrls.length && !editedPrompt) {
      const basic = [
        "상품명: AI 제품",
        "요약 설명: 업로드 이미지를 바탕으로 고품질 상세페이지 합성/구성을 생성합니다.",
        "",
        "요청:",
        "- 제품 클로즈업, 질감/재질 강조",
        "- 쇼룸 조명, 자연스러운 그림자",
        "- 전자상거래용 미니멀 배경",
      ].join("\n");
      setEditedPrompt(basic);
      setHistory([basic]);
      const parsed = extractTitleDesc(basic);
      setProductTitle(parsed.title);
      setProductDesc(parsed.desc);
    }
  }, [initialPrompt, imageUrls]);

  useEffect(() => {
    if (!editedPrompt) return;
    if (!productTitle || !productDesc) {
      const parsed = extractTitleDesc(editedPrompt);
      if (!productTitle) setProductTitle(parsed.title);
      if (!productDesc) setProductDesc(parsed.desc);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editedPrompt]);

  useEffect(() => {
    setEditedPrompt(initialPrompt || "");
    setHistory(initialPrompt ? [initialPrompt] : []);
  }, [initialPrompt]);

  // ✅ 미리보기 이미지 우선순위
  const effectivePreviewImageUrl = useMemo(() => {
    return (
      previewImageUrl ||
      (Array.isArray(imageUrls) && imageUrls.length ? imageUrls[0] : null) ||
      (multiFittedImages[0]?.url || null)
    );
  }, [previewImageUrl, imageUrls, multiFittedImages]);

  // ✅ 4컷 설명 생성 (내구성 보강: 실패 시 대체 캡션 자동 생성)
  const handleGenerateGPTDescriptions = async () => {
    try {
      if (!multiFittedImages.length) {
        return setErr("❌ 먼저 4컷 이미지를 생성하세요.");
      }
      setInfo("🧠 이미지 설명 생성 중…");

      const payload = {
        modelImageUrl: effectivePreviewImageUrl,
        multiFittedImages: multiFittedImages.map((img) => img.url),
      };

      let data;
      try {
        const res = await apiPost("/api/image-descriptions", payload);
        data = res.data;
      } catch (e) {
        // 서버 오류 시 로컬 폴백
        data = null;
      }

      const fallbackByCut = (cut) => {
        const map = {
          "full-body": "전신 연출 컷",
          "half-body": "상반신 디테일 컷",
          "side-view": "측면 실루엣 컷",
          "back-view": "후면 핏 컷",
          "macro-texture": "질감/소재 클로즈업",
          "usage-context": "사용 장면 연출",
          "scale-reference": "사이즈 비교 컷",
          "packaging": "패키징/구성품 컷",
        };
        return map[cut] || "제품 포인트 컷";
      };

      const nextDescs =
        data?.imgDescs && Array.isArray(data.imgDescs) && data.imgDescs.length
          ? multiFittedImages.map((m, i) => data.imgDescs[i] || fallbackByCut(m.cut))
          : multiFittedImages.map((m) => fallbackByCut(m.cut));

      setImgDescriptions(nextDescs);
      setOk("✅ 이미지 설명 생성 완료! (필요 시 아래에서 바로 수정 가능)");
    } catch (e) {
      console.error("GPT 설명 생성 오류:", e);
      setErr("❌ 설명 생성 실패");
    }
  };

  // ✅ 4컷 생성 (카테고리별 다른 컷 세트 지원)
  const handleGenerateFittingCuts = async () => {
    const base = effectivePreviewImageUrl;
    if (!base) return setErr("❌ 먼저 미리보기 이미지를 선택하세요.");

    const clothingCuts = ["full-body", "side-view", "back-view", "half-body"];
    const otherCuts = ["macro-texture", "usage-context", "scale-reference", "packaging"];
    const cuts = productCategory === "clothing" ? clothingCuts : otherCuts;

    try {
      setIsMultiGenerating(true);
      setInfo("🧵 4컷 이미지 생성 중…");

      const results = await Promise.all(
        cuts.map(async (cut) => {
          try {
            const { data } = await apiPost("/runway-fitting-cut", {
              cut,
              model: "gen4_image",
              referenceImages: JSON.stringify([{ uri: base, tag: "style" }]),
              // 👉 비의류의 경우 cut 키워드로 프롬프트 보강은 서버측에서 처리(권장)
            });
            if (data?.outputUrl) return { cut, url: data.outputUrl };
          } catch (e) {
            // 개별 컷 실패 무시하고 계속
          }
          return null;
        })
      );

      const valid = results.filter(Boolean);
      if (!valid.length) return setErr("❌ 4컷 이미지 생성 실패");
      setMultiFittedImages(valid);

      // 설명 배열 길이 맞추기 (초기 캡션)
      setImgDescriptions(valid.map((v) => ({
        "full-body": "전신 연출 컷",
        "half-body": "상반신 디테일 컷",
        "side-view": "측면 실루엣 컷",
        "back-view": "후면 핏 컷",
        "macro-texture": "질감/소재 클로즈업",
        "usage-context": "사용 장면 연출",
        "scale-reference": "사이즈 비교 컷",
        "packaging": "패키징/구성품 컷",
      }[v.cut] || "제품 포인트 컷")));

      setOk("✅ 4컷 이미지 생성 완료!");
    } catch (e) {
      console.error(e);
      setErr("❌ 4컷 이미지 생성 실패");
    } finally {
      setIsMultiGenerating(false);
    }
  };

  // ✅ 저장/재생성/합성/스토리
  const handleSave = async () => {
    if (!canSave) return setErr("❌ 프롬프트 내용을 입력해주세요.");
    try {
      setIsSaving(true);
      setStatus(null);
      const res = await apiPost("/api/save-edited-prompt", {
        editedPrompt,
        productTitle,
        productDesc,
        imgDescriptions,
      });
      if (res.status === 200) {
        setOk("✅ 프롬프트가 저장되었습니다!");
        setHistory((prev) => (prev[0] === editedPrompt ? prev : [editedPrompt, ...prev]));
      } else setErr("❌ 저장 실패. 다시 시도해주세요.");
    } catch (e) {
      console.error("save error", e);
      setErr("❌ 서버 오류. 관리자에게 문의하세요.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerate = async () => {
    if (!canSave) return setErr("❌ 재생성할 내용이 없습니다.");
    try {
      setIsRegen(true);
      setInfo("🤖 프롬프트 재생성 중…");
      const { data } = await apiPost("/api/prompt-guide", { userMessage: editedPrompt });
      if (data?.reply) {
        setEditedPrompt(data.reply);
        setOk("✅ 프롬프트가 재생성되었습니다!");
      } else setErr("❌ 재생성 실패");
    } catch (e) {
      console.error("regenerate error", e);
      setErr("❌ 프롬프트 재생성 실패");
    } finally {
      setIsRegen(false);
    }
  };

  const handleGenerateCompositeImage = async () => {
    if (!canSave) return setErr("❌ 합성에 사용할 프롬프트가 없습니다.");
    try {
      setIsComposing(true);
      setInfo("🧪 합성 이미지 생성 중…");
      const payload = { prompt: editedPrompt, imageUrls: Array.isArray(imageUrls) ? imageUrls : [] };
      const { data } = await apiPost("/api/generate-composite-image", payload);
      if (data?.imageUrl) {
        setPreviewImageUrl(data.imageUrl);
        setOk("✅ 합성 이미지 생성 완료!");
      } else setErr("❌ 이미지 생성 실패");
    } catch (e) {
      console.error("compose error", e);
      setErr("❌ 서버 오류. 다시 시도해주세요.");
    } finally {
      setIsComposing(false);
    }
  };

  const handleGenerateStory = async () => {
    try {
      setInfo("📖 탄생 스토리 생성 중…");
      const { data } = await apiPost("/api/product-story", {
        prompt: editedPrompt || `${productTitle}\n${productDesc}`,
        imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
      });
      if (data?.story) {
        setOriginStory(data.story);
        setOk("✅ 스토리가 생성되었습니다!");
      } else setErr("❌ 스토리 생성 실패");
    } catch (e) {
      console.error("story error", e);
      setErr("❌ 서버 오류. 다시 시도해주세요.");
    }
  };

  // ✅ 템플릿 썸네일 후보
  const previewCandidates = useMemo(() => {
    const arr = [];
    if (Array.isArray(imageUrls)) arr.push(...imageUrls);
    if (Array.isArray(multiFittedImages)) arr.push(...multiFittedImages.map((m) => m.url));
    return Array.from(new Set(arr.filter(Boolean)));
  }, [imageUrls, multiFittedImages]);

  // 섹션 순서 변경
  const moveSection = (key, dir) => {
    setSectionOrder((prev) => {
      const i = prev.indexOf(key);
      if (i < 0) return prev;
      const j = dir === "up" ? Math.max(0, i - 1) : Math.min(prev.length - 1, i + 1);
      if (i === j) return prev;
      const next = [...prev];
      const [it] = next.splice(i, 1);
      next.splice(j, 0, it);
      return next;
    });
  };

  // ✅ 진행중 배너 메시지
  const currentTask = (() => {
    if (isExporting) return "📦 내보내기 처리 중입니다… (PNG/PDF/ZIP)";
    if (isMultiGenerating) return "🖼 4컷 이미지 생성 중입니다…";
    if (isComposing) return "🧪 합성 이미지 생성 중입니다…";
    if (isRegen) return "🤖 프롬프트 재생성 중입니다…";
    if (isSaving) return "💾 저장 중입니다…";
    if (status?.kind === "info") return status.msg;
    return null;
  })();

  // ✅ 내보내기 핸들러 (pageRef만 내보내서 버튼/패널 제거된 1장 생성)
  const handleExport = async (kind) => {
    if (!pageRef.current) {
      setErr("❌ 내보낼 영역을 찾지 못했습니다.");
      return;
    }
    try {
      setIsExporting(true);
      setInfo(kind === "png" ? "🖼 PNG 생성 중…" : kind === "pdf" ? "📄 PDF 작성 중…" : "📦 ZIP 압축 중…");
      if (kind === "png") await exportAsPng(pageRef, productTitle || "PickyAI");
      else if (kind === "pdf") await exportAsPdf(pageRef, productTitle || "PickyAI");
      else await exportAsZip(pageRef, productTitle || "PickyAI");
      setOk("✅ 내보내기가 완료되었습니다!");
    } catch (e) {
      console.error("export error", e);
      setErr("❌ 내보내기 실패. 다시 시도해주세요.");
    } finally {
      setIsExporting(false);
    }
  };

  // ✅ 상태/알림 헬퍼
  const setOk = (msg) => setStatus({ kind: "success", msg });
  const setErr = (msg) => setStatus({ kind: "error", msg });
  const setInfo = (msg) => setStatus({ kind: "info", msg });

  // ✅ 프롬프트 채팅 조작 (요청 3번)
  const handlePromptTweak = async () => {
    const instruction = tweakInput.trim();
    if (!instruction) return;
    setPromptChatLog((log) => [...log, { role: "user", content: instruction }]);
    setTweakInput("");
    setInfo("💬 프롬프트 조정 중…");

    try {
      // 서버가 지원하면 action:"tweak" 사용, 아니면 /api/prompt-guide에 instruction 포함
      const { data } = await apiPost("/api/prompt-guide", {
        action: "tweak",
        base: editedPrompt,
        instruction,
      });

      const next = data?.reply || `${editedPrompt}\n\n[사용자 수정사항]\n- ${instruction}`;
      setEditedPrompt(next);
      setPromptChatLog((log) => [...log, { role: "assistant", content: "프롬프트에 수정사항을 반영했습니다." }]);
      setOk("✅ 프롬프트 수정 반영 완료!");
    } catch (e) {
      // 폴백
      setEditedPrompt((prev) => `${prev}\n\n[사용자 수정사항]\n- ${instruction}`);
      setPromptChatLog((log) => [...log, { role: "assistant", content: "서버 오류: 로컬로 수정사항을 병합했어요." }]);
      setErr("⚠️ 서버 오류로 로컬 병합을 수행했습니다.");
    }
  };

  // ✅ 캡션 에디터: 미리보기 + 4컷 + 디테일 컷을 한곳에서 편집
  const allEditableImages = useMemo(() => {
    const detail = (detailCuts || []).map((d) => (typeof d === "string" ? d : d?.url)).filter(Boolean);
    const multi = (multiFittedImages || []).map((m) => m.url).filter(Boolean);
    const unique = Array.from(new Set([...(effectivePreviewImageUrl ? [effectivePreviewImageUrl] : []), ...multi, ...detail]));
    return unique;
  }, [effectivePreviewImageUrl, multiFittedImages, detailCuts]);

  // 캡션 배열 길이 동기화
  useEffect(() => {
    if (!allEditableImages.length) return;
    setImgDescriptions((prev) => {
      const next = [...(prev || [])];
      for (let i = 0; i < allEditableImages.length; i++) {
        if (!next[i] || typeof next[i] !== "string") next[i] = "";
      }
      return next.slice(0, allEditableImages.length);
    });
  }, [allEditableImages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────────────────
  return (
    <div className="mt-6 bg-white border rounded-lg shadow p-6 relative">
      {/* 상단 진행중 배너 */}
      {currentTask && (
        <div className="mb-4">
          <div className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white px-4 py-2 text-sm shadow">
            {currentTask}
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        ✏️ 프롬프트 수정
      </h2>

      {/* 제목/요약 직접 편집 (요청 2번) */}
      <div className="grid md:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">상품명</label>
          <input
            value={productTitle}
            onChange={(e) => setProductTitle(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="상품명을 입력하세요"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">요약 설명</label>
          <input
            value={productDesc}
            onChange={(e) => setProductDesc(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="짧은 설명을 입력하세요"
          />
        </div>
      </div>

      <label className="block mb-2 text-sm font-medium text-gray-700">자동 생성된 프롬프트</label>
      <textarea
        value={editedPrompt}
        onChange={(e) => setEditedPrompt(e.target.value)}
        rows={14}
        className="w-full border border-gray-300 rounded-lg p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
        placeholder="프롬프트를 수정하세요..."
      />

      {/* 프롬프트 채팅 조작 */}
      <div className="mt-3 border rounded-lg p-3 bg-gray-50">
        <div className="flex items-center gap-2 mb-2">
          <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-semibold">프롬프트 채팅으로 조정</span>
        </div>
        <div className="flex gap-2">
          <input
            value={tweakInput}
            onChange={(e) => setTweakInput(e.target.value)}
            placeholder="예: '배경을 화이트 스튜디오로 바꿔줘', '상세설명에 소재 강조'"
            className="flex-1 border rounded px-3 py-2 text-sm"
          />
          <button
            onClick={handlePromptTweak}
            className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 text-sm"
            disabled={!tweakInput.trim() || busy}
          >
            적용
          </button>
        </div>
        {promptChatLog.length > 0 && (
          <ul className="mt-2 max-h-28 overflow-auto text-xs text-gray-600 space-y-1">
            {promptChatLog.map((m, i) => (
              <li key={i} className={m.role === "user" ? "text-gray-800" : "text-blue-700"}>
                {m.role === "user" ? "• " : "↳ "}{m.content}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 액션 버튼 */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleSave}
            disabled={!canSave || isSaving}
            className={`px-5 py-2 text-sm font-semibold rounded shadow ${
              !canSave || isSaving ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            } text-white transition`}
          >
            {isSaving ? "💾 저장 중..." : "💾 저장하기"}
          </button>

          <button
            onClick={handleRegenerate}
            disabled={!canSave || isRegen}
            className={`px-5 py-2 text-sm font-semibold rounded text-white flex items-center gap-1 ${
              !canSave || isRegen ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            <ArrowPathIcon className="w-4 h-4" />
            {isRegen ? "재생성 중..." : "재생성"}
          </button>

          <button
            onClick={handleGenerateCompositeImage}
            disabled={!canSave || isComposing}
            className={`px-5 py-2 text-sm font-semibold rounded text-white flex items-center gap-1 ${
              !canSave || isComposing ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            <PhotoIcon className="w-4 h-4" />
            {isComposing ? "합성 생성 중..." : "모델-상품 합성"}
          </button>
        </div>

        {status && (
          <div className="flex items-center gap-2 text-sm">
            {status.kind === "success" && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
            {status.kind === "error" && <XCircleIcon className="w-5 h-5 text-red-500" />}
            <span
              className={
                status.kind === "success"
                  ? "text-green-600"
                  : status.kind === "error"
                  ? "text-red-600"
                  : "text-blue-600"
              }
            >
              {status.msg}
            </span>
          </div>
        )}
      </div>

      {/* 저장 이력 */}
      {history.length > 1 && (
        <div className="mt-6">
          <h3 className="text-md font-semibold mb-2 flex items-center gap-1">
            <ClockIcon className="w-4 h-4 text-gray-500" /> 이전 저장 기록
          </h3>
          <ul className="space-y-1 text-sm text-gray-700">
            {history.slice(1).map((version, idx) => (
              <li key={idx} className="bg-gray-100 rounded p-2 flex justify-between items-start">
                <div className="w-[85%] whitespace-pre-wrap line-clamp-3 overflow-hidden">
                  {version}
                </div>
                <button
                  onClick={() => {
                    setEditedPrompt(version);
                    setStatus({ kind: "info", msg: "🔄 이전 버전으로 복원되었습니다." });
                  }}
                  className="ml-3 text-xs text-blue-600 hover:underline"
                >
                  복원
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────
         디자인 패널 (6 템플릿 + 배경/글자색 + 섹션 토글/정렬)
      ───────────────────────────────────────────────────────── */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {/* 템플릿/테마/배경/글자색 */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-semibold mb-3">🎨 디자인</h4>

          <label className="block text-sm mb-1">템플릿</label>
          <div className="flex gap-2 flex-wrap mb-3">
            {[
              "TemplateBasic",
              "TemplateModern",
              "TemplateImageFocus",
              "TemplateTextHeavy",
              "TemplateOneImage",
              "TemplateTwoImageGrid",
            ].map((tpl) => (
              <button
                key={tpl}
                onClick={() => setSelectedTemplate(tpl)}
                className={`px-3 py-1 rounded border text-sm ${
                  selectedTemplate === tpl ? "bg-blue-600 text-white" : "bg-white"
                }`}
              >
                {tpl.replace("Template", "")}
              </button>
            ))}
          </div>

          <label className="block text-sm mb-1">테마</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm mb-3"
          >
            <option value="classic">Classic (밝음)</option>
            <option value="modern">Modern (카드/섀도우)</option>
            <option value="dark">Dark (다크 톤)</option>
            <option value="gradient">Gradient (그라디언트)</option>
          </select>

          <label className="block text-sm mb-1">미리보기 배경</label>
          <select
            value={previewBg}
            onChange={(e) => setPreviewBg(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm mb-3"
          >
            <option value="bg-white">화이트</option>
            <option value="bg-gray-50">라이트 그레이</option>
            <option value="bg-slate-900">다크(배경)</option>
            <option value="bg-gradient-to-br from-indigo-50 via-white to-pink-50">부드러운 그라디언트</option>
            <option value="bg-gradient-to-br from-emerald-50 via-white to-sky-50">민트 그라디언트</option>
            <option value="bg-gradient-to-br from-rose-50 via-white to-amber-50">웜 그라디언트</option>
            <option value="bg-gradient-to-br from-slate-50 via-white to-sky-50">쿨 그라디언트</option>
          </select>

          <label className="block text-sm mb-1">글자 색상</label>
          <select
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="text-gray-900">기본(짙은 회색)</option>
            <option value="text-slate-800">슬레이트</option>
            <option value="text-zinc-900">진한 블랙</option>
            <option value="text-rose-900">로즈</option>
            <option value="text-emerald-900">에메랄드</option>
            <option value="text-indigo-900">인디고</option>
          </select>
        </div>

        {/* 섹션 토글 */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-semibold mb-3">🧩 섹션 노출</h4>
          {Object.keys(sections).map((k) => (
            <label key={k} className="flex items-center justify-between text-sm py-1">
              <span className="capitalize">
                {({
                  title: "제목/요약",
                  model: "모델 이미지",
                  fitted: "착용 이미지",
                  multi: "4컷 포즈",
                  detail: "디테일 컷",
                  video: "영상",
                  story: "제품 스토리",
                  long: "상세 설명",
                  reviews: "사용자 리뷰",
                }[k])}
              </span>
              <input
                type="checkbox"
                checked={sections[k]}
                onChange={(e) => setSections((prev) => ({ ...prev, [k]: e.target.checked }))}
              />
            </label>
          ))}
        </div>

        {/* 섹션 정렬 */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-semibold mb-3">↕️ 섹션 순서</h4>
          <ul className="space-y-2">
            {sectionOrder.map((key) => (
              <li key={key} className="flex items-center justify-between bg-white border rounded px-3 py-2 text-sm">
                <span className="truncate">
                  {({
                    title: "제목/요약",
                    model: "모델 이미지",
                    fitted: "착용 이미지",
                    multi: "4컷 포즈",
                    detail: "디테일 컷",
                    video: "영상",
                    story: "제품 스토리",
                    long: "상세 설명",
                    reviews: "사용자 리뷰",
                  }[key])}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => moveSection(key, "up")} className="p-1 rounded hover:bg-gray-100" title="위로">
                    <ChevronUpIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => moveSection(key, "down")} className="p-1 rounded hover:bg-gray-100" title="아래로">
                    <ChevronDownIcon className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* 카테고리 선택: 4컷 생성 정책 */}
          <div className="mt-4">
            <label className="block text-sm mb-1 font-medium">상품 카테고리(4컷 정책)</label>
            <select
              value={productCategory}
              onChange={(e) => setProductCategory(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="clothing">의류 (전신/측면/후면/상반신)</option>
              <option value="others">기타 제품 (질감/사용/사이즈/패키징)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────
         라이브 미리보기 (pageRef ONLY 내보내기) — 버튼/패널 제외
      ───────────────────────────────────────────────────────── */}
      <div className={`mt-8 rounded-xl p-4 border ${previewBg}`}>
        <div
          ref={pageRef}
          className={`${
            theme === "dark"
              ? "bg-slate-900 text-slate-100"
              : theme === "gradient"
              ? "bg-gradient-to-br from-white/70 to-white/30 backdrop-blur"
              : theme === "modern"
              ? "bg-white"
              : "bg-white"
          } rounded-xl p-4 ${textColor}`}
        >
          {/* 템플릿 */}
          {selectedTemplate === "TemplateBasic" && (
            <TemplateBasic
              modelImageUrl={effectivePreviewImageUrl}
              title={productTitle || "GPT 상품명 예시"}
              shortDesc={productDesc || "GPT 요약 설명 예시"}
              imgDescs={imgDescriptions.length ? imgDescriptions : [editedPrompt]}
              longDesc="GPT 상세 설명 예시"
              textColorClass={textColor}
            />
          )}

          {selectedTemplate === "TemplateModern" && (
            <TemplateModern
              modelImageUrl={effectivePreviewImageUrl}
              multiFittedImages={multiFittedImages}
              detailImages={(detailCuts || []).map((d) => (typeof d === "string" ? d : d?.url)).filter(Boolean)}
              title={productTitle || "GPT 상품명 예시"}
              shortDesc={productDesc || "GPT 요약 설명 예시"}
              imgDescs={imgDescriptions.length ? imgDescriptions : [editedPrompt]}
              setImgDescs={setImgDescriptions}
              longDesc="GPT 상세 설명 예시"
              originStory={originStory}
              setOriginStory={setOriginStory}
              editable={true} // ✅ 템플릿 내에서 캡션 등 직접 수정 허용
              reviews={[]} // MakeReview 섹션에서 주입
              theme={theme}
              sections={sections}
              sectionOrder={sectionOrder}
              textColorClass={textColor}
            />
          )}

          {selectedTemplate === "TemplateImageFocus" && (
            <TemplateImageFocus
              modelImageUrl={effectivePreviewImageUrl}
              imgDescs={imgDescriptions.length ? imgDescriptions : [editedPrompt]}
              longDesc="GPT 상세 설명 예시"
              textColorClass={textColor}
            />
          )}

          {selectedTemplate === "TemplateTextHeavy" && (
            <TemplateTextHeavy
              modelImageUrl={effectivePreviewImageUrl}
              longDesc="GPT 상세 설명 예시"
              textColorClass={textColor}
            />
          )}

          {selectedTemplate === "TemplateOneImage" && (
            <TemplateOneImage
              modelImageUrl={effectivePreviewImageUrl}
              title={productTitle}
              shortDesc={productDesc}
              textColorClass={textColor}
            />
          )}

          {selectedTemplate === "TemplateTwoImageGrid" && (
            <TemplateTwoImageGrid
              images={previewCandidates}
              title={productTitle}
              shortDesc={productDesc}
              textColorClass={textColor}
            />
          )}
        </div>

        {/* 템플릿/생성 액션들 — 프리뷰 바깥이므로 PNG/PDF에는 포함되지 않음 */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => alert(`${selectedTemplate} 템플릿으로 상세페이지가 확정되었습니다!`)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            ✅ 현재 템플릿으로 확정하기
          </button>
          <button
            onClick={handleGenerateStory}
            disabled={busy}
            className={`px-5 py-2 text-sm font-semibold rounded text-white ${
              busy ? "bg-gray-400 cursor-not-allowed" : "bg-amber-600 hover:bg-amber-700"
            }`}
          >
            {busy ? "📖 진행중…" : "📖 탄생 스토리 생성"}
          </button>
          <button
            onClick={handleGenerateFittingCuts}
            disabled={isMultiGenerating || !effectivePreviewImageUrl}
            className={`px-5 py-2 text-sm font-semibold rounded text-white ${
              isMultiGenerating ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {isMultiGenerating ? "⏳ 생성 중…" : "🖼️ 4컷 이미지 자동 생성"}
          </button>
          <button
            onClick={handleGenerateGPTDescriptions}
            disabled={multiFittedImages.length === 0 || busy}
            className={`px-4 py-2 rounded text-white ${
              multiFittedImages.length === 0 || busy ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {busy ? "🧠 생성 중…" : "🧠 4컷 이미지 설명 생성"}
          </button>
        </div>

        {/* 내보내기 버튼 — pageRef만 출력되므로 버튼은 PNG/PDF에 없음 */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => handleExport("png")}
            disabled={isExporting}
            className={`px-4 py-2 rounded text-white ${
              isExporting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isExporting ? "🖼 PNG 생성중..." : "🖼 PNG 다운로드"}
          </button>
          <button
            onClick={() => handleExport("pdf")}
            disabled={isExporting}
            className={`px-4 py-2 rounded text-white ${
              isExporting ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isExporting ? "📄 PDF 작성중..." : "📄 PDF 다운로드"}
          </button>
          <button
            onClick={() => handleExport("zip")}
            disabled={isExporting}
            className={`px-4 py-2 rounded text-white ${
              isExporting ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {isExporting ? "📦 ZIP 압축중..." : "📦 ZIP 다운로드"}
          </button>
        </div>

        {/* 이미지 캡션 편집 (요청 2번: 모든 이미지에 설명글/수정 가능) */}
        {allEditableImages.length > 0 && (
          <div className="mt-6 border rounded-lg p-4 bg-gray-50">
            <h4 className="font-semibold mb-3">📝 이미지 캡션 편집</h4>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {allEditableImages.map((u, i) => (
                <div key={u + i} className="bg-white border rounded-lg p-2">
                  <div className="aspect-[4/5] w-full rounded overflow-hidden bg-gray-100">
                    <img src={u} alt={`cap-${i}`} className="w-full h-full object-cover" />
                  </div>
                  <input
                    value={imgDescriptions[i] ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setImgDescriptions((prev) => {
                        const next = [...prev];
                        next[i] = v;
                        return next;
                      });
                    }}
                    className="mt-2 w-full border rounded px-2 py-1 text-sm"
                    placeholder="이 이미지의 설명을 입력하세요"
                  />
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">※ 캡션은 템플릿에 반영되며, PNG/PDF 내보내기에도 포함됩니다.</p>
          </div>
        )}

        {/* 디테일컷 / 리뷰 / 정책 / QnA */}
        {sections.detail && (
          <DetailCutsUpload apiPost={apiPost} value={detailCuts} onChange={setDetailCuts} />
        )}

        {sections.reviews && (
          <MakeReview
            title={productTitle}
            description={productDesc}
            imageUrl={effectivePreviewImageUrl}
            onResult={(reviews) => {
              // TemplateModern에 바로 적용하려면 state로 관리 → 여기서는 외부 Template가 참조하므로 콘솔만
              console.log("✅ 리뷰 생성:", reviews);
            }}
          />
        )}

        {sections.long && (
          <ShippingPolicyEditor
            title={productTitle}
            description={productDesc}
            imageUrl={effectivePreviewImageUrl}
            onSave={(text) => console.log("📦 저장된 정책:", text)}
          />
        )}

        <QnAGeneration
          title={productTitle}
          description={productDesc}
          imageUrl={effectivePreviewImageUrl}
          onSave={(text) => console.log("✅ 저장된 QnA:", text)}
        />
      </div>
    </div>
  );
}
