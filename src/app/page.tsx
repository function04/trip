"use client";

import Link from "next/link";
import MobileHeader from "@/components/layout/MobileHeader";

const MENU_ITEMS = [
  { href: "/schedule",          icon: "📅",  title: "일정"        },
  { href: "/expenses",          icon: "💰",  title: "가계부"      },
  { href: "/pre-trip-expenses", icon: "✈️",  title: "여행전 지출" },
  { href: "/summary",           icon: "📊",  title: "지출합계"    },
  { href: "/accommodations",    icon: "🏨",  title: "숙소"        },
  { href: "/checklist",         icon: "✅",  title: "준비사항"    },
  { href: "/bookings",          icon: "📋",  title: "예약관리"    },
  { href: "/upgrades",          icon: "🔧",  title: "업데이트"    },
];

const UK_URL = "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=900&q=85";
const IE_URL = "https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?w=900&q=85";

export default function Dashboard() {
  return (
    <>
      {/* ── 모바일 ── */}
      <div className="md:hidden min-h-screen" style={{ background: "var(--bg-primary)" }}>

        <MobileHeader title="" />

        {/* 커버 — 상단 */}
        <div style={{ position: "relative", height: 260, overflow: "hidden" }}>
          <img src={IE_URL} alt="" style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center 60%",
          }} />
          <img src={UK_URL} alt="" style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center 30%",
            maskImage: "linear-gradient(to bottom, black 30%, transparent 65%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 30%, transparent 65%)",
          }} />
          {/* 다크 오버레이 */}
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
          {/* 하단 페이드 — CSS 변수 사용 */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 100,
            background: "linear-gradient(to top, var(--bg-primary), transparent)",
          }} />
          {/* 제목 */}
          <div style={{ position: "absolute", bottom: 18, left: 20 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
              {/* 국기: 모바일(iOS)에서는 이모지, 크롬에서는 텍스트 배지 */}
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                padding: "3px 7px", borderRadius: 6,
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(6px)",
                color: "#fff",
              }}>🇬🇧 GB</span>
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                padding: "3px 7px", borderRadius: 6,
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(6px)",
                color: "#fff",
              }}>🇮🇪 IE</span>
            </div>
            <h1 style={{
              fontSize: 24, fontWeight: 700, color: "#fff",
              letterSpacing: "-0.3px", lineHeight: 1.2, margin: 0,
              textShadow: "0 2px 16px rgba(0,0,0,0.7)",
            }}>
              영국 · 아일랜드
            </h1>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4, textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>
              구도현 · 김상윤 · 12일
            </p>
          </div>
        </div>

        {/* 앱 그리드 */}
        <div style={{ padding: "20px 20px 48px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px 12px" }}>
            {MENU_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textDecoration: "none" }}
                className="active:scale-90 transition-transform duration-100"
              >
                <div style={{
                  width: 62, height: 62, borderRadius: 18,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 28, lineHeight: 1,
                  position: "relative", overflow: "hidden",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-default)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 var(--border-hover)",
                }}>
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 26,
                    borderRadius: "17px 17px 0 0",
                    background: "linear-gradient(to bottom, var(--border-hover), transparent)",
                    pointerEvents: "none",
                  }} />
                  <span style={{ position: "relative", zIndex: 1 }}>{item.icon}</span>
                </div>
                <span style={{
                  fontSize: 10, color: "var(--text-secondary)",
                  textAlign: "center", lineHeight: 1.3,
                  width: 62, wordBreak: "keep-all",
                }}>
                  {item.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── PC ── */}
      <div className="hidden md:block">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🇬🇧</span>
            <span className="text-2xl">🇮🇪</span>
            <span className="text-sm text-text-tertiary">GB · IE</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">영국 · 아일랜드 여행</h1>
          <p className="text-text-secondary mt-1 text-sm">구도현 · 김상윤 · 12일간의 여행</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {MENU_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group block p-5 rounded-xl bg-bg-elevated border border-border-default transition-all duration-200 hover:bg-bg-hover"
            >
              <div className="text-3xl mb-3">{item.icon}</div>
              <h2 className="text-base font-semibold text-text-primary mb-1">{item.title}</h2>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
