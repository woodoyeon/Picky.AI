// ✅ src/pages/ProductUpload.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import { useLocation } from 'react-router-dom';

// Step 컴포넌트 임포트
import Step1ModelConfig from '../components/Step1ModelConfig';
import Step2ImageUpload from '../components/Step2ImageUpload';
import Step3MultiFitting from '../components/Step3MultiFitting';
import Step4VideoGeneration from '../components/Step4VideoGeneration';
import Step5DetailUpload from '../components/Step5DetailUpload';
import Step6TemplateSelector from '../components/Step6TemplateSelector';
import Step7TextGenerator from '../components/Step7TextGenerator';
import Step8FinalPreview from '../components/Step8FinalPreview';

// 기타 컴포넌트
import Footer from '../components/Footer';
import { parsePromptToTexts, urlToFile } from '../utils/productHelpers.js';

export default function ProductUpload() {
  const location = useLocation();
  const expertInit = location.state?.expertInit || null;

  // ───── 상태 관리 ─────
  const [currentStep, setCurrentStep] = useState(1);

  // STEP 1
  const [selectedModel, setSelectedModel] = useState({});
  const [modelImageUrl, setModelImageUrl] = useState(null);
  
  // STEP 2
  const [uploadedModelImage, setUploadedModelImage] = useState(null);
  const [uploadedClothesImage, setUploadedClothesImage] = useState(null);
  const [productMeta, setProductMeta] = useState({ category: '', size: '', position: '', background: '' });
  const [fittedImageUrl, setFittedImageUrl] = useState(null);

  // STEP 3
  const [multiFittedImages, setMultiFittedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // STEP 4
  const [selectedImageForVideo, setSelectedImageForVideo] = useState(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState(null);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);

  // STEP 5
  const [detailImages, setDetailImages] = useState([null, null, null, null]);

  // STEP 6
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // STEP 7
  const [title, setTitle] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [longDesc, setLongDesc] = useState('');
  const [imgDescs, setImgDescs] = useState(Array(8).fill(''));

  // 기타
  const [userId, setUserId] = useState(null);
  const previewRef = useRef(null);

  // ───── 라이프사이클 & 헬퍼 ─────
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data?.user?.id || null));
  }, []);

  useEffect(() => {
    if (!expertInit) return;
    // 전문가 모드 초기화 로직 (기존 코드와 동일)
  }, [expertInit]);

  const STEPS = [
    { number: 1, title: "AI 모델 선택", component: Step1ModelConfig },
    { number: 2, title: "이미지 업로드 & 피팅", component: Step2ImageUpload },
    { number: 3, title: "다양한 컷 생성", component: Step3MultiFitting },
    { number: 4, title: "영상 제작", component: Step4VideoGeneration },
    { number: 5, title: "디테일 컷 추가", component: Step5DetailUpload },
    { number: 6, title: "템플릿 선택", component: Step6TemplateSelector },
    { number: 7, title: "텍스트 생성/수정", component: Step7TextGenerator },
    { number: 8, title: "최종 미리보기", component: Step8FinalPreview },
  ];

  const CurrentStepComponent = STEPS.find(s => s.number === currentStep)?.component;

  const goToNextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  const goToPrevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // ───── UI 렌더 ─────
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* 사이드바 */}
      <aside className="w-64 bg-white p-6 border-r flex flex-col">
        <h1 className="text-2xl font-bold text-pink-500 mb-8">상품 업로드</h1>
        <nav className="flex-1 space-y-2">
          {STEPS.map(step => (
            <button
              key={step.number}
              onClick={() => setCurrentStep(step.number)}
              className={`w-full text-left px-4 py-2 rounded-md transition ${ currentStep === step.number
                  ? 'bg-pink-500 text-white shadow'
                  : 'hover:bg-pink-50'
              }`}
            >
              <span className={`font-semibold ${currentStep === step.number ? 'text-white' : 'text-pink-400'}`}>
                STEP {step.number}
              </span>
              <span className="ml-3">{step.title}</span>
            </button>
          ))}
        </nav>
        
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            {CurrentStepComponent && (
              <CurrentStepComponent
                // 각 스텝에 필요한 props를 여기에 전달합니다.
                // 예시:
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                modelImageUrl={modelImageUrl}
                setModelImageUrl={setModelImageUrl}
                
                uploadedModelImage={uploadedModelImage}
                setUploadedModelImage={setUploadedModelImage}
                uploadedClothesImage={uploadedClothesImage}
                setUploadedClothesImage={setUploadedClothesImage}
                productMeta={productMeta}
                setProductMeta={setProductMeta}
                fittedImageUrl={fittedImageUrl}
                setFittedImageUrl={setFittedImageUrl}

                multiFittedImages={multiFittedImages}
                setMultiFittedImages={setMultiFittedImages}
                isLoading={isLoading}
                setIsLoading={setIsLoading}

                selectedImageForVideo={selectedImageForVideo}
                setSelectedImageForVideo={setSelectedImageForVideo}
                generatedVideoUrl={generatedVideoUrl}
                setGeneratedVideoUrl={setGeneratedVideoUrl}
                isVideoGenerating={isVideoGenerating}
                setIsVideoGenerating={setIsVideoGenerating}

                detailImages={detailImages}
                setDetailImages={setDetailImages}

                selectedTemplate={selectedTemplate}
                setSelectedTemplate={setSelectedTemplate}

                title={title}
                setTitle={setTitle}
                shortDesc={shortDesc}
                setShortDesc={setShortDesc}
                longDesc={longDesc}
                setLongDesc={setLongDesc}
                imgDescs={imgDescs}
                setImgDescs={setImgDescs}
                
                previewRef={previewRef}
              />
            )}
          </div>

          {/* 네비게이션 버튼 */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={goToPrevStep}
              disabled={currentStep === 1}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
            >
              이전
            </button>
            <button
              onClick={goToNextStep}
              disabled={currentStep === STEPS.length}
              className="px-6 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 disabled:opacity-50"
            >
              다음
            </button>
          </div>
          <Footer />
        </div>
      </main>

       {/* 미리보기 영역 */}
       <aside className="w-96 bg-gray-50 p-6 border-l overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">미리보기</h2>
          <div className="bg-white p-4 rounded-lg shadow-inner min-h-[300px]">
            {/* 
              각 스텝의 결과물을 여기에 표시합니다.
              예를 들어, 1단계에서는 생성된 모델 이미지를, 
              2단계에서는 피팅된 이미지를 보여줄 수 있습니다.
            */}
            {currentStep === 1 && modelImageUrl && (
              <img src={modelImageUrl} alt="AI 모델" className="w-full rounded-md" />
            )}
            {currentStep === 2 && fittedImageUrl && (
              <img src={fittedImageUrl} alt="피팅 이미지" className="w-full rounded-md" />
            )}
            {currentStep === 3 && multiFittedImages.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {multiFittedImages.map((img, i) => <img key={i} src={img} alt={`컷 ${i+1}`} className="w-full rounded-md" />)}
              </div>
            )}
            {currentStep === 4 && generatedVideoUrl && (
              <video src={generatedVideoUrl} controls className="w-full rounded-md" />
            )}
            {currentStep >= 5 && (
              <div>
                <h3 className="font-bold text-lg mb-2">{title || '상품 제목'}</h3>
                <p className="text-sm text-gray-600 mb-4">{shortDesc || '상품 요약 설명'}</p>
                {fittedImageUrl && <img src={fittedImageUrl} alt="대표 이미지" className="w-full rounded-md mb-4" />}
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: longDesc.replace(/\n/g, '<br/>') }} />
              </div>
            )}
          </div>
        </aside>
    </div>
  );
}
