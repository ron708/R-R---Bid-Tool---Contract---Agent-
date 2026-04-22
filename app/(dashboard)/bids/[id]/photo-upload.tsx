"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Camera, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { BidPhoto } from "@prisma/client";

interface Props {
  bidId: string;
  existingPhotos: BidPhoto[];
}

export function PhotoUpload({ bidId, existingPhotos }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bidId", bidId);

      const res = await fetch("/api/photos", { method: "POST", body: formData });
      if (!res.ok) {
        toast({ title: "Upload failed", description: file.name, variant: "destructive" });
      }
    }

    setUploading(false);
    router.refresh();
  }

  async function deletePhoto(photoId: string) {
    await fetch(`/api/photos/${photoId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Site Photos</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          Add Photos
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </CardHeader>
      <CardContent>
        {existingPhotos.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No photos yet. Tap "Add Photos" to upload from your camera or gallery.
          </p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {existingPhotos.map((photo) => (
              <div key={photo.id} className="relative group aspect-square">
                <Image
                  src={photo.publicUrl}
                  alt={photo.caption ?? "Site photo"}
                  fill
                  className="object-cover rounded-md"
                  sizes="(max-width: 640px) 33vw, 25vw"
                />
                <button
                  onClick={() => deletePhoto(photo.id)}
                  className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
