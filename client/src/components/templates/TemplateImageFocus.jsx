// src/components/templates/TemplateImageFocus.jsx
import React from "react";

export default function TemplateImageFocus({
  // 기존
  modelImageUrl,
  fittedImageUrl,
  multiFittedImages,
  detailImages,
  generatedVideoUrl,

  // 신규
  editable = false,
  theme = "modern",
  sections = {}, // { model, fitted, multi, detail, video }
  sectionOrder = ["model", "fitted", "multi", "detail", "video"],

  imgDescs = [],
  setImgDescs,

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
    model: () =>
      modelImageUrl && (
        <div className="relative">
          <img src={modelImageUrl} className="w-full rounded shadow" alt="모델 이미지" />
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
                  type="button"
                  onClick={onClearModel}
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
          <img src={fittedImageUrl} className="w-full rounded shadow" alt="피팅 이미지" />
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
                  type="button"
                  onClick={onClearFitted}
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
              <img src={url} className="rounded shadow w-full" alt={`포즈 ${i}`} />
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
                      type="button"
                      onClick={() => onRemoveMulti(i)}
                      className="absolute top-2 right-2 text-xs bg-red-600 text-white px-2 py-1 rounded"
                    >
                      삭제
                    </button>
                  )}
                </>
              ) : (
                imgDescs?.[imgIndex] && (
                  <p className="text-xs text-gray-500 text-center mt-1">{imgDescs?.[imgIndex]}</p>
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
                      type="button"
                      onClick={() => onRemoveDetail(i)}
                      className="absolute top-2 right-2 text-xs bg-red-600 text-white px-2 py-1 rounded"
                    >
                      삭제
                    </button>
                  )}
                </>
              ) : (
                imgDescs?.[imgIndex] && (
                  <p className="text-xs text-gray-500 text-center mt-1">{imgDescs?.[imgIndex]}</p>
                )
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
      ? "p-6 rounded-xl space-y-6 bg-slate-900 text-slate-100"
      : theme === "gradient"
      ? "p-6 rounded-xl space-y-6 bg-gradient-to-br from-white/70 to-white/20 backdrop-blur"
      : theme === "classic"
      ? "p-6 rounded-xl space-y-6 bg-white"
      : "p-6 rounded-xl space-y-6 bg-white shadow-sm";

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
