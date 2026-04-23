import { createClient } from "@supabase/supabase-js";

const BUCKET = "bid-photos";

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  return createClient(url, key);
}

export async function uploadBidPhoto(
  contractorId: string,
  bidId: string,
  file: File
): Promise<{ storagePath: string; publicUrl: string }> {
  const supabase = getClient();
  const ext = file.name.split(".").pop();
  const storagePath = `${contractorId}/${bidId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return { storagePath, publicUrl: data.publicUrl };
}

export async function deleteBidPhoto(storagePath: string) {
  const supabase = getClient();
  await supabase.storage.from(BUCKET).remove([storagePath]);
}
