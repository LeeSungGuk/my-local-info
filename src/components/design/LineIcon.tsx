export type LineIconName = "calendar" | "pin" | "ticket" | "building";

const PATHS: Record<LineIconName, string> = {
  calendar: "M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z",
  pin: "M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  ticket: "M4 8a2 2 0 0 0 0 4v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4a2 2 0 0 1 0-4V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v3Zm10-4v13",
  building: "M4 21h16M6 21V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v16M10 8h4m-4 4h4m-4 4h4",
};

// 이모지 대신 쓰는 선 아이콘. 같은 굵기(1.6)로 그려 사이트 전체에서 모양을 맞춘다
export default function LineIcon({ name, className = "h-4 w-4" }: { name: LineIconName; className?: string }) {
  return (
    <svg aria-hidden="true" className={`shrink-0 ${className}`} viewBox="0 0 24 24" fill="none">
      <path d={PATHS[name]} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
