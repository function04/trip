"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { TOTAL_DAYS } from "@/lib/constants";
import type { Expense, ExchangeRate } from "@/types";
import ExpenseFormPopup from "@/components/expenses/ExpenseFormPopup";
import ExpenseList from "@/components/expenses/ExpenseList";
import MobileHeader from "@/components/layout/MobileHeader";
import FAB from "@/components/layout/FAB";
import { convertToKRW, formatKRW } from "@/lib/currency";

export default function ExpenseDayClient({ dayNumber }: { dayNumber: number }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [dayDate, setDayDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  async function fetchExpenses() {
    const [expRes, rateRes, dayRes] = await Promise.all([
      supabase.from("expenses").select("*").eq("expense_type", "trip").eq("day_number", dayNumber).order("created_at", { ascending: false }),
      supabase.from("exchange_rates").select("*"),
      supabase.from("schedule_days").select("date").eq("day_number", dayNumber).single(),
    ]);
    if (expRes.data) setExpenses(expRes.data);
    if (rateRes.data) setRates(rateRes.data);
    if (dayRes.data) setDayDate(dayRes.data.date);
    setLoading(false);
  }

  useEffect(() => { fetchExpenses(); }, [dayNumber]);

  const totals: Record<string, number> = {};
  expenses.forEach((e) => {
    totals[e.currency] = (totals[e.currency] || 0) + Number(e.amount);
  });

  const totalKRW = expenses.reduce((sum, e) => sum + convertToKRW(Number(e.amount), e.currency, e.payment_method, rates), 0);

  return (
    <div style={{ minHeight: "100svh", background: "var(--bg-primary)" }}>
      {/* iOS 헤더 */}
      <MobileHeader title={`Day ${dayNumber} 가계부`} />

      <div className="px-4 pt-2 pb-10">
        {/* PC용 타이틀 */}
        <div className="hidden md:flex items-center justify-between mb-6">
          <div>
            <Link href="/expenses" className="text-text-tertiary hover:text-text-secondary text-sm mb-2 inline-block">
              ← 가계부
            </Link>
            <h1 className="text-2xl font-bold">💰 Day {dayNumber} 가계부</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-xl bg-accent-blue text-white text-sm font-medium hover:opacity-90"
          >
            {showForm ? "닫기" : "+ 지출 추가"}
          </button>
        </div>

        {/* 총 금액 KRW 카드 */}
        {expenses.length > 0 && (
          <div style={{
            borderRadius: 16, padding: "14px 18px", marginBottom: 12,
            background: "var(--card-bg)", border: "1px solid var(--border-hover)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 500 }}>총 금액</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>{formatKRW(totalKRW)}</span>
          </div>
        )}

        {/* 합계 뱃지 */}
        {Object.keys(totals).length > 0 && (
          <div className="flex gap-2 mb-4">
            {Object.entries(totals).map(([cur, amt]) => (
              <span
                key={cur}
                className="text-[13px] px-3 py-1.5 rounded-full font-medium"
                style={{ background: "var(--border-hover)", color: "var(--text-secondary)" }}
              >
                {cur === "GBP" ? "£" : cur === "EUR" ? "€" : "₩"}{amt.toLocaleString()}
              </span>
            ))}
          </div>
        )}

        {/* Day 선택 (iOS pill) */}
        <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map((d) => (
            <Link
              key={d}
              href={`/expenses/${d}`}
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-[14px] font-medium transition-all"
              style={{
                background: d === dayNumber ? "#0a84ff" : "var(--card-bg)",
                color: d === dayNumber ? "#fff" : "var(--text-secondary)",
              }}
            >
              {d}
            </Link>
          ))}
        </div>
        {/* 날짜 — 작은 회색 */}
        {dayDate && (
          <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 14, paddingLeft: 2 }}>
            {dayDate}
          </div>
        )}

        <FAB onClick={() => setShowForm((v) => !v)} label={showForm ? "✕" : "+"} />

        {showForm && (
          <ExpenseFormPopup
            expenseType="trip"
            dayNumber={dayNumber}
            onAdded={() => { fetchExpenses(); setShowForm(false); }}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* 리스트 */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: "var(--card-bg)" }} />
            ))}
          </div>
        ) : (
          <ExpenseList expenses={expenses} onDeleted={fetchExpenses} />
        )}
      </div>
    </div>
  );
}
