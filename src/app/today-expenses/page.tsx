"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Expense, ExchangeRate } from "@/types";
import ExpenseFormPopup from "@/components/expenses/ExpenseFormPopup";
import ExpenseList from "@/components/expenses/ExpenseList";
import MobileHeader from "@/components/layout/MobileHeader";
import FAB from "@/components/layout/FAB";
import { getTodayDayNumber } from "@/lib/todayDay";
import { convertToKRW, formatKRW } from "@/lib/currency";

const BG = "var(--bg-primary)";

export default function TodayExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [dayDate, setDayDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const todayDay = getTodayDayNumber();
  const todayStr = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric", month: "long", day: "numeric", weekday: "short",
    timeZone: "Europe/London",
  }).format(new Date());

  async function fetchExpenses() {
    if (!todayDay) { setLoading(false); return; }
    const [expRes, rateRes, dayRes] = await Promise.all([
      supabase.from("expenses").select("*").eq("expense_type", "trip").eq("day_number", todayDay).order("created_at", { ascending: false }),
      supabase.from("exchange_rates").select("*"),
      supabase.from("schedule_days").select("date").eq("day_number", todayDay).single(),
    ]);
    if (expRes.data) setExpenses(expRes.data);
    if (rateRes.data) setRates(rateRes.data);
    if (dayRes.data) setDayDate(dayRes.data.date);
    setLoading(false);
  }

  useEffect(() => { fetchExpenses(); }, [todayDay]);

  const totals: Record<string, number> = {};
  expenses.forEach((e) => {
    totals[e.currency] = (totals[e.currency] || 0) + Number(e.amount);
  });

  const totalKRW = expenses.reduce((sum, e) => sum + convertToKRW(Number(e.amount), e.currency, e.payment_method, rates), 0);

  return (
    <div style={{ minHeight: "100svh", background: BG }}>
      <MobileHeader title={todayDay ? `Day ${todayDay} 가계부` : "오늘 가계부"} />

      {/* PC */}
      <div className="hidden md:block p-8">
        <h1 className="text-2xl font-bold mb-4">
          {todayDay ? `💰 Day ${todayDay} 가계부` : "💰 오늘 가계부"}
        </h1>
        {todayDay ? (
          <Link href={`/expenses/${todayDay}`} className="text-accent-blue text-sm hover:underline">
            Day {todayDay} 가계부 전체 보기 →
          </Link>
        ) : (
          <p className="text-text-secondary">여행 기간이 아닙니다.</p>
        )}
      </div>

      {/* 모바일 */}
      <div className="md:hidden px-4 pt-3 pb-4">
        {/* 오늘 날짜 — 항상 표시 */}
        <div style={{
          fontSize: 13, fontWeight: 600, color: "var(--text-secondary)",
          marginBottom: 14, paddingLeft: 2,
        }}>
          {todayStr}
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ height: 62, borderRadius: 16, background: "var(--card-bg)" }} className="animate-pulse" />
            ))}
          </div>
        ) : !todayDay ? (
          /* 여행 기간 아님 */
          <div style={{ textAlign: "center", paddingTop: 80, color: "var(--text-tertiary)" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💰</div>
            <div style={{ fontSize: 17, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
              아직 여행 중이 아니에요
            </div>
            <div style={{ fontSize: 13, color: "var(--text-tertiary)", lineHeight: 1.6 }}>
              여행이 시작되면<br />오늘의 가계부가 여기에 표시돼요
            </div>
            <Link href="/expenses"
              style={{
                display: "inline-block", marginTop: 28,
                padding: "11px 24px", borderRadius: 14,
                background: "var(--card-bg)",
                border: "1px solid var(--border-hover)",
                color: "var(--text-secondary)", fontSize: 14, fontWeight: 600,
                textDecoration: "none",
              }}>
              전체 가계부 보기
            </Link>
          </div>
        ) : (
          <>
            {/* Day 뱃지 */}
            <div style={{ marginBottom: 14 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "6px 12px", borderRadius: 20,
                background: "var(--card-bg)",
                border: "1px solid var(--border-hover)",
                marginBottom: 10,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: 3, background: "var(--border-hover)" }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
                  Day {todayDay} · 오늘
                </span>
              </div>

              {/* 총 금액 KRW 카드 */}
              {expenses.length > 0 && (
                <div style={{
                  borderRadius: 16, padding: "14px 18px", marginBottom: 10,
                  background: "var(--card-bg)", border: "1px solid var(--border-hover)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <span style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 500 }}>총 금액</span>
                  <span style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>{formatKRW(totalKRW)}</span>
                </div>
              )}

              {/* 합계 뱃지 */}
              {Object.keys(totals).length > 0 && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {Object.entries(totals).map(([cur, amt]) => (
                    <span key={cur} style={{
                      fontSize: 13, padding: "5px 12px", borderRadius: 20,
                      background: "var(--card-bg)",
                      color: "var(--text-secondary)", fontWeight: 500,
                    }}>
                      {cur === "GBP" ? "£" : cur === "EUR" ? "€" : "₩"}{amt.toLocaleString()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 지출 리스트 */}
            {expenses.length === 0 ? (
              <div style={{ textAlign: "center", paddingTop: 32, color: "var(--text-tertiary)" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🧾</div>
                <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>아직 지출 내역이 없어요</div>
              </div>
            ) : (
              <ExpenseList expenses={expenses} onDeleted={fetchExpenses} />
            )}

            {/* Day n 상세로 이동 */}
            <Link href={`/expenses/${todayDay}`}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                marginTop: 14, padding: "12px", borderRadius: 14,
                background: "var(--card-bg)",
                border: "1px solid var(--border-default)",
                color: "var(--text-secondary)", fontSize: 13,
                textDecoration: "none",
              }}>
              Day {todayDay} 전체 보기 ›
            </Link>
          </>
        )}
      </div>
      {todayDay && showForm && (
        <ExpenseFormPopup
          expenseType="trip"
          dayNumber={todayDay}
          onAdded={() => { fetchExpenses(); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      )}
      {todayDay && <FAB onClick={() => setShowForm((v) => !v)} label={showForm ? "✕" : "+"} />}
    </div>
  );
}
