"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdBannerProps {
  slot?: string;
  className?: string;
}

const adSenseId = process.env.NEXT_PUBLIC_ADSENSE_ID?.trim() ?? "";
const isConfigured = Boolean(adSenseId && adSenseId !== "나중에_입력");

export default function AdBanner({ slot = "", className = "" }: AdBannerProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const normalizedSlot = slot.trim();

  useEffect(() => {
    if (!isConfigured || !normalizedSlot || !adRef.current) {
      return;
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense script not ready or duplicate initialization; fail silently.
    }
  }, [normalizedSlot]);

  if (!isConfigured || !normalizedSlot || normalizedSlot === "나중에_입력") {
    return null;
  }

  return (
    <div className={className}>
      <ins
        ref={adRef}
        className="adsbygoogle block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
        style={{ display: "block" }}
        data-ad-client={adSenseId}
        data-ad-slot={normalizedSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
