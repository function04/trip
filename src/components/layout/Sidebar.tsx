"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "대시보드", icon: "🏠" },
  { href: "/schedule", label: "일정", icon: "📅" },
  { href: "/expenses", label: "가계부", icon: "💰" },
  { href: "/pre-trip-expenses", label: "여행 전 지출", icon: "✈️" },
  { href: "/summary", label: "지출내역합계", icon: "📊" },
  { href: "/accommodations", label: "숙소정보", icon: "🏨" },
  { href: "/checklist", label: "준비사항", icon: "✅" },
  { href: "/bookings", label: "예약관리", icon: "📋" },
  { href: "/upgrades", label: "향후 업그레이드", icon: "🔄" },
];

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

export default function Sidebar({ open, onToggle }: SidebarProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/" || pathname === "";
    return pathname.startsWith(href);
  }

  return (
    <aside
      className={`fixed left-0 top-0 h-full flex flex-col border-r border-border-default z-50 transition-all duration-200 ${
        open ? "w-[260px]" : "w-0 overflow-hidden border-r-0"
      }`}
      style={{ background: "#1a1b1e" }}
    >
      {/* Header */}
      <div className="p-4 pb-2 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">
            ✈️ 여행 플래너
          </h1>
          <p className="text-xs text-text-tertiary mt-1">Day 1 ~ Day 12</p>
        </div>
        <button
          onClick={onToggle}
          className="w-7 h-7 flex items-center justify-center rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-elevated transition-colors text-sm"
          title="사이드바 닫기"
        >
          ✕
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors mb-0.5 ${
              isActive(item.href)
                ? "bg-bg-elevated text-text-primary"
                : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

    </aside>
  );
}
