"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PASSWORD = "ukire2025";

export default function LoginPage() {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pw === PASSWORD) {
      localStorage.setItem("trip_auth", "1");
      router.push("/projects");
    } else {
      setError(true);
      setShaking(true);
      setPw("");
      setTimeout(() => setShaking(false), 500);
    }
  }

  return (
    <div style={{
      minHeight: "100svh",
      background: "#1e1f22",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "0 32px",
    }}>
      {/* 아이콘 */}
      <div style={{
        width: 72, height: 72, borderRadius: 22,
        background: "rgba(10,132,255,0.15)",
        border: "1px solid rgba(10,132,255,0.25)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 32, marginBottom: 24,
      }}>
        ✈️
      </div>

      <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4, textAlign: "center" }}>
        Travel Planner
      </div>
      <div style={{ fontSize: 13, color: "var(--text-tertiary)", marginBottom: 40, textAlign: "center" }}>
        UK &amp; Ireland 2025
      </div>

      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 320 }}>
        <div style={{
          borderRadius: 16, overflow: "hidden",
          background: "var(--card-bg)",
          border: error ? "1px solid rgba(255,69,58,0.5)" : "1px solid rgba(255,255,255,0.08)",
          animation: shaking ? "shake 0.4s ease" : "none",
          marginBottom: 12,
        }}>
          <input
            type="password"
            value={pw}
            onChange={(e) => { setPw(e.target.value); setError(false); }}
            placeholder="비밀번호 입력"
            autoFocus
            style={{
              display: "block", width: "100%",
              padding: "15px 16px",
              background: "transparent", border: "none", outline: "none",
              color: "var(--text-primary)", fontSize: 16,
              textAlign: "center", letterSpacing: "0.2em",
            }}
          />
        </div>

        {error && (
          <div style={{ fontSize: 12, color: "#ff453a", textAlign: "center", marginBottom: 12 }}>
            비밀번호가 맞지 않아요
          </div>
        )}

        <button type="submit" disabled={!pw.trim()}
          style={{
            width: "100%", padding: "15px",
            borderRadius: 16, border: "none",
            background: pw.trim() ? "#0a84ff" : "rgba(10,132,255,0.25)",
            color: pw.trim() ? "var(--text-primary)" : "var(--text-tertiary)",
            fontSize: 16, fontWeight: 600,
          }}>
          입장하기
        </button>
      </form>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
