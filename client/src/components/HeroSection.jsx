import React from 'react';
import UploadBox from './UploadBox';
import logo from '../assets/logo.png';
import heroImg from '../assets/hero.png';
import img1 from '../assets/img1.jpg';
import img2 from '../assets/img2.jpg';
import img3 from '../assets/img3.jpg';
import img4 from '../assets/img4.jpg';

export default function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center md:flex-row md:justify-center md:items-center min-h-[85vh] gap-16">
      {/* 왼쪽: 텍스트 + 이미지 */}
      <div className="flex flex-col items-center md:items-start gap-4 md:gap-8">
        <img src={logo} alt="로고" className="h-12" />
        <img src={heroImg} alt="모델" className="w-48 h-48 object-cover rounded-2xl shadow-lg border-4 border-pink-200" />
        <h1 className="text-5xl font-extrabold text-pink-600 leading-tight drop-shadow-md">
          이미지에서<br />배경을 자동으로 제거하세요
        </h1>
        <p className="text-lg text-pink-400 font-semibold">상세페이지용 이미지 자동 제작!</p>
        <button className="mt-2 px-7 py-3 rounded-full bg-gradient-to-r from-pink-400 to-yellow-300 text-white font-bold shadow hover:scale-105 transition">
          지금 바로 시작하기
        </button>
      </div>

      {/* 오른쪽: 업로드 박스 + 샘플 미리보기 */}
      <div className="flex flex-col items-center">
        <UploadBox />
        <div className="flex gap-3 mt-6">
          {[img1, img2, img3, img4].map((img, i) => (
            <img key={i} src={img} alt={`샘플${i + 1}`} className="w-16 h-16 object-cover rounded-lg shadow border border-pink-100" />
          ))}
        </div>
        <div className="text-xs text-gray-400 mt-2">이미지 없으신가요? 위의 예시로 테스트해보세요!</div>
      </div>
    </section>
  );
}
