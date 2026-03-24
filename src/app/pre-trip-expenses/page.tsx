"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Expense } from "@/types";
import ExpenseForm from "@/components/expenses/ExpenseForm";
import ExpenseFormPopup from "@/components/expenses/ExpenseFormPopup";
import ExpenseList from "@/components/expenses/ExpenseList";
import MobileHeader from "@/components/layout/MobileHeader";
import FAB from "@/components/layout/FAB";

const BG = "var(--bg-primary)";

// Category icon mapping
const CAT_EMOJI: Record<string, string> = {
  항공: "✈️", 숙소: "🏨", 기차: "🚆", 티켓: "🎫", 통신: "📱", 기타: "💰",
  식비: "🍽️", 카페: "☕", 지하철: "🚇", 트램: "🚊", 버스: "🚌", 택시: "🚕",
  기념품: "🎁", 쇼핑: "🛍️", 마트: "🛒",
};

export default function PreTripExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [catFilter, setCatFilter] = useState<string>("all");

  async function fetchExpenses() {
    const { data } = await supabase
      .from("expenses")
      .select("*")
      .eq("expense_type", "pre_trip")
      .order("created_at", { ascending: false });
    if (data) setExpenses(data);
    setLoading(false);
  }

  useEffect(() => { fetchExpenses(); }, []);

  // Unique categories present in data
  const categories = Array.from(new Set(expenses.map(e => e.category))).sort();

  const filtered = catFilter === "all" ? expenses : expenses.filter(e => e.category === catFilter);

  const totals: Record<string, number> = {};
  filtered.forEach((e) => {
    totals[e.currency] = (totals[e.currency] || 0) + Number(e.amount);
  });

  return (
    <div style={{ minHeight: "100svh", background: BG }}>
      <MobileHeader title="여행전 지출" />

      {/* PC */}
      <div className="hidden md:block p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">✈️ 여행 전 지출</h1>
            <p className="text-text-secondary text-sm mt-1">항공권, 숙소, 패스, 기차 예약 등</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-md bg-accent-blue text-white text-sm font-medium hover:opacity-90 transition-opacity">
            {showForm ? "닫기" : "+ 지출 추가"}
          </button>
        </div>
        {Object.keys(totals).length > 0 && (
          <div className="flex gap-3 mb-4">
            {Object.entries(totals).map(([cur, amt]) => (
              <span key={cur} className="text-sm px-3 py-1 rounded-full bg-bg-elevated text-text-secondary">
                {cur === "GBP" ? "£" : cur === "EUR" ? "€" : "₩"}{amt.toLocaleString()}
              </span>
            ))}
          </div>
        )}
        {showForm && (
          <div className="mb-6 p-4 rounded-xl bg-bg-elevated border border-border-default">
            <ExpenseForm expenseType="pre_trip" onAdded={() => { fetchExpenses(); setShowForm(false); }} />
          </div>
        )}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-bg-elevated rounded-lg animate-pulse" />)}
          </div>
        ) : (
          <ExpenseList expenses={filtered} onDeleted={fetchExpenses} />
        )}
      </div>

      {/* 모바일 */}
      <div className="md:hidden px-4 pt-3 pb-28">
        {/* 카테고리 필터 칩 */}
        {!loading && categories.length > 0 && (
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 14 }}>
            <button onClick={() => setCatFilter("all")}
              style={{
                padding: "6px 14px", borderRadius: 10, border: "none", fontSize: 12, fontWeight: 600,
                background: catFilter === "all" ? "rgba(10,132,255,0.2)" : "var(--card-bg)",
                color: catFilter === "all" ? "#0a84ff" : "var(--text-tertiary)",
              }}>
              전체
            </button>
            {categories.map(cat => (
              <button key={cat} onClick={() => setCatFilter(cat)}
                style={{
                  padding: "6px 12px", borderRadius: 10, border: "none", fontSize: 12, fontWeight: 600,
                  background: catFilter === cat ? "rgba(10,132,255,0.2)" : "var(--card-bg)",
                  color: catFilter === cat ? "#0a84ff" : "var(--text-tertiary)",
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                {CAT_EMOJI[cat] && <span style={{ fontSize: 13 }}>{CAT_EMOJI[cat]}</span>}
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* 합계 */}
        {Object.keys(totals).length > 0 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            {Object.entries(totals).map(([cur, amt]) => (
              <span key={cur} style={{
                fontSize: 13, padding: "5px 12px", borderRadius: 20,
                background: "var(--card-bg)", color: "var(--text-secondary)", fontWeight: 500,
              }}>
                {cur === "GBP" ? "£" : cur === "EUR" ? "€" : "₩"}{amt.toLocaleString()}
              </span>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ height: 60, borderRadius: 14, background: "var(--card-bg)" }} className="animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 60, color: "var(--text-tertiary)" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
            <div style={{ fontSize: 14 }}>{catFilter === "all" ? "아직 지출 내역이 없어요" : `${catFilter} 항목이 없어요`}</div>
          </div>
        ) : (
          <ExpenseList expenses={filtered} onDeleted={fetchExpenses} />
        )}
      </div>

      {showForm && (
        <ExpenseFormPopup
          expenseType="pre_trip"
          onAdded={() => { fetchExpenses(); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <FAB onClick={() => setShowForm((v) => !v)} label={showForm ? "✕" : "+"} />
    </div>
  );
}
