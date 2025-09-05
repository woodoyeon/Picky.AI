// utils/uploadFileToSupabase.js
import { supabase } from '../supabaseClient.js';

export const uploadFileToSupabase = async (file, fileName, folder, bucket = 'detail-images') => {
  try {
    const filePath = `${folder}/${fileName}`;

    // ✅ 브라우저에서는 Buffer 대신 Uint8Array 사용
    const arrayBuffer = await file.arrayBuffer(); // File 또는 Blob에서 ArrayBuffer 추출
    const uint8Array = new Uint8Array(arrayBuffer); // Supabase에서 허용하는 타입

    const contentType = file.type || 'image/png'; // fallback

    // ✅ Supabase에 업로드
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
    console.error('❌ Supabase 파일 업로드 실패:', err.message);
    return null;
  }
};
