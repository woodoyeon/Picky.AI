import React from 'react';
import { getOccupations } from '../utils/productHelpers';

export default function Step1ModelConfig({
  selectedModel, 
  setSelectedModel,
  handleGenerateModelImage,
  isLoading,
  loadingText,
  isVideoGenerating,
  modelImageUrl,
  applyModelImageToUploadBox,
  handleNextStep
}) {

  return (
    <div className="space-y-6">
      <section className="bg-white p-6 rounded-2xl shadow-md space-y-6 border border-pink-200">
          <h2 className="text-2xl font-bold text-pink-500 text-center">STEP 1. AI 모델 선택</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* 상품 카테고리 */}
            <div>
              <label className="block text-sm font-medium text-pink-600 mb-1">상품 카테고리</label>
              <select 
                className="w-full border border-pink-300 rounded-md px-3 py-2"
                value={selectedModel.category}
                onChange={(e) => setSelectedModel(prev => ({ ...prev, category: e.target.value, occupation: "" }))}>
                <option value="">선택하세요</option>
                <option value="clothing">의류</option>
                <option value="agriculture">농수산물</option>
                <option value="electronics">전자제품</option>
                <option value="cosmetics">화장품</option>
              </select>
            </div>

            {/* 모델 직업 */}
            <div>
              <label className="block text-sm font-medium text-pink-600 mb-1">모델 직업</label>
              <select 
                className="w-full border border-pink-300 rounded-md px-3 py-2"
                value={selectedModel.occupation}
                onChange={(e) => setSelectedModel(prev => ({ ...prev, occupation: e.target.value }))}>
                <option value="">선택하세요</option>
                {getOccupations(selectedModel.category).map((label) => (
                  <option key={label} value={label}>{label}</option>
                ))}
              </select>
            </div>

            {/* 국적 */}
            <div>
              <label className="block text-sm font-medium text-pink-600 mb-1">국적</label>
              <select 
                className="w-full border border-pink-300 rounded-md px-3 py-2"
                value={selectedModel.nationality}
                onChange={(e) => setSelectedModel(prev => ({ ...prev, nationality: e.target.value }))}>
                <option value="">선택하세요</option>
                <option value="Korean">한국</option>
                <option value="Japanese">일본</option>
                <option value="American">미국</option>
                <option value="European">유럽</option>
              </select>
            </div>

            {/* 연령 */}
            <div>
              <label className="block text-sm font-medium text-pink-600 mb-1">연령대</label>
              <select 
                className="w-full border border-pink-300 rounded-md px-3 py-2"
                value={selectedModel.age}
                onChange={(e) => setSelectedModel(prev => ({ ...prev, age: e.target.value }))}>
                <option value="">선택하세요</option>
                <option value="20s">20대</option>
                <option value="30s">30대</option>
                <option value="40s">40대</option>
                <option value="50s">50대 이상</option>
              </select>
            </div>

            {/* 성별 */}
            <div>
              <label className="block text-sm font-medium text-pink-600 mb-1">성별</label>
              <select 
                className="w-full border border-pink-300 rounded-md px-3 py-2"
                value={selectedModel.gender}
                onChange={(e) => setSelectedModel(prev => ({ ...prev, gender: e.target.value }))}>
                <option value="">선택하세요</option>
                <option value="female">여성</option>
                <option value="male">남성</option>
                <option value="androgynous">중성적</option>
              </select>
            </div>

            {/* 배경 */}
            <div>
              <label className="block text-sm font-medium text-pink-600 mb-1">배경</label>
              <select 
                className="w-full border border-pink-300 rounded-md px-3 py-2"
                value={selectedModel.background}
                onChange={(e) => setSelectedModel(prev => ({ ...prev, background: e.target.value }))}>
                <option value="">선택하세요</option>
                <option value="studio">스튜디오</option>
                <option value="outdoor">야외</option>
                <option value="white">화이트 배경</option>
                <option value="market">시장</option>
                <option value="kitchen">주방</option>
              </select>
            </div>

            {/* 프롬프트 직접입력 */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-pink-600 mb-1">직접 프롬프트 입력 (선택)</label>
              <textarea
                rows={3}
                className="w-full border border-pink-300 rounded-md px-3 py-2"
                placeholder="예) 30대 여성 농부가 시장에서 신선한 채소를 들고 있는 모습..."
                value={selectedModel.customPrompt}
                onChange={(e) => setSelectedModel(prev => ({ ...prev, customPrompt: e.target.value }))}
              />
            </div>
          </div>

          {/* 생성 버튼 */}
         <div className="text-center">
            <button
              onClick={handleGenerateModelImage}
              disabled={isLoading || isVideoGenerating}
              className={`bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600 mt-4 transition ${
                (isLoading || isVideoGenerating) ? 'bg-gray-400 cursor-not-allowed' : ''
              }`}
            >
              {isLoading && loadingText.includes('DALL·E') ? '생성 중...' : '➕ 모델 이미지 생성'}
            </button>
            {isLoading && loadingText.includes('DALL·E') && (
              <div className="mt-4 p-3 bg-pink-50 border border-pink-200 rounded-lg text-pink-700 flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-t-2 border-pink-500 rounded-full animate-spin"></div>
                <span>{loadingText}</span>
              </div>
            )}
          </div>

          {/* 이미지 미리보기 */}
          {/* {modelImageUrl && (
            <div className="mt-6 text-center">
              <img src={modelImageUrl} alt="모델" className="w-full max-w-md mx-auto rounded-lg border shadow" />
            </div>
          )} */}
        </section>
        </div>
  );
}