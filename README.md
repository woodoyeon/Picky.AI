
---

# 🛍️ Picky.AI — AI 기반 쇼핑몰 상세페이지 자동화 플랫폼

> **프롬프트 기반 AI + API 통합**으로 상품 상세페이지를 자동 제작하는 올인원 SaaS 프로젝트
> **역할:** PM & Full-stack (React/Node/Supabase) · LLM 프롬프트 설계 · 이미지·영상 자동화

---

## ✨ 핵심 가치 제안 (Why Picky.AI?)

* **프롬프트 입력만으로 상세페이지 완성**
* **이미지·영상·텍스트 올인원 자동화**: 10장 이상의 합성 이미지 + 홍보 영상 + 설명문 + 리뷰 + 정책 자동 생성
* **모든 상품군 적용 가능**: 패션, 리빙, 뷰티, 전자제품 등 범용 상세페이지 생성
* **제작 시간 90%+ 단축**: 기획·디자인·카피라이팅 부담 최소화
* **데이터 관리·배포 자동화**: Supabase 기반 DB/스토리지 + PDF/PNG/ZIP Export

---

## 🔧 기술 스택

* **Frontend**: React (Vite), TypeScript, TailwindCSS
* **Backend**: Node.js (Express.js)
* **DB & Storage**: Supabase (PostgreSQL, Storage, Auth)
* **AI/LLM**: OpenAI GPT (설명문/리뷰/정책/스토리), Runway API (모델 합성 이미지·영상)
* **Deploy/DevOps**: Vercel(프론트), Render/Fly.io(백엔드), GitHub Actions

---

## 🧩 주요 기능

1. **상품 상세페이지 자동 생성**

   * 프롬프트 기반: 상품명/특징 입력 → 이미지+설명문+정책 자동 생성
   * 모델 합성 이미지 10장 이상 + 다각도 컷 자동 구성
   * GPT 기반 스토리/스펙표 자동 작성

2. **홍보 영상 생성**

   * Runway API → 업로드 이미지 + 프롬프트 → 상품 영상 자동 제작

3. **정책·리뷰 자동화**

   * 배송/교환/환불 정책 초안, 리뷰 문구, FAQ 자동 생성

4. **템플릿 적용 & Export**

   * Modern/Basic 등 템플릿 선택 → 최종 상세페이지 Preview
   * PDF/PNG/ZIP Export 기능 → 입점/제안서/등록용 활용

5. **Supabase 연동**

   * DB 저장: prompt/결과 데이터, 이미지 URL
   * Storage: detail-images 버킷 → public URL 활용

---

## 📂 프로젝트 구조

```
Picky.AI/
├─ client/                    # React 프론트엔드
│  ├─ src/components/         # TemplateModern, TemplateBasic, Editor 등
│  ├─ src/pages/              # ProductUpload, PromptCreate, PromptEditor
│  └─ index.html
├─ server/                    # Express 백엔드
│  ├─ routes/
│  │  ├─ prompt-guide.js      # 프롬프트 가이드 저장
│  │  ├─ runway-fitting.js    # Runway API 합성
│  │  ├─ generate-reviews.js  # 리뷰 자동 생성
│  │  └─ shipping-policy.js   # 정책 생성
│  ├─ services/               # supabase, openai, runway clients
│  └─ index.js
├─ README.md
└─ .gitignore
```

---

## 🚀 실행 방법 (Local)

### 1) 환경 변수 설정

**server/.env**

```bash
OPENAI_API_KEY=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
RUNWAY_API_KEY=...
```

**client/.env**

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_API_BASE=http://localhost:8080
```

### 2) 설치 & 실행

```bash
# server
cd server && npm install && npm run dev
# client
cd client && npm install && npm run dev
```

* 프론트엔드: [http://localhost:5173](http://localhost:5173)
* 백엔드: [http://localhost:8080](http://localhost:8080)

---

## 🔌 대표 API

```http
POST /api/prompt-guide
- body: { prompt, options }
- res: { normalizedPrompt }

POST /api/runway-fitting
- body: { productImageUrl, modelPrompt }
- res: { imageUrls[] }

POST /api/generate-reviews
- body: { productTitle, productDesc, count }
- res: { reviews[] }

POST /api/shipping-policy
- body: { brand, tone, language }
- res: { draftHtml }
```

---

## 🧭 역할 & 기여

* **PM (기획)**

  * 단계별 플로우(업로드 → 생성 → 편집 → 미리보기 → 저장) 설계
  * 사용자 UX 단순화 및 “프롬프트 기반 자동화” 가치 제안

* **개발 (Full-stack & AI)**

  * React 기반 ProductUpload/PromptEditor/Template UI 구현
  * Supabase 연동 (테이블+Storage)
  * GPT·Runway API 연결 및 결과 처리
  * Export 기능 (html2pdf, html-to-image, jszip)

---

## 📑 프로젝트 자료

* 📄 [창업투자경진대회 신청서](./창업투자경진대회%20신청서.pdf)
* 📊 [Picky.AI 발표 PPT](./Picky.AI_PPT.pdf)

본 프로젝트는 **학교 추천을 받아 외부 창업경진대회에 출품**되었으며,  
현재 **본선 단계에서 진행 중**입니다. 아래 자료는 제출된 공식 문서와 발표 자료입니다.

---

## 📄 라이선스

이 프로젝트는 **학습 및 포트폴리오 제출용**으로 제작되었습니다.
상업적 사용 시 관련 API 제공처 정책을 반드시 준수해야 합니다.

---

