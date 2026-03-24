"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";
import { formatAmount } from "@/lib/currency";
import { CATEGORIES, CITIES, PAYERS, CURRENCIES, PAYMENT_METHODS, CURRENCY_LABELS, PAYMENT_LABELS } from "@/lib/constants";
import type { Expense } from "@/types";

interface ExpenseListProps {
  expenses: Expense[];
  onDeleted: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  식비: "#c87941", 카페: "#8b6bb5", 지하철: "#4a7fc1", 트램: "#4a7fc1",
  버스: "#4a7fc1", 택시: "#4fa870", 기차: "#4a7fc1", 숙소: "#b85c5c",
  항공: "#b85c5c", 티켓: "#b8a040", 기념품: "#a05070", 쇼핑: "#a05070",
  마트: "#4fa870", 통신: "#4a8fa0", 기타: "#6b7280",
};

function getCategoryEmoji(cat: string): string {
  const map: Record<string, string> = {
    식비: "🍽", 카페: "☕", 지하철: "🚇", 트램: "🚊", 버스: "🚌",
    택시: "🚕", 기차: "🚂", 숙소: "🏨", 항공: "✈️", 티켓: "🎫",
    기념품: "🛍", 쇼핑: "🛍", 마트: "🛒", 통신: "📱", 기타: "💳",
  };
  return map[cat] ?? "💳";
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

// 팝업 내부용 커스텀 인라인 피커
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
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
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
            <button
              key={opt}
              type="button"
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

function EditRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 0", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", width: 60, flexShrink: 0, paddingTop: 2 }}>{label}</span>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

function EditPopup({ exp, onSaved, onCancel }: { exp: Expense; onSaved: () => void; onCancel: () => void }) {
  const [description, setDescription] = useState(exp.description);
  const [amount, setAmount] = useState(String(exp.amount));
  const [currency, setCurrency] = useState(exp.currency);
  const [paymentMethod, setPaymentMethod] = useState(exp.payment_method);
  const [category, setCategory] = useState(exp.category);
  const [paidBy, setPaidBy] = useState(exp.paid_by);
  const [city, setCity] = useState(exp.city ?? "");
  const [time, setTime] = useState(exp.time ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!description || !amount) return;
    setSaving(true);
    await supabase.from("expenses").update({
      description, amount: parseFloat(amount),
      currency, payment_method: paymentMethod,
      category, paid_by: paidBy,
      city: city || null, time: time || null,
    }).eq("id", exp.id);
    setSaving(false);
    onSaved();
  }

  const inputCls = "bg-transparent text-[14px] outline-none text-right w-full";

  if (typeof document === "undefined") return null;
  return createPortal(
    <>
      {/* 딤 배경 */}
      <div onClick={onCancel} style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(8px) saturate(70%)",
        WebkitBackdropFilter: "blur(8px) saturate(70%)",
      }} />
      {/* 팝업 카드 — 리퀴드 글래스 */}
      <div style={{
        position: "fixed", zIndex: 201,
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "calc(100vw - 40px)",
        maxWidth: 360,
        maxHeight: "80vh",
        overflowY: "auto",
        borderRadius: 26,
        background: "rgba(30,32,36,0.55)",
        backdropFilter: "blur(60px) saturate(180%) brightness(1.1)",
        WebkitBackdropFilter: "blur(60px) saturate(180%) brightness(1.1)",
        border: "1px solid rgba(255,255,255,0.18)",
        boxShadow: "0 12px 60px rgba(0,0,0,0.55), inset 0 1.5px 0 rgba(255,255,255,0.13), inset 0 -1px 0 rgba(0,0,0,0.2)",
        padding: "20px 18px 18px",
      }}>
        {/* 헤더 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: `${CATEGORY_COLORS[exp.category] ?? "#6b7280"}22`,
            fontSize: 16,
          }}>
            {getCategoryEmoji(exp.category)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {exp.description}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
              {formatAmount(Number(exp.amount), exp.currency)}
            </div>
          </div>
        </div>

        {/* 폼 필드 */}
        <div style={{ borderRadius: 14, background: "rgba(255,255,255,0.06)", padding: "0 12px", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0" }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", width: 60, flexShrink: 0 }}>내용</span>
            <input value={description} onChange={(e) => setDescription(e.target.value)}
              className={inputCls} style={{ color: "#fff" }} />
          </div>
          <EditRow label="금액">
            <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
              className={inputCls} style={{ color: "#fff" }} />
          </EditRow>
          <EditRow label="화폐">
            <InlinePicker options={[...CURRENCIES]} labels={CURRENCY_LABELS} value={currency} onChange={(v) => setCurrency(v as any)} />
          </EditRow>
          <EditRow label="결제">
            <SegmentControl options={PAYMENT_METHODS} labels={PAYMENT_LABELS} value={paymentMethod} onChange={(v) => setPaymentMethod(v)} />
          </EditRow>
          <EditRow label="카테고리">
            <InlinePicker options={[...CATEGORIES]} value={category} onChange={setCategory} />
          </EditRow>
          <EditRow label="도시">
            <InlinePicker options={["", ...CITIES]} labels={{ "": "미선택" }} value={city} onChange={setCity} />
          </EditRow>
          <EditRow label="결제자">
            <SegmentControl options={PAYERS} labels={{ "구도현": "도현", "김상윤": "상윤", "n빵": "n빵" }} value={paidBy} onChange={(v) => setPaidBy(v)} />
          </EditRow>
          {exp.expense_type === "trip" && (
            <EditRow label="시간">
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
            </EditRow>
          )}
        </div>

        {/* 버튼 */}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onCancel}
            style={{
              flex: 1, padding: "11px 0", borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
              color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: 500,
            }}>
            취소
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{
              flex: 2, padding: "11px 0", borderRadius: 14,
              border: "1px solid rgba(10,132,255,0.5)",
              background: "linear-gradient(135deg, rgba(10,132,255,0.85) 0%, rgba(0,100,220,0.75) 100%)",
              backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
              boxShadow: "0 4px 20px rgba(10,132,255,0.35), inset 0 1px 0 rgba(255,255,255,0.25)",
              color: "#fff", fontSize: 14, fontWeight: 600,
            }}>
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}

export default function ExpenseList({ expenses, onDeleted }: ExpenseListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    await supabase.from("expenses").delete().eq("id", id);
    onDeleted();
  }

  const editingExp = expenses.find((e) => e.id === editingId) ?? null;

  if (expenses.length === 0) {
    return (
      <div style={{ textAlign: "center", paddingTop: 48, paddingBottom: 24 }}>
        <p style={{ fontSize: 36, marginBottom: 8 }}>📝</p>
        <p style={{ fontSize: 14, color: "var(--text-tertiary)" }}>아직 지출 내역이 없습니다</p>
      </div>
    );
  }

  return (
    <>
      {editingExp && (
        <EditPopup
          exp={editingExp}
          onSaved={() => { setEditingId(null); onDeleted(); }}
          onCancel={() => setEditingId(null)}
        />
      )}

      <div style={{ borderRadius: 16, overflow: "hidden", background: "var(--card-bg)" }}>
        {expenses.map((exp, idx) => (
          <div
            key={exp.id}
            onClick={() => setEditingId(exp.id)}
            className="group active:opacity-70 transition-opacity"
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 14px", cursor: "pointer",
              borderTop: idx === 0 ? "none" : "1px solid var(--border-default)",
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: `${CATEGORY_COLORS[exp.category] ?? "#6b7280"}1a`,
              fontSize: 16,
            }}>
              <span>{getCategoryEmoji(exp.category)}</span>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {exp.description}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2, display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                <span>{exp.category}</span>
                {exp.city && <><span>·</span><span>{exp.city}</span></>}
                <span>·</span>
                <span>{PAYMENT_LABELS[exp.payment_method]}</span>
                <span>·</span>
                <span>{exp.paid_by}</span>
                {exp.time && <><span>·</span><span>{exp.time}</span></>}
              </div>
            </div>

            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                {formatAmount(Number(exp.amount), exp.currency)}
              </div>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(exp.id); }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                width: 22, height: 22, borderRadius: 11, flexShrink: 0, marginLeft: 2,
                background: "var(--bg-elevated)", color: "var(--text-secondary)",
                border: "none", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
