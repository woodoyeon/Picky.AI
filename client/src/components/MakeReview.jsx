// components/MakeReview.jsx
import React, { useState } from "react";
import axios from "axios";

/**
 * MakeReview
 * props:
 * - title: 상품명
 * - description: 상품 요약 설명
 * - imageUrl: 대표 이미지 URL
 * - onResult: 리뷰 결과를 부모에게 전달하는 콜백
 */
export default function MakeReview({ title, description, imageUrl, onResult }) {
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | done | noData | error
  const [errorMsg, setErrorMsg] = useState("");

  const API = import.meta.env.VITE_EXPRESS_URL;

  const handleGenerate = async () => {

    // !title || !description || !imageUrl 디버깅용
    console.log("🟡 props check:", { title, description, imageUrl });


    // if (!title || !description || !imageUrl) {
    //   alert("제목, 설명, 이미지가 모두 필요합니다.");
    //   return;
    // }

    setStatus("loading");
    try {
      const res = await axios.post(`${API}/api/generate-reviews`, {
        title,
        description,
        imageUrl,
      });

      if (res.data?.reviews?.length) {
        setReviews(res.data.reviews);
        setStatus("done");
        onResult?.(res.data.reviews);
      } else {
        setStatus("noData");
      }
    } catch (e) {
      console.error("리뷰 생성 실패:", e);
      setErrorMsg("리뷰 생성 중 오류가 발생했습니다.");
      setStatus("error");
    }
  };

  return (
    <div className="my-6 border rounded-lg bg-white p-4 shadow">
      <h3 className="text-lg font-semibold mb-3">📝 AI 리뷰 자동 생성</h3>

      <button
        onClick={handleGenerate}
        disabled={status === "loading"}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {status === "loading" ? "⏳ 생성 중..." : "✨ 리뷰 생성하기"}
      </button>

      {status === "done" && <ReviewList reviews={reviews} />}
      {status === "noData" && (
        <p className="mt-4 text-gray-500 text-sm">🔍 리뷰가 없습니다. 다른 키워드로 다시 시도해보세요.</p>
      )}
      {status === "error" && (
        <p className="mt-4 text-red-600 text-sm">❌ {errorMsg}</p>
      )}
    </div>
  );
}

/**
 * ReviewList
 */
function ReviewList({ reviews = [] }) {
  if (!reviews.length) {
    return <p className="text-gray-500 text-sm mt-2">리뷰가 없습니다.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
      {reviews.map((review, idx) => (
        <ReviewCard key={idx} {...review} />
      ))}
    </div>
  );
}

/**
 * ReviewCard
 * props:
 * - author, rating, content, tags?, date?, source?
 */
function ReviewCard({ author, rating, content, tags = [], date, source }) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow hover:shadow-md transition">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-gray-800">{author || "익명"}</div>
        <div className="text-sm text-yellow-500 font-medium">⭐ {rating.toFixed(1)}</div>
      </div>

      <p className="text-sm text-gray-700 whitespace-pre-line mb-2">{content}</p>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {tags.map((tag, i) => (
            <span key={i} className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 text-xs text-gray-400 flex justify-between items-center">
        <span>{date || "오늘"}</span>
        {source === "gpt" && <span className="text-blue-500">🤖 AI 생성</span>}
      </div>
    </div>
  );
}
