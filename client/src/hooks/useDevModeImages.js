// src/hooks/useDevModeImages.js
import { supabase } from '../supabaseClient';

export async function getLatestImageFromBucket(bucket, path = '', limit = 1) {
  const { data, error } = await supabase.storage.from(bucket).list(path, {
    sortBy: { column: 'created_at', order: 'desc' },
    limit
  });

  if (error || !data.length) return null;

  const filePath = path ? `${path}/${data[0].name}` : data[0].name;
  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return publicData.publicUrl;
}

export async function getLatestImagesArray(bucket, path = '', limit = 4) {
  const { data, error } = await supabase.storage.from(bucket).list(path, {
    sortBy: { column: 'created_at', order: 'desc' },
    limit
  });

  if (error || !data.length) return [];

  return data.map(file => {
    const filePath = path ? `${path}/${file.name}` : file.name;
    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return publicData.publicUrl;
  });
}
