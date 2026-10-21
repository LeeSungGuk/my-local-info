"use client";

import Image from "next/image";
import { useState } from "react";
import SeoulCover from "./SeoulCover";

export default function EventPoster({ imageUrl, title, className = "" }: {
  imageUrl?: string;
  title: string;
  className?: string;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  let safeUrl = "";
  try {
    const url = new URL(imageUrl || "");
    if (url.protocol === "https:" && url.hostname === "culture.seoul.go.kr") {
      safeUrl = url.href;
    }
  } catch { /* Missing posters use the local illustrated cover. */ }

  return (
    <div className={`event-poster ${className}`}>
      {safeUrl && safeUrl !== failedUrl ? (
        <Image src={safeUrl} alt={`${title} 포스터`} fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 380px" className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]" onError={() => setFailedUrl(safeUrl)} />
      ) : <SeoulCover kind="events" />}
    </div>
  );
}
