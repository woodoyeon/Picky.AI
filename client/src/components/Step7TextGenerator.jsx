import React, { useState } from 'react';
import axios from 'axios';

export default function Step7TextGenerator({
  modelImageUrl,
  fittedImageUrl,
  multiFittedImages,
  detailImages,
  generatedVideoUrl,
  title,
  setTitle,
  shortDesc,
  setShortDesc,
  imgDescs,
  setImgDescs,
  longDesc,
  setLongDesc
}) {
  const [isLoading, setIsLoading] = useState(false);

  const generateText = async () => {
    setIsLoading(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_EXPRESS_URL}/generate-text-from-urls`, {
        modelImageUrl,
        fittedImageUrl,
        multiFittedImages,
        detailImages,
        generatedVideoUrl,
      });

      console.log("📦 GPT 응답 결과:", res.data);

      const { title, shortDesc, imgDescs: gptImgDescs, longDesc } = res.data.result || {};

      // ✅ 이미지 개수 계산
      const allImageCount = [
        modelImageUrl,
        fittedImageUrl,
        ...(multiFittedImages || []),
        ...(detailImages || []),
        generatedVideoUrl
      ].filter(Boolean).length;

      // ✅ 설명 개수 보정 (빈칸 포함해서 allImageCount만큼 맞춰줌)
      const paddedImgDescs = new Array(allImageCount)
        .fill("")
        .map((_, i) => (gptImgDescs?.[i] || ""));

      // ✅ 상태 반영
      setTitle(title || "");
      setShortDesc(shortDesc || "");
      setImgDescs(paddedImgDescs);
      setLongDesc(longDesc || "");

      alert("✅ GPT로 글 자동 작성 완료!");
    } catch (err) {
      console.error("❌ GPT 생성 실패:", err);
      alert("❌ 글 자동 생성에 실패했습니다.");
    }

    setIsLoading(false);
  };

  return (
    <section className="bg-white p-6 rounded-xl shadow mt-10 border">
      <h2 className="text-2xl font-bold text-pink-500 text-center mb-4">STEP 7. 이미지 기반 글 작성 및 수정</h2>

      <div className="flex justify-end mb-4">
        <button
          onClick={generateText}
          className="bg-pink-500 text-white px-4 py-2 rounded shadow hover:bg-pink-600"
          disabled={isLoading}
        >
          {isLoading ? "생성 중..." : "✍️ GPT로 자동 생성"}
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="font-semibold">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mt-1 border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="font-semibold">간단한 설명</label>
          <input
            type="text"
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
            className="w-full mt-1 border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="font-semibold">각 이미지에 대한 설명</label>
          {imgDescs?.map((desc, i) => (
            <input
              key={i}
              type="text"
              value={desc}
              onChange={(e) => {
                const newDescs = [...imgDescs];
                newDescs[i] = e.target.value;
                setImgDescs(newDescs);
              }}
              placeholder={`이미지 ${i + 1} 설명`}
              className="w-full mt-1 border rounded px-3 py-2 mb-2"
            />
          ))}
        </div>

        <div>
          <label className="font-semibold">상세 설명</label>
          <textarea
            value={longDesc}
            onChange={(e) => setLongDesc(e.target.value)}
            className="w-full mt-1 border rounded px-3 py-2 h-40"
          />
        </div>
      </div>
    </section>
  );
}
