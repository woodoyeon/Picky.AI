// src/components/templates/TemplateBasic.jsx
import React from "react";

export default function TemplateBasic({
  // 기존 props
  modelImageUrl,
  fittedImageUrl,
  multiFittedImages,
  detailImages,
  generatedVideoUrl,
  title,
  shortDesc,
  imgDescs = [],
  longDesc,

  // 신규 옵션(선택)
  editable = false,
  setTitle,
  setShortDesc,
  setImgDescs,
  setLongDesc,

  // 디자인/제어
  theme = "modern", // classic | modern | dark | gradient
  sections = {}, // { title, model, fitted, multi, detail, video, long }
  sectionOrder = ["title", "model", "fitted", "multi", "detail", "video", "long"],

  // (선택) 삭제/정리 콜백
  onClearModel,
  onClearFitted,
  onRemoveMulti,
  onRemoveDetail,
}) {
  const getUrl = (it) => (typeof it === "string" ? it : it?.url);

  const safeMulti = Array.isArray(multiFittedImages)
    ? multiFittedImages.map(getUrl).filter(Boolean)
    : [];
  const safeDetail = Array.isArray(detailImages)
    ? detailImages.map(getUrl).filter(Boolean)
    : [];

  const updateImgDesc = (index, value) => {
    if (!setImgDescs) return;
    const next = [...(imgDescs || [])];
    next[index] = value;
    setImgDescs(next);
  };

  // 섹션 구현
  let imgIndex = 0;

  const blocks = {
    title: () => (
      <div>
        {editable ? (
          <>
            <input
              value={title || ""}
              onChange={(e) => setTitle?.(e.target.value)}
              className="w-full text-2xl md:text-3xl font-bold text-gray-800 bg-transparent border-b border-gray-200 focus:outline-none"
              placeholder="상품명을 입력하세요"
            />
            <input
              value={shortDesc || ""}
              onChange={(e) => setShortDesc?.(e.target.value)}
              className="mt-2 w-full text-gray-600 bg-transparent border-b border-gray-100 focus:outline-none"
              placeholder="요약 설명을 입력하세요"
            />
          </>
        ) : (
          <>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{title}</h2>
            <p className="text-gray-600">{shortDesc}</p>
          </>
        )}
      </div>
    ),

    model: () =>
      modelImageUrl && (
        <div>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700 mt-2">모델 이미지</h3>
            {editable && (
              <button
                onClick={onClearModel}
                className="text-xs text-red-600 hover:underline"
                type="button"
              >
                삭제
              </button>
            )}
          </div>
          <img src={modelImageUrl} alt="모델 이미지" className="w-full rounded shadow" />
          {editable && (
            <textarea
              className="mt-2 w-full border rounded px-3 py-2 text-sm"
              placeholder="이 이미지에 대한 설명을 입력하세요"
              value={imgDescs?.[imgIndex] || ""}
              onChange={(e) => updateImgDesc(imgIndex, e.target.value)}
              rows={2}
            />
          )}
          {imgIndex++}
        </div>
      ),

    fitted: () =>
      fittedImageUrl && (
        <div>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700 mt-4">착용 이미지</h3>
            {editable && (
              <button
                onClick={onClearFitted}
                className="text-xs text-red-600 hover:underline"
                type="button"
              >
                삭제
              </button>
            )}
          </div>
          <img src={fittedImageUrl} alt="피팅 이미지" className="w-full rounded shadow" />
          {editable && (
            <textarea
              className="mt-2 w-full border rounded px-3 py-2 text-sm"
              placeholder="이 이미지에 대한 설명을 입력하세요"
              value={imgDescs?.[imgIndex] || ""}
              onChange={(e) => updateImgDesc(imgIndex, e.target.value)}
              rows={2}
            />
          )}
          {imgIndex++}
        </div>
      ),

    multi: () =>
      safeMulti.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-700 mt-4">다양한 포즈</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            {safeMulti.map((url, i) => (
              <div key={i} className="relative">
                <img src={url} alt={`포즈 ${i + 1}`} className="rounded shadow w-full" />
                {editable && (
                  <>
                    <textarea
                      className="mt-2 w-full border rounded px-3 py-2 text-sm"
                      placeholder={`포즈 ${i + 1} 설명`}
                      value={imgDescs?.[imgIndex] || ""}
                      onChange={(e) => updateImgDesc(imgIndex, e.target.value)}
                      rows={2}
                    />
                    {typeof onRemoveMulti === "function" && (
                      <button
                        onClick={() => onRemoveMulti(i)}
                        className="absolute top-1 right-1 text-[11px] bg-red-600 text-white px-2 py-1 rounded"
                        type="button"
                      >
                        삭제
                      </button>
                    )}
                  </>
                )}
                {!editable && imgDescs?.[imgIndex] && (
                  <p className="text-sm text-gray-500 text-center mt-1">
                    {imgDescs?.[imgIndex]}
                  </p>
                )}
                {imgIndex++}
              </div>
            ))}
          </div>
        </div>
      ),

    detail: () =>
      safeDetail.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-700 mt-4">디테일 이미지</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            {safeDetail.map((url, i) => (
              <div key={i} className="relative">
                <img src={url} alt={`디테일 ${i + 1}`} className="rounded shadow w-full" />
                {editable ? (
                  <>
                    <textarea
                      className="mt-2 w-full border rounded px-3 py-2 text-sm"
                      placeholder={`디테일 ${i + 1} 설명`}
                      value={imgDescs?.[imgIndex] || ""}
                      onChange={(e) => updateImgDesc(imgIndex, e.target.value)}
                      rows={2}
                    />
                    {typeof onRemoveDetail === "function" && (
                      <button
                        onClick={() => onRemoveDetail(i)}
                        className="absolute top-1 right-1 text-[11px] bg-red-600 text-white px-2 py-1 rounded"
                        type="button"
                      >
                        삭제
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-500 text-center mt-1">
                    {imgDescs?.[imgIndex]}
                  </p>
                )}
                {imgIndex++}
              </div>
            ))}
          </div>
        </div>
      ),

    video: () =>
      generatedVideoUrl && (
        <div>
          <h3 className="font-semibold text-gray-700 mt-4">제품 소개 영상</h3>
          <video src={generatedVideoUrl} controls className="w-full rounded shadow" />
        </div>
      ),

    long: () => (
      <div className="text-gray-700 whitespace-pre-wrap mt-6">
        {editable ? (
          <textarea
            className="w-full border rounded px-3 py-2"
            rows={8}
            value={longDesc || ""}
            onChange={(e) => setLongDesc?.(e.target.value)}
            placeholder="상세 설명을 입력하세요"
          />
        ) : (
          longDesc
        )}
      </div>
    ),
  };

  // 루트 테마
  const rootClass =
    theme === "dark"
      ? "p-6 rounded-lg border space-y-6 bg-slate-900 text-slate-100"
      : theme === "gradient"
      ? "p-6 rounded-lg border space-y-6 bg-gradient-to-br from-white/70 to-white/20 backdrop-blur"
      : theme === "classic"
      ? "p-6 rounded-lg border space-y-6 bg-white"
      : "p-6 rounded-lg border space-y-6 bg-white shadow-sm"; // modern(기본)

  return (
    <div className={rootClass}>
      {sectionOrder.map((key) => {
        if (sections && sections[key] === false) return null;
        const Comp = blocks[key];
        return Comp ? <div key={key}>{Comp()}</div> : null;
      })}
    </div>
  );
}
