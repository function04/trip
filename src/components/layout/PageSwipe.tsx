"use client";

import { usePathname, useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";

const SWIPE_PAGES = ["/", "/today-schedule", "/today-expenses"];

export default function PageSwipe({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentIdx = SWIPE_PAGES.indexOf(pathname);
  const isSwipePage = currentIdx !== -1;

  const containerRef = useRef<HTMLDivElement>(null);
  const [dragX, setDragX] = useState(0);

  // Use refs to avoid stale closures in native event handlers
  const stateRef = useRef({
    touchStartX: null as number | null,
    touchStartY: null as number | null,
    isHorizontal: false,
    dragging: false,
    dragX: 0,
    currentIdx,
    isSwipePage,
  });

  // Keep stateRef in sync
  stateRef.current.currentIdx = currentIdx;
  stateRef.current.isSwipePage = isSwipePage;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onTouchStart(e: TouchEvent) {
      stateRef.current.touchStartX = e.touches[0].clientX;
      stateRef.current.touchStartY = e.touches[0].clientY;
      stateRef.current.isHorizontal = false;
      stateRef.current.dragging = false;
      stateRef.current.dragX = 0;
      setDragX(0);
    }

    function onTouchMove(e: TouchEvent) {
      const s = stateRef.current;
      if (!s.isSwipePage || s.touchStartX === null || s.touchStartY === null) return;

      const dx = e.touches[0].clientX - s.touchStartX;
      const dy = e.touches[0].clientY - s.touchStartY;

      // 방향 잠금
      if (!s.isHorizontal && !s.dragging) {
        if (Math.abs(dy) > Math.abs(dx)) return; // 세로 이동 → 무시
        if (Math.abs(dx) > 6) {
          s.isHorizontal = true;
          s.dragging = true;
        } else {
          return;
        }
      }

      if (!s.isHorizontal) return;

      // 경계 처리
      if (dx > 0 && s.currentIdx === 0) return;
      if (dx < 0 && s.currentIdx === SWIPE_PAGES.length - 1) return;

      e.preventDefault(); // 세로 스크롤 차단 — passive: false 이므로 작동
      s.dragX = dx;
      setDragX(dx);
    }

    function onTouchEnd() {
      const s = stateRef.current;
      if (!s.dragging || !s.isSwipePage) {
        s.dragging = false;
        s.touchStartX = null;
        setDragX(0);
        return;
      }

      const WIDTH = window.innerWidth;
      const threshold = WIDTH * 0.3;

      if (s.dragX < -threshold && s.currentIdx < SWIPE_PAGES.length - 1) {
        router.push(SWIPE_PAGES[s.currentIdx + 1]);
      } else if (s.dragX > threshold && s.currentIdx > 0) {
        router.push(SWIPE_PAGES[s.currentIdx - 1]);
      }

      s.dragging = false;
      s.touchStartX = null;
      s.dragX = 0;
      setDragX(0);
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [router]); // router is stable, so this runs once

  if (!isSwipePage) return <>{children}</>;

  const totalPages = SWIPE_PAGES.length;
  const isDragging = stateRef.current.dragging;

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* 3페이지를 나란히 배치, translate로 슬라이드 */}
      <div
        style={{
          display: "flex",
          width: `${totalPages * 100}%`,
          height: "100%",
          transform: `translateX(calc(${-currentIdx * (100 / totalPages)}% + ${dragX}px))`,
          transition: isDragging ? "none" : "transform 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          willChange: "transform",
        }}
      >
        {SWIPE_PAGES.map((page, idx) => (
          <div
            key={page}
            style={{
              width: `${100 / totalPages}%`,
              height: "100%",
              flexShrink: 0,
              overflowY: idx === currentIdx ? "auto" : "hidden",
              overflowX: "hidden",
            }}
          >
            {idx === currentIdx ? children : (
              <div style={{ width: "100%", height: "100%", background: "var(--bg-primary)" }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
