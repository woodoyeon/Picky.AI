// server/utils/savePromptResult.js
import { supabase } from "../supabaseClient.js";

// 쉬운모드 GPT 분석 결과 저장
export async function savePromptResult({
  userId = "guest",
  imageUrl,
  gptReply,
  generatedPrompt,
  categories = {},
}) {
  const payload = {
    user_id: userId,
    image_url: imageUrl || null,
    gpt_reply: gptReply || null,
    generated_prompt: generatedPrompt || null,
    categories, // JSONB 권장
  };

  const { data, error } = await supabase
    .from("easy_prompt_results")
    .insert([payload])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
