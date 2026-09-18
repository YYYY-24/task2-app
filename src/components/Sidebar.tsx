"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ACCENT = "#2c7871";

const NAV_ITEMS = [
  {
    href: "/",
    label: "スケジュール",
    isActive: (path: string) => path === "/",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </svg>
    ),
  },
  {
    href: "/projects",
    label: "プロジェクト",
    isActive: (path: string) => path.startsWith("/projects"),
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
      </svg>
    ),
  },
  {
    href: "/new",
    label: "新規登録",
    isActive: (path: string) => path.startsWith("/new"),
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-[232px] min-w-[232px] bg-white border-r border-[#e3e7e8] flex flex-col p-4">
      <div className="flex items-center gap-2.5 px-2 pb-7">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect width="28" height="28" rx="8" fill={ACCENT} />
          <path d="M8 14.5l4 4 8-9" stroke="white" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="font-bold text-sm leading-tight">
          業務内容
          <br />
          整理アプリ
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = item.isActive(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-semibold transition-colors"
              style={{
                background: active ? "#eaf4f3" : "transparent",
                color: active ? ACCENT : "#5b6570",
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
