"use client";

import { createPortal } from "react-dom";

interface ExpenseFormPopupProps {
  expenseType: "trip" | "pre_trip";
  dayNumber?: number;
  onAdded: () => void;
  onCancel: () => void;
}

export default function ExpenseFormPopup({ expenseType, dayNumber, onAdded, onCancel }: ExpenseFormPopupProps) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <>
      {/* 딤 배경 */}
      <div
        onClick={onCancel}
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(8px) saturate(70%)",
          WebkitBackdropFilter: "blur(8px) saturate(70%)",
        }}
      />
      {/* 팝업 카드 */}
      <div style={{
        position: "fixed", zIndex: 201,
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "calc(100vw - 40px)",
        maxWidth: 390,
        maxHeight: "80vh",
        overflowY: "auto",
        borderRadius: 26,
        background: "rgba(30,32,36,0.55)",
        backdropFilter: "blur(60px) saturate(180%) brightness(1.1)",
        WebkitBackdropFilter: "blur(60px) saturate(180%) brightness(1.1)",
        border: "1px solid rgba(255,255,255,0.18)",
        boxShadow: "0 12px 60px rgba(0,0,0,0.55), inset 0 1.5px 0 rgba(255,255,255,0.13), inset 0 -1px 0 rgba(0,0,0,0.2)",
        padding: "16px 16px 20px",
      }}>
        {/* 헤더 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: "-0.2px" }}>
            지출 추가
          </span>
          <button
            type="button"
            onClick={onCancel}
            style={{
              width: 28, height: 28, borderRadius: 14,
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "rgba(255,255,255,0.55)",
              fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        <ExpenseFormInPopup expenseType={expenseType} dayNumber={dayNumber} onAdded={onAdded} />
      </div>
    </>,
    document.body
  );
}

// 팝업 내부 전용 인라인 폼 (select → InlinePicker 사용)
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { smartParse } from "@/lib/smartParse";
import { CATEGORIES, TRIP_CATEGORIES, CITIES, PAYERS, CURRENCIES, PAYMENT_METHODS, CURRENCY_LABELS, PAYMENT_LABELS } from "@/lib/constants";

function InlinePicker({ options, labels, value, onChange }: {
  options: readonly string[];
  labels?: Record<string, string>;
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const displayLabel = labels ? (labels[value] ?? value) : value;
  return (
    <div style={{ textAlign: "right" }}>
      <button type="button" onClick={() => setOpen((v) => !v)}
        style={{
          background: "none", border: "none", padding: 0,
          fontSize: 14, color: "rgba(255,255,255,0.85)", fontWeight: 500,
          display: "flex", alignItems: "center", gap: 4, marginLeft: "auto",
        }}
      >
        {displayLabel || "미선택"}
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{
          marginTop: 6, borderRadius: 10,
          overflow: "hidden auto",
          maxHeight: 180,
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          {options.map((opt, idx) => (
            <button key={opt} type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              style={{
                display: "block", width: "100%", padding: "9px 12px",
                textAlign: "right", border: "none",
                borderTop: idx === 0 ? "none" : "1px solid rgba(255,255,255,0.06)",
                background: value === opt ? "rgba(10,132,255,0.2)" : "transparent",
                color: value === opt ? "#0a84ff" : "rgba(255,255,255,0.75)",
                fontSize: 13, fontWeight: value === opt ? 600 : 400,
              }}
            >
              {labels ? (labels[opt] ?? opt) : opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SegmentControl<T extends string>({
  options, labels, value, onChange,
}: { options: readonly T[]; labels: Record<string, string>; value: T; onChange: (v: T) => void }) {
  return (
    <div style={{ display: "flex", gap: 2, padding: 2, borderRadius: 8, background: "rgba(255,255,255,0.08)" }}>
      {options.map((opt) => (
        <button key={opt} type="button" onClick={() => onChange(opt)}
          style={{
            flex: 1, padding: "6px 0", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 500,
            background: value === opt ? "rgba(255,255,255,0.18)" : "transparent",
            color: value === opt ? "#fff" : "rgba(255,255,255,0.4)",
          }}>
          {labels[opt] ?? opt}
        </button>
      ))}
    </div>
  );
}

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 0", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", width: 60, flexShrink: 0, paddingTop: 2 }}>{label}</span>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

function ExpenseFormInPopup({ expenseType, dayNumber, onAdded }: {
  expenseType: "trip" | "pre_trip";
  dayNumber?: number;
  onAdded: () => void;
}) {
  const [smartText, setSmartText] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("GBP");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [category, setCategory] = useState("기타");
  const [paidBy, setPaidBy] = useState("n빵");
  const [city, setCity] = useState("");
  const [time, setTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!dayNumber) return;
    supabase.from("schedule_days").select("city").eq("day_number", dayNumber).single()
      .then(({ data }) => { if (data?.city) setCity(data.city); });
  }, [dayNumber]);

  function handleSmartInput(text: string) {
    setSmartText(text);
    const parsed = smartParse(text);
    if (parsed.description) setDescription(parsed.description);
    if (parsed.amount !== undefined) setAmount(String(parsed.amount));
    if (parsed.currency) setCurrency(parsed.currency);
    if (parsed.paymentMethod) setPaymentMethod(parsed.paymentMethod);
    if (parsed.paidBy) setPaidBy(parsed.paidBy);
    if (parsed.category) setCategory(parsed.category);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description || !amount) return;
    setSubmitting(true);
    const { error } = await supabase.from("expenses").insert({
      expense_type: expenseType,
      day_number: expenseType === "trip" ? dayNumber : null,
      description, amount: parseFloat(amount),
      currency, payment_method: paymentMethod,
      category, paid_by: paidBy,
      city: city || null, time: time || null,
    });
    if (!error) {
      onAdded();
    }
    setSubmitting(false);
  }

  const inputCls = "bg-transparent text-[14px] outline-none text-right w-full";

  const canSubmit = !submitting && !!description && !!amount;

  return (
    <form onSubmit={handleSubmit}>
      {/* 빠른 입력 */}
      <div style={{
        padding: "10px 12px", borderRadius: 14, marginBottom: 10,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}>
        <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>
          빠른 입력
        </p>
        <input
          type="text"
          value={smartText}
          onChange={(e) => handleSmartInput(e.target.value)}
          placeholder="예: 커피 3파운드 카드 상윤"
          className={inputCls}
          style={{ textAlign: "left", color: "rgba(255,255,255,0.85)", fontSize: 14 }}
        />
      </div>

      {/* 폼 필드 */}
      <div style={{ borderRadius: 14, background: "rgba(255,255,255,0.06)", padding: "0 12px", marginBottom: 12 }}>
        {/* 내용 */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0" }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", width: 60, flexShrink: 0 }}>내용</span>
          <input value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="지출 내용" required
            className={inputCls} style={{ color: "#fff" }} />
        </div>
        <FormRow label="금액">
          <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00" required className={inputCls} style={{ color: "#fff" }} />
        </FormRow>
        <FormRow label="화폐">
          <InlinePicker options={[...CURRENCIES]} labels={CURRENCY_LABELS} value={currency} onChange={setCurrency} />
        </FormRow>
        <FormRow label="결제">
          <SegmentControl options={PAYMENT_METHODS} labels={PAYMENT_LABELS} value={paymentMethod as any} onChange={setPaymentMethod} />
        </FormRow>
        <FormRow label="카테고리">
          <InlinePicker options={expenseType === "trip" ? [...TRIP_CATEGORIES] : [...CATEGORIES]} value={category} onChange={setCategory} />
        </FormRow>
        <FormRow label="도시">
          <InlinePicker options={["", ...CITIES]} labels={{ "": "미선택" }} value={city} onChange={setCity} />
        </FormRow>
        <FormRow label="결제자">
          <SegmentControl options={PAYERS} labels={{ "구도현": "도현", "김상윤": "상윤", "n빵": "n빵" }} value={paidBy as any} onChange={setPaidBy} />
        </FormRow>
        {expenseType === "trip" && (
          <FormRow label="시간">
            <input value={time} onChange={(e) => {
              const raw = e.target.value;
              const digits = raw.replace(/[^0-9]/g, '');
              if (digits.length >= 4 && !raw.includes(':')) {
                setTime(`${digits.slice(0, 2)}:${digits.slice(2, 4)}`);
              } else {
                setTime(raw);
              }
            }} placeholder="14:30"
              maxLength={5} className={inputCls} style={{ color: "#fff" }} />
          </FormRow>
        )}
      </div>

      {/* 추가 버튼 — 리퀴드 글래스 */}
      <button
        type="submit"
        disabled={!canSubmit}
        style={{
          width: "100%", padding: "13px 0", borderRadius: 16,
          border: canSubmit ? "1px solid rgba(10,132,255,0.5)" : "1px solid rgba(255,255,255,0.08)",
          // 리퀴드 글래스 파란 버튼
          background: canSubmit
            ? "linear-gradient(135deg, rgba(10,132,255,0.85) 0%, rgba(0,100,220,0.75) 100%)"
            : "rgba(255,255,255,0.06)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: canSubmit
            ? "0 4px 20px rgba(10,132,255,0.35), inset 0 1px 0 rgba(255,255,255,0.25)"
            : "none",
          color: canSubmit ? "#fff" : "rgba(255,255,255,0.25)",
          fontSize: 15, fontWeight: 600,
        }}
      >
        {submitting ? "추가 중..." : "지출 추가"}
      </button>
    </form>
  );
}
