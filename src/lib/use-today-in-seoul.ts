"use client";

import { useSyncExternalStore } from "react";
import { getTodayInSeoul } from "@/lib/event-visibility";

function subscribe() {
  return () => {};
}

export function useTodayInSeoul() {
  return useSyncExternalStore(subscribe, () => getTodayInSeoul(), () => "");
}
