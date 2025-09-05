// ✅ client/src/utils/productHelpers.js

export function getOccupations(category) {
  switch (category) {
    case 'clothing':
      return ['패션모델', '일반인 여성', '피트니스 모델'];
    case 'agriculture':
      return ['농부', '시장 상인', '밭에서 일하는 사람'];
    case 'electronics':
      return ['제품 설명 리포터', '남성 사용자', '여성 사용자'];
    case 'cosmetics':
      return ['뷰티 인플루언서', '셀럽', 'SNS 모델'];
    default:
      return ['일반인'];
  }
}

export function mapBackgroundToPrompt(bg) {
  switch (bg) {
    case "studio": return "in a professional photo studio";
    case "outdoor": return "in an outdoor setting";
    case "white": return "on a white seamless background";
    case "market": return "in a traditional market";
    case "kitchen": return "in a modern kitchen";
    default: return "in a clean environment";
  }
}

export async function urlToFile(url, filename = `file-${Date.now()}.png`, fallbackMime = "image/png") {
  const res = await fetch(url);
  const blob = await res.blob();
  const type = blob?.type || fallbackMime;
  return new File([blob], filename, { type });
}

export function parsePromptToTexts(text = "") {
  const out = { title: "", short: "", long: "", imgDescs: [] };
  if (!text) return out;
  const lines = text.split("\n").map((l) => l.trim());
  const getAfter = (prefixes) =>
    lines.find((l) => prefixes.some((p) => l.toLowerCase().startsWith(p)))?.replace(/^[^:：]+[:：]\s*/, "").trim();
  out.title = getAfter(["상품명:", "제품명:", "title:", "name:"]) || "";
  out.short = getAfter(["요약 설명:", "요약설명:", "설명:", "summary:", "desc:", "description:"]) || "";
  if (!out.title) out.title = (lines[0] || "AI 생성 상품").slice(0, 60);
  if (!out.short) out.short = (lines[1] || lines.slice(1).join(" ")).slice(0, 120);
  const firstBlank = lines.findIndex((l) => l === "");
  if (firstBlank >= 0) {
    out.long = lines.slice(firstBlank + 1).join("\n").trim();
  } else {
    out.long = lines.slice(2).join("\n").trim();
  }
  const bullets = lines.filter((l) => (/^[-•]\s+/.test(l))).map((l) => l.replace(/^[-•]\s+/, ""));
  if (bullets.length) out.imgDescs = bullets.slice(0, 8);
  return out;
}