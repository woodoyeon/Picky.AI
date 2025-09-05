// DetailMaker.jsx

import { uploadImageToSupabase } from '../utils/uploadToSupabase';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import UploadBox from '../components/UploadBox';
import Footer from '../components/Footer';
import { supabase } from '../supabaseClient';


export default function DetailMaker() {
  const [title, setTitle] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [imgDescs, setImgDescs] = useState(['', '', '']);
  const [longDesc, setLongDesc] = useState('');
  const [userId, setUserId] = useState(null);
  const [uploadedModelImage, setUploadedModelImage] = useState(null);
  const [uploadedClothesImage, setUploadedClothesImage] = useState(null);
  const [selectedModel, setSelectedModel] = useState('');
  const [modelImageUrl, setModelImageUrl] = useState(null);
  const [fittedImageUrl, setFittedImageUrl] = useState(null);
  const [modelImagePreview, setModelImagePreview] = useState(null);


  const step3Ref = useRef(null);
  const step4Ref = useRef(null);

  const modelPrompts = {
    '모델 A': 'A full-body profile shot of a slim Korean male model in his 30s...',
    '모델 B': 'A full-body photo of a young slim Korean man in his 30s...',
    '모델 C': 'A full-body portrait of a handsome slim Korean man in his 30s...',
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data?.user?.id || null);
    });
  }, []);


  const handleModelImageSave = async () => {
  if (!modelImageUrl) return;
  const savedUrl = await uploadImageToSupabase(
    modelImageUrl,
    `model-${Date.now()}.png`,
    'model-images'
  );
  if (savedUrl) setModelImageUrl(savedUrl);
};

  const handleFittedImageSave = async () => {
    if (!fittedImageUrl) return;
    const savedUrl = await uploadImageToSupabase(
      fittedImageUrl,
      `fitted-${Date.now()}.png`,
      'fitted-images'
    );
    if (savedUrl) setFittedImageUrl(savedUrl);
  };



  const autoFillText = () => {
    setTitle('AI가 추천한 상품 제목');
    setShortDesc('이 상품은 최신 트렌드에 맞춰 디자인된 아이템입니다.');
    setImgDescs(['전면 착용 이미지', '후면 디테일 강조', '소재와 핏 강조 이미지']);
    setLongDesc('이 제품은 프리미엄 원단으로 제작되어 착용감이 뛰어나며, 일상에서도 스타일리시하게 활용 가능합니다.');
  };

  const handleGenerateModelImage = async () => {
    if (!selectedModel) return alert('AI 모델을 선택해주세요!');
    const prompt = modelPrompts[selectedModel];

    try {
      const res = await axios.post(`${import.meta.env.VITE_EXPRESS_URL}/leonardo`, { prompt });
      const imageUrl = res.data?.images?.[0]?.url;

      if (imageUrl) {
        setModelImageUrl(imageUrl);
        autoFillText();
        alert('✅ 모델 이미지 생성 완료!');
        //step3Ref.current?.scrollIntoView({ behavior: 'smooth' });
      } else {
        alert('❌ 이미지 생성에 실패했습니다.');
      }
    } catch (err) {
      console.error("❌ 모델 생성 오류:", err);
      alert('❌ 서버 오류로 이미지 생성 실패');
    }
  };

  const applyModelImageToUploadBox = async () => {
    if (!modelImageUrl) return alert("모델 이미지가 없습니다.");
    try {
      const response = await fetch(modelImageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'model-image.png', { type: 'image/png' });
      setUploadedModelImage(file);           // 실제 업로드용
      setModelImagePreview(modelImageUrl);   // ✅ 미리보기용
      alert("✅ 모델 이미지가 업로드 영역에 적용되었습니다.");
    } catch (err) {
      console.error("❌ 이미지 적용 실패:", err);
      alert("❌ 이미지 적용 중 오류 발생");
    }
  };



  const handleFittingRequest = async () => {
    if (!uploadedModelImage || !uploadedClothesImage)
      return alert('모델 이미지와 상품 이미지를 모두 업로드해주세요.');

    const formData = new FormData();
    formData.append('modelImageFile', uploadedModelImage);
    formData.append('clothesImageFile', uploadedClothesImage);

    try {
      const res = await axios.post(`${import.meta.env.VITE_EXPRESS_URL}/fashn-fitting`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.outputUrl) {
        setFittedImageUrl(res.data.outputUrl);
        alert('✅ 피팅 이미지 생성 완료!');
        step4Ref.current?.scrollIntoView({ behavior: 'smooth' });
      } else {
        alert('❌ 피팅 이미지 생성 실패');
      }
    } catch (err) {
      console.error("❌ 피팅 오류:", err);
      alert('❌ 서버 오류로 이미지 생성 실패');
    }
  };

  const handleGenerateTextFromImage = async () => {
    if (!uploadedClothesImage) return alert("상품 이미지를 먼저 업로드해주세요!");

    const formData = new FormData();
    formData.append("image", uploadedClothesImage);

    try {
      const res = await axios.post(`${import.meta.env.VITE_EXPRESS_URL}/generate-text`, formData);
      const result = res.data.result || '';

      const lines = result.split('\n').map(line => line.trim()).filter(line => line.includes(':') && line.split(':')[1]);

      setTitle(lines[0]?.split(':')[1]?.trim() || '제목 없음');
      setShortDesc(lines[1]?.split(':')[1]?.trim() || '간략 설명 없음');
      setImgDescs([
        lines[2]?.split(':')[1]?.trim() || '이미지 설명1 없음',
        lines[3]?.split(':')[1]?.trim() || '이미지 설명2 없음',
        lines[4]?.split(':')[1]?.trim() || '이미지 설명3 없음',
      ]);
      setLongDesc(result);

      alert('✅ 글 자동 생성 완료!');
    } catch (err) {
      console.error("❌ GPT Vision 요청 실패:", err);
      alert('❌ 글 생성 실패');
    }
  };

  
  const handleSave = async () => {
  if (!userId) return alert('로그인 후 이용해주세요.');
  if (!title || !shortDesc || !longDesc) return alert('제목, 설명이 비어있어요.');

  // AI 이미지 있으면 Supabase에 올리기
  if (modelImageUrl) await handleModelImageSave();
  if (fittedImageUrl) await handleFittedImageSave();

  const { error } = await supabase.from('product_details').insert({
    user_id: userId,
    title,
    short_description: shortDesc,
    section1_text: imgDescs[0],
    section2_text: imgDescs[1],
    section3_text: imgDescs[2],
    long_description: longDesc,
    model_image_url: modelImageUrl || null,  // 없어도 저장 가능
    fitted_image_url: fittedImageUrl || null,
    selected_model: selectedModel || null,
    status: 'pending'
  });

  if (error) {
    alert(`❌ 저장 실패: ${error.message}`);
  } else {
    alert('✅ 저장 완료! 관리자의 승인을 기다려주세요.');
  }
};



  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 font-sans">
      <div className="max-w-3xl mx-auto space-y-16 text-center">

        {/* STEP 1 */}
        <section className="bg-white p-6 rounded-xl shadow-lg space-y-4">
          <h2 className="text-xl font-semibold text-blue-700">STEP 1. AI 모델 선택</h2>
          <div className="flex justify-center gap-3">
            {Object.keys(modelPrompts).map((name) => (
              <button key={name} onClick={() => setSelectedModel(name)}
                className={`px-4 py-2 rounded-md border ${selectedModel === name ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>
                {name}
              </button>
            ))}
          </div>
          <button onClick={handleGenerateModelImage} className="bg-purple-600 text-white px-5 py-2 rounded-md hover:bg-purple-700">➕ 모델 이미지 생성</button>
          {modelImageUrl && (
            <>
              <img src={modelImageUrl} alt="모델" className="w-full max-w-md mx-auto rounded-lg border shadow mt-4" />
              <button onClick={applyModelImageToUploadBox} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                📌 모델 이미지 업로드 영역에 적용
              </button>

            </>
          )}
        </section>

        {/* STEP 2 */}
        <section className="bg-white p-6 rounded-xl shadow-lg space-y-4">
          <h2 className="text-xl font-semibold text-pink-600">STEP 2. 상품 이미지 업로드 & 자동작성</h2>
          <UploadBox
            label="모델 이미지 업로드"
            onImageUpload={setUploadedModelImage}
            previewUrl={modelImagePreview}
          />

          <UploadBox label="상품 이미지 업로드" onImageUpload={setUploadedClothesImage} />
          <button onClick={handleGenerateTextFromImage} className="bg-pink-500 text-white px-5 py-2 rounded-md hover:bg-pink-600">✨ GPT로 글 자동 생성</button>
          <button onClick={handleFittingRequest} className="bg-indigo-600 text-white px-5 py-2 rounded-md hover:bg-indigo-700">👕 AI 피팅 이미지 생성</button>
        </section>

        {/* STEP 3 */}
        <section ref={step3Ref} className="bg-white p-6 rounded-xl shadow-lg space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">STEP 3. 설명 입력 및 수정</h2>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목" className="w-full px-4 py-2 border rounded-md text-center font-semibold text-blue-700" />
          <input value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} placeholder="간단 설명" className="w-full px-4 py-2 border rounded-md text-center" />
          {imgDescs.map((desc, i) => (
            <input key={i} value={desc} onChange={(e) => {
              const copy = [...imgDescs];
              copy[i] = e.target.value;
              setImgDescs(copy);
            }} placeholder={`이미지 설명 ${i + 1}`} className="w-full px-4 py-2 border rounded-md text-center" />
          ))}
          <textarea value={longDesc} onChange={(e) => setLongDesc(e.target.value)} placeholder="상세 설명" rows={5} className="w-full px-4 py-2 border rounded-md text-center" />
        </section>

        
        {/* STEP 4: 상세페이지 미리보기 */}
        <section ref={step4Ref} className="bg-white p-6 rounded-xl shadow-lg space-y-6 text-left">
          <h2 className="text-xl font-semibold text-green-700 text-center">STEP 4. 상세페이지 미리보기</h2>

          {/* ✅ 모델 이미지 제거, 피팅 이미지만 출력 */}
          {fittedImageUrl && <img src={fittedImageUrl} alt="피팅 이미지" className="w-full rounded-lg border shadow" />}

          <h3 className="text-2xl font-bold text-gray-800 mt-6">{title}</h3>
          <p className="text-gray-600 mb-4">{shortDesc}</p>

          {[0, 1, 2].map((i) => (
            <div key={i} className="border p-4 rounded-md shadow-sm mb-2">
              <p className="font-semibold">설명 {i + 1}</p>
              <p>{imgDescs[i]}</p>
            </div>
          ))}

          <div className="border p-4 rounded-md shadow-sm mt-4 bg-gray-50">
            <p className="font-semibold">상세 설명</p>
            <p>{longDesc}</p>
          </div>
        </section>


        {/* 저장 버튼 */}
        <section className="flex justify-center">
          <button onClick={handleSave} className="bg-green-500 text-white px-6 py-3 rounded-md shadow hover:bg-green-600">✅ 저장하기</button>
        </section>

        <Footer />
      </div>
    </div>
  );
}
