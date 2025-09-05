import React from 'react';
import UploadBox from '../components/UploadBox';

export default function Step2ImageUpload({ 
  setUploadedModelImage,
  modelImagePreview,
  setUploadedClothesImage,
  productMeta,
  setProductMeta,
  handleFittingRequest,
  isLoading,
  loadingText,
  isVideoGenerating,
  fittedImageUrl,
  handleNextStep
}) {
  
  return (
    <div className="space-y-6">
      <section className="bg-white p-6 rounded-2xl shadow-md border border-pink-200">
        <h2 className="text-2xl font-bold text-pink-500 text-center mb-6">STEP 2. 상품 이미지 업로드</h2>
      
        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
          <div className="text-center">
            <UploadBox
              label="모델 이미지 업로드"
              onImageUpload={setUploadedModelImage}
              previewUrl={modelImagePreview}
            />
            <p className="text-sm text-gray-500 mt-2">AI로 생성된 모델 이미지를 등록하세요</p>
          </div>
          <div className="text-center">
            <UploadBox
              label="상품 이미지 업로드"
              onImageUpload={setUploadedClothesImage}
            />
            <p className="text-sm text-gray-500 mt-2">합성할 상품 이미지 (배경제거된 PNG 권장)</p>
          </div>
        </div>
      
        {/* 🔍 추가 정보 입력 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 상품 카테고리 */}
          <div>
            <label className="block text-sm font-medium text-pink-600 mb-1">상품 카테고리</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={productMeta.category}
              onChange={e => setProductMeta(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">선택하세요</option>
              <option value="의류">의류</option>
              <option value="농수산물">농수산물</option>
              <option value="가전제품">가전제품</option>
              <option value="잡화">잡화/가방</option>
              <option value="기타">기타</option>
            </select>
          </div>
          {/* 제품 크기 */}
          <div>
            <label className="block text-sm font-medium text-pink-600 mb-1">제품 크기</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={productMeta.size}
              onChange={e => setProductMeta(prev => ({ ...prev, size: e.target.value }))}
            >
              <option value="">선택하세요</option>
              <option value="소형">소형 (손에 들어가는 크기)</option>
              <option value="중형">중형 (가방, 노트북 등)</option>
              <option value="대형">대형 (의류, 대형 가전 등)</option>
            </select>
          </div>
          {/* 합성 위치 */}
          <div>
            <label className="block text-sm font-medium text-pink-600 mb-1">상품 위치</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={productMeta.position}
              onChange={e => setProductMeta(prev => ({ ...prev, position: e.target.value }))}
            >
              <option value="">선택하세요</option>
              <option value="착용">착용</option>
              <option value="들고 있음">들고 있음</option>
              <option value="바닥에 놓임">바닥에 놓임</option>
              <option value="어깨에 맴">어깨에 맴</option>
              <option value="옆에 놓음">옆에 놓음</option>
            </select>
          </div>
          {/* 배경 스타일 */}
          <div>
            <label className="block text-sm font-medium text-pink-600 mb-1">배경 스타일</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={productMeta.background}
              onChange={e => setProductMeta(prev => ({ ...prev, background: e.target.value }))}
            >
              <option value="">선택하세요</option>
              <option value="화이트">화이트 배경</option>
              <option value="스튜디오">스튜디오</option>
              <option value="야외">야외</option>
              <option value="주방">주방</option>
              <option value="카페">카페</option>
            </select>
          </div>
        </div>
      
        {/* 요청 버튼 및 로딩 UI */}
        <div className="text-center mt-6">
          <button
            onClick={handleFittingRequest}
            disabled={isLoading || isVideoGenerating}
            className={`bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600 transition ${
              (isLoading || isVideoGenerating) ? 'bg-gray-400 cursor-not-allowed' : ''
            }`}
          >
            {isLoading && loadingText.includes('피팅') ? '요청 중...' : '🎯 피팅 이미지 요청'}
          </button>
          {isLoading && loadingText.includes('피팅') && (
            <div className="mt-4 p-3 bg-pink-50 border border-pink-200 rounded-lg text-pink-700 flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-t-2 border-pink-500 rounded-full animate-spin"></div>
              <span>{loadingText}</span>
            </div>
          )}
        </div>
      
        {/* 피팅 이미지 출력 */}
        {/* {fittedImageUrl && (
          <div className="mt-6 text-center">
            <h3 className="text-lg font-semibold text-pink-600 mb-2">🧥 피팅 이미지 미리보기</h3>
            <img
              src={fittedImageUrl}
              alt="피팅 이미지"
              className="inline-block max-w-xs border rounded-lg shadow-md"
            />
            <div className="mt-4">
              <button
                onClick={handleNextStep}
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition"
              >
                다음 단계로 &rarr;
              </button>
            </div>
          </div>
        )} */}
      </section>
    </div>
  );
}
