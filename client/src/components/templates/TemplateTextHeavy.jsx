// src/components/templates/TemplateTextHeavy.jsx
import React from "react";

export default function TemplateTextHeavy({
  // 기존
  modelImageUrl,
  fittedImageUrl,
  multiFittedImages,
  detailImages,
  generatedVideoUrl,
  title,
  shortDesc,
  imgDescs = [],
  longDesc,

  // 신규
  editable = false,
  setTitle,
  setShortDesc,
  setImgDescs,
  setLongDesc,

  theme = "modern",
  sections = {}, // { title, model, fitted, multi, detail, video, long }
  sectionOrder = ["title", "long", "model", "fitted", "multi", "detail", "video"],

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

  let imgIndex = 0;

  const blocks = {
    title: () => (
      <div>
        {editable ? (
          <>
            <input
              value={title || ""}
              onChange={(e) => setTitle?.(e.target.value)}
              className="w-full text-3xl font-bold text-gray-800 bg-transparent border-b border-gray-200 focus:outline-none"
              placeholder="상품명을 입력하세요"
            />
            <input
              value={shortDesc || ""}
              onChange={(e) => setShortDesc?.(e.target.value)}
              className="mt-2 w-full text-lg text-gray-600 bg-transparent border-b border-gray-100 focus:outline-none"
              placeholder="요약 설명을 입력하세요"
            />
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
            <p className="text-lg text-gray-600">{shortDesc}</p>
          </>
        )}
      </div>
    ),

    long: () => (
      <article className="text-gray-700 leading-relaxed whitespace-pre-wrap">
        {editable ? (
          <textarea
            value={longDesc || ""}
            onChange={(e) => setLongDesc?.(e.target.value)}
            className="w-full border rounded px-3 py-2"
            rows={10}
            placeholder="제품 상세 설명을 입력하세요"
          />
        ) : (
          longDesc
        )}
      </article>
    ),

    model: () =>
      modelImageUrl && (
        <div className="relative">
          <img src={modelImageUrl} alt="모델" className="rounded shadow-md w-full" />
          {editable && (
            <>
              <textarea
                className="mt-2 w-full border rounded px-3 py-2 text-sm"
                placeholder="모델 이미지 설명"
                value={imgDescs?.[imgIndex] || ""}
                onChange={(e) => updateImgDesc(imgIndex, e.target.value)}
                rows={2}
              />
              {typeof onClearModel === "function" && (
                <button
                  onClick={onClearModel}
                  type="button"
                  className="absolute top-2 right-2 text-xs bg-red-600 text-white px-2 py-1 rounded"
                >
                  삭제
                </button>
              )}
            </>
          )}
          {imgIndex++}
        </div>
      ),

    fitted: () =>
      fittedImageUrl && (
        <div className="relative">
          <img src={fittedImageUrl} alt="피팅" className="rounded shadow-md w-full" />
          {editable && (
            <>
              <textarea
                className="mt-2 w-full border rounded px-3 py-2 text-sm"
                placeholder="착용 이미지 설명"
                value={imgDescs?.[imgIndex] || ""}
                onChange={(e) => updateImgDesc(imgIndex, e.target.value)}
                rows={2}
              />
              {typeof onClearFitted === "function" && (
                <button
                  onClick={onClearFitted}
                  type="button"
                  className="absolute top-2 right-2 text-xs bg-red-600 text-white px-2 py-1 rounded"
                >
                  삭제
                </button>
              )}
            </>
          )}
          {imgIndex++}
        </div>
      ),

    multi: () =>
      safeMulti.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {safeMulti.map((url, i) => (
            <div key={i} className="relative">
              <img src={url} alt={`포즈 ${i}`} className="rounded shadow w-full" />
              {editable ? (
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
                      type="button"
                      className="absolute top-2 right-2 text-xs bg-red-600 text-white px-2 py-1 rounded"
                    >
                      삭제
                    </button>
                  )}
                </>
              ) : (
                imgDescs?.[imgIndex] && (
                  <p className="text-sm text-gray-500 text-center mt-1">{imgDescs?.[imgIndex]}</p>
                )
              )}
              {imgIndex++}
            </div>
          ))}
        </div>
      ),

    detail: () =>
      safeDetail.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {safeDetail.map((url, i) => (
            <div key={i} className="relative">
              <img src={url} className="rounded shadow w-full" alt={`디테일 ${i}`} />
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
                      type="button"
                      className="absolute top-2 right-2 text-xs bg-red-600 text-white px-2 py-1 rounded"
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
      ),

    video: () =>
      generatedVideoUrl && (
        <video src={generatedVideoUrl} controls className="w-full rounded shadow" />
      ),
  };

  const rootClass =
    theme === "dark"
      ? "p-6 rounded-lg space-y-6 bg-slate-900 text-slate-100"
      : theme === "gradient"
      ? "p-6 rounded-lg space-y-6 bg-gradient-to-br from-white/70 to-white/20 backdrop-blur"
      : theme === "classic"
      ? "p-6 rounded-lg space-y-6 bg-white"
      : "p-6 rounded-lg space-y-6 bg-white shadow-sm";

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
