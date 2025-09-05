import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Supabase 클라이언트 생성 완료');


// ✅ 비동기 함수로 감싸기
const testSupabase = async () => {
  const { data, error } = await supabase.auth.admin.listUsers();
  //console.log('📦 유저 목록:', data);
  //console.log('❗에러:', error);
};

testSupabase();
