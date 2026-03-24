"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { ScheduleDay, ScheduleItem } from "@/types";
import MobileHeader from "@/components/layout/MobileHeader";
import { getTodayDayNumber } from "@/lib/todayDay";

const BG = "var(--bg-primary)";

export default function TodaySchedulePage() {
  const [dayInfo, setDayInfo] = useState<ScheduleDay | null>(null);
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  const todayDay = getTodayDayNumber();

  useEffect(() => {
    async function load() {
      if (!todayDay) { setLoading(false); return; }
      const { data: dayData } = await supabase
        .from("schedule_days")
        .select("*")
        .eq("day_number", todayDay)
        .single();
      if (dayData) {
        setDayInfo(dayData);
        const { data: itemData } = await supabase
          .from("schedule_items")
          .select("*")
          .eq("day_id", dayData.id)
          .order("seq");
        if (itemData) setItems(itemData);
      }
      setLoading(false);
    }
    load();
  }, [todayDay]);

  const transportIcon = (type: string | null) => {
    switch (type) {
      case "subway": return "🚇";
      case "bus":    return "🚌";
      case "walk":   return "🚶";
      case "tram":   return "🚊";
      case "train":  return "🚂";
      case "taxi":   return "🚕";
      default:       return "📍";
    }
  };

  return (
    <div style={{ minHeight: "100svh", background: BG }}>
      <MobileHeader
        title={todayDay ? `Day ${todayDay} · 오늘 일정` : "오늘 일정"}
      />

      {/* PC */}
      <div className="hidden md:block p-8">
        <h1 className="text-2xl font-bold mb-2">
          {todayDay ? `📅 Day ${todayDay} 일정` : "📅 오늘 일정"}
        </h1>
        {dayInfo?.title && <p className="text-text-secondary mb-4">{dayInfo.title}</p>}
        {todayDay ? (
          <Link href={`/schedule/${todayDay}`} className="text-accent-blue text-sm hover:underline">
            전체 일정 보기 →
          </Link>
        ) : (
          <p className="text-text-secondary">여행 기간이 아닙니다.</p>
        )}
      </div>

      {/* 모바일 */}
      <div className="md:hidden px-4 pt-3 pb-4">
        {/* 오늘 날짜 — 항상 표시 (영국 시간 기준) */}
        <div style={{
          fontSize: 13, fontWeight: 600, color: "var(--text-secondary)",
          marginBottom: 14, paddingLeft: 2,
        }}>
          {new Intl.DateTimeFormat("ko-KR", {
            year: "numeric", month: "long", day: "numeric", weekday: "short",
            timeZone: "Europe/London",
          }).format(new Date())}
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ height: 62, borderRadius: 16, background: "var(--card-bg)" }} className="animate-pulse" />
            ))}
          </div>
        ) : !todayDay ? (
          /* 여행 기간 아님 */
          <div style={{ textAlign: "center", paddingTop: 80, color: "var(--text-tertiary)" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✈️</div>
            <div style={{ fontSize: 17, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
              아직 여행 중이 아니에요
            </div>
            <div style={{ fontSize: 13, color: "var(--text-tertiary)", lineHeight: 1.6 }}>
              여행이 시작되면<br />오늘의 일정이 여기에 표시돼요
            </div>
            <Link href="/schedule"
              style={{
                display: "inline-block", marginTop: 28,
                padding: "11px 24px", borderRadius: 14,
                background: "var(--card-bg)",
                border: "1px solid var(--border-hover)",
                color: "var(--text-secondary)", fontSize: 14, fontWeight: 600,
                textDecoration: "none",
              }}>
              전체 일정 보기
            </Link>
          </div>
        ) : (
          <>
            {/* Day 헤더 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "6px 12px", borderRadius: 20,
                background: "var(--card-bg)",
                border: "1px solid var(--border-hover)",
                marginBottom: 8,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: 3, background: "var(--border-hover)" }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
                  Day {todayDay} · 오늘
                </span>
              </div>
              {dayInfo?.title && (
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>{dayInfo.title}</div>
              )}
              {dayInfo?.date && (
                <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{dayInfo.date}</div>
              )}
              {dayInfo?.summary && (
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.5 }}>{dayInfo.summary}</div>
              )}
              {dayInfo?.google_maps_url && (
                <a
                  href={dayInfo.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    marginTop: 10, padding: "9px 14px", borderRadius: 12,
                    background: "var(--card-bg)",
                    border: "1px solid var(--border-default)",
                    color: "var(--text-secondary)", fontSize: 13, fontWeight: 500,
                    textDecoration: "none",
                  }}
                >
                  🗺️ 오늘 동선 보기
                </a>
              )}
            </div>

            {/* 일정 리스트 */}
            {items.length === 0 ? (
              <div style={{ textAlign: "center", paddingTop: 40, color: "var(--text-tertiary)" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
                <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>아직 등록된 일정이 없어요</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {items.map((item, idx) => {
                  const itemUrls = (item.map_urls?.length ?? 0) > 0 ? item.map_urls! : item.google_maps_url ? [item.google_maps_url] : [];
                  return (
                    <div key={item.id} style={{
                      display: "flex", gap: 10,
                      padding: "9px 14px", borderRadius: 14,
                      background: "var(--card-bg)",
                    }}>
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
                          {itemUrls.map((url, i, arr) => (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer"
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
                            {item.route_url && (
                              <a href={item.route_url} target="_blank" rel="noopener noreferrer"
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
                  );
                })}
              </div>
            )}

            {/* 전체 일정 링크 */}
            <Link href={`/schedule/${todayDay}`}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                marginTop: 16, padding: "12px", borderRadius: 14,
                background: "var(--card-bg)",
                border: "1px solid var(--border-default)",
                color: "var(--text-secondary)", fontSize: 13,
                textDecoration: "none", gap: 4,
              }}>
              Day {todayDay} 상세 보기 ›
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
