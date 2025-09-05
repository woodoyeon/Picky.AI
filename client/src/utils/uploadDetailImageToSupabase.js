// utils/uploadDetailImageToSupabase.js
import { supabase } from '../supabaseClient.js';

/**
 * 디테일컷 이미지 전용 Supabase 업로드 함수
 */
export const uploadDetailImageToSupabase = async (
  file,
  label,
  userId = 'guest',
  bucket = 'detail-images'
) => {
  try {
    // ✅ 유니크한 파일명 생성
    const uniqueSuffix = `${Date.now()}-${crypto.randomUUID()}`;
    const fileName = `detail-${label}-${uniqueSuffix}.png`;

    // ✅ SaaS 대비: 사용자별 폴더 구조
    const folder = `${userId}/detail-images`;
    const filePath = `${folder}/${fileName}`;

    // ✅ 브라우저에서 사용할 수 있는 형식으로 변환
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const contentType = file.type || 'image/png';

    // ✅ 업로드
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, uint8Array, {
        contentType,
        upsert: true,
      });

    if (error) throw error;

    // ✅ Public URL 반환
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data?.publicUrl || null;
  } catch (err) {
    console.error(`❌ 디테일컷 업로드 실패: ${err.message}`);
    return null;
  }
};
