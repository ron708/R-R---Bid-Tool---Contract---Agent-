import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = "bid-photos";

export async function uploadBidPhoto(
  contractorId: string,
  bidId: string,
  file: File
): Promise<{ storagePath: string; publicUrl: string }> {
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
  await supabase.storage.from(BUCKET).remove([storagePath]);
}
