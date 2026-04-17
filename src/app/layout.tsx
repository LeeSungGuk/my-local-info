import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getNormalizedAdSenseId, shouldRenderAdSenseScript } from "@/lib/adsense-config";
import { getNormalizedGaId, shouldRenderGaScript } from "@/lib/ga-config";

const siteUrl = "https://my-local-info-6ny.pages.dev";
const gaId = getNormalizedGaId(process.env.NEXT_PUBLIC_GA_ID);
const shouldLoadGaScript = shouldRenderGaScript(gaId);
const adSenseId = getNormalizedAdSenseId(process.env.NEXT_PUBLIC_ADSENSE_ID);
const shouldLoadAdSenseScript = shouldRenderAdSenseScript({
  adSenseId,
  enabledFlag: process.env.NEXT_PUBLIC_ADSENSE_ENABLED,
});
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "서울시 생활 정보",
  url: siteUrl,
  description: "서울 시민을 위한 지역 행사, 축제, 지원금, 혜택 정보",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "서울시 생활 정보 | 행사·혜택·지원금 안내",
  description:
    "서울 시민을 위한 지역 행사, 축제, 지원금, 혜택 정보를 매일 업데이트합니다.",
  openGraph: {
    title: "서울시 생활 정보 | 행사·혜택·지원금 안내",
    description:
      "서울 시민을 위한 지역 행사, 축제, 지원금, 혜택 정보를 매일 업데이트합니다.",
    url: siteUrl,
    siteName: "서울시 생활 정보",
    locale: "ko_KR",
    type: "website",
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: ["/favicon.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {shouldLoadGaScript ? (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
gtag("js", new Date());
gtag("config", ${JSON.stringify(gaId)});
`,
              }}
            />
          </>
        ) : null}
        {shouldLoadAdSenseScript ? (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSenseId}`}
            crossOrigin="anonymous"
          />
        ) : null}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
