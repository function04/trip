"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { ExchangeRate } from "@/types";
import MobileHeader from "@/components/layout/MobileHeader";

const BG = "var(--bg-primary)";

const currencies = ["EUR", "GBP"] as const;
const methods = [
  { key: "card", label: "카드" },
  { key: "cash", label: "현금" },
] as const;
const symbol = (c: string) => c === "GBP" ? "£" : "€";

export default function ExchangeRatesPage() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saved, setSaved] = useState(false);

  async function fetchRates() {
    const { data } = await supabase.from("exchange_rates").select("*").order("currency").order("payment_method");
    if (data) setRates(data);
    setLoading(false);
  }

  useEffect(() => { fetchRates(); }, []);

  async function saveRate(id: string) {
    const val = parseFloat(editValue);
    if (isNaN(val)) { setEditingId(null); return; }
    await supabase.from("exchange_rates").update({ rate_to_krw: val, updated_at: new Date().toISOString() }).eq("id", id);
    setEditingId(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    fetchRates();
  }

  const rateMap: Record<string, ExchangeRate> = {};
  rates.forEach((r) => { rateMap[`${r.currency}_${r.payment_method}`] = r; });

  return (
    <div style={{ minHeight: "100svh", background: BG }}>
      <MobileHeader title="환율 설정" />

      {/* PC */}
      <div className="hidden md:block p-8">
        <h1 className="text-2xl font-bold mb-2">💱 환율 설정</h1>
        <p className="text-text-secondary text-sm mb-6">지출 원화 환산에 사용됩니다</p>
        <RateGrid rateMap={rateMap} editingId={editingId} editValue={editValue}
          setEditingId={setEditingId} setEditValue={setEditValue} saveRate={saveRate} />
      </div>

      {/* 모바일 */}
      <div className="md:hidden px-4 pt-1 pb-28">
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "var(--text-tertiary)", lineHeight: 1.5 }}>
            결제 수단과 화폐에 따라 환율을 개별 설정할 수 있어요.{"\n"}
            지출 입력 시 이 환율로 원화 변환됩니다.
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ height: 64, borderRadius: 14, background: "var(--card-bg)" }} className="animate-pulse" />
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {currencies.map((cur) =>
              methods.map((m) => {
                const rate = rateMap[`${cur}_${m.key}`];
                if (!rate) return null;
                const isEditing = editingId === rate.id;
                return (
                  <div key={`${cur}_${m.key}`} style={{
                    borderRadius: 16, padding: "14px 16px",
                    background: isEditing ? "rgba(10,132,255,0.1)" : "rgba(255,255,255,0.06)",
                    border: isEditing ? "1px solid rgba(10,132,255,0.4)" : "1px solid rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    transition: "all 0.2s",
                  }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
                        {symbol(cur)} {cur} — {m.label}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>
                        {cur === "GBP" ? "파운드" : "유로"} {m.label === "카드" ? "카드결제" : "현금"}
                      </div>
                    </div>

                    {isEditing ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveRate(rate.id)}
                          onKeyDown={(e) => e.key === "Enter" && saveRate(rate.id)}
                          style={{
                            width: 90, padding: "6px 10px", borderRadius: 10,
                            background: "rgba(10,132,255,0.2)", border: "1px solid rgba(10,132,255,0.5)",
                            color: "var(--text-primary)", fontSize: 15, fontWeight: 600,
                            outline: "none", textAlign: "right",
                          }}
                        />
                        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>원</span>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingId(rate.id); setEditValue(String(rate.rate_to_krw)); }}
                        style={{
                          padding: "6px 14px", borderRadius: 10, border: "none",
                          background: "var(--border-hover)",
                          color: "var(--text-primary)", fontSize: 15, fontWeight: 600,
                        }}>
                        {Number(rate.rate_to_krw).toLocaleString()}원
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {saved && (
          <div style={{
            position: "fixed", bottom: 40, left: "50%", transform: "translateX(-50%)",
            background: "rgba(48,209,88,0.9)", color: "var(--text-primary)",
            padding: "10px 20px", borderRadius: 20, fontSize: 13, fontWeight: 600,
            zIndex: 100,
          }}>
            ✓ 저장되었습니다
          </div>
        )}
      </div>
    </div>
  );
}

function RateGrid({ rateMap, editingId, editValue, setEditingId, setEditValue, saveRate }: {
  rateMap: Record<string, ExchangeRate>;
  editingId: string | null;
  editValue: string;
  setEditingId: (id: string | null) => void;
  setEditValue: (v: string) => void;
  saveRate: (id: string) => void;
}) {
  return (
    <div className="max-w-sm">
      {/* Header */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div />
        {methods.map((m) => (
          <div key={m.key} className="text-center text-xs text-text-tertiary">{m.label}</div>
        ))}
      </div>
      {currencies.map((cur) => (
        <div key={cur} className="grid grid-cols-3 gap-2 mb-2 items-center">
          <div className="text-sm text-text-secondary font-medium">{symbol(cur)} {cur}</div>
          {methods.map((m) => {
            const rate = rateMap[`${cur}_${m.key}`];
            if (!rate) return <div key={m.key} />;
            return (
              <div key={m.key} className="text-center">
                {editingId === rate.id ? (
                  <input type="number" value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => saveRate(rate.id)}
                    onKeyDown={(e) => e.key === "Enter" && saveRate(rate.id)}
                    className="w-full bg-bg-elevated border border-accent-blue rounded px-1 py-0.5 text-center text-text-primary text-xs outline-none"
                    />
                ) : (
                  <button onClick={() => { setEditingId(rate.id); setEditValue(String(rate.rate_to_krw)); }}
                    className="w-full text-xs text-text-primary hover:text-accent-blue rounded px-1 py-0.5 hover:bg-bg-elevated transition-colors">
                    {Number(rate.rate_to_krw).toLocaleString()}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
