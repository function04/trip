"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { ScheduleDay, ScheduleItem } from "@/types";
import { TOTAL_DAYS } from "@/lib/constants";
import MobileHeader from "@/components/layout/MobileHeader";

const TRANSPORT_ICON: Record<string, string> = { subway: "🚇", bus: "🚌", walk: "🚶", tram: "🚊", train: "🚂", taxi: "🚕" };

const CITY_COLOR: Record<string, { bg: string; color: string }> = {
  "맨체스터": { bg: "rgba(10,132,255,0.15)",   color: "rgba(100,180,255,0.9)" },
  "리버풀":   { bg: "rgba(48,209,88,0.15)",   color: "rgba(80,210,120,0.9)" },
  "런던":     { bg: "rgba(255,159,10,0.15)",  color: "rgba(255,190,80,0.9)" },
  "옥스퍼드": { bg: "rgba(191,90,242,0.15)",  color: "rgba(210,140,255,0.9)" },
  "케임브리지":{ bg: "rgba(100,210,255,0.15)", color: "rgba(120,220,255,0.9)" },
  "더블린":   { bg: "rgba(255,107,107,0.15)", color: "rgba(255,140,140,0.9)" },
};

function ItemDetailPopup({ item, onClose }: { item: ScheduleItem & { day_number: number; day_title: string | null }; onClose: () => void }) {
  const itemUrls = (item.map_urls?.length ?? 0) > 0 ? item.map_urls! : item.google_maps_url ? [item.google_maps_url] : [];
  if (typeof document === "undefined") return null;
  return createPortal(
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px) saturate(70%)", WebkitBackdropFilter: "blur(8px) saturate(70%)" }} />
      <div style={{
        position: "fixed", zIndex: 301, top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: "calc(100vw - 40px)", maxWidth: 380, maxHeight: "80vh", overflowY: "auto",
        borderRadius: 26,
        background: "rgba(30,32,36,0.72)",
        backdropFilter: "blur(60px) saturate(180%) brightness(1.1)",
        WebkitBackdropFilter: "blur(60px) saturate(180%) brightness(1.1)",
        border: "1px solid rgba(255,255,255,0.18)",
        boxShadow: "0 12px 60px rgba(0,0,0,0.6), inset 0 1.5px 0 rgba(255,255,255,0.13)",
        padding: "18px 18px 20px",
      }}>
        {/* 헤더 */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: "#0a84ff", fontWeight: 700, marginBottom: 4 }}>Day {item.day_number}{item.day_title ? ` · ${item.day_title}` : ""}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.95)", lineHeight: 1.3 }}>{item.title}</div>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 14, background: "rgba(255,255,255,0.1)", border: "none", color: "rgba(255,255,255,0.55)", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
        </div>

        {/* 시간 */}
        {(item.time_start || item.time_end) && (
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>🕐</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
              {item.time_start}{item.time_end ? ` ~ ${item.time_end}` : ""}
            </span>
          </div>
        )}

        {/* 설명 */}
        {item.description && (
          <div style={{
            fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.6,
            padding: "10px 12px", borderRadius: 12, background: "rgba(255,255,255,0.06)",
            marginBottom: 12,
          }}>
            {item.description}
          </div>
        )}

        {/* 이동수단 */}
        {item.transport_type && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14 }}>{TRANSPORT_ICON[item.transport_type] ?? "📍"}</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{item.transport_detail || item.transport_type}</span>
            {item.route_url && (
              <a href={item.route_url} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, textDecoration: "none", background: "rgba(10,132,255,0.15)", color: "rgba(120,200,255,0.9)", fontWeight: 600, border: "1px solid rgba(10,132,255,0.2)" }}>
                동선
              </a>
            )}
          </div>
        )}

        {/* 지도 버튼들 */}
        {itemUrls.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {itemUrls.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                style={{
                  flex: 1, minWidth: 80, padding: "10px 0", borderRadius: 12, textDecoration: "none", textAlign: "center",
                  background: "rgba(10,132,255,0.15)", color: "rgba(120,200,255,0.95)",
                  fontSize: 13, fontWeight: 600, border: "1px solid rgba(10,132,255,0.25)",
                }}>
                📍 지도{itemUrls.length > 1 ? ` ${i + 1}` : ""}
              </a>
            ))}
          </div>
        )}
      </div>
    </>,
    document.body
  );
}

// 텍스트 내 #태그를 파싱해 클릭 시 해당 id 섹션으로 스크롤
function RichText({ text }: { text: string }) {
  // #으로 시작하는 단어 매칭 (한글, 영문, 숫자, 공백 전까지)
  const parts = text.split(/(#[\w가-힣]+)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("#")) {
          const tag = part.slice(1); // # 제거
          return (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                // schedule-item-id 방식 대신 텍스트로 검색
                const all = document.querySelectorAll("[data-tag]");
                for (const el of Array.from(all)) {
                  if ((el as HTMLElement).dataset.tag === tag) {
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                    break;
                  }
                }
              }}
              style={{
                background: "none", border: "none", padding: 0, cursor: "pointer",
                color: "#0a84ff", fontWeight: 600, fontSize: "inherit",
              }}
            >
              {part}
            </button>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export default function SchedulePage() {
  const [days, setDays] = useState<ScheduleDay[]>([]);
  const [allItems, setAllItems] = useState<(ScheduleItem & { day_number: number; day_title: string | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [detailItem, setDetailItem] = useState<(ScheduleItem & { day_number: number; day_title: string | null }) | null>(null);

  // 전체일정 시트 스와이프-닫기
  const sheetSwipeStartX = useRef<number | null>(null);
  const sheetSwipeStartY = useRef<number | null>(null);
  function onSheetTouchStart(e: React.TouchEvent) {
    sheetSwipeStartX.current = e.touches[0].clientX;
    sheetSwipeStartY.current = e.touches[0].clientY;
  }
  function onSheetTouchEnd(e: React.TouchEvent) {
    if (sheetSwipeStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - sheetSwipeStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - (sheetSwipeStartY.current ?? 0));
    sheetSwipeStartX.current = null;
    // 오른쪽으로 80px 이상, 세로 이동보다 가로가 클 때
    if (dx > 80 && dx > dy) setShowAll(false);
  }

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("schedule_days").select("*").order("day_number");
      if (data) {
        setDays(data);
        // 총일정용 — 모든 아이템 로드
        const { data: items } = await supabase
          .from("schedule_items")
          .select("*, schedule_days(day_number, title)")
          .order("seq");
        if (items) {
          const flat = items.map((i: any) => ({
            ...i,
            day_number: i.schedule_days?.day_number,
            day_title: i.schedule_days?.title,
          }));
          setAllItems(flat);
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  const BG = "var(--bg-primary)";

  return (
    <div style={{ minHeight: "100svh", background: BG }}>
      <MobileHeader title="일정" />

      {/* PC */}
      <div className="hidden md:block p-8">
        <h1 className="text-2xl font-bold mb-6">📅 일정</h1>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {days.map((day) => (
            <Link key={day.id} href={`/schedule/${day.day_number}`}
              className="block p-5 rounded-xl bg-bg-elevated border border-border-default hover:bg-bg-hover transition-all">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-white">Day {day.day_number}</span>
                {day.date && <span className="text-xs text-text-tertiary">{day.date}</span>}
              </div>
              <p className="text-sm text-text-secondary">{day.title || "일정 미정"}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* 모바일 */}
      <div className="md:hidden px-4 pt-3 pb-28">
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ height: 72, borderRadius: 14, background: "var(--card-bg)" }} className="animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* 총일정 버튼 */}
            <button
              onClick={() => setShowAll(true)}
              style={{
                width: "100%", padding: "12px 16px", borderRadius: 14, marginBottom: 14,
                background: "var(--card-bg)", border: "1px solid var(--border-default)",
                color: "var(--text-primary)", fontSize: 15, fontWeight: 600, textAlign: "left",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}
            >
              <span>📋 전체 일정 보기</span>
              <span style={{ color: "var(--text-tertiary)", fontSize: 18 }}>›</span>
            </button>

            {/* 3열 그리드 — Day 1~12 + allItems의 커스텀 섹션(13+) 자동 추가 */}
            {(() => {
              // allItems에서 day_number > 12인 고유 섹션 추출 (순서 유지)
              const extraNums = Array.from(new Set(allItems.filter(i => i.day_number > 12).map(i => i.day_number))).sort((a, b) => a - b);
              return (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                  {/* Day 1~12 */}
                  {days.map((day) => (
                    <Link key={day.id} href={`/schedule/${day.day_number}`}
                      style={{ textDecoration: "none" }}
                      className="active:scale-95 transition-transform duration-100"
                    >
                      <div style={{
                        borderRadius: 14, padding: "10px 10px",
                        background: "var(--card-bg)", border: "1px solid var(--border-default)",
                        height: 80, display: "flex", flexDirection: "column", overflow: "hidden",
                      }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", paddingBottom: 6 }}>Day {day.day_number}</div>
                        <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 6, flexShrink: 0 }} />
                        <div style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {day.title || (day.date ?? "미정")}
                        </div>
                      </div>
                    </Link>
                  ))}
                  {/* Day 12 이후 커스텀 섹션 — 전체일정에서 앵커로 이동 */}
                  {extraNums.map((n) => {
                    const extraDay = days.find(d => d.day_number === n);
                    const label = extraDay?.title ?? `섹션 ${n}`;
                    return (
                      <button key={n}
                        onClick={() => setShowAll(true)}
                        className="active:scale-95 transition-transform duration-100"
                        style={{
                          borderRadius: 14, padding: "10px 10px", textAlign: "left",
                          background: "var(--card-bg)", border: "1px solid var(--border-default)",
                          height: 80, display: "flex", flexDirection: "column", overflow: "hidden",
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#0a84ff", paddingBottom: 6, lineHeight: 1.2, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {label}
                        </div>
                        <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 6, flexShrink: 0 }} />
                        <div style={{ fontSize: 10, color: "var(--text-tertiary)", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          전체 일정 보기 ›
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })()}
          </>
        )}
      </div>

      {/* 총일정 풀스크린 시트 */}
      {detailItem && <ItemDetailPopup item={detailItem} onClose={() => setDetailItem(null)} />}

      {showAll && (
        <div
          onTouchStart={onSheetTouchStart}
          onTouchEnd={onSheetTouchEnd}
          style={{ position: "fixed", inset: 0, zIndex: 100, background: "var(--bg-primary)", overflowY: "auto" }}
        >
          {/* 스티키 헤더 */}
          <div style={{
            position: "sticky", top: 0, zIndex: 10,
            background: "var(--header-bg)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid var(--border-default)",
          }}>
            <div style={{ padding: "11px 20px", display: "flex", alignItems: "center", gap: 10 }}>
              <Link href="/" onClick={() => setShowAll(false)} style={{ color: "var(--text-primary)", textDecoration: "none", fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", opacity: 0.9, flexShrink: 0 }}>PLANNER</Link>
              <span style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 300 }}>|</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>전체 일정</span>
            </div>
          </div>

          <div style={{ padding: "14px 14px 80px" }}>
            {/* 상단 소개 */}
            <div style={{
              borderRadius: 14, padding: "14px 16px", marginBottom: 14,
              background: "var(--card-bg)", border: "1px solid var(--border-default)",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>🇬🇧🇮🇪 영국·아일랜드 12일</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                맨체스터 1박 → 리버풀 당일 → 런던 5박 (옥스포드·케임브리지 당일) → 더블린 2박<br/>
                런던패스 3일 (Day 6~8) · 안필드 · Book of Kells · Howth 절벽 · 기네스<br/>
                <span style={{fontSize: 11, color: "var(--text-tertiary)"}}>예정: 2027년 12월 말 · 2인 (구도현, 김상윤)</span>
              </div>
            </div>

            {/* # 앵커 모음 — allItems 기준으로 자동 생성 (MCP로 섹션 추가 시 자동 확장) */}
            {allItems.length > 0 && (() => {
              // day_number 기준 오름차순 정렬 (Day 1~12 먼저, 이후 특수 섹션)
              const uniqueDayNums = Array.from(new Set(allItems.map(i => i.day_number))).sort((a, b) => a - b);
              return (
                <div style={{
                  borderRadius: 14, padding: "10px 12px", marginBottom: 16,
                  background: "var(--card-bg)", border: "1px solid var(--border-default)",
                }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {uniqueDayNums.map((dayNum) => {
                      const dayInfo = days.find(d => d.day_number === dayNum);
                      const isExtra = dayNum > 12;
                      const label = isExtra
                        ? (dayInfo?.title ?? `섹션 ${dayNum}`)
                        : `Day ${dayNum}`;
                      return (
                        <button
                          key={dayNum}
                          onClick={() => {
                            const el = document.getElementById(`schedule-day-${dayNum}`);
                            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                          }}
                          style={{
                            padding: "4px 8px", borderRadius: 6, border: "none",
                            background: isExtra ? "rgba(10,132,255,0.12)" : "rgba(255,255,255,0.07)",
                            color: isExtra ? "rgba(100,180,255,0.9)" : "var(--text-primary)",
                            fontSize: 11, fontWeight: isExtra ? 600 : 500, cursor: "pointer",
                          }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* 일정 리스트 — allItems unique day_number 기준 (MCP 추가 섹션 자동 포함) */}
            {allItems.length === 0 ? (
              <div style={{ textAlign: "center", paddingTop: 60, color: "var(--text-tertiary)" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
                <div style={{ fontSize: 14 }}>아직 등록된 일정이 없습니다</div>
              </div>
            ) : (
              Array.from(new Set(allItems.map(i => i.day_number))).sort((a, b) => a - b).map((dayNum) => {
                const dayItems = allItems.filter((i) => i.day_number === dayNum);
                const day = days.find(d => d.day_number === dayNum);
                const sectionTitle = dayNum > 12
                  ? (day?.title ?? `섹션 ${dayNum}`)
                  : `Day ${dayNum}${day?.title ? ` · ${day.title}` : ""}`;
                return (
                  <div key={dayNum} id={`schedule-day-${dayNum}`} style={{ marginBottom: 18, scrollMarginTop: 56 }}>
                    {/* Day 헤더 */}
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6, paddingLeft: 2, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, color: "#0a84ff", fontWeight: 700 }}>#</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>{sectionTitle}</span>
                      {day?.city && (() => {
                        const cc = CITY_COLOR[day.city!] ?? { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" };
                        return <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 5, background: cc.bg, color: cc.color, fontWeight: 600 }}>{day.city}</span>;
                      })()}
                      {/* 총 동선 버튼 — 하나만 */}
                      {(day?.map_urls?.[0] ?? day?.google_maps_url) && (
                        <a href={day!.map_urls?.[0] ?? day!.google_maps_url!} target="_blank" rel="noopener noreferrer"
                          style={{
                            fontSize: 10, padding: "2px 7px", borderRadius: 5, textDecoration: "none",
                            background: "rgba(10,132,255,0.12)", color: "rgba(120,200,255,0.85)",
                            fontWeight: 600, letterSpacing: "0.02em",
                          }}>
                          총 동선
                        </a>
                      )}
                    </div>
                    {/* 아이템 */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      {dayItems.map((item) => {
                        const fullText = `${item.title ?? ""} ${item.description ?? ""}`;
                        const tags = (fullText.match(/#([\w가-힣]+)/g) ?? []).map((t) => t.slice(1));
                        const itemUrls = (item.map_urls?.length ?? 0) > 0 ? item.map_urls! : item.google_maps_url ? [item.google_maps_url] : [];
                        return (
                          <div key={item.id} id={`schedule-item-${item.id}`}
                            {...(tags.length > 0 ? { "data-tag": tags[0] } : {})}
                            onClick={() => setDetailItem(item)}
                            className="active:opacity-70 transition-opacity cursor-pointer"
                            style={{
                              padding: "7px 11px", borderRadius: 10,
                              background: "var(--card-bg)",
                              display: "flex", gap: 8, alignItems: "flex-start",
                            }}>
                            {item.time_start && (
                              <span style={{ fontSize: 10, color: "var(--text-tertiary)", minWidth: 34, paddingTop: 2, flexShrink: 0 }}>
                                {item.time_start}
                              </span>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                                <span style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 500 }}>
                                  <RichText text={item.title} />
                                </span>
                                {itemUrls.map((url, i) => (
                                  <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                      fontSize: 10, padding: "1px 6px", borderRadius: 4, textDecoration: "none",
                                      background: "rgba(10,132,255,0.1)", color: "rgba(120,200,255,0.8)",
                                      fontWeight: 600, flexShrink: 0,
                                    }}>
                                    지도{itemUrls.length > 1 ? ` ${i + 1}` : ""}
                                  </a>
                                ))}
                                {item.route_url && (
                                  <a href={item.route_url} target="_blank" rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                      fontSize: 10, padding: "1px 6px", borderRadius: 4, textDecoration: "none",
                                      background: "rgba(10,132,255,0.1)", color: "rgba(120,200,255,0.8)",
                                      fontWeight: 600, flexShrink: 0,
                                    }}>
                                    동선
                                  </a>
                                )}
                              </div>
                              {item.description && (
                                <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 1, lineHeight: 1.4 }}>
                                  <RichText text={item.description} />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
