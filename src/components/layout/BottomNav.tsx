"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getTodayDayNumber } from "@/lib/todayDay";

export default function BottomNav() {
  const pathname = usePathname();
  const todayDay = getTodayDayNumber();

  // 하단탭 표시할 페이지 — 홈/오늘일정/오늘가계부만
  const MAIN_PAGES = ["/", "/today-schedule", "/today-expenses"];
  const visible = MAIN_PAGES.includes(pathname);

  const NAV = [
    {
      key: "home",
      href: "/",
      label: "홈",
      sub: null as string | null,
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V10.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill={active ? "rgba(255,255,255,0.15)" : "none"} />
          <path d="M9 21V13h6v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      key: "today-schedule",
      href: "/today-schedule",
      label: "오늘 일정",
      sub: todayDay ? `Day ${todayDay}` : null,
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="17" rx="2.5" stroke="currentColor" strokeWidth="1.8" fill={active ? "rgba(255,255,255,0.12)" : "none"} />
          <path d="M8 2v4M16 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="8" cy="15.5" r="1.1" fill="currentColor" />
          <circle cx="12" cy="15.5" r="1.1" fill="currentColor" />
          <circle cx="16" cy="15.5" r="1.1" fill="currentColor" />
        </svg>
      ),
    },
    {
      key: "today-expenses",
      href: "/today-expenses",
      label: "오늘 가계부",
      sub: todayDay ? `Day ${todayDay}` : null,
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="5" width="20" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.8" fill={active ? "rgba(255,255,255,0.12)" : "none"} />
          <path d="M2 10h20" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="7" cy="15.5" r="1.4" fill="currentColor" />
          <path d="M12 13.5h5M12 16.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  function isActive(key: string) {
    if (key === "home") return pathname === "/" || pathname === "";
    if (key === "today-schedule") return pathname === "/today-schedule";
    if (key === "today-expenses") return pathname === "/today-expenses";
    return false;
  }

  return (
    <div
      className="md:hidden"
      style={{
        position: "fixed",
        bottom: 16,
        left: 16,
        right: 16,
        zIndex: 80,
        borderRadius: 24,
        background: "var(--header-bg)",
        backdropFilter: "blur(32px) saturate(180%)",
        WebkitBackdropFilter: "blur(32px) saturate(180%)",
        border: "1px solid var(--border-default)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.25), 0 1px 0 var(--border-hover) inset",
        marginBottom: "env(safe-area-inset-bottom, 0px)",
        // iOS 슬라이드 애니메이션
        transform: visible ? "translateY(0)" : "translateY(140px)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.65s cubic-bezier(0.32,0.72,0,1), opacity 0.5s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", height: 58, padding: "0 8px" }}>
        {NAV.map((item) => {
          const active = isActive(item.key);
          return (
            <Link key={item.key} href={item.href}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 3, flex: 1, height: "100%", textDecoration: "none",
                color: active ? "var(--text-primary)" : "var(--text-tertiary)",
                transition: "color 0.15s",
                borderRadius: 16,
              }}
              className="active:opacity-50"
            >
              {item.icon(active)}
              <div style={{ textAlign: "center", lineHeight: 1.2 }}>
                <div style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{item.label}</div>
                {item.sub && <div style={{ fontSize: 9, color: active ? "var(--text-secondary)" : "var(--text-tertiary)", marginTop: 1 }}>{item.sub}</div>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
