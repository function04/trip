"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";
import type { ChecklistItem } from "@/types";
import MobileHeader from "@/components/layout/MobileHeader";
import FAB from "@/components/layout/FAB";

const BG = "var(--bg-primary)";

export default function ChecklistPage() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"todo" | "done">("todo");

  // 추가 모달
  const [showAddModal, setShowAddModal] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [saving, setSaving] = useState(false);

  // 수정 모달
  const [editItem, setEditItem] = useState<ChecklistItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  async function fetchItems() {
    const { data } = await supabase.from("checklist_items").select("*").order("sort_order").order("created_at");
    if (data) setItems(data);
    setLoading(false);
  }

  useEffect(() => { fetchItems(); }, []);

  async function toggleCheck(id: string, current: boolean) {
    await supabase.from("checklist_items").update({ is_checked: !current }).eq("id", id);
    fetchItems();
  }

  async function handleAdd() {
    if (!addTitle.trim()) return;
    setSaving(true);
    await supabase.from("checklist_items").insert({ title: addTitle.trim(), description: addDesc.trim() || null, sort_order: items.length });
    setAddTitle(""); setAddDesc(""); setShowAddModal(false); setSaving(false);
    fetchItems();
  }

  async function handleEdit() {
    if (!editItem || !editTitle.trim()) return;
    setSaving(true);
    await supabase.from("checklist_items").update({ title: editTitle.trim(), description: editDesc.trim() || null }).eq("id", editItem.id);
    setEditItem(null); setSaving(false);
    fetchItems();
  }

  async function handleDelete(id: string) {
    await supabase.from("checklist_items").delete().eq("id", id);
    if (editItem?.id === id) setEditItem(null);
    fetchItems();
  }

  function openEdit(item: ChecklistItem) {
    setEditItem(item);
    setEditTitle(item.title);
    setEditDesc(item.description ?? "");
  }

  const todoItems = items.filter(i => !i.is_checked);
  const doneItems = items.filter(i => i.is_checked);
  const displayItems = tab === "todo" ? todoItems : doneItems;

  const modalStyle = {
    position: "fixed" as const, zIndex: 201,
    top: "50%", left: "50%",
    transform: "translate(-50%, -50%)",
    width: "calc(100vw - 40px)",
    maxWidth: 340,
    borderRadius: 26,
    background: "rgba(30,32,36,0.55)",
    backdropFilter: "blur(60px) saturate(180%) brightness(1.1)",
    WebkitBackdropFilter: "blur(60px) saturate(180%) brightness(1.1)",
    border: "1px solid rgba(255,255,255,0.18)",
    boxShadow: "0 12px 60px rgba(0,0,0,0.55), inset 0 1.5px 0 rgba(255,255,255,0.13)",
    padding: "20px 18px 18px",
  };

  const overlayStyle = {
    position: "fixed" as const, inset: 0, zIndex: 200,
    background: "rgba(0,0,0,0.45)",
    backdropFilter: "blur(8px) saturate(70%)",
    WebkitBackdropFilter: "blur(8px) saturate(70%)",
  };

  return (
    <div style={{ minHeight: "100svh", background: BG }}>
      <MobileHeader title="준비사항" />

      {/* PC */}
      <div className="hidden md:block p-8">
        <h1 className="text-2xl font-bold mb-2">✅ 준비사항</h1>
        {items.length > 0 && <p className="text-text-secondary text-sm mb-6">{doneItems.length}/{items.length} 완료</p>}
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-4 rounded-xl bg-bg-elevated border border-border-default">
              <div onClick={() => toggleCheck(item.id, item.is_checked)}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 cursor-pointer ${item.is_checked ? "bg-accent-green border-accent-green" : "border-text-tertiary"}`}>
                {item.is_checked && <span className="text-white text-xs">✓</span>}
              </div>
              <div className="flex-1 cursor-pointer" onClick={() => openEdit(item)}>
                <div className={`text-sm ${item.is_checked ? "line-through text-text-tertiary" : "text-text-primary"}`}>{item.title}</div>
                {item.description && <div className="text-xs text-text-tertiary mt-0.5">{item.description}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 모바일 */}
      <div className="md:hidden px-4 pt-3 pb-28">
        {/* 진행률 */}
        {items.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>진행률</span>
              <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{doneItems.length}/{items.length}</span>
            </div>
            <div style={{ height: 3, borderRadius: 2, background: "var(--border-hover)" }}>
              <div style={{ height: "100%", borderRadius: 2, background: "#30d158", width: `${items.length ? (doneItems.length / items.length) * 100 : 0}%`, transition: "width 0.3s" }} />
            </div>
          </div>
        )}

        {/* 탭 */}
        <div style={{
          display: "flex", gap: 0, background: "var(--card-bg)",
          borderRadius: 10, padding: 3, marginBottom: 12,
        }}>
          {(["todo", "done"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                flex: 1, padding: "7px 0", borderRadius: 7, border: "none",
                background: tab === t ? "var(--bg-elevated)" : "transparent",
                color: tab === t ? "var(--text-primary)" : "var(--text-tertiary)",
                fontSize: 12, fontWeight: 600, transition: "all 0.2s",
              }}>
              {t === "todo" ? `미완료 ${todoItems.length}` : `완료 ${doneItems.length}`}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ height: 42, borderRadius: 10, background: "var(--card-bg)" }} className="animate-pulse" />
            ))}
          </div>
        ) : displayItems.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 60, color: "var(--text-tertiary)" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>{tab === "todo" ? "🎉" : "🗒"}</div>
            <div style={{ fontSize: 13 }}>{tab === "todo" ? "모두 완료했어요!" : "완료된 항목이 없어요"}</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {displayItems.map((item) => (
              <div key={item.id}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 12px", borderRadius: 10,
                  background: "var(--card-bg)",
                  border: "1px solid var(--border-default)",
                  opacity: item.is_checked ? 0.6 : 1,
                }}
              >
                {/* 체크 버튼 */}
                <div onClick={() => toggleCheck(item.id, item.is_checked)}
                  style={{
                    width: 20, height: 20, borderRadius: 10, flexShrink: 0,
                    border: item.is_checked ? "none" : "1.5px solid var(--border-hover)",
                    background: item.is_checked ? "#30d158" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                  }}>
                  {item.is_checked && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}
                </div>
                {/* 텍스트 — 누르면 수정 팝업 */}
                <div style={{ flex: 1, cursor: "pointer" }} onClick={() => openEdit(item)}>
                  <div style={{ fontSize: 13, color: "var(--text-primary)", textDecoration: item.is_checked ? "line-through" : "none", lineHeight: 1.3 }}>{item.title}</div>
                  {item.description && <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 1 }}>{item.description}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <FAB onClick={() => setShowAddModal(true)} />

      {/* 추가 모달 */}
      {showAddModal && typeof document !== "undefined" && createPortal(
        <>
          <div onClick={() => setShowAddModal(false)} style={overlayStyle} />
          <div style={modalStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>준비사항 추가</span>
              <button type="button" onClick={() => setShowAddModal(false)}
                style={{ width: 28, height: 28, borderRadius: 14, background: "rgba(255,255,255,0.1)", border: "none", color: "rgba(255,255,255,0.55)", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                ✕
              </button>
            </div>
            <div style={{ borderRadius: 14, overflow: "hidden", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", marginBottom: 12 }}>
              <input value={addTitle} onChange={(e) => setAddTitle(e.target.value)}
                placeholder="항목 이름"
                style={{ display: "block", width: "100%", padding: "12px 14px", background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 14 }} />
              <div style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />
              <input value={addDesc} onChange={(e) => setAddDesc(e.target.value)}
                placeholder="메모 (선택)"
                style={{ display: "block", width: "100%", padding: "12px 14px", background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 14 }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowAddModal(false)}
                style={{ flex: 1, padding: "11px 0", borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: 500 }}>취소</button>
              <button onClick={handleAdd} disabled={!addTitle.trim() || saving}
                style={{
                  flex: 2, padding: "11px 0", borderRadius: 14,
                  border: addTitle.trim() ? "1px solid rgba(10,132,255,0.5)" : "1px solid rgba(255,255,255,0.08)",
                  background: addTitle.trim() ? "linear-gradient(135deg, rgba(10,132,255,0.85), rgba(0,100,220,0.75))" : "rgba(255,255,255,0.06)",
                  color: addTitle.trim() ? "#fff" : "rgba(255,255,255,0.25)", fontSize: 15, fontWeight: 600,
                }}>
                {saving ? "추가 중..." : "추가"}
              </button>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* 수정 모달 */}
      {editItem && typeof document !== "undefined" && createPortal(
        <>
          <div onClick={() => setEditItem(null)} style={overlayStyle} />
          <div style={modalStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>항목 수정</span>
              <button type="button" onClick={() => setEditItem(null)}
                style={{ width: 28, height: 28, borderRadius: 14, background: "rgba(255,255,255,0.1)", border: "none", color: "rgba(255,255,255,0.55)", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                ✕
              </button>
            </div>
            <div style={{ borderRadius: 14, overflow: "hidden", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", marginBottom: 12 }}>
              <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                placeholder="항목 이름"
                style={{ display: "block", width: "100%", padding: "12px 14px", background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 14 }} />
              <div style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />
              <input value={editDesc} onChange={(e) => setEditDesc(e.target.value)}
                placeholder="메모 (선택)"
                style={{ display: "block", width: "100%", padding: "12px 14px", background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 14 }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => handleDelete(editItem.id)}
                style={{ flex: 1, padding: "11px 0", borderRadius: 14, border: "1px solid rgba(255,80,80,0.3)", background: "rgba(255,60,60,0.12)", color: "rgba(255,100,100,0.8)", fontSize: 14, fontWeight: 500 }}>삭제</button>
              <button onClick={handleEdit} disabled={!editTitle.trim() || saving}
                style={{
                  flex: 2, padding: "11px 0", borderRadius: 14,
                  border: editTitle.trim() ? "1px solid rgba(10,132,255,0.5)" : "1px solid rgba(255,255,255,0.08)",
                  background: editTitle.trim() ? "linear-gradient(135deg, rgba(10,132,255,0.85), rgba(0,100,220,0.75))" : "rgba(255,255,255,0.06)",
                  color: editTitle.trim() ? "#fff" : "rgba(255,255,255,0.25)", fontSize: 15, fontWeight: 600,
                }}>
                {saving ? "수정 중..." : "수정"}
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
