"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { smartParse } from "@/lib/smartParse";
import { CATEGORIES, CITIES, PAYERS, CURRENCIES, PAYMENT_METHODS, CURRENCY_LABELS, PAYMENT_LABELS } from "@/lib/constants";

interface ExpenseFormProps {
  expenseType: "trip" | "pre_trip";
  dayNumber?: number;
  onAdded: () => void;
}

// iOS 스타일 row
function IosRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3" style={{ borderTop: "1px solid var(--border-default)" }}>
      <span className="text-[15px] w-20 flex-shrink-0" style={{ color: "var(--text-secondary)" } as React.CSSProperties}>{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

// iOS 스타일 세그먼트 컨트롤
function SegmentControl<T extends string>({
  options, labels, value, onChange,
}: { options: readonly T[]; labels: Record<string, string>; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: "var(--border-hover)" }}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className="flex-1 py-1.5 rounded-md text-[13px] font-medium transition-all"
          style={{
            background: value === opt ? "var(--bg-elevated)" : "transparent",
            color: value === opt ? "var(--text-primary)" : "var(--text-tertiary)",
          }}
        >
          {labels[opt] ?? opt}
        </button>
      ))}
    </div>
  );
}

export default function ExpenseForm({ expenseType, dayNumber, onAdded }: ExpenseFormProps) {
  const [smartText, setSmartText] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<string>("GBP");
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [category, setCategory] = useState<string>("기타");
  const [paidBy, setPaidBy] = useState<string>("n빵");
  const [city, setCity] = useState<string>("");
  const [time, setTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // dayNumber가 있으면 해당 day의 city 자동 로드
  useEffect(() => {
    if (!dayNumber) return;
    supabase
      .from("schedule_days")
      .select("city")
      .eq("day_number", dayNumber)
      .single()
      .then(({ data }) => {
        if (data?.city) setCity(data.city);
      });
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
    setErrorMsg(null);
    const { error } = await supabase.from("expenses").insert({
      expense_type: expenseType,
      day_number: expenseType === "trip" ? dayNumber : null,
      description,
      amount: parseFloat(amount),
      currency,
      payment_method: paymentMethod,
      category,
      paid_by: paidBy,
      city: city || null,
      time: time || null,
    });
    if (!error) {
      setSmartText(""); setDescription(""); setAmount("");
      setCurrency("GBP"); setPaymentMethod("card");
      setCategory("기타"); setPaidBy("n빵"); setTime("");
      // city는 trip의 경우 day 자동선택 유지, pre_trip은 초기화
      if (expenseType !== "trip") setCity("");
      onAdded();
    } else {
      setErrorMsg(error.message);
    }
    setSubmitting(false);
  }

  const inputCls = "w-full bg-transparent text-[15px] outline-none text-right";
  const selectCls = "w-full bg-transparent text-[15px] outline-none text-right appearance-none";

  return (
    <form onSubmit={handleSubmit}>
      {/* 빠른 입력 */}
      <div className="mb-3 px-4 pt-3 pb-3 rounded-2xl" style={{ background: "var(--card-bg)" }}>
        <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" } as React.CSSProperties}>빠른 입력</p>
        <input
          type="text"
          value={smartText}
          onChange={(e) => handleSmartInput(e.target.value)}
          placeholder="예: 커피 3파운드 카드 상윤"
          className="w-full bg-transparent text-[15px] outline-none"
        />
      </div>

      {/* iOS 그룹 */}
      <div className="rounded-2xl overflow-hidden mb-3" style={{ background: "var(--card-bg)" }}>
        {/* 내용 */}
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="text-[15px] w-20 flex-shrink-0" style={{ color: "var(--text-secondary)" } as React.CSSProperties}>내용</span>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="지출 내용"
            className={inputCls}
            required
          />
        </div>
        {/* 금액 */}
        <IosRow label="금액">
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className={inputCls}
            required
          />
        </IosRow>
        {/* 화폐 */}
        <IosRow label="화폐">
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={selectCls}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{CURRENCY_LABELS[c]}</option>)}
          </select>
        </IosRow>
        {/* 결제 */}
        <IosRow label="결제수단">
          <SegmentControl
            options={PAYMENT_METHODS}
            labels={PAYMENT_LABELS}
            value={paymentMethod as "card" | "cash"}
            onChange={(v) => setPaymentMethod(v)}
          />
        </IosRow>
      </div>

      {/* 카테고리 + 도시 + 인원 */}
      <div className="rounded-2xl overflow-hidden mb-3" style={{ background: "var(--card-bg)" }}>
        <IosRow label="카테고리">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </IosRow>
        <IosRow label="도시">
          <select value={city} onChange={(e) => setCity(e.target.value)} className={selectCls}>
            <option value="">미선택</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </IosRow>
        <IosRow label="결제자">
          <SegmentControl
            options={PAYERS}
            labels={{ "구도현": "도현", "김상윤": "상윤", "n빵": "n빵" }}
            value={paidBy as "구도현" | "김상윤" | "n빵"}
            onChange={(v) => setPaidBy(v)}
          />
        </IosRow>
        {expenseType === "trip" && (
          <IosRow label="시간">
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value.replace(/[^\d:]/g, ""))}
              onBlur={(e) => {
                const v = e.target.value.replace(/:/g, "");
                if (/^\d{3,4}$/.test(v)) {
                  setTime(`${v.slice(0, -2).padStart(2, "0")}:${v.slice(-2)}`);
                }
              }}
              placeholder="14:30"
              maxLength={5}
              className={inputCls}
            />
          </IosRow>
        )}
      </div>

      {errorMsg && (
        <p className="text-[13px] text-[#ff453a] text-center mb-3">{errorMsg}</p>
      )}

      {/* 추가 버튼 */}
      <button
        type="submit"
        disabled={submitting || !description || !amount}
        className="w-full py-3.5 rounded-2xl text-[17px] font-semibold transition-all"
        style={{
          background: submitting || !description || !amount
            ? "rgba(10,132,255,0.3)"
            : "#0a84ff",
          color: submitting || !description || !amount ? "rgba(255,255,255,0.3)" : "#fff",
        }}
      >
        {submitting ? "추가 중..." : "지출 추가"}
      </button>
    </form>
  );
}
