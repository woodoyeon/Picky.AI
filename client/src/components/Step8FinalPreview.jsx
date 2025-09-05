// src/components/Step8FinalPreview.jsx
import React, { useEffect, useState } from 'react';
import TemplateModern from './templates/TemplateModern';
import TemplateBasic from './templates/TemplateBasic';
import TemplateImageFocus from './templates/TemplateImageFocus';
import TemplateTextHeavy from './templates/TemplateTextHeavy';

const templateMap = {
  modern: TemplateModern,
  basic: TemplateBasic,
  image: TemplateImageFocus,
  text: TemplateTextHeavy,
};

// ✅ Supabase Public URL → Base64 변환 함수
async function convertImageToBase64(url) {
  try {
    const res = await fetch(url, { mode: 'cors' });
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error('❌ 이미지 Base64 변환 실패:', err);
    return url; // 실패 시 원본 URL 반환
  }
}

export default function Step8FinalPreview({
  selectedTemplate,
  modelImageUrl,
  fittedImageUrl,
  multiFittedImages = [],
  detailImages = [],
  generatedVideoUrl,
  title,
  setTitle,
  shortDesc,
  setShortDesc,
  imgDescs,
  setImgDescs,
  longDesc,
  setLongDesc,
}) {
  const Template = templateMap[selectedTemplate];
  const editable = true;

  // ✅ 변환된 Base64 이미지 상태
  const [safeImages, setSafeImages] = useState({
    modelImageUrl,
    fittedImageUrl,
    multiFittedImages,
    detailImages
  });

  // ✅ 마운트 시 이미지 Base64 변환
  useEffect(() => {
    const prepareImages = async () => {
      const convertedModel = modelImageUrl ? await convertImageToBase64(modelImageUrl) : null;
      const convertedFitted = fittedImageUrl ? await convertImageToBase64(fittedImageUrl) : null;
      const convertedMulti = await Promise.all(
        (multiFittedImages || []).map(url => url ? convertImageToBase64(url) : null)
      );
      const convertedDetail = await Promise.all(
        (detailImages || []).map(item => {
          if (typeof item === 'string') return convertImageToBase64(item);
          if (item?.url) return convertImageToBase64(item.url);
          return null;
        })
      );

      setSafeImages({
        modelImageUrl: convertedModel,
        fittedImageUrl: convertedFitted,
        multiFittedImages: convertedMulti,
        detailImages: convertedDetail
      });
    };

    prepareImages();
  }, [modelImageUrl, fittedImageUrl, multiFittedImages, detailImages]);

  if (!Template) {
    return (
      <section className="bg-white p-6 rounded-xl shadow mt-10 border text-center">
        <h2 className="text-xl text-red-500 font-semibold">선택된 템플릿이 없습니다.</h2>
        <p className="text-gray-500 mt-2">STEP 6에서 템플릿을 먼저 선택해주세요.</p>
      </section>
    );
  }

  return (
    <section className="bg-white p-6 rounded-xl shadow mt-10 border">
      <h2 className="text-2xl font-bold text-pink-500 text-center mb-6">
        STEP 8. 최종 상세페이지 미리보기 & 수정
        <span className="block text-sm text-gray-500 mt-1">
          선택된 템플릿: <strong>{selectedTemplate}</strong>
        </span>
      </h2>

      {/* ✅ 선택한 템플릿에 안전한 이미지(Base64) 전달 */}
      <Template
        modelImageUrl={safeImages.modelImageUrl}
        fittedImageUrl={safeImages.fittedImageUrl}
        multiFittedImages={safeImages.multiFittedImages}
        detailImages={safeImages.detailImages}
        generatedVideoUrl={generatedVideoUrl}
        title={title}
        setTitle={setTitle}
        shortDesc={shortDesc}
        setShortDesc={setShortDesc}
        imgDescs={imgDescs}
        setImgDescs={setImgDescs}
        longDesc={longDesc}
        setLongDesc={setLongDesc}
        editable={editable}
        crossOrigin="anonymous" // ✅ 모든 이미지에 CORS 허용
      />
    </section>
  );
}
