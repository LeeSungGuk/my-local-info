"use client";

import { useEffect, useRef } from "react";
import {
  getNormalizedAdSenseId,
  shouldRenderAdSenseBanner,
} from "@/lib/adsense-config";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdBannerProps {
  slot?: string;
  className?: string;
}

const adSenseId = getNormalizedAdSenseId(process.env.NEXT_PUBLIC_ADSENSE_ID);
const enabledFlag = process.env.NEXT_PUBLIC_ADSENSE_ENABLED;

export default function AdBanner({ slot = "", className = "" }: AdBannerProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const normalizedSlot = slot.trim();
  const shouldRenderBanner = shouldRenderAdSenseBanner({
    adSenseId,
    enabledFlag,
    slot: normalizedSlot,
  });

  useEffect(() => {
    if (!shouldRenderBanner || !adRef.current) {
      return;
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense script not ready or duplicate initialization; fail silently.
    }
  }, [normalizedSlot, shouldRenderBanner]);

  if (!shouldRenderBanner) {
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
