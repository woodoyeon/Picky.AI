import React, { useState } from 'react';
import DetailPreview from '../components/DetailPreview';

export default function Home() {
  const [model, setModel] = useState('model1');
  const [clothImage, setClothImage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setClothImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-rose-50 font-sans text-gray-800 px-4">
      <div className="flex flex-col md:flex-row w-full max-w-6xl">

        {/* 왼쪽 영역 */}
        <div className="relative w-full md:w-1/2 my-10 flex justify-center items-center">
          <h2 className="absolute top-0 text-lg md:text-xl font-bold text-rose-600 bg-white bg-opacity-80 px-3 py-2 rounded shadow text-center">
            사진을 업로드하면 AI가 자동으로 상세페이지를 생성해요
          </h2>

          <div className="flex gap-6 mt-20 flex-col md:flex-row items-center">
            {/* Before 이미지 */}
            <div>
              <img
                src="/intro/model_before.png"
                alt="착용 전"
                className="w-44 md:w-64 rounded-xl shadow hover:scale-105 transition-transform duration-300"
              />
              <p className="text-center mt-2 text-sm text-gray-600">착용 전</p>
            </div>

            {/* After 이미지 */}
            <div>
              <img
                src="/intro/model_after.png"
                alt="착용 후"
                className="w-44 md:w-64 rounded-xl shadow hover:scale-105 transition-transform duration-300"
              />
              <p className="text-center mt-2 text-sm text-gray-600">착용 후</p>
            </div>
          </div>
        </div>

        {/* 오른쪽 영역 */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col gap-6">
          <div>
            <label className="font-semibold text-rose-700 text-base md:text-lg">
              👗 모델 선택: 원하는 AI 모델을 직접 생성할 수도 있어요.
            </label>
            <div className="flex flex-wrap gap-3 mt-3">
              {['model1', 'model2', 'model3', 'model4'].map((item, index) => (
                <img
                  key={item}
                  src={`/models/${item}.png`}
                  alt={`모델 ${index + 1}`}
                  onClick={() => setModel(item)}
                  className={`w-16 h-24 md:w-20 md:h-28 cursor-pointer rounded-xl shadow hover:scale-105 transition-transform duration-300
                    ${model === item ? 'ring-4 ring-rose-400' : ''}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="font-semibold text-rose-700">📤 의류 이미지 업로드:</label>
            <input
              type="file"
              onChange={handleImageUpload}
              className="ml-2 mt-2"
              accept="image/*"
            />
          </div>

          <div className="flex-1 border rounded p-4 bg-white shadow">
            <DetailPreview model={model} image={clothImage} />
          </div>
        </div>
      </div>
    </div>
  );
}
