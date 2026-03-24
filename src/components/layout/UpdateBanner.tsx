"use client";

import { useEffect, useRef, useState } from "react";

const POLL_INTERVAL = 30_000; // 30초마다 확인
const VERSION_URL = "/trip/version.json";

export default function UpdateBanner() {
  const [show, setShow] = useState(false);
  const initialVersion = useRef<string | null>(null);

  useEffect(() => {
    async function fetchVersion(): Promise<string | null> {
      try {
        const res = await fetch(`${VERSION_URL}?t=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) return null;
        const json = await res.json();
        return json.v ?? null;
      } catch {
        return null;
      }
    }

    async function init() {
      const v = await fetchVersion();
      if (!v || v === "dev") return;

      const stored = sessionStorage.getItem("appVersion");
      if (!stored) {
        // 최초 방문: 현재 버전 저장
        sessionStorage.setItem("appVersion", v);
        initialVersion.current = v;
      } else if (stored !== v) {
        // 이전 세션 버전과 다르면 즉시 배너 표시
        setShow(true);
        sessionStorage.setItem("appVersion", v);
      } else {
        initialVersion.current = v;
      }
    }

    async function check() {
      if (!initialVersion.current) return;
      const v = await fetchVersion();
      if (v && v !== initialVersion.current) {
        setShow(true);
      }
    }

    init();
    const id = setInterval(check, POLL_INTERVAL);
    return () => clearInterval(id);
  }, []);

  if (!show) return null;

  return (
    <div style={{
      position: "fixed", bottom: 88, left: "50%", transform: "translateX(-50%)",
      zIndex: 500,
      display: "flex", alignItems: "center", gap: 10,
      padding: "11px 16px 11px 14px",
      borderRadius: 16,
      background: "rgba(30,32,36,0.88)",
      backdropFilter: "blur(24px) saturate(180%)",
      WebkitBackdropFilter: "blur(24px) saturate(180%)",
      border: "1px solid rgba(255,255,255,0.15)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      whiteSpace: "nowrap",
    }}>
      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>새 버전이 있어요</span>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: "6px 14px", borderRadius: 10, border: "none",
          background: "linear-gradient(135deg, rgba(10,132,255,0.9), rgba(0,100,220,0.8))",
          color: "#fff", fontSize: 13, fontWeight: 600,
          boxShadow: "0 2px 10px rgba(10,132,255,0.35)",
        }}
      >
        업데이트
      </button>
    </div>
  );
}
