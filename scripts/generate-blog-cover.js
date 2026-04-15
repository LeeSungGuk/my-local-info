/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const SVG_WIDTH = 1600;
const SVG_HEIGHT = 900;
const DEFAULT_PUBLIC_DIR = path.join(__dirname, "..", "public");

const PALETTES = [
  {
    backgroundStart: "#082F49",
    backgroundEnd: "#0EA5E9",
    accent: "#BAE6FD",
    accentSoft: "#E0F2FE",
    text: "#F8FAFC",
    chipBg: "rgba(240, 249, 255, 0.18)",
    chipBorder: "rgba(186, 230, 253, 0.5)",
  },
  {
    backgroundStart: "#0F172A",
    backgroundEnd: "#1D4ED8",
    accent: "#93C5FD",
    accentSoft: "#DBEAFE",
    text: "#F8FAFC",
    chipBg: "rgba(219, 234, 254, 0.14)",
    chipBorder: "rgba(147, 197, 253, 0.45)",
  },
  {
    backgroundStart: "#134E4A",
    backgroundEnd: "#0F766E",
    accent: "#99F6E4",
    accentSoft: "#CCFBF1",
    text: "#F0FDFA",
    chipBg: "rgba(204, 251, 241, 0.16)",
    chipBorder: "rgba(153, 246, 228, 0.45)",
  },
  {
    backgroundStart: "#3F1D2E",
    backgroundEnd: "#BE185D",
    accent: "#F9A8D4",
    accentSoft: "#FCE7F3",
    text: "#FFF1F2",
    chipBg: "rgba(252, 231, 243, 0.16)",
    chipBorder: "rgba(249, 168, 212, 0.45)",
  },
  {
    backgroundStart: "#3B2F0A",
    backgroundEnd: "#CA8A04",
    accent: "#FDE68A",
    accentSoft: "#FEF3C7",
    text: "#FFFBEB",
    chipBg: "rgba(254, 243, 199, 0.15)",
    chipBorder: "rgba(253, 230, 138, 0.45)",
  },
];

function hashString(value) {
  return Array.from(String(value || "")).reduce(
    (acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0,
    0
  );
}

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function truncateText(value, maxLength) {
  if (!value) {
    return "";
  }

  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(1, maxLength - 1)).trim()}…`;
}

function breakLongWord(word, maxLength) {
  const pieces = [];

  for (let index = 0; index < word.length; index += maxLength) {
    pieces.push(word.slice(index, index + maxLength));
  }

  return pieces;
}

function wrapText(value, maxLength, maxLines) {
  const normalized = String(value || "").trim();

  if (!normalized) {
    return [];
  }

  const rawWords = normalized.split(/\s+/).flatMap((word) => {
    if (word.length <= maxLength) {
      return [word];
    }

    return breakLongWord(word, maxLength);
  });

  const lines = [];
  let current = "";

  for (const word of rawWords) {
    const next = current ? `${current} ${word}` : word;

    if (next.length <= maxLength) {
      current = next;
      continue;
    }

    if (current) {
      lines.push(current);
    }
    current = word;

    if (lines.length === maxLines) {
      break;
    }
  }

  if (current && lines.length < maxLines) {
    lines.push(current);
  }

  if (lines.length > maxLines) {
    return lines.slice(0, maxLines);
  }

  const joinedLength = lines.join(" ").length;
  if (joinedLength < normalized.length && lines.length > 0) {
    lines[lines.length - 1] = truncateText(lines[lines.length - 1], maxLength);
  }

  return lines;
}

function pickPalette(topic) {
  const seed = `${topic.topicCategory || ""}:${topic.id || topic.titleHint || ""}`;
  return PALETTES[hashString(seed) % PALETTES.length];
}

function sanitizeFileSegment(value) {
  return String(value || "blog-cover")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_/]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/\/{2,}/g, "/")
    .replace(/^-+|-+$/g, "");
}

function normalizeCoverImagePath(topic) {
  const configuredPath = typeof topic.coverImage === "string" ? topic.coverImage.trim() : "";

  if (configuredPath) {
    const normalized = configuredPath.startsWith("/") ? configuredPath : `/${configuredPath}`;
    return normalized.replace(/\/{2,}/g, "/");
  }

  return `/blog-covers/${sanitizeFileSegment(topic.id || topic.titleHint)}.svg`;
}

function resolveCoverAlt(topic) {
  const configuredAlt = typeof topic.coverAlt === "string" ? topic.coverAlt.trim() : "";

  if (configuredAlt) {
    return configuredAlt;
  }

  return `${topic.titleHint || "서울 정보글"}을 보여주는 서울 정보글 커버 이미지`;
}

function getPublicFilePath(publicDir, coverImagePath) {
  const relativePath = path.posix.normalize(coverImagePath).replace(/^\/+/, "");

  if (!relativePath || relativePath.startsWith("..")) {
    throw new Error(`유효하지 않은 coverImage 경로입니다: ${coverImagePath}`);
  }

  return path.join(publicDir, relativePath);
}

function createBlogCoverSvg(topic) {
  const palette = pickPalette(topic);
  const title = String(topic.titleHint || topic.id || "서울 정보글").trim();
  const titleLines = wrapText(title, 15, 3);
  const category = truncateText(String(topic.topicCategory || "서울 추천").trim(), 14);
  const places = Array.isArray(topic.places) ? topic.places.filter(Boolean).slice(0, 3) : [];
  const placeLabels = places.map((place) => truncateText(String(place).trim(), 14));
  const tagLabels = Array.isArray(topic.tags) ? topic.tags.filter(Boolean).slice(0, 2) : [];
  const description = [
    `${title} 주제의 서울 정보글 커버 이미지`,
    placeLabels.length > 0 ? `추천 장소: ${placeLabels.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join(". ");

  const titleMarkup = titleLines
    .map(
      (line, index) =>
        `<tspan x="120" dy="${index === 0 ? 0 : 78}">${escapeXml(line)}</tspan>`
    )
    .join("");

  const placesMarkup = placeLabels
    .map((place, index) => {
      const x = 120 + index * 250;
      return `
        <g transform="translate(${x} 640)">
          <rect width="220" height="64" rx="24" fill="${palette.chipBg}" stroke="${palette.chipBorder}" />
          <text x="110" y="40" fill="${palette.text}" font-size="26" font-weight="600" text-anchor="middle">${escapeXml(
            place
          )}</text>
        </g>`;
    })
    .join("");

  const tagsMarkup = tagLabels
    .map((tag, index) => {
      const x = 120 + index * 190;
      return `
        <g transform="translate(${x} 742)">
          <rect width="164" height="48" rx="999" fill="rgba(15, 23, 42, 0.16)" stroke="rgba(248, 250, 252, 0.24)" />
          <text x="82" y="31" fill="${palette.accentSoft}" font-size="22" font-weight="600" text-anchor="middle">#${escapeXml(
            truncateText(String(tag).trim(), 8)
          )}</text>
        </g>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${SVG_WIDTH}" height="${SVG_HEIGHT}" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="cover-title cover-desc">
  <title id="cover-title">${escapeXml(title)}</title>
  <desc id="cover-desc">${escapeXml(description)}</desc>
  <defs>
    <linearGradient id="bg-gradient" x1="140" y1="80" x2="1460" y2="820" gradientUnits="userSpaceOnUse">
      <stop stop-color="${palette.backgroundStart}" />
      <stop offset="1" stop-color="${palette.backgroundEnd}" />
    </linearGradient>
    <radialGradient id="glow-gradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1280 160) rotate(125) scale(480 400)">
      <stop stop-color="${palette.accent}" stop-opacity="0.62" />
      <stop offset="1" stop-color="${palette.accent}" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="${SVG_WIDTH}" height="${SVG_HEIGHT}" rx="48" fill="url(#bg-gradient)" />
  <rect x="52" y="52" width="${SVG_WIDTH - 104}" height="${SVG_HEIGHT - 104}" rx="40" stroke="rgba(248,250,252,0.12)" />
  <circle cx="1280" cy="160" r="340" fill="url(#glow-gradient)" />
  <circle cx="1190" cy="720" r="210" fill="rgba(255,255,255,0.06)" />
  <path d="M1110 280C1180 228 1266 210 1372 226C1297 278 1230 340 1186 432C1144 398 1117 346 1110 280Z" fill="rgba(248,250,252,0.14)" />
  <path d="M1020 544C1110 492 1216 482 1336 518C1244 582 1175 656 1138 742C1061 701 1021 633 1020 544Z" fill="rgba(15,23,42,0.12)" />
  <g transform="translate(120 112)">
    <rect width="190" height="48" rx="999" fill="rgba(248,250,252,0.13)" stroke="rgba(248,250,252,0.24)" />
    <text x="95" y="31" fill="${palette.accentSoft}" font-size="22" font-weight="700" text-anchor="middle">SEOUL LOCAL GUIDE</text>
  </g>
  <g transform="translate(120 188)">
    <rect width="146" height="52" rx="18" fill="rgba(15,23,42,0.18)" stroke="rgba(248,250,252,0.18)" />
    <text x="73" y="34" fill="${palette.accentSoft}" font-size="28" font-weight="700" text-anchor="middle">${escapeXml(
      category
    )}</text>
  </g>
  <text x="120" y="340" fill="${palette.text}" font-size="72" font-weight="800" letter-spacing="-0.04em">${titleMarkup}</text>
  <text x="120" y="558" fill="rgba(248,250,252,0.76)" font-size="30" font-weight="500">
    서울 생활 정보글용 자동 생성 커버
  </text>
  ${placesMarkup}
  ${tagsMarkup}
  <g transform="translate(1168 628)">
    <path d="M96 0L112 34V126H80V34L96 0Z" fill="${palette.accentSoft}" fill-opacity="0.88" />
    <path d="M112 34L152 74V126H112V34Z" fill="rgba(248,250,252,0.16)" />
    <path d="M80 34L40 86V126H80V34Z" fill="rgba(15,23,42,0.18)" />
    <rect x="58" y="126" width="76" height="76" rx="16" fill="rgba(15,23,42,0.18)" />
    <rect x="34" y="196" width="124" height="20" rx="10" fill="${palette.accent}" fill-opacity="0.72" />
  </g>
</svg>`;
}

function ensureTopicCoverAsset(topic, options = {}) {
  const publicDir = options.publicDir || DEFAULT_PUBLIC_DIR;
  const coverImage = normalizeCoverImagePath(topic);
  const coverAlt = resolveCoverAlt(topic);
  const filePath = getPublicFilePath(publicDir, coverImage);

  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, createBlogCoverSvg(topic), "utf8");
  }

  return { coverImage, coverAlt };
}

module.exports = {
  createBlogCoverSvg,
  ensureTopicCoverAsset,
};
