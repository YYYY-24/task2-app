import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "業務内容整理アプリ",
  description: "複数プロジェクトの業務項目・期限・スケジュールを一元管理する個人用アプリ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} h-full antialiased`}>
      <body className="h-full bg-[#f5f7f7] text-[#24292b]" style={{ fontFamily: "var(--font-noto-sans-jp)" }}>
        {children}
      </body>
    </html>
  );
}
