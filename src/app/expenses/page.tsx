"use client";

import Link from "next/link";
import { TOTAL_DAYS } from "@/lib/constants";
import MobileHeader from "@/components/layout/MobileHeader";

export default function ExpensesPage() {
  const BG = "var(--bg-primary)";

  return (
    <div style={{ minHeight: "100svh", background: BG }}>
      <MobileHeader title="가계부" />

      {/* PC */}
      <div className="hidden md:block p-8">
        <h1 className="text-2xl font-bold mb-6">💰 가계부</h1>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map((day) => (
            <Link key={day} href={`/expenses/${day}`}
              className="flex items-center justify-center p-6 rounded-xl bg-bg-elevated border border-border-default hover:bg-bg-hover transition-all">
              <span className="text-xl font-bold text-white">Day {day}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 모바일 — 3×4 그리드 */}
      <div className="md:hidden px-4 pt-1 pb-28">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map((day) => (
            <Link key={day} href={`/expenses/${day}`}
              style={{ textDecoration: "none" }}
              className="active:scale-95 transition-transform duration-100"
            >
              <div style={{
                borderRadius: 14, padding: "18px 12px",
                background: "var(--card-bg)",
                border: "1px solid var(--border-default)",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Day {day}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
