import React from 'react';

export default function Step3MultiFitted({
    handleRunwayFittingRequest,
    isLoading,
    multiFittedImages,
    selectedImageForVideo,
    setSelectedImageForVideo,
    handleNextStep,
    handleApplyMultiFittedToDetails
}) {

    return (
        <div className="space-y-6">
            <section className="bg-white p-6 rounded-xl shadow-lg space-y-6 border border-purple-200">
                <h2 className="text-2xl font-bold text-purple-600 text-center">STEP 3. 다양한 상품 모델 합성</h2>
                <p className="text-gray-600 text-center">
                    전신, 측면, 후면, 상반신 4장 이미지가 자동으로 생성됩니다.<br />
                    모델은 원본 얼굴/의상/신발을 유지하며, 입력한 배경과 상품이 합성됩니다.
                </p>

                <div className="flex justify-center">
                    <button
                        onClick={handleRunwayFittingRequest}
                        disabled={isLoading}
                        className={`px-6 py-3 rounded-md text-white font-semibold transition ${
                            isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-500 hover:bg-purple-600'
                        }`}
                    >
                        {isLoading ? '생성 중...' : '🎨 4장 자동 합성 요청'}
                    </button>
                </div>

                {multiFittedImages.length > 0 && (
                    <div>
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            {multiFittedImages.map((url, i) => (
                                <div key={i} className="text-center">
                                    <img
                                        src={url}
                                        alt={`합성 이미지 ${i + 1}`}
                                        onClick={() => setSelectedImageForVideo(url)}
                                        className={`w-full rounded-lg shadow cursor-pointer transition ${
                                            selectedImageForVideo === url ? 'ring-4 ring-purple-400' : ''
                                        }`}
                                    />
                                    <p className="text-sm text-gray-500 mt-2">
                                        {['전신', '측면', '후면', '상반신'][i]}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-6 flex flex-col gap-2">
                            <button
                                onClick={handleApplyMultiFittedToDetails}
                                disabled={multiFittedImages.length !== 4}
                                className={`bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition ${
                                    multiFittedImages.length !== 4 ? 'bg-gray-400 cursor-not-allowed' : ''
                                }`}
                            >
                                ✅ 4장 이미지 5단계에 적용 및 이동
                            </button>
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
