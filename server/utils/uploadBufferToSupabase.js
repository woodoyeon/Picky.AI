// utils/uploadBufferToSupabase.js (Supabase에 이미지업로드와 publicURL 다운로드가 잘 만들어진 파일 )
import { supabase } from '../supabaseClient.js';
import { lookup } from 'mime-types';

/**
 * Supabase에 이미지 buffer를 업로드하고 공개 URL 반환
 * @param {Buffer} buffer - 이미지 버퍼 데이터
 * @param {string} fileName - 저장될 파일 이름 (예: fitted-full-body.png)
 * @param {string} folder - 저장할 Supabase 버킷 내 폴더명
 * @returns {Promise<string|null>} 업로드된 이미지의 public URL 또는 null
 */
export async function uploadBufferToSupabase(buffer, fileName, folder) {
  try {
    const contentType = lookup(fileName) || 'image/png';
    const filePath = `${folder}/${fileName}`;

    console.log(`📦 Supabase에 업로드 중: ${filePath}`);

    const { data, error } = await supabase.storage
      .from('detail-images') // ✅ 사용 중인 버킷 이름으로 변경하세요 (예: 'images')
      .upload(filePath, buffer, {
        contentType,
        upsert: true, // 같은 이름이면 덮어쓰기
      });

    if (error) {
      console.error('❌ Supabase 업로드 실패:', error.message);
      return null;
    }

    // ✅ 공개 URL 생성
    const { data: publicUrlData } = supabase.storage
      .from('detail-images')
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData?.publicUrl;
    console.log(`✅ Supabase 업로드 성공: ${publicUrl}`);
    return publicUrl;
  } catch (err) {
    console.error('❌ Supabase 업로드 중 예외 발생:', err.message);
    return null;
  }
}
