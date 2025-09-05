// src/utils/saveDetailCutsWithDescriptions.js
//import { supabase } from "../../../server/supabaseClient";
import { supabase } from "../supabaseClient"; // ⚠️ 프론트용 클라이언트로 바꿔주세요!

/**
 * items: Array<{ url: string, desc?: string }>
 * userId: string
 */
export async function saveDetailCutsWithDescriptions({ userId = "guest", items = [] }) {
  const payload = {
    user_id: userId,
    items, // JSONB로 그대로 저장
  };

  const { data, error } = await supabase
    .from("detail_cuts")
    .insert([payload])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
