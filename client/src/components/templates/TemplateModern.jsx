// components/templates/TemplateModern.jsx
import React, { useMemo } from "react";

/**
 * Modern 레이아웃
 * - 모든 이미지 아래 캡션 노출
 * - editable=true + setImgDescs 전달 시 인라인 편집 가능
 * - sections + sectionOrder 로 노출/순서 제어
 */
export default function TemplateModern({
  modelImageUrl,
  multiFittedImages = [],     // [{url,cut}] 형태 권장, string url 도 허용
  detailImages = [],          // [string]
  title = "",
  shortDesc = "",
  longDesc = "",
  originStory = "",
  setOriginStory,
  imgDescs = [],              // 모든 이미지 캡션 풀 배열 (model + multi + detail 순)
  setImgDescs,                // 전달 시 인라인 편집 허용
  editable = false,
  reviews = [],               // [{user, rating, text}]
  theme = "modern",           // classic | modern | dark | gradient
  sections = {
    title: true,
    model: true,
    fitted: false,
    multi: true,
    detail: true,
    video: false,
    story: true,
    long: true,
    reviews: true,
  },
  sectionOrder = ["title", "model", "multi", "detail", "story", "long", "reviews"],
}) {
  // 이미지 캡션 인덱싱 도우미
  // model 1장 -> multi N장 -> detail M장 순으로 imgDescs 사용
  const indexes = useMemo(() => {
    let idx = 0;
    const out = { model: null, multi: [], detail: [] };
    if (modelImageUrl) out.model = idx++;
    for (let i = 0; i < multiFittedImages.length; i++) out.multi.push(idx++);
    for (let i = 0; i < detailImages.length; i++) out.detail.push(idx++);
    return out;
  }, [modelImageUrl, multiFittedImages.length, detailImages.length]);

  const onEditDesc = (captionIndex, value) => {
    if (!editable || !setImgDescs) return;
    const next = [...imgDescs];
    next[captionIndex] = value;
    setImgDescs(next);
  };

  const card = (children) =>
    theme === "dark"
      ? <div className="bg-slate-900 text-slate-100 rounded-xl p-4">{children}</div>
      : theme === "gradient"
      ? <div className="bg-gradient-to-br from-white/70 to-white/30 backdrop-blur rounded-xl p-4">{children}</div>
      : theme === "classic"
      ? <div className="bg-white rounded-xl p-4 border">{children}</div>
      : <div className="bg-white rounded-xl p-4 shadow">{children}</div>;

  const SectionTitle = ({ children }) => (
    <h3 className="text-lg md:text-xl font-bold mb-2">{children}</h3>
  );

  const renderSection = (key) => {
    if (!sections[key]) return null;

    switch (key) {
      case "title":
        return card(
          <div>
            {!!title && <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>}
            {!!shortDesc && <p className="text-gray-700 mt-1">{shortDesc}</p>}
          </div>
        );

      case "model":
        if (!modelImageUrl) return null;
        return card(
          <figure>
            <img src={modelImageUrl} alt="model" className="w-full rounded-xl object-cover" />
            <figcaption className="mt-2 text-sm text-gray-600">
              {editable ? (
                <input
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={imgDescs[indexes.model] || ""}
                  onChange={(e) => onEditDesc(indexes.model, e.target.value)}
                  placeholder="대표 이미지 설명"
                />
              ) : (imgDescs[indexes.model] || "")}
            </figcaption>
          </figure>
        );

      case "multi":
        if (!multiFittedImages?.length) return null;
        return card(
          <div>
            <SectionTitle>착장/구도 4컷</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              {multiFittedImages.map((m, i) => {
                const url = typeof m === "string" ? m : m?.url;
                const ci = indexes.multi[i];
                return (
                  <figure key={(url || "") + i} className="bg-white rounded-lg shadow p-2">
                    <img src={url} alt={`multi-${i}`} className="w-full rounded-md object-cover" />
                    <figcaption className="mt-1 text-xs text-gray-600">
                      {editable ? (
                        <input
                          className="w-full border rounded px-2 py-1 text-xs"
                          value={imgDescs[ci] || ""}
                          onChange={(e) => onEditDesc(ci, e.target.value)}
                          placeholder={`이미지 ${i + 1} 설명`}
                        />
                      ) : (imgDescs[ci] || "")}
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </div>
        );

      case "detail":
        if (!detailImages?.length) return null;
        return card(
          <div>
            <SectionTitle>디테일 컷</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              {detailImages.map((u, i) => {
                const ci = indexes.detail[i];
                return (
                  <figure key={(u || "") + i} className="bg-white rounded-lg shadow p-2">
                    <img src={u} alt={`detail-${i}`} className="w-full rounded-md object-cover" />
                    <figcaption className="mt-1 text-xs text-gray-600">
                      {editable ? (
                        <input
                          className="w-full border rounded px-2 py-1 text-xs"
                          value={imgDescs[ci] || ""}
                          onChange={(e) => onEditDesc(ci, e.target.value)}
                          placeholder={`디테일 ${i + 1} 설명`}
                        />
                      ) : (imgDescs[ci] || "")}
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </div>
        );

      case "story":
        return card(
          <div>
            <SectionTitle>제품 스토리</SectionTitle>
            {editable && setOriginStory ? (
              <textarea
                rows={5}
                className="w-full border rounded px-3 py-2 text-sm"
                value={originStory || ""}
                onChange={(e) => setOriginStory(e.target.value)}
                placeholder="제품의 탄생/브랜드 스토리를 작성하세요"
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">{originStory || ""}</p>
            )}
          </div>
        );

      case "long":
        return card(
          <div>
            <SectionTitle>상세 설명</SectionTitle>
            <p className="text-gray-700 whitespace-pre-wrap">{longDesc || ""}</p>
          </div>
        );

      case "reviews":
        if (!reviews?.length) return null;
        return card(
          <div>
            <SectionTitle>사용자 리뷰</SectionTitle>
            <ul className="space-y-3">
              {reviews.map((r, i) => (
                <li key={i} className="bg-white rounded border p-3">
                  <div className="text-sm font-semibold">
                    {r.user || "고객"} <span className="text-amber-500">{("★").repeat(r.rating || 5)}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{r.text || ""}</p>
                </li>
              ))}
            </ul>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {sectionOrder.map((k) => (
        <div key={k}>{renderSection(k)}</div>
      ))}
    </div>
  );
}
