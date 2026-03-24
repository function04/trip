"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const PROJECTS = [
  {
    id: "uk-ireland",
    title: "영국 · 아일랜드",
    subtitle: "12일간의 여행",
    emoji: "🇬🇧",
    emoji2: "🇮🇪",
    members: "구도현 · 김상윤",
    date: "2025",
    href: "/",
  },
];

export default function ProjectsPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!localStorage.getItem("trip_auth")) {
        router.replace("/login");
      }
    }
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("trip_auth");
    router.push("/login");
  }

  return (
    <div style={{
      minHeight: "100svh",
      background: "#1e1f22",
      padding: "0 20px",
    }}>
      {/* 헤더 */}
      <div style={{
        paddingTop: "max(env(safe-area-inset-top, 0px), 48px)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        paddingBottom: 8,
      }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "var(--text-tertiary)", textTransform: "uppercase" }}>
            Travel Planner
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginTop: 2 }}>
            내 여행
          </div>
        </div>
        <button onClick={handleLogout}
          style={{ fontSize: 13, color: "var(--text-tertiary)", background: "none", border: "none", padding: "6px 0" }}>
          로그아웃
        </button>
      </div>

      {/* 프로젝트 카드 */}
      <div style={{ paddingTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        {PROJECTS.map((p) => (
          <button key={p.id} onClick={() => router.push(p.href)}
            style={{
              display: "block", width: "100%", textAlign: "left",
              borderRadius: 20, overflow: "hidden",
              background: "var(--card-bg)",
              border: "1px solid var(--border-hover)",
              padding: 0, cursor: "pointer",
            }}
            className="active:scale-98 transition-transform duration-100"
          >
            {/* 커버 그라디언트 */}
            <div style={{
              height: 120,
              background: "linear-gradient(135deg, #1a1a3e 0%, #0d2a1f 50%, #1a1a1a 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 16, position: "relative",
            }}>
              <div style={{ fontSize: 48, filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.6))" }}>
                {p.emoji}
              </div>
              <div style={{ fontSize: 48, filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.6))" }}>
                {p.emoji2}
              </div>
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.5))",
              }} />
            </div>

            <div style={{ padding: "14px 16px" }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                {p.title}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                {p.members} · {p.subtitle}
              </div>
            </div>
          </button>
        ))}

        {/* 새 여행 추가 (비활성) */}
        <div style={{
          borderRadius: 20, border: "1.5px dashed rgba(255,255,255,0.1)",
          padding: "24px 16px", textAlign: "center",
          color: "var(--text-tertiary)",
        }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>+</div>
          <div style={{ fontSize: 13 }}>새 여행 추가</div>
        </div>
      </div>
    </div>
  );
}
