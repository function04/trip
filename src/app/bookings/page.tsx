"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Expense } from "@/types";
import MobileHeader from "@/components/layout/MobileHeader";

type FilterTab = "all" | "needed" | "reserved";
type CatFilter = "all" | string;

const BOOKING_CATEGORIES: { key: string; emoji: string; label: string }[] = [
  { key: "항공", emoji: "✈️", label: "항공" },
  { key: "숙소", emoji: "🏨", label: "숙소" },
  { key: "기차", emoji: "🚆", label: "기차" },
  { key: "티켓", emoji: "🎫", label: "티켓" },
  { key: "통신", emoji: "📱", label: "통신" },
  { key: "기타", emoji: "💰", label: "기타" },
];

export default function BookingsPage() {
  const [items, setItems] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [catFilter, setCatFilter] = useState<CatFilter>("all");

  async function load() {
    const { data } = await supabase
      .from("expenses")
      .select("*")
      .in("booking_status", ["needed", "reserved"])
      .order("day_number")
      .order("description");
    if (data) setItems(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleStatus(item: Expense) {
    const next = item.booking_status === "needed" ? "reserved" : "needed";
    await supabase.from("expenses").update({ booking_status: next }).eq("id", item.id);
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, booking_status: next } : i));
  }

  const filtered = items.filter(i => {
    const statusOk = filter === "all" ? true : i.booking_status === filter;
    const catOk = catFilter === "all" ? true : (() => {
      const match = BOOKING_CATEGORIES.find(c => c.key === i.category);
      const key = match ? i.category : "기타";
      return key === catFilter;
    })();
    return statusOk && catOk;
  });

  // Group by category using BOOKING_CATEGORIES order
  const grouped = filtered.reduce((acc, item) => {
    // Find matching category key
    const match = BOOKING_CATEGORIES.find(c => c.key === item.category);
    const key = match ? item.category : "기타";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, Expense[]>);

  const neededCount = items.filter(i => i.booking_status === "needed").length;
  const reservedCount = items.filter(i => i.booking_status === "reserved").length;

  // Count per category from ALL items (not filtered)
  function getCatCounts(catKey: string) {
    const catItems = items.filter(i => {
      const match = BOOKING_CATEGORIES.find(c => c.key === i.category);
      const key = match ? i.category : "기타";
      return key === catKey;
    });
    const needed = catItems.filter(i => i.booking_status === "needed").length;
    const reserved = catItems.filter(i => i.booking_status === "reserved").length;
    return { needed, reserved, total: catItems.length };
  }

  return (
    <div style={{ minHeight: "100svh", background: "var(--bg-primary)" }}>
      <MobileHeader title="예약 관리" />
      <div className="md:hidden px-4 pt-1 pb-24">
        {/* Summary */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <div style={{ flex: 1, borderRadius: 14, padding: "12px 14px", background: "var(--card-bg)", border: "1px solid var(--border-default)" }}>
            <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 2 }}>예약 필요</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#ff6b6b" }}>{neededCount}</div>
          </div>
          <div style={{ flex: 1, borderRadius: 14, padding: "12px 14px", background: "var(--card-bg)", border: "1px solid var(--border-default)" }}>
            <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 2 }}>예약 완료</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#30d158" }}>{reservedCount}</div>
          </div>
        </div>

        {/* 카테고리 필터 */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          <button onClick={() => setCatFilter("all")}
            style={{ padding: "6px 12px", borderRadius: 10, border: "none", fontSize: 12, fontWeight: 600, background: catFilter === "all" ? "rgba(10,132,255,0.2)" : "var(--card-bg)", color: catFilter === "all" ? "#0a84ff" : "var(--text-tertiary)" }}>
            전체
          </button>
          {BOOKING_CATEGORIES.map(cat => {
            const counts = getCatCounts(cat.key);
            if (counts.total === 0) return null;
            return (
              <button key={cat.key} onClick={() => setCatFilter(cat.key)}
                style={{
                  padding: "6px 12px", borderRadius: 10, border: "none", fontSize: 12, fontWeight: 600,
                  background: catFilter === cat.key ? "rgba(10,132,255,0.2)" : "var(--card-bg)",
                  color: catFilter === cat.key ? "#0a84ff" : "var(--text-tertiary)",
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                <span style={{ fontSize: 13 }}>{cat.emoji}</span>{cat.label}
                {counts.needed > 0 && <span style={{ fontSize: 9, background: "rgba(255,107,107,0.3)", color: "#ff6b6b", borderRadius: 4, padding: "0 4px" }}>{counts.needed}</span>}
              </button>
            );
          })}
        </div>

        {/* 상태 Filter tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {(["all", "needed", "reserved"] as FilterTab[]).map(tab => (
            <button key={tab} onClick={() => setFilter(tab)}
              style={{
                padding: "5px 12px", borderRadius: 10, border: "none", fontSize: 11, fontWeight: 600,
                background: filter === tab ? "rgba(10,132,255,0.15)" : "transparent",
                color: filter === tab ? "#0a84ff" : "var(--text-tertiary)",
              }}>
              {tab === "all" ? "전체" : tab === "needed" ? "예약필요" : "예약완료"}
            </button>
          ))}
        </div>

        {loading ? (
          <div>{Array.from({length: 5}).map((_,i) => <div key={i} style={{height: 60, borderRadius: 12, background: "var(--card-bg)", marginBottom: 8}} className="animate-pulse" />)}</div>
        ) : (
          BOOKING_CATEGORIES.map(cat => {
            const catItems = grouped[cat.key];
            if (!catItems || catItems.length === 0) return null;
            const counts = getCatCounts(cat.key);
            return (
              <div key={cat.key} style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, paddingLeft: 2 }}>
                  <span style={{ fontSize: 14 }}>{cat.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>{cat.label}</span>
                  <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
                    {counts.reserved}/{counts.total} 완료
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {catItems.map(item => (
                    <button key={item.id} onClick={() => toggleStatus(item)}
                      style={{
                        width: "100%", borderRadius: 12, padding: "11px 14px", textAlign: "left",
                        background: "var(--card-bg)", border: `1px solid ${item.booking_status === "reserved" ? "rgba(48,209,88,0.25)" : "rgba(255,107,107,0.25)"}`,
                        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                      }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 3 }}>{item.description}</div>
                        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                          {item.day_number != null && (
                            <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: "rgba(255,255,255,0.07)", color: "var(--text-tertiary)" }}>
                              Day {item.day_number}
                            </span>
                          )}
                          {item.city && <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>{item.city}</span>}
                          {item.estimated_amount != null && item.estimated_amount > 0 && (
                            <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>≈ {item.currency === 'KRW' ? '₩' : item.currency === 'GBP' ? '£' : '€'}{item.estimated_amount}</span>
                          )}
                          {item.london_pass && (
                            <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: "rgba(255,159,10,0.2)", color: "#ff9f0a" }}>런던패스</span>
                          )}
                        </div>
                      </div>
                      <span style={{
                        fontSize: 10, padding: "3px 8px", borderRadius: 6, fontWeight: 700, flexShrink: 0,
                        background: item.booking_status === "reserved" ? "rgba(48,209,88,0.15)" : "rgba(255,107,107,0.15)",
                        color: item.booking_status === "reserved" ? "#30d158" : "#ff6b6b",
                      }}>
                        {item.booking_status === "reserved" ? "✓ 완료" : "예약필요"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PC */}
      <div className="hidden md:block p-8">
        <h1 className="text-2xl font-bold mb-6">📋 예약 관리</h1>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-bg-elevated border border-border-default text-center">
            <div className="text-sm text-text-secondary mb-1">예약 필요</div>
            <div className="text-2xl font-bold" style={{ color: "#ff6b6b" }}>{neededCount}</div>
          </div>
          <div className="p-4 rounded-xl bg-bg-elevated border border-border-default text-center">
            <div className="text-sm text-text-secondary mb-1">예약 완료</div>
            <div className="text-2xl font-bold" style={{ color: "#30d158" }}>{reservedCount}</div>
          </div>
        </div>
        <div className="flex gap-2 mb-6">
          {(["all", "needed", "reserved"] as FilterTab[]).map(tab => (
            <button key={tab} onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === tab ? "bg-accent-blue/20 text-accent-blue" : "bg-bg-elevated text-text-tertiary hover:text-text-primary"}`}>
              {tab === "all" ? "전체" : tab === "needed" ? "예약필요" : "예약완료"}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="space-y-2">{Array.from({length: 5}).map((_,i) => <div key={i} className="h-14 bg-bg-elevated rounded-xl animate-pulse" />)}</div>
        ) : (
          BOOKING_CATEGORIES.map(cat => {
            const catItems = grouped[cat.key];
            if (!catItems || catItems.length === 0) return null;
            const counts = getCatCounts(cat.key);
            return (
              <div key={cat.key} className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span>{cat.emoji}</span>
                  <span className="text-xs font-bold text-text-tertiary uppercase">{cat.label}</span>
                  <span className="text-xs text-text-tertiary">{counts.reserved}/{counts.total} 완료</span>
                </div>
                <div className="space-y-2">
                  {catItems.map(item => (
                    <button key={item.id} onClick={() => toggleStatus(item)}
                      className="w-full rounded-xl p-3 text-left flex items-center justify-between gap-3 transition-opacity hover:opacity-80"
                      style={{
                        background: "var(--bg-elevated)",
                        border: `1px solid ${item.booking_status === "reserved" ? "rgba(48,209,88,0.3)" : "rgba(255,107,107,0.3)"}`,
                      }}>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-text-primary mb-1">{item.description}</div>
                        <div className="flex gap-2 items-center">
                          {item.day_number != null && <span className="text-xs text-text-tertiary bg-bg-hover px-2 py-0.5 rounded">Day {item.day_number}</span>}
                          {item.city && <span className="text-xs text-text-tertiary">{item.city}</span>}
                          {item.estimated_amount != null && item.estimated_amount > 0 && (
                            <span className="text-xs text-text-tertiary">≈ {item.currency === 'KRW' ? '₩' : item.currency === 'GBP' ? '£' : '€'}{item.estimated_amount}</span>
                          )}
                          {item.london_pass && (
                            <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(255,159,10,0.2)", color: "#ff9f0a" }}>런던패스</span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-lg font-bold shrink-0"
                        style={{
                          background: item.booking_status === "reserved" ? "rgba(48,209,88,0.15)" : "rgba(255,107,107,0.15)",
                          color: item.booking_status === "reserved" ? "#30d158" : "#ff6b6b",
                        }}>
                        {item.booking_status === "reserved" ? "✓ 완료" : "예약필요"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
