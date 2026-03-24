"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";
import type { Accommodation } from "@/types";
import { TOTAL_DAYS } from "@/lib/constants";
import MobileHeader from "@/components/layout/MobileHeader";
import FAB from "@/components/layout/FAB";

const BG = "var(--bg-primary)";

export default function AccommodationsPage() {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingAccom, setEditingAccom] = useState<Accommodation | null>(null);

  // form state
  const [dayNum, setDayNum] = useState(1);
  const [name, setName] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [resNum, setResNum] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [notes, setNotes] = useState("");

  async function fetchData() {
    const { data } = await supabase.from("accommodations").select("*").order("day_number");
    if (data) setAccommodations(data);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  async function handleAdd() {
    if (!name.trim()) return;
    setSaving(true);
    await supabase.from("accommodations").insert({
      day_number: dayNum,
      name: name.trim(),
      check_in_time: checkIn.trim() || null,
      check_out_time: checkOut.trim() || null,
      reservation_number: resNum.trim() || null,
      google_maps_url: mapsUrl.trim() || null,
      notes: notes.trim() || null,
    });
    setName(""); setCheckIn(""); setCheckOut(""); setResNum(""); setMapsUrl(""); setNotes("");
    setShowModal(false); setSaving(false);
    fetchData();
  }

  async function handleDelete(id: string) {
    await supabase.from("accommodations").delete().eq("id", id);
    fetchData();
  }

  function openEdit(accom: Accommodation) {
    setEditingAccom(accom);
    setDayNum(accom.day_number);
    setName(accom.name);
    setCheckIn(accom.check_in_time ?? "");
    setCheckOut(accom.check_out_time ?? "");
    setResNum(accom.reservation_number ?? "");
    setMapsUrl(accom.google_maps_url ?? "");
    setNotes(accom.notes ?? "");
    setShowModal(true);
  }

  async function handleEdit() {
    if (!editingAccom || !name.trim()) return;
    setSaving(true);
    await supabase.from("accommodations").update({
      day_number: dayNum,
      name: name.trim(),
      check_in_time: checkIn.trim() || null,
      check_out_time: checkOut.trim() || null,
      reservation_number: resNum.trim() || null,
      google_maps_url: mapsUrl.trim() || null,
      notes: notes.trim() || null,
    }).eq("id", editingAccom.id);
    setEditingAccom(null);
    setName(""); setCheckIn(""); setCheckOut(""); setResNum(""); setMapsUrl(""); setNotes("");
    setShowModal(false); setSaving(false);
    fetchData();
  }

  const byDay: Record<number, Accommodation[]> = {};
  accommodations.forEach((a) => {
    if (!byDay[a.day_number]) byDay[a.day_number] = [];
    byDay[a.day_number].push(a);
  });

  return (
    <div style={{ minHeight: "100svh", background: BG }}>
      <MobileHeader title="숙소" />

      {/* PC */}
      <div className="hidden md:block p-8">
        <h1 className="text-2xl font-bold mb-6">🏨 숙소정보</h1>
        <div className="space-y-4">
          {accommodations.length === 0 ? (
            <p className="text-text-secondary">등록된 숙소가 없습니다.</p>
          ) : (
            Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map((day) => {
              const dayAccom = byDay[day];
              if (!dayAccom) return null;
              return dayAccom.map((accom) => (
                <div key={accom.id} className="p-5 rounded-xl bg-bg-elevated border border-border-default">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-accent-blue">Day {accom.day_number}</span>
                    {accom.google_maps_url && (
                      <a href={accom.google_maps_url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-blue hover:underline">📍 지도 보기</a>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">{accom.name}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {accom.check_in_time && <div><span className="text-text-tertiary">체크인: </span><span>{accom.check_in_time}</span></div>}
                    {accom.check_out_time && <div><span className="text-text-tertiary">체크아웃: </span><span>{accom.check_out_time}</span></div>}
                    {accom.reservation_number && <div className="col-span-2"><span className="text-text-tertiary">예약번호: </span><span className="font-mono">{accom.reservation_number}</span></div>}
                  </div>
                  {accom.notes && <p className="text-sm text-text-secondary mt-2 pt-2 border-t border-border-default">{accom.notes}</p>}
                </div>
              ));
            })
          )}
        </div>
      </div>

      {/* 모바일 */}
      <div className="md:hidden px-4 pt-1 pb-28">
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ height: 90, borderRadius: 14, background: "var(--card-bg)" }} className="animate-pulse" />
            ))}
          </div>
        ) : accommodations.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 80, color: "var(--text-tertiary)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏨</div>
            <div style={{ fontSize: 15 }}>아직 등록된 숙소가 없어요</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>+ 버튼으로 추가해보세요</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map((day) => {
              const dayAccom = byDay[day];
              if (!dayAccom) return null;
              return dayAccom.map((accom) => (
                <div key={accom.id}
                  onClick={() => openEdit(accom)}
                  className="active:opacity-70 transition-opacity cursor-pointer"
                  style={{
                    borderRadius: 14, padding: "14px",
                    background: "var(--card-bg)",
                    border: "1px solid var(--border-default)",
                  }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, color: "#0a84ff", fontWeight: 600 }}>Day {accom.day_number}</span>
                        {accom.google_maps_url && (
                          <a href={accom.google_maps_url} target="_blank" rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              fontSize: 10, padding: "1px 6px", borderRadius: 4, textDecoration: "none",
                              background: "rgba(10,132,255,0.1)", color: "rgba(120,200,255,0.85)",
                              fontWeight: 600, border: "1px solid rgba(10,132,255,0.15)",
                            }}>
                            지도
                          </a>
                        )}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 5 }}>{accom.name}</div>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        {accom.check_in_time && (
                          <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>체크인 <span style={{ color: "var(--text-secondary)" }}>{accom.check_in_time}</span></div>
                        )}
                        {accom.check_out_time && (
                          <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>체크아웃 <span style={{ color: "var(--text-secondary)" }}>{accom.check_out_time}</span></div>
                        )}
                      </div>
                      {accom.reservation_number && (
                        <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 3, fontFamily: "monospace" }}>
                          예약번호: {accom.reservation_number}
                        </div>
                      )}
                      {accom.notes && (
                        <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 5, paddingTop: 5, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                          {accom.notes}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: 11, color: "var(--text-tertiary)", flexShrink: 0, paddingTop: 2 }}>›</span>
                  </div>
                </div>
              ));
            })}
          </div>
        )}
      </div>

      <FAB onClick={() => { setShowModal((v) => !v); if (showModal) setEditingAccom(null); }} label={showModal ? "✕" : "+"} />

      {/* 입력 모달 — iOS 중앙 팝업 (리퀴드 글래스) */}
      {showModal && typeof document !== "undefined" && createPortal(
        <>
          <div onClick={() => { setShowModal(false); setEditingAccom(null); }} style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(8px) saturate(70%)",
            WebkitBackdropFilter: "blur(8px) saturate(70%)",
          }} />
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>{editingAccom ? "숙소 수정" : "숙소 추가"}</span>
              <button type="button" onClick={() => { setShowModal(false); setEditingAccom(null); }}
                style={{ width: 28, height: 28, borderRadius: 14, background: "rgba(255,255,255,0.1)", border: "none", color: "rgba(255,255,255,0.55)", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                ✕
              </button>
            </div>

            {/* Day 선택 — Day 12는 귀국일이라 숙소 없음 */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Day</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {Array.from({ length: TOTAL_DAYS - 1 }, (_, i) => i + 1).map((d) => (
                  <button key={d} onClick={() => setDayNum(d)}
                    style={{
                      width: 36, height: 36, borderRadius: 10, border: "none",
                      background: dayNum === d
                        ? "linear-gradient(135deg, rgba(10,132,255,0.85), rgba(0,100,220,0.75))"
                        : "rgba(255,255,255,0.08)",
                      color: dayNum === d ? "#fff" : "rgba(255,255,255,0.45)",
                      fontSize: 13, fontWeight: 600,
                      boxShadow: dayNum === d ? "0 2px 10px rgba(10,132,255,0.3), inset 0 1px 0 rgba(255,255,255,0.2)" : "none",
                    }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* 입력 필드 */}
            <div style={{ borderRadius: 14, overflow: "hidden", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", marginBottom: 12 }}>
              {[
                { val: name, set: setName, ph: "숙소 이름" },
                { val: checkIn, set: setCheckIn, ph: "체크인 시간 (예: 15:00)" },
                { val: checkOut, set: setCheckOut, ph: "체크아웃 시간 (예: 11:00)" },
                { val: resNum, set: setResNum, ph: "예약번호 (선택)" },
                { val: mapsUrl, set: setMapsUrl, ph: "구글 지도 URL (선택)" },
                { val: notes, set: setNotes, ph: "메모 (선택)" },
              ].map((f, i, arr) => (
                <div key={i}>
                  <input value={f.val} onChange={(e) => f.set(e.target.value)}
                    placeholder={f.ph}
                    style={{ display: "block", width: "100%", padding: "12px 14px", background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 14 }} />
                  {i < arr.length - 1 && <div style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />}
                </div>
              ))}
            </div>

            {/* 버튼 */}
            <div style={{ display: "flex", gap: 8 }}>
              {editingAccom ? (
                <button onClick={async () => { await handleDelete(editingAccom.id); setShowModal(false); setEditingAccom(null); }}
                  style={{ flex: 1, padding: "11px 0", borderRadius: 14, border: "1px solid rgba(255,80,80,0.3)", background: "rgba(255,60,60,0.12)", backdropFilter: "blur(10px)", color: "rgba(255,100,100,0.8)", fontSize: 14, fontWeight: 500 }}>
                  삭제
                </button>
              ) : (
                <button onClick={() => { setShowModal(false); setEditingAccom(null); }}
                  style={{ flex: 1, padding: "11px 0", borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)", color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: 500 }}>
                  취소
                </button>
              )}
              <button onClick={editingAccom ? handleEdit : handleAdd} disabled={!name.trim() || saving}
                style={{
                  flex: 2, padding: "11px 0", borderRadius: 14,
                  border: name.trim() ? "1px solid rgba(10,132,255,0.5)" : "1px solid rgba(255,255,255,0.08)",
                  background: name.trim()
                    ? "linear-gradient(135deg, rgba(10,132,255,0.85) 0%, rgba(0,100,220,0.75) 100%)"
                    : "rgba(255,255,255,0.06)",
                  backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                  boxShadow: name.trim() ? "0 4px 20px rgba(10,132,255,0.35), inset 0 1px 0 rgba(255,255,255,0.25)" : "none",
                  color: name.trim() ? "#fff" : "rgba(255,255,255,0.25)",
                  fontSize: 15, fontWeight: 600,
                }}>
                {saving ? (editingAccom ? "수정 중..." : "추가 중...") : (editingAccom ? "수정" : "추가")}
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
