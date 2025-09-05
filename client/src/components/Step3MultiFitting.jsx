// src/components/Step3MultiFitting.jsx
import React, { useState } from "react";
import axios from "axios";
import { uploadFileToSupabase } from "../utils/uploadFileToSupabase";

export default function Step3MultiFitting({
  modelImageUrl,
  fittedImageUrl,
  uploadedClothesImage,
  selectedModel,
  onComplete
}) {
  const [multiFittedImages, setMultiFittedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleRunwayFittingRequest = async () => {
    console.group("[Step3MultiFitting] handleRunwayFittingRequest");
    console.log("modelImageUrl:", modelImageUrl);
    console.log("fittedImageUrl:", fittedImageUrl);
    console.log("uploadedClothesImage:", uploadedClothesImage);
    console.log("selectedModel:", selectedModel);

    if (!modelImageUrl || !fittedImageUrl || !uploadedClothesImage) {
      console.warn(
        "🚫 Missing required inputs",
        {
          hasModel: !!modelImageUrl,
          hasFitted: !!fittedImageUrl,
          hasClothes: !!uploadedClothesImage,
        }
      );
      return alert("STEP 2를 먼저 완료해주세요. 모델+상품+피팅 이미지가 필요합니다.");
    }
    setIsLoading(true);
    const cuts = ["full-body", "side-view", "back-view", "half-body"];
    const outputUrls = [];

    const uploadOneImage = async (cut) => {
      try {
        const clothesImageUrl = await uploadFileToSupabase(
          uploadedClothesImage,
          `clothes-${cut}-${Date.now()}.png`,
          "clothes-images"
        );
        const referenceImages = [
          { uri: modelImageUrl, tag: "model" },
          { uri: clothesImageUrl, tag: "style" },
          { uri: fittedImageUrl, tag: "fitting" },
        ];

        const formData = new FormData();
        formData.append("cut", cut);
        formData.append("model", JSON.stringify(selectedModel));
        formData.append("referenceImages", JSON.stringify(referenceImages));

        const res = await axios.post(
          `${import.meta.env.VITE_EXPRESS_URL}/runway-fitting-cut`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        if (res.data?.outputUrl) outputUrls.push(res.data.outputUrl);
      } catch (err) {
        console.error(`${cut} 생성 실패`, err);
      }
    };

    for (let cut of cuts) {
      await uploadOneImage(cut);
    }
    setMultiFittedImages(outputUrls);
    setIsLoading(false);
    onComplete?.(outputUrls);
  };

  return (
    <section className="bg-white p-6 rounded-xl shadow space-y-6 border border-purple-200">
      <h2 className="text-2xl font-bold text-purple-600 text-center">
        STEP 3. 다양한 상품 모델 합성
      </h2>
      <div className="flex justify-center">
        <button
          onClick={handleRunwayFittingRequest}
          disabled={isLoading}
          className={`px-6 py-3 rounded-md text-white font-semibold transition ${
            isLoading ? "bg-gray-400" : "bg-purple-500 hover:bg-purple-600"
          }`}
        >
          {isLoading ? "생성 중..." : "🎨 4장 자동 합성 요청"}
        </button>
      </div>

      {multiFittedImages.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mt-6">
          {multiFittedImages.map((url, i) => (
            <div key={i} className="text-center">
              <img
                src={url}
                alt={`합성 이미지 ${i + 1}`}
                className="w-full rounded-lg shadow"
              />
              <p className="text-sm text-gray-500 mt-2">
                {["전신", "측면", "후면", "상반신"][i]}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
