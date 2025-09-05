// components/templates/TemplateTwoUp.jsx
import React from "react";

export default function TemplateTwoUp({
  images = [],
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

  const list = images.slice(0, 2);

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((u, i) => (
          <figure key={(u || "") + i} className="bg-white rounded-xl shadow p-2">
            {u ? (
              <img src={u} alt={`two-up-${i}`} className="w-full rounded-lg object-cover" />
            ) : (
              <div className="aspect-[4/5] bg-gray-100 rounded" />
            )}
            <figcaption className="mt-1 text-xs text-gray-600">
              {editable ? (
                <input
                  className="w-full border rounded px-2 py-1 text-xs"
                  value={imgDescs[i] || ""}
                  onChange={(e) => onEdit(i, e.target.value)}
                  placeholder={`이미지 ${i + 1} 설명`}
                />
              ) : (
                imgDescs[i] || ""
              )}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
