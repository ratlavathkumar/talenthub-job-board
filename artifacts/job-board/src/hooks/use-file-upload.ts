import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface UploadResult {
  objectPath: string;
  serveUrl: string;
}

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file: File): Promise<UploadResult> => {
    setIsUploading(true);
    setProgress(0);

    try {
      const metaRes = await fetch(`${BASE}/api/storage/uploads/request-url`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          contentType: file.type,
        }),
      });

      if (!metaRes.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { uploadURL, objectPath } = await metaRes.json();

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadURL);
        xhr.setRequestHeader("Content-Type", file.type);

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Upload failed")));
        xhr.send(file);
      });

      setProgress(100);
      return {
        objectPath,
        serveUrl: `${BASE}/api/storage${objectPath}`,
      };
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading, progress };
}
