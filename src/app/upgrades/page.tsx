"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { UpgradeNote } from "@/types";
import MobileHeader from "@/components/layout/MobileHeader";

const BG = "var(--bg-primary)";

const PRIORITY_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  high:   { bg: "rgba(255,69,58,0.18)",   color: "#ff453a", label: "높음" },
  medium: { bg: "rgba(255,214,10,0.18)",  color: "#ffd60a", label: "보통" },
  low:    { bg: "rgba(10,132,255,0.18)",  color: "#0a84ff", label: "낮음" },
};

export default function UpgradesPage() {
  const [notes, setNotes] = useState<UpgradeNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("upgrade_notes").select("*").order("sort_order").order("created_at").then(({ data }) => {
      if (data) setNotes(data);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ minHeight: "100svh", background: BG }}>
      <MobileHeader title="업데이트" />

      {/* PC */}
      <div className="hidden md:block p-8">
        <h1 className="text-2xl font-bold mb-2">🔧 향후 업데이트</h1>
        <p className="text-text-secondary text-sm mb-6">여행 계획 최종 수정 시 참고할 개선 사항 목록</p>
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="p-4 rounded-xl bg-bg-elevated border border-border-default">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="text-sm font-medium text-text-primary">{note.title}</div>
                  {note.description && <p className="text-xs text-text-secondary mt-1">{note.description}</p>}
                </div>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: PRIORITY_STYLE[note.priority]?.bg, color: PRIORITY_STYLE[note.priority]?.color, flexShrink: 0 }}>
                  {PRIORITY_STYLE[note.priority]?.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 모바일 */}
      <div className="md:hidden px-4 pt-1 pb-20">
        <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 16, lineHeight: 1.6 }}>
          여행 계획을 최종 확정할 때 참고할 개선·추가 사항 목록입니다.
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ height: 64, borderRadius: 14, background: "var(--card-bg)" }} className="animate-pulse" />
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 80, color: "var(--text-tertiary)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔧</div>
            <div style={{ fontSize: 15 }}>업데이트 항목이 없어요</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {/* priority order: high → medium → low */}
            {(["high", "medium", "low"] as const).map(priority => {
              const group = notes.filter(n => n.priority === priority);
              if (group.length === 0) return null;
              const ps = PRIORITY_STYLE[priority];
              return (
                <div key={priority}>
                  <div style={{ fontSize: 11, color: ps.color, fontWeight: 700, marginBottom: 6, paddingLeft: 2 }}>
                    {ps.label}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {group.map((note) => (
                      <div key={note.id} style={{
                        padding: "13px 14px", borderRadius: 14,
                        background: "var(--card-bg)",
                        border: `1px solid ${ps.bg}`,
                      }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 4, background: ps.color, flexShrink: 0, marginTop: 4 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.4 }}>{note.title}</div>
                            {note.description && (
                              <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 4, lineHeight: 1.5 }}>{note.description}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
