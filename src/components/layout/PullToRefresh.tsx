"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function PullToRefresh({ children }: { children: React.ReactNode }) {
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const THRESHOLD = 72;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY > 0) return;
    startY.current = e.touches[0].clientY;
    pulling.current = true;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!pulling.current) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) {
      // dampen
      setPullY(Math.min(dy * 0.45, THRESHOLD + 20));
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!pulling.current) return;
    pulling.current = false;
    if (pullY >= THRESHOLD) {
      setRefreshing(true);
      setPullY(THRESHOLD * 0.6);
      // reload
      setTimeout(() => {
        router.refresh();
        setTimeout(() => {
          setRefreshing(false);
          setPullY(0);
        }, 600);
      }, 400);
    } else {
      setPullY(0);
    }
  }, [pullY, router]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: true });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const progress = Math.min(pullY / THRESHOLD, 1);

  return (
    <div ref={containerRef} style={{ minHeight: "100%" }}>
      {/* pull indicator */}
      <div style={{
        position: "sticky", top: 0, zIndex: 30,
        display: "flex", justifyContent: "center",
        height: pullY > 2 ? pullY : 0,
        overflow: "hidden",
        transition: pullY === 0 ? "height 0.3s ease" : "none",
        pointerEvents: "none",
        alignItems: "flex-end", paddingBottom: 10,
      }}>
        {pullY > 4 && (
          <div style={{
            width: 28, height: 28, borderRadius: 14,
            background: "rgba(255,255,255,0.1)",
            border: "1.5px solid rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: progress,
          }}>
            {refreshing ? (
              <div style={{
                width: 14, height: 14, borderRadius: 7,
                border: "2px solid rgba(10,132,255,0.3)",
                borderTopColor: "#0a84ff",
                animation: "ptr-spin 0.7s linear infinite",
              }} />
            ) : (
              <div style={{
                width: 10, height: 10,
                borderLeft: "1.5px solid rgba(255,255,255,0.6)",
                borderBottom: "1.5px solid rgba(255,255,255,0.6)",
                transform: `rotate(${-45 + progress * 180}deg) translateY(-1px)`,
                transition: "transform 0.1s",
              }} />
            )}
          </div>
        )}
      </div>

      <div style={{ transform: `translateY(${pullY > 2 ? 0 : 0}px)` }}>
        {children}
      </div>

      <style>{`
        @keyframes ptr-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
