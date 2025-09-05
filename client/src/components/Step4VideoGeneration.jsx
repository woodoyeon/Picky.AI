import React from 'react';
import UploadBox from '../components/UploadBox';

export default function Step4VideoGeneration({
  selectedImageForVideo,
  handleVideoImageUpload,
  videoCategory,
  setVideoCategory,
  handleVideoGeneration,
  isVideoGenerating,
  generatedVideoUrl,
  handleNextStep
}) {

  return (
    <div className="space-y-6">
      <section className="bg-white p-6 rounded-xl shadow-lg space-y-6 border border-pink-300">
        <h2 className="text-2xl font-bold text-pink-600 text-center">STEP 4. 이미지 기반 영상 제작</h2>
      
        <div className="text-center">
          <UploadBox
            label="영상용 이미지 업로드"
            onImageUpload={handleVideoImageUpload}
          />
          <p className="text-sm text-gray-500 mt-2">STEP 3 없이도 여기서 직접 업로드해 사용할 수 있어요</p>
        </div>
      
        {selectedImageForVideo && (
          <div className="text-center mt-4">
            <img
              src={selectedImageForVideo}
              alt="선택된 영상용 이미지"
              className="w-full max-w-sm mx-auto rounded-md border shadow"
            />
          </div>
        )}
      
        <div className="text-center mt-6">
          <label className="text-sm text-gray-700 mr-2 font-medium">🎯 영상 카테고리</label>
          <select
            value={videoCategory}
            onChange={(e) => setVideoCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="의류">의류</option>
            <option value="농수산물">농수산물</option>
            <option value="전자제품">전자제품</option>
            <option value="화장품">화장품</option>
          </select>
        </div>
      
        <div className="text-center">
          <button
            onClick={handleVideoGeneration}
            disabled={isVideoGenerating}
            className={`mt-4 px-6 py-3 rounded-md text-white font-semibold transition ${
              isVideoGenerating ? 'bg-gray-400' : 'bg-pink-500 hover:bg-pink-600'
            }`}
          >
            {isVideoGenerating ? '영상 생성 중...' : '🎥 선택 이미지로 영상 만들기'}
          </button>
        </div>
      
        {generatedVideoUrl && (
          <div className="mt-6 text-center">
            <video src={generatedVideoUrl} controls className="w-full rounded-lg shadow-md" />
            <p className="text-sm text-gray-600 mt-2">🎬 생성된 영상 미리보기</p>
            <div className="mt-4">
              <button
                onClick={handleNextStep}
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition"
              >
                다음 단계로 &rarr;
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}