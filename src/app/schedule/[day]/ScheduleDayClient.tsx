"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { ScheduleDay, ScheduleItem } from "@/types";
import MobileHeader from "@/components/layout/MobileHeader";
import FAB from "@/components/layout/FAB";
import { TOTAL_DAYS } from "@/lib/constants";

const CITY_COLOR: Record<string, { bg: string; color: string }> = {
  "맨체스터": { bg: "rgba(10,132,255,0.15)",   color: "rgba(100,180,255,0.9)" },
  "리버풀":   { bg: "rgba(48,209,88,0.15)",   color: "rgba(80,210,120,0.9)" },
  "런던":     { bg: "rgba(255,159,10,0.15)",  color: "rgba(255,190,80,0.9)" },
  "옥스퍼드": { bg: "rgba(191,90,242,0.15)",  color: "rgba(210,140,255,0.9)" },
  "케임브리지":{ bg: "rgba(100,210,255,0.15)", color: "rgba(120,220,255,0.9)" },
  "더블린":   { bg: "rgba(255,107,107,0.15)", color: "rgba(255,140,140,0.9)" },
};

const TRANSPORT_OPTIONS = [
  { value: "", label: "없음" },
  { value: "walk", label: "🚶 도보" },
  { value: "subway", label: "🚇 지하철" },
  { value: "bus", label: "🚌 버스" },
  { value: "tram", label: "🚊 트램" },
  { value: "train", label: "🚂 기차" },
  { value: "taxi", label: "🚕 택시" },
];

function transportIcon(type: string | null) {
  const map: Record<string, string> = { subway: "🚇", bus: "🚌", walk: "🚶", tram: "🚊", train: "🚂", taxi: "🚕" };
  return type ? (map[type] ?? "📍") : null;
}

// 리퀴드 글래스 팝업 — 일정 아이템 편집
function EditItemPopup({ item, onSaved, onCancel, onDeleted }: {
  item: ScheduleItem;
  onSaved: () => void;
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description ?? "");
  const [timeStart, setTimeStart] = useState(item.time_start ?? "");
  const [timeEnd, setTimeEnd] = useState(item.time_end ?? "");
  const [transport, setTransport] = useState(item.transport_type ?? "");
  const [transportDetail, setTransportDetail] = useState(item.transport_detail ?? "");
  const [mapsUrl, setMapsUrl] = useState(item.google_maps_url ?? "");
  const [mapUrlsText, setMapUrlsText] = useState((item.map_urls ?? []).join("\n"));
  const [routeUrl, setRouteUrl] = useState(item.route_url ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    const parsedUrls = mapUrlsText.split("\n").map(s => s.trim()).filter(Boolean);
    await supabase.from("schedule_items").update({
      title: title.trim(),
      description: description.trim() || null,
      time_start: timeStart.trim() || null,
      time_end: timeEnd.trim() || null,
      transport_type: transport || null,
      transport_detail: transportDetail.trim() || null,
      google_maps_url: mapsUrl.trim() || null,
      map_urls: parsedUrls.length > 0 ? parsedUrls : [],
      route_url: routeUrl.trim() || null,
    }).eq("id", item.id);
    setSaving(false);
    onSaved();
  }

  async function handleDelete() {
    await supabase.from("schedule_items").delete().eq("id", item.id);
    onDeleted();
  }

  const inputStyle = { display: "block", width: "100%", padding: "11px 12px", background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 14 } as React.CSSProperties;

  if (typeof document === "undefined") return null;
  return createPortal(
    <>
      <div onClick={onCancel} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px) saturate(70%)", WebkitBackdropFilter: "blur(8px) saturate(70%)" }} />
      <div style={{
        position: "fixed", zIndex: 201, top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: "calc(100vw - 40px)", maxWidth: 380, maxHeight: "80vh", overflowY: "auto",
        borderRadius: 26,
        background: "rgba(30,32,36,0.55)",
        backdropFilter: "blur(60px) saturate(180%) brightness(1.1)",
        WebkitBackdropFilter: "blur(60px) saturate(180%) brightness(1.1)",
        border: "1px solid rgba(255,255,255,0.18)",
        boxShadow: "0 12px 60px rgba(0,0,0,0.55), inset 0 1.5px 0 rgba(255,255,255,0.13)",
        padding: "18px 16px 16px",
      }}>
        {/* 헤더 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>일정 수정</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleDelete} style={{ padding: "5px 10px", borderRadius: 10, border: "none", background: "rgba(255,69,58,0.2)", color: "#ff453a", fontSize: 12, fontWeight: 600 }}>삭제</button>
            <button onClick={onCancel} style={{ width: 28, height: 28, borderRadius: 14, background: "rgba(255,255,255,0.1)", border: "none", color: "rgba(255,255,255,0.55)", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
        </div>

        {/* 필드 */}
        <div style={{ borderRadius: 14, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", marginBottom: 10, overflow: "hidden" }}>
          {/* 제목 */}
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="일정 제목" style={{ ...inputStyle, fontWeight: 600 }} />
          <div style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />
          {/* 설명 */}
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="설명 (선택)" rows={2}
            style={{ ...inputStyle, resize: "none", lineHeight: 1.5 }} />
        </div>

        {/* 시간 */}
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <div style={{ flex: 1, borderRadius: 12, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", padding: "6px 12px 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>시작</div>
            <input value={timeStart} onChange={(e) => setTimeStart(e.target.value)} placeholder="09:00" maxLength={5}
              style={{ ...inputStyle, padding: "4px 12px 8px", fontSize: 15, fontWeight: 500 }} />
          </div>
          <div style={{ flex: 1, borderRadius: 12, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", padding: "6px 12px 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>종료</div>
            <input value={timeEnd} onChange={(e) => setTimeEnd(e.target.value)} placeholder="10:30" maxLength={5}
              style={{ ...inputStyle, padding: "4px 12px 8px", fontSize: 15, fontWeight: 500 }} />
          </div>
        </div>

        {/* 이동수단 */}
        <div style={{ borderRadius: 12, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", marginBottom: 10, overflow: "hidden" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", padding: "6px 12px 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>이동수단</div>
          <div style={{ display: "flex", gap: 4, padding: "6px 10px 10px", flexWrap: "wrap" }}>
            {TRANSPORT_OPTIONS.map((opt) => (
              <button key={opt.value} type="button" onClick={() => setTransport(opt.value)}
                style={{
                  padding: "5px 10px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 500,
                  background: transport === opt.value ? "rgba(10,132,255,0.35)" : "rgba(255,255,255,0.08)",
                  color: transport === opt.value ? "#0a84ff" : "rgba(255,255,255,0.55)",
                }}>
                {opt.label}
              </button>
            ))}
          </div>
          {transport && (
            <>
              <div style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />
              <input value={transportDetail} onChange={(e) => setTransportDetail(e.target.value)} placeholder="상세 (예: Elizabeth line · £12)"
                style={{ ...inputStyle, fontSize: 13 }} />
            </>
          )}
        </div>

        {/* 지도 URL (여러 개 줄바꿈) */}
        <div style={{ borderRadius: 12, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", marginBottom: 10, overflow: "hidden" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", padding: "6px 12px 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>지도 URL (여러 개는 줄바꿈)</div>
          <textarea value={mapUrlsText} onChange={(e) => setMapUrlsText(e.target.value)} placeholder={"https://maps.app.goo.gl/...\nhttps://maps.app.goo.gl/..."} rows={2}
            style={{ ...inputStyle, fontSize: 12, resize: "none", lineHeight: 1.5 }} />
        </div>
        {/* 동선 URL */}
        <div style={{ borderRadius: 12, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", marginBottom: 14, overflow: "hidden" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", padding: "6px 12px 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>동선 URL (Google Maps 길찾기)</div>
          <input value={routeUrl} onChange={(e) => setRouteUrl(e.target.value)} placeholder="https://www.google.com/maps/dir/..."
            style={{ ...inputStyle, fontSize: 12 }} />
        </div>

        {/* 버튼 */}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "11px 0", borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)", color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: 500 }}>취소</button>
          <button onClick={handleSave} disabled={saving || !title.trim()} style={{
            flex: 2, padding: "11px 0", borderRadius: 14,
            border: "1px solid rgba(10,132,255,0.5)",
            background: "linear-gradient(135deg, rgba(10,132,255,0.85) 0%, rgba(0,100,220,0.75) 100%)",
            backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
            boxShadow: "0 4px 20px rgba(10,132,255,0.35), inset 0 1px 0 rgba(255,255,255,0.25)",
            color: "#fff", fontSize: 15, fontWeight: 600,
          }}>{saving ? "저장 중..." : "저장"}</button>
        </div>
      </div>
    </>,
    document.body
  );
}

// 새 일정 추가 팝업
function AddItemPopup({ dayId, nextSeq, onSaved, onCancel }: {
  dayId: string;
  nextSeq: number;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeStart, setTimeStart] = useState("");
  const [timeEnd, setTimeEnd] = useState("");
  const [transport, setTransport] = useState("");
  const [transportDetail, setTransportDetail] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    await supabase.from("schedule_items").insert({
      day_id: dayId,
      seq: nextSeq,
      title: title.trim(),
      description: description.trim() || null,
      time_start: timeStart.trim() || null,
      time_end: timeEnd.trim() || null,
      transport_type: transport || null,
      transport_detail: transportDetail.trim() || null,
    });
    setSaving(false);
    onSaved();
  }

  const inputStyle = { display: "block", width: "100%", padding: "11px 12px", background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 14 } as React.CSSProperties;

  if (typeof document === "undefined") return null;
  return createPortal(
    <>
      <div onClick={onCancel} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px) saturate(70%)", WebkitBackdropFilter: "blur(8px) saturate(70%)" }} />
      <div style={{
        position: "fixed", zIndex: 201, top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: "calc(100vw - 40px)", maxWidth: 380, maxHeight: "80vh", overflowY: "auto",
        borderRadius: 26,
        background: "rgba(30,32,36,0.55)",
        backdropFilter: "blur(60px) saturate(180%) brightness(1.1)",
        WebkitBackdropFilter: "blur(60px) saturate(180%) brightness(1.1)",
        border: "1px solid rgba(255,255,255,0.18)",
        boxShadow: "0 12px 60px rgba(0,0,0,0.55), inset 0 1.5px 0 rgba(255,255,255,0.13)",
        padding: "18px 16px 16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>일정 추가</span>
          <button onClick={onCancel} style={{ width: 28, height: 28, borderRadius: 14, background: "rgba(255,255,255,0.1)", border: "none", color: "rgba(255,255,255,0.55)", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        <div style={{ borderRadius: 14, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", marginBottom: 10, overflow: "hidden" }}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="일정 제목" style={{ ...inputStyle, fontWeight: 600 }} />
          <div style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="설명 (선택)" rows={2}
            style={{ ...inputStyle, resize: "none" as const, lineHeight: 1.5 }} />
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <div style={{ flex: 1, borderRadius: 12, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", padding: "6px 12px 0", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>시작</div>
            <input value={timeStart} onChange={(e) => setTimeStart(e.target.value)} placeholder="09:00" maxLength={5} style={{ ...inputStyle, padding: "4px 12px 8px", fontSize: 15 }} />
          </div>
          <div style={{ flex: 1, borderRadius: 12, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", padding: "6px 12px 0", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>종료</div>
            <input value={timeEnd} onChange={(e) => setTimeEnd(e.target.value)} placeholder="10:30" maxLength={5} style={{ ...inputStyle, padding: "4px 12px 8px", fontSize: 15 }} />
          </div>
        </div>

        <div style={{ borderRadius: 12, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", marginBottom: 14, overflow: "hidden" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", padding: "6px 12px 0", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>이동수단</div>
          <div style={{ display: "flex", gap: 4, padding: "6px 10px 10px", flexWrap: "wrap" as const }}>
            {TRANSPORT_OPTIONS.map((opt) => (
              <button key={opt.value} type="button" onClick={() => setTransport(opt.value)}
                style={{ padding: "5px 10px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 500, background: transport === opt.value ? "rgba(10,132,255,0.35)" : "rgba(255,255,255,0.08)", color: transport === opt.value ? "#0a84ff" : "rgba(255,255,255,0.55)" }}>
                {opt.label}
              </button>
            ))}
          </div>
          {transport && (
            <>
              <div style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />
              <input value={transportDetail} onChange={(e) => setTransportDetail(e.target.value)} placeholder="상세 (예: Elizabeth line · £12)" style={{ ...inputStyle, fontSize: 13 }} />
            </>
          )}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "11px 0", borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)", color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: 500 }}>취소</button>
          <button onClick={handleSave} disabled={saving || !title.trim()} style={{
            flex: 2, padding: "11px 0", borderRadius: 14,
            border: title.trim() ? "1px solid rgba(10,132,255,0.5)" : "1px solid rgba(255,255,255,0.08)",
            background: title.trim() ? "linear-gradient(135deg, rgba(10,132,255,0.85), rgba(0,100,220,0.75))" : "rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
            boxShadow: title.trim() ? "0 4px 20px rgba(10,132,255,0.35), inset 0 1px 0 rgba(255,255,255,0.25)" : "none",
            color: title.trim() ? "#fff" : "rgba(255,255,255,0.25)", fontSize: 15, fontWeight: 600,
          }}>{saving ? "추가 중..." : "추가"}</button>
        </div>
      </div>
    </>,
    document.body
  );
}

export default function ScheduleDayClient({ dayNumber }: { dayNumber: number }) {
  const [dayInfo, setDayInfo] = useState<ScheduleDay | null>(null);
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  async function load() {
    const { data: dayData } = await supabase.from("schedule_days").select("*").eq("day_number", dayNumber).single();
    if (dayData) {
      setDayInfo(dayData);
      const { data: itemData } = await supabase.from("schedule_items").select("*").eq("day_id", dayData.id).order("seq");
      if (itemData) setItems(itemData);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [dayNumber]);

  return (
    <div style={{ minHeight: "100svh", background: "var(--bg-primary)" }}>
      <MobileHeader title={`Day ${dayNumber}`} />

      {/* 편집/추가 팝업 */}
      {editingItem && (
        <EditItemPopup
          item={editingItem}
          onSaved={() => { setEditingItem(null); load(); }}
          onCancel={() => setEditingItem(null)}
          onDeleted={() => { setEditingItem(null); load(); }}
        />
      )}
      {showAdd && dayInfo && (
        <AddItemPopup
          dayId={dayInfo.id}
          nextSeq={(items[items.length - 1]?.seq ?? 0) + 1}
          onSaved={() => { setShowAdd(false); load(); }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      <FAB onClick={() => setShowAdd((v) => !v)} label={showAdd ? "✕" : "+"} />

      <div className="px-4 pt-2 pb-28">
        {/* PC용 헤더 */}
        <div className="hidden md:block mb-6">
          <Link href="/schedule" className="text-text-tertiary hover:text-text-secondary text-sm mb-2 inline-block">← 전체 일정</Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Day {dayNumber}</h1>
            {dayInfo?.date && <span className="text-text-secondary text-sm">{dayInfo.date}</span>}
          </div>
          {dayInfo?.title && <h2 className="text-lg text-text-primary mt-1">{dayInfo.title}</h2>}
          {dayInfo?.summary && <p className="text-sm text-text-secondary mt-1">{dayInfo.summary}</p>}
        </div>

        {/* 모바일 Day 정보 */}
        <div className="md:hidden mb-3">
          {/* Day 네비 pills — Link 사용 (basePath 자동 적용) */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", marginBottom: 12, paddingBottom: 2 }}>
            {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map((d) => (
              <Link key={d} href={`/schedule/${d}`}
                style={{
                  flexShrink: 0, width: 34, height: 34,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: 17, fontSize: 13, fontWeight: 600, textDecoration: "none",
                  background: d === dayNumber ? "#0a84ff" : "var(--card-bg)",
                  color: d === dayNumber ? "#fff" : "var(--text-secondary)",
                }}>
                {d}
              </Link>
            ))}
          </div>

          <div style={{ marginBottom: 10, paddingTop: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
              {dayInfo?.title && (
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", lineHeight: 1.3 }}>{dayInfo.title}</span>
              )}
              {dayInfo?.city && (() => {
                const cc = CITY_COLOR[dayInfo.city!] ?? { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" };
                return <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 5, background: cc.bg, color: cc.color, fontWeight: 600 }}>{dayInfo.city}</span>;
              })()}
              {dayInfo?.date && <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{dayInfo.date}</span>}
              {/* 총 동선 인라인 버튼 */}
              {(dayInfo?.map_urls?.[0] ?? dayInfo?.google_maps_url) && (
                <a href={dayInfo!.map_urls?.[0] ?? dayInfo!.google_maps_url!} target="_blank" rel="noopener noreferrer"
                  style={{
                    fontSize: 10, padding: "1px 7px", borderRadius: 5, textDecoration: "none",
                    background: "rgba(10,132,255,0.1)", border: "1px solid rgba(10,132,255,0.2)",
                    color: "rgba(120,200,255,0.85)", fontWeight: 600,
                  }}>
                  총 동선
                </a>
              )}
            </div>
            {dayInfo?.summary && <p style={{ fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.4 }}>{dayInfo.summary}</p>}
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 rounded-2xl animate-pulse" style={{ background: "var(--card-bg)" }} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📋</p>
            <p style={{ fontSize: 15, color: "var(--text-tertiary)" }}>아직 등록된 일정이 없습니다</p>
            <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 6 }}>+ 버튼으로 추가해보세요</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {items.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setEditingItem(item)}
                className="active:opacity-70 transition-opacity cursor-pointer"
                style={{ display: "flex", gap: 10, padding: "9px 14px", borderRadius: 14, background: "var(--card-bg)" }}
              >
                {/* 시간 */}
                <div style={{ width: 38, flexShrink: 0, textAlign: "right", paddingTop: 2 }}>
                  {item.time_start && <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text-tertiary)" }}>{item.time_start}</div>}
                  {item.time_end && <div style={{ fontSize: 10, color: "var(--text-tertiary)", opacity: 0.55 }}>~{item.time_end}</div>}
                </div>
                {/* dot */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 3, flexShrink: 0, background: "#0a84ff" }} />
                  {idx < items.length - 1 && <div style={{ width: 1, flex: 1, marginTop: 3, background: "rgba(255,255,255,0.1)" }} />}
                </div>
                {/* 내용 */}
                <div style={{ flex: 1, paddingBottom: 2 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.3 }}>{item.title}</span>
                    {/* 지도 버튼 */}
                    {((item.map_urls?.length ?? 0) > 0 ? item.map_urls! : item.google_maps_url ? [item.google_maps_url] : []).map((url, i, arr) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          fontSize: 10, padding: "1px 6px", borderRadius: 4, textDecoration: "none",
                          background: "rgba(10,132,255,0.1)", color: "rgba(120,200,255,0.85)",
                          fontWeight: 600, flexShrink: 0, border: "1px solid rgba(10,132,255,0.15)",
                        }}>
                        지도{arr.length > 1 ? ` ${i + 1}` : ""}
                      </a>
                    ))}
                  </div>
                  {item.description && <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2, lineHeight: 1.4 }}>{item.description}</div>}
                  {item.transport_type && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>{transportIcon(item.transport_type)}</span>
                      <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>{item.transport_detail || item.transport_type}</span>
                      {/* 동선 버튼 */}
                      {item.route_url && (
                        <a href={item.route_url} target="_blank" rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            fontSize: 10, padding: "1px 6px", borderRadius: 4, textDecoration: "none",
                            background: "rgba(10,132,255,0.1)", color: "rgba(120,200,255,0.85)",
                            fontWeight: 600, flexShrink: 0, border: "1px solid rgba(10,132,255,0.15)",
                          }}>
                          동선
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

