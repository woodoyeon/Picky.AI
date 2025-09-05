// components/templates/TemplatePhotoOne.jsx
import React from "react";

export default function TemplatePhotoOne({
  modelImageUrl,
  title = "",
  shortDesc = "",
  imgDescs = [],
  editable = false,
  setImgDescs,
}) {
  const onEdit = (i, v) => {
    if (!editable || !setImgDescs) return;
    const next = [...imgDescs];
    next[i] = v;
    setImgDescs(next);
  };

  return (
    <div className="max-w-[900px] mx-auto space-y-4">
      {title && <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>}
      {shortDesc && <p className="text-gray-700">{shortDesc}</p>}

      {modelImageUrl && (
        <figure>
          <img
            src={modelImageUrl}
            alt="main"
            className="w-full rounded-xl object-cover"
          />
          <figcaption className="mt-2 text-sm text-gray-600">
            {editable ? (
              <input
                className="w-full border rounded px-2 py-1 text-sm"
                value={imgDescs[0] || ""}
                onChange={(e) => onEdit(0, e.target.value)}
                placeholder="이미지 설명을 입력하세요"
              />
            ) : (
              imgDescs[0] || ""
            )}
          </figcaption>
        </figure>
      )}
    </div>
  );
}
