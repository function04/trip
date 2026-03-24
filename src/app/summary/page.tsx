"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import MobileHeader from "@/components/layout/MobileHeader";
import { convertToKRW, formatKRW, formatAmount } from "@/lib/currency";
import { PAYMENT_LABELS, CITIES } from "@/lib/constants";
import type { Expense, ExchangeRate } from "@/types";
import DonutChart from "@/components/summary/DonutChart";

const BG = "var(--bg-primary)";

const COLORS = [
  "#0a84ff", "#30d158", "#ff9f0a", "#ff453a", "#bf5af2",
  "#64d2ff", "#ffd60a", "#ff6b6b", "#4ecdc4", "#a8e063",
  "#ff6b9d", "#c56ef3", "#f7b731", "#26de81", "#fd9644",
];

const CITY_COLORS: Record<string, string> = {
  "맨체스터": "#0a84ff",
  "리버풀":   "#30d158",
  "런던":     "#ff9f0a",
  "옥스퍼드": "#bf5af2",
  "케임브리지":"#64d2ff",
  "더블린":   "#ff6b6b",
};

export default function SummaryPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"chart" | "city" | "table" | "transport" | "rates">("chart");

  useEffect(() => {
    async function load() {
      const [expRes, rateRes] = await Promise.all([
        supabase.from("expenses").select("*").order("created_at"),
        supabase.from("exchange_rates").select("*"),
      ]);
      if (expRes.data) setExpenses(expRes.data);
      if (rateRes.data) setRates(rateRes.data);
      setLoading(false);
    }
    load();
  }, []);

  function getPersonExpenses(person: "구도현" | "김상윤") {
    const result: Record<string, number> = {};
    expenses.forEach((exp) => {
      const krw = convertToKRW(Number(exp.amount), exp.currency, exp.payment_method, rates);
      let share = 0;
      if (exp.paid_by === person) share = krw;
      else if (exp.paid_by === "n빵") share = Math.round(krw / 2);
      if (share > 0) result[exp.category] = (result[exp.category] || 0) + share;
    });
    return result;
  }

  function getPersonTotal(person: "구도현" | "김상윤") {
    return Object.values(getPersonExpenses(person)).reduce((s, v) => s + v, 0);
  }

  function makeChartData(person: "구도현" | "김상윤") {
    return Object.entries(getPersonExpenses(person))
      .map(([name, value], idx) => ({ name, value, color: COLORS[idx % COLORS.length] }))
      .sort((a, b) => b.value - a.value);
  }

  // 도시별 집계 (여행 전 지출 제외)
  function getCityTotals() {
    const result: Record<string, number> = {};
    expenses.filter(e => e.expense_type !== "pre_trip").forEach((exp) => {
      const key = exp.city || "미분류";
      const krw = convertToKRW(Number(exp.amount), exp.currency, exp.payment_method, rates);
      result[key] = (result[key] || 0) + krw;
    });
    return result;
  }

  function makeCityChartData() {
    return Object.entries(getCityTotals())
      .map(([name, value]) => ({ name, value, color: CITY_COLORS[name] || "#80848e" }))
      .sort((a, b) => b.value - a.value);
  }

  const totalKDH = getPersonTotal("구도현");
  const totalKSY = getPersonTotal("김상윤");
  const grandTotal = expenses.reduce((s, e) => s + convertToKRW(Number(e.amount), e.currency, e.payment_method, rates), 0);
  const cityData = makeCityChartData();
  const cityTotal = cityData.reduce((s, d) => s + d.value, 0);

  return (
    <div style={{ minHeight: "100svh", background: BG }}>
      <MobileHeader title="지출합계" />

      {/* PC */}
      <div className="hidden md:block p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">📊 지출내역합계</h1>
            <p className="text-text-secondary text-sm mt-1">여행 전 + 가계부 지출이 모두 포함됩니다</p>
          </div>
          <div className="flex gap-1 bg-bg-elevated rounded-md p-0.5">
            <button onClick={() => setView("chart")} className={`px-3 py-1 rounded text-sm transition-colors ${view === "chart" ? "bg-bg-hover text-text-primary" : "text-text-secondary"}`}>차트</button>
            <button onClick={() => setView("city")} className={`px-3 py-1 rounded text-sm transition-colors ${view === "city" ? "bg-bg-hover text-text-primary" : "text-text-secondary"}`}>도시별</button>
            <button onClick={() => setView("table")} className={`px-3 py-1 rounded text-sm transition-colors ${view === "table" ? "bg-bg-hover text-text-primary" : "text-text-secondary"}`}>상세</button>
            <button onClick={() => setView("transport")} className={`px-3 py-1 rounded text-sm transition-colors ${view === "transport" ? "bg-bg-hover text-text-primary" : "text-text-secondary"}`}>교통비</button>
            <button onClick={() => setView("rates")} className={`px-3 py-1 rounded text-sm transition-colors ${view === "rates" ? "bg-bg-hover text-text-primary" : "text-text-secondary"}`}>환율</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-bg-elevated border border-border-default text-center">
            <div className="text-sm text-text-secondary">구도현 총 지출</div>
            <div className="text-xl font-bold text-accent-blue mt-1">{formatKRW(totalKDH)}</div>
          </div>
          <div className="p-4 rounded-xl bg-bg-elevated border border-border-default text-center">
            <div className="text-sm text-text-secondary">김상윤 총 지출</div>
            <div className="text-xl font-bold text-accent-green mt-1">{formatKRW(totalKSY)}</div>
          </div>
        </div>
        {view === "chart" ? (
          <div className="grid grid-cols-2 gap-8">
            <div className="p-6 rounded-xl bg-bg-elevated border border-border-default">
              <DonutChart data={makeChartData("구도현")} total={totalKDH} label="구도현" />
            </div>
            <div className="p-6 rounded-xl bg-bg-elevated border border-border-default">
              <DonutChart data={makeChartData("김상윤")} total={totalKSY} label="김상윤" />
            </div>
          </div>
        ) : view === "city" ? (
          <div className="p-6 rounded-xl bg-bg-elevated border border-border-default max-w-sm mx-auto">
            <DonutChart data={cityData} total={cityTotal} label="도시별 지출" />
          </div>
        ) : view === "transport" ? (
          <TransportComparison expenses={expenses} rates={rates} />
        ) : view === "rates" ? (
          <ExchangeRateEditor rates={rates} onUpdated={async () => {
            const { data } = await supabase.from("exchange_rates").select("*");
            if (data) setRates(data);
          }} />
        ) : (
          <PCTable expenses={expenses} rates={rates} />
        )}
      </div>

      {/* 모바일 */}
      <div className="md:hidden pb-16">
        {loading ? (
          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 10 }}>
            {[1, 2, 3].map((i) => <div key={i} style={{ height: 80, borderRadius: 16, background: "var(--card-bg)" }} className="animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* 탭 */}
            <div style={{ padding: "12px 16px 0" }}>
              <div style={{
                display: "flex", gap: 0,
                background: "var(--card-bg)",
                borderRadius: 12, padding: 3,
              }}>
                {(["chart", "city", "table", "transport", "rates"] as const).map((v) => (
                  <button key={v} onClick={() => setView(v)}
                    style={{
                      flex: 1, padding: "7px 0", borderRadius: 9, border: "none",
                      background: view === v ? "var(--bg-elevated)" : "transparent",
                      color: view === v ? "var(--text-primary)" : "var(--text-tertiary)",
                      fontSize: 11, fontWeight: 600, transition: "all 0.2s",
                    }}>
                    {v === "chart" ? "카테고리" : v === "city" ? "도시별" : v === "table" ? "상세내역" : v === "transport" ? "교통비" : "환율"}
                  </button>
                ))}
              </div>
            </div>

            {view === "chart" ? (
              <MobileChartView
                totalKDH={totalKDH}
                totalKSY={totalKSY}
                grandTotal={grandTotal}
                dataKDH={makeChartData("구도현")}
                dataKSY={makeChartData("김상윤")}
              />
            ) : view === "city" ? (
              <MobileCityView
                grandTotal={grandTotal}
                cityData={cityData}
                cityTotal={cityTotal}
              />
            ) : view === "transport" ? (
              <TransportComparison expenses={expenses} rates={rates} />
            ) : view === "rates" ? (
              <div style={{ padding: "14px 16px" }}>
                <ExchangeRateEditor rates={rates} onUpdated={async () => {
                  const { data } = await supabase.from("exchange_rates").select("*");
                  if (data) setRates(data);
                }} />
              </div>
            ) : (
              <MobileTableView expenses={expenses} rates={rates} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function MobileChartView({
  totalKDH, totalKSY, grandTotal, dataKDH, dataKSY,
}: {
  totalKDH: number; totalKSY: number; grandTotal: number;
  dataKDH: { name: string; value: number; color: string }[];
  dataKSY: { name: string; value: number; color: string }[];
}) {
  return (
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
      {/* 총 지출 배너 */}
      <div style={{
        borderRadius: 18, padding: "16px 18px",
        background: "var(--card-bg)",
        border: "1px solid var(--border-hover)",
      }}>
        <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 4 }}>총 여행 경비</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: "var(--text-primary)" }}>{formatKRW(grandTotal)}</div>
        <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4 }}>인당 {formatKRW(Math.round(grandTotal / 2))}</div>
      </div>

      {/* 개인별 요약 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{
          borderRadius: 16, padding: "14px",
          background: "rgba(10,132,255,0.08)",
          border: "1px solid rgba(10,132,255,0.15)",
        }}>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 6 }}>구도현</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#0a84ff" }}>{formatKRW(totalKDH)}</div>
        </div>
        <div style={{
          borderRadius: 16, padding: "14px",
          background: "rgba(48,209,88,0.08)",
          border: "1px solid rgba(48,209,88,0.15)",
        }}>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 6 }}>김상윤</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#30d158" }}>{formatKRW(totalKSY)}</div>
        </div>
      </div>

      {/* 도넛 차트 — 구도현 */}
      <div style={{
        borderRadius: 20, padding: "20px 16px",
        background: "var(--card-bg)",
        border: "1px solid var(--border-default)",
      }}>
        <DonutChart data={dataKDH} total={totalKDH} label="구도현" color="#0a84ff" />
      </div>

      {/* 도넛 차트 — 김상윤 */}
      <div style={{
        borderRadius: 20, padding: "20px 16px",
        background: "var(--card-bg)",
        border: "1px solid var(--border-default)",
      }}>
        <DonutChart data={dataKSY} total={totalKSY} label="김상윤" color="#30d158" />
      </div>
    </div>
  );
}

function MobileCityView({
  grandTotal, cityData, cityTotal,
}: {
  grandTotal: number;
  cityData: { name: string; value: number; color: string }[];
  cityTotal: number;
}) {
  return (
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
      {/* 총 지출 배너 */}
      <div style={{
        borderRadius: 18, padding: "16px 18px",
        background: "var(--card-bg)",
        border: "1px solid var(--border-default)",
      }}>
        <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>총 여행 경비</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: "var(--text-primary)" }}>{formatKRW(grandTotal)}</div>
      </div>

      {/* 도시별 도넛 차트 */}
      <div style={{
        borderRadius: 20, padding: "20px 16px",
        background: "var(--card-bg)",
        border: "1px solid var(--border-default)",
      }}>
        <DonutChart data={cityData} total={cityTotal} label="도시별 지출" />
      </div>

      {/* 도시별 막대 리스트 */}
      {cityData.length > 0 && (
        <div style={{
          borderRadius: 20, padding: "16px",
          background: "var(--card-bg)",
          border: "1px solid var(--border-default)",
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          {cityData.map((city) => {
            const pct = cityTotal > 0 ? (city.value / cityTotal) * 100 : 0;
            return (
              <div key={city.name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 4, background: city.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>{city.name}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>{formatKRW(city.value)}</span>
                    <span style={{ fontSize: 11, color: "var(--text-tertiary)", marginLeft: 6 }}>{pct.toFixed(1)}%</span>
                  </div>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: "var(--card-bg)" }}>
                  <div style={{ height: 4, borderRadius: 2, background: city.color, width: `${pct}%`, transition: "width 0.4s ease" }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const CITY_COLOR_TABLE: Record<string, { bg: string; color: string }> = {
  "맨체스터": { bg: "rgba(10,132,255,0.15)",   color: "rgba(100,180,255,0.9)" },
  "리버풀":   { bg: "rgba(48,209,88,0.15)",   color: "rgba(80,210,120,0.9)" },
  "런던":     { bg: "rgba(255,159,10,0.15)",  color: "rgba(255,190,80,0.9)" },
  "옥스퍼드": { bg: "rgba(191,90,242,0.15)",  color: "rgba(210,140,255,0.9)" },
  "케임브리지":{ bg: "rgba(100,210,255,0.15)", color: "rgba(120,220,255,0.9)" },
  "더블린":   { bg: "rgba(255,107,107,0.15)", color: "rgba(255,140,140,0.9)" },
};

type TableFilter = "all" | "pre_trip" | "trip" | string; // string = day/city key

function MobileTableView({ expenses, rates }: { expenses: Expense[]; rates: ExchangeRate[] }) {
  const [filter, setFilter] = useState<TableFilter>("all");

  if (expenses.length === 0) {
    return (
      <div style={{ textAlign: "center", paddingTop: 80, color: "var(--text-tertiary)" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
        <div>아직 지출 내역이 없어요</div>
      </div>
    );
  }

  // Sort: pre_trip first (by created_at), then trip by day_number asc + time asc
  const sorted = [...expenses].sort((a, b) => {
    if (a.expense_type === "pre_trip" && b.expense_type !== "pre_trip") return -1;
    if (a.expense_type !== "pre_trip" && b.expense_type === "pre_trip") return 1;
    if (a.expense_type === "trip" && b.expense_type === "trip") {
      const dayDiff = (a.day_number ?? 0) - (b.day_number ?? 0);
      if (dayDiff !== 0) return dayDiff;
      const timeA = a.time ?? "00:00";
      const timeB = b.time ?? "00:00";
      return timeA.localeCompare(timeB);
    }
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  // Filter options
  const days = Array.from(new Set(sorted.filter(e => e.expense_type === "trip" && e.day_number).map(e => e.day_number!))).sort((a,b)=>a-b);
  const cities = Array.from(new Set(sorted.filter(e => e.city).map(e => e.city!))).sort();

  const filtered = sorted.filter(exp => {
    if (filter === "all") return true;
    if (filter === "pre_trip") return exp.expense_type === "pre_trip";
    if (filter === "trip") return exp.expense_type === "trip";
    if (filter.startsWith("day:")) return exp.day_number === Number(filter.slice(4));
    if (filter.startsWith("city:")) return exp.city === filter.slice(5);
    return true;
  });

  return (
    <div style={{ padding: "12px 16px" }}>
      {/* 필터 칩 */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {([
          { k: "all", label: "전체" },
          { k: "pre_trip", label: "여행전" },
          { k: "trip", label: "여행중" },
          ...days.map(d => ({ k: `day:${d}`, label: `Day ${d}` })),
          ...cities.map(c => ({ k: `city:${c}`, label: c })),
        ]).map(({ k, label }) => {
          const isCity = k.startsWith("city:");
          const cityName = isCity ? k.slice(5) : null;
          const cc = cityName ? (CITY_COLOR_TABLE[cityName] ?? { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }) : null;
          return (
            <button key={k} onClick={() => setFilter(k as TableFilter)}
              style={{
                padding: "4px 10px", borderRadius: 8, border: "none", fontSize: 11, fontWeight: 600,
                background: filter === k
                  ? (isCity && cc ? cc.bg : "rgba(10,132,255,0.2)")
                  : "var(--card-bg)",
                color: filter === k
                  ? (isCity && cc ? cc.color : "#0a84ff")
                  : "var(--text-tertiary)",
              }}>
              {label}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((exp) => {
          const krw = convertToKRW(Number(exp.amount), exp.currency, exp.payment_method, rates);
          const cc = exp.city ? (CITY_COLOR_TABLE[exp.city] ?? null) : null;
          return (
            <div key={exp.id} style={{
              borderRadius: 14, padding: "11px 14px",
              background: "var(--card-bg)",
              border: "1px solid var(--border-default)",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3, flexWrap: "wrap" }}>
                  <span style={{
                    fontSize: 9, padding: "1px 5px", borderRadius: 4,
                    background: exp.expense_type === "pre_trip" ? "rgba(191,90,242,0.2)" : "rgba(48,209,88,0.2)",
                    color: exp.expense_type === "pre_trip" ? "#bf5af2" : "#30d158",
                  }}>
                    {exp.expense_type === "pre_trip" ? "여행전" : "여행중"}
                  </span>
                  {exp.day_number != null && exp.day_number > 0 && <span style={{ fontSize: 9, color: "var(--text-tertiary)" }}>Day {exp.day_number}</span>}
                  {exp.city && cc && (
                    <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 4, background: cc.bg, color: cc.color, fontWeight: 600 }}>{exp.city}</span>
                  )}
                  <span style={{ fontSize: 9, color: "var(--text-tertiary)" }}>{exp.category}</span>
                </div>
                <div style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {exp.description || "내역 없음"}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 2 }}>
                  <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>{exp.paid_by} · {PAYMENT_LABELS[exp.payment_method]}</span>
                  {exp.time && <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>{exp.time}</span>}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{formatAmount(Number(exp.amount), exp.currency)}</div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 1 }}>{formatKRW(krw)}</div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", paddingTop: 40, color: "var(--text-tertiary)", fontSize: 13 }}>해당 내역이 없어요</div>
        )}
      </div>
    </div>
  );
}

const TRANSPORT_CATEGORIES = ['기차', '지하철', '트램', '버스', '택시'];

function TransportComparison({ expenses, rates }: { expenses: Expense[]; rates: ExchangeRate[] }) {
  const transportItems = expenses.filter(e => TRANSPORT_CATEGORIES.includes(e.category));

  if (transportItems.length === 0) {
    return (
      <div style={{ padding: "14px 16px", textAlign: "center", paddingTop: 60, color: "var(--text-tertiary)" }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>🚇</div>
        <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>아직 교통비 내역이 없어요</div>
        <div style={{ fontSize: 12, marginTop: 6, lineHeight: 1.5 }}>가계부에 교통 카테고리로 지출을 추가하면<br/>예상 vs 실제 비교가 여기 표시돼요</div>
      </div>
    );
  }

  // Group by transport category (기차/지하철/트램/버스/택시)
  const catMap: Record<string, { actual: number; items: Expense[] }> = {};
  transportItems.forEach((e) => {
    const cat = e.category;
    if (!catMap[cat]) catMap[cat] = { actual: 0, items: [] };
    const krw = convertToKRW(Number(e.amount), e.currency, e.payment_method, rates);
    catMap[cat].actual += krw;
    catMap[cat].items.push(e);
  });

  // 카테고리 순서 고정
  const catOrder = ['기차', '지하철', '트램', '버스', '택시'];
  const cats = catOrder.filter(c => catMap[c]);
  const totalActual = cats.reduce((s, c) => s + catMap[c].actual, 0);

  const CAT_ICON: Record<string, string> = {
    기차: '🚆', 지하철: '🚇', 트램: '🚊', 버스: '🚌', 택시: '🚕',
  };

  return (
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
      {/* 총 교통비 */}
      <div style={{ borderRadius: 18, padding: "14px 18px", background: "var(--card-bg)", border: "1px solid var(--border-hover)" }}>
        <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 4 }}>총 교통비</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>{formatKRW(totalActual)}</div>
        <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4 }}>인당 {formatKRW(Math.round(totalActual / 2))}</div>
      </div>

      {/* 교통수단별 테이블 */}
      <div style={{ borderRadius: 18, padding: "14px 16px", background: "var(--card-bg)", border: "1px solid var(--border-default)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>교통수단별 합계</div>
        {cats.map(cat => {
          const { actual } = catMap[cat];
          const pct = totalActual > 0 ? (actual / totalActual) * 100 : 0;
          return (
            <div key={cat} style={{ padding: "8px 0", borderTop: "1px solid var(--border-default)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 14 }}>{CAT_ICON[cat]}</span>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>{cat}</span>
                  <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>{catMap[cat].items.length}건</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>{formatKRW(actual)}</span>
                  <span style={{ fontSize: 10, color: "var(--text-tertiary)", marginLeft: 5 }}>{pct.toFixed(0)}%</span>
                </div>
              </div>
              <div style={{ height: 3, borderRadius: 2, background: "var(--border-default)" }}>
                <div style={{ height: 3, borderRadius: 2, background: "#0a84ff", width: `${pct}%`, transition: "width 0.4s ease" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 항목별 상세 */}
      <div style={{ borderRadius: 18, padding: "14px 16px", background: "var(--card-bg)", border: "1px solid var(--border-default)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>항목별 상세</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {transportItems.map(e => {
            const krw = convertToKRW(Number(e.amount), e.currency, e.payment_method, rates);
            const cc = e.city ? (CITY_COLOR_TABLE[e.city] ?? null) : null;
            return (
              <div key={e.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 5, alignItems: "center", marginBottom: 2, flexWrap: "wrap" }}>
                    {e.day_number != null && e.day_number > 0 && <span style={{ fontSize: 9, color: "var(--text-tertiary)" }}>Day {e.day_number}</span>}
                    {e.city && cc && <span style={{ fontSize: 9, padding: "0px 5px", borderRadius: 4, background: cc.bg, color: cc.color, fontWeight: 600 }}>{e.city}</span>}
                    <span style={{ fontSize: 9, color: "var(--text-tertiary)" }}>{e.category}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.description}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{formatKRW(krw)}</div>
                  {e.estimated_amount && Number(e.estimated_amount) > 0 && (
                    <div style={{ fontSize: 10, color: "var(--text-tertiary)" }}>예상 {formatAmount(Number(e.estimated_amount), e.currency)}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ExchangeRateEditor({ rates, onUpdated }: { rates: ExchangeRate[]; onUpdated: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);

  const rateMap: Record<string, ExchangeRate> = {};
  rates.forEach((r) => { rateMap[`${r.currency}_${r.payment_method}`] = r; });

  const currencies = ["GBP", "EUR"];
  const methods = [{ key: "card", label: "카드" }, { key: "cash", label: "현금" }];
  const currencySymbol = (c: string) => (c === "GBP" ? "£" : "€");
  const currencyName = (c: string) => (c === "GBP" ? "파운드" : "유로");

  async function saveRate(id: string) {
    const val = parseFloat(editValue);
    if (isNaN(val)) return;
    setSaving(true);
    await supabase.from("exchange_rates").update({ rate_to_krw: val, updated_at: new Date().toISOString() }).eq("id", id);
    setEditingId(null);
    setSaving(false);
    onUpdated();
  }

  return (
    <div style={{ borderRadius: 16, background: "var(--card-bg)", border: "1px solid var(--border-default)", padding: "16px", maxWidth: 400 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>환율 설정 (원)</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
        <div />
        {methods.map(m => (
          <div key={m.key} style={{ fontSize: 11, color: "var(--text-tertiary)", textAlign: "center", fontWeight: 600 }}>{m.label}</div>
        ))}
      </div>
      {currencies.map(cur => (
        <div key={cur} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10, alignItems: "center" }}>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>
            {currencySymbol(cur)} {currencyName(cur)}
          </div>
          {methods.map(m => {
            const rate = rateMap[`${cur}_${m.key}`];
            if (!rate) return <div key={m.key} />;
            return (
              <div key={m.key}>
                {editingId === rate.id ? (
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => saveRate(rate.id)}
                    onKeyDown={(e) => e.key === "Enter" && saveRate(rate.id)}
                    style={{
                      width: "100%", padding: "7px 8px", borderRadius: 8, border: "1px solid #0a84ff",
                      background: "var(--bg-elevated)", color: "var(--text-primary)", fontSize: 13,
                      textAlign: "center", outline: "none",
                    }}
                    disabled={saving}
                  />
                ) : (
                  <button
                    onClick={() => { setEditingId(rate.id); setEditValue(String(rate.rate_to_krw)); }}
                    style={{
                      width: "100%", padding: "7px 8px", borderRadius: 8,
                      border: "1px solid var(--border-default)", background: "var(--bg-elevated)",
                      color: "var(--text-primary)", fontSize: 13, textAlign: "center", cursor: "pointer",
                    }}
                  >
                    {Number(rate.rate_to_krw).toLocaleString()}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ))}
      {rates.length === 0 && (
        <div style={{ fontSize: 13, color: "var(--text-tertiary)", textAlign: "center", paddingTop: 8 }}>환율 데이터 없음</div>
      )}
      <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 8, marginBottom: 14 }}>숫자를 탭하여 수정 · Enter 또는 포커스 해제로 저장</div>
      {/* 적용 버튼 */}
      <button
        onClick={async () => {
          setApplying(true);
          await onUpdated();
          setApplying(false);
        }}
        disabled={applying}
        style={{
          width: "100%", padding: "12px 0", borderRadius: 14,
          border: "1px solid rgba(48,209,88,0.3)",
          background: "rgba(48,209,88,0.12)",
          color: applying ? "rgba(48,209,88,0.4)" : "rgba(80,220,120,0.9)",
          fontSize: 14, fontWeight: 600,
        }}
      >
        {applying ? "새로고침 중..." : "✓ 적용 (환율 반영)"}
      </button>
    </div>
  );
}

function PCTable({ expenses, rates }: { expenses: Expense[]; rates: ExchangeRate[] }) {
  return (
    <div className="rounded-xl bg-bg-elevated border border-border-default overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-default text-text-secondary text-xs">
            <th className="text-left p-3">구분</th>
            <th className="text-left p-3">Day</th>
            <th className="text-left p-3">도시</th>
            <th className="text-left p-3">내용</th>
            <th className="text-left p-3">카테고리</th>
            <th className="text-right p-3">원래 금액</th>
            <th className="text-right p-3">원화</th>
            <th className="text-left p-3">결제</th>
            <th className="text-left p-3">입력자</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp) => {
            const krw = convertToKRW(Number(exp.amount), exp.currency, exp.payment_method, rates);
            return (
              <tr key={exp.id} className="border-b border-border-default hover:bg-bg-hover">
                <td className="p-3">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${exp.expense_type === "pre_trip" ? "bg-purple-500/20 text-purple-300" : "bg-green-500/20 text-green-300"}`}>
                    {exp.expense_type === "pre_trip" ? "여행전" : "여행중"}
                  </span>
                </td>
                <td className="p-3 text-text-secondary">{exp.day_number ? `Day ${exp.day_number}` : "-"}</td>
                <td className="p-3 text-text-secondary">{exp.city || "-"}</td>
                <td className="p-3 text-text-primary">{exp.description}</td>
                <td className="p-3 text-text-secondary">{exp.category}</td>
                <td className="p-3 text-right text-text-primary">{formatAmount(Number(exp.amount), exp.currency)}</td>
                <td className="p-3 text-right font-medium text-text-primary">{formatKRW(krw)}</td>
                <td className="p-3 text-text-secondary">{PAYMENT_LABELS[exp.payment_method]}</td>
                <td className="p-3 text-text-secondary">{exp.paid_by}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {expenses.length === 0 && (
        <div className="text-center py-8 text-text-tertiary text-sm">아직 지출 내역이 없습니다</div>
      )}
    </div>
  );
}
