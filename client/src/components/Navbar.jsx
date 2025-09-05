// ✅ Navbar.jsx 수정된 전체 코드
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { supabase } from '../supabaseClient';

export default function Navbar() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  // ✅ role로 관리자 여부 판단
  const userRole = session?.user?.user_metadata?.role;
  const isAdmin = userRole === 'admin';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    alert('로그아웃 되었습니다.');
    navigate('/');
  };

  return (
    <nav className="w-full flex justify-between items-center px-8 py-4 bg-white shadow-sm border-b">
      <div className="flex items-center space-x-6">
        <Link to="/">
          <img src={logo} alt="로고" className="h-8" />
        </Link>
        <div className="text-sm font-medium flex flex-wrap items-center gap-4 text-gray-700">
          
          {/* 업로드 버튼에 올리면 하위 메뉴가 나타나는 구조 */}
          <div className="relative group">
            <button className="hover:text-blue-600">업로드 ▾</button>

            {/* 🟦 드롭다운 메뉴 */}
            <div className="absolute hidden group-hover:block bg-white shadow-md rounded-md p-2 z-50 min-w-[160px] text-sm whitespace-nowrap">
              
              {/*  
              <Link 
                to="/detail-maker" className="block px-4 py-2 text-sm hover:bg-gray-100"
                >
                  👕 의류 이미지 업로드
                  </Link>
              */}

              <Link 
                to="/prompt-create" className="block px-4 py-2 text-sm hover:bg-gray-100"
                >
                  ✏️ Prompt Create
                  </Link>

              <Link 
                to="/product-upload" className="block px-4 py-2 text-sm hover:bg-gray-100"
                >
                  🎨 Canvas Studio
                  </Link>
            </div>
          </div>
          
          
          {/* 기능  */}
          <div className="relative group">
            <button className="hover:text-blue-600">기능 ▾</button>
            <div className="absolute hidden group-hover:block bg-white shadow-md rounded-md p-2 z-50 min-w-[160px] text-sm whitespace-nowrap">
              
              <Link to="/features/model-generation" className="block px-4 py-2 hover:bg-gray-100 text-left pl-2">🧠 모델 생성</Link>
              <Link to="/features/image-synthesis" className="block px-4 py-2 hover:bg-gray-100 text-left pl-2">🖼️ 이미지 합성</Link>
              <Link to="/features/text-writer" className="block px-4 py-2 hover:bg-gray-100 text-left pl-2">✍️ 글 작성</Link>
              <Link to="/features/video-maker" className="block px-4 py-2 hover:bg-gray-100 text-left pl-2">🎞️ 동영상 제작</Link>
              <Link to="/features/template-tool" className="block px-4 py-2 hover:bg-gray-100 text-left pl-2">📐 템플릿 툴</Link>
              <Link to="/features/uploader" className="block px-4 py-2 hover:bg-gray-100 text-left pl-2">📤 업로드</Link>
              <Link to="/features/ad-video-maker" className="block px-4 py-2 hover:bg-gray-100 text-left pl-2">📺 광고 영상 제작</Link>
              
              {/* ✅ 설명서용 페이지 추가 */}
              <Link to="/features/chat-guide" className="block px-4 py-2 hover:bg-gray-100 text-left pl-2">💬 챗봇 상담</Link>
              <Link to="/features/ledger-guide" className="block px-4 py-2 hover:bg-gray-100 text-left pl-2">📊 매출 대시보드</Link>
            </div>
          </div>

          {/* 비즈니스용  */}
          <div className="relative group">
            <button className="hover:text-blue-600">비즈니스용 ▾</button>
            <div className="absolute hidden group-hover:block bg-white shadow-md rounded-md p-2 z-50 min-w-[200px] text-sm whitespace-nowrap">
              <Link to="/business/bulk-detail" className="block px-4 py-2 hover:bg-gray-100 text-left pl-2">🧾 대량 상세페이지 제작</Link>
              <Link to="/business/global-sync" className="block px-4 py-2 hover:bg-gray-100 text-left pl-2">🌍 해외 입점몰 연동</Link>
              <Link to="/business/domestic-sync" className="block px-4 py-2 hover:bg-gray-100 text-left pl-2">🏬 국내 입점몰 연동</Link>
              <Link to="/business/self-hosted-sync" className="block px-4 py-2 hover:bg-gray-100 text-left pl-2">🛒 독립 자사몰 연동</Link>
            </div>
          </div>

          {/* DOC 와 API  */}
          <div className="relative group">
            <button className="hover:text-blue-600">DOC 와 API ▾</button>
            <div className="absolute hidden group-hover:block bg-white shadow-md rounded-md p-2 z-50 min-w-[200px] text-sm whitespace-nowrap">
              <Link to="/docs/guide" className="block px-4 py-2 hover:bg-gray-100 text-left pl-2">📘 사용 설명서</Link>
              <Link to="/docs/api-list" className="block px-4 py-2 hover:bg-gray-100 text-left pl-2">🔌 API 제공 목록</Link>
            </div>
          </div>

          {/* FAQ 와 가격 */}
          <div className="relative group">
            <button className="hover:text-blue-600">FAQ 와 가격 ▾</button>

            <div className="absolute hidden group-hover:block bg-white shadow-md rounded-md p-2 z-50 min-w-[160px] text-sm whitespace-nowrap">
              <Link to="/docs/faq" className="block px-4 py-2 hover:bg-gray-100 text-left pl-2">❓ 자주 묻는 질문(FAQ)</Link>
              <Link to="/docs/price" className="block px-4 py-2 hover:bg-gray-100 text-left pl-2">💰 가격 안내</Link>
            </div>
          </div>
          

          {/* ✅ 로그인한 일반 사용자만 보이는 메뉴(나의메뉴) */}
          {session && !isAdmin && (
              <div className="relative group">
                <button className="hover:text-blue-600">나의 메뉴 ▾</button>

                <div className="absolute hidden group-hover:block bg-white shadow-md rounded-md p-2 z-50 min-w-[180px] text-sm whitespace-nowrap">
                  <Link to="/my-products" className="block px-4 py-2 hover:bg-gray-100 text-left pl-2">
                    📄 나의 상세페이지
                  </Link>
                  <Link to="/chat-logs" className="block px-4 py-2 hover:bg-gray-100 text-left pl-2">
                    💬 챗봇 상담
                  </Link>
                  <Link to="/ledger" className="block px-4 py-2 hover:bg-gray-100 text-left pl-2">
                    📊 매출 대시보드
                  </Link>
                  <Link to="/settings" className="block px-4 py-2 hover:bg-gray-100 text-left pl-2">
                    ⚙️ 설정
                  </Link>
                </div>
              </div>
            )}


          {isAdmin && (
            <>
              <span className="text-gray-400 mx-2">|</span>
              <span className="text-red-600 font-bold">관리자 메뉴</span>
              <Link to="/admin/dashboard" className="text-red-600 font-semibold">대시보드</Link>
              <Link to="/admin/approvals" className="text-red-600 font-semibold">승인관리</Link>
              <Link to="/admin/page-management" className="text-red-600 font-semibold">상세페이지관리</Link>
              <Link to="/admin/template-upload" className="text-red-600 font-semibold">템플릿등록</Link>
              <Link to="/admin/chat-analysis" className="text-red-600 font-semibold">챗봇관리</Link>
              <Link to="/admin/sales-report" className="text-red-600 font-semibold">매출관리</Link>
              <Link to="/admin/user-management" className="text-red-600 font-semibold">회원검색</Link>
            </>
          )}
        </div>
      </div>

      <div className="space-x-2">
        {session ? (
          <button onClick={handleLogout} className="bg-gray-600 text-white px-4 py-1 rounded text-sm hover:bg-gray-700">
            로그아웃
          </button>
        ) : (
          <Link to="/login">
            <button className="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700">
              로그인 / 회원가입
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
}
