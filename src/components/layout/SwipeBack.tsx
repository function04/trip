"use client";

import { useRouter, usePathname } from "next/navigation";
import { useRef, useState } from "react";

const MAIN_PAGES = ["/", "/today-schedule", "/today-expenses"];

export default function SwipeBack({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);

  const WIDTH = typeof window !== "undefined" ? window.innerWidth : 390;
  // 메인 3페이지에서는 SwipeBack 비활성화 (PageSwipe가 담당)
  const isMainPage = MAIN_PAGES.includes(pathname);

  function onTouchStart(e: React.TouchEvent) {
    if (isMainPage) return;
    if (e.touches[0].clientX > WIDTH * 0.42) return; // 왼쪽 42% 영역에서 시작 가능
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setDragging(true);
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!dragging || touchStartX.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.touches[0].clientY - (touchStartY.current ?? 0));
    if (dy > dx) { // 세로 스크롤이면 취소
      setDragging(false);
      setDragX(0);
      return;
    }
    if (dx > 0) setDragX(Math.min(dx, WIDTH));
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (!dragging) return;
    const dx = dragX;
    setDragging(false);
    setDragX(0);
    touchStartX.current = null;
    touchStartY.current = null;
    if (dx > WIDTH * 0.38) {
      router.back();
    }
  }

  const progress = Math.min(dragX / WIDTH, 1); // 0~1

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="h-full relative"
    >
      {/* 뒤에 보이는 이전 페이지 흉내 — 왼쪽 고정된 어두운 레이어 */}
      {dragging && dragX > 0 && (
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: "#000",
            opacity: 0.4 - progress * 0.4,
          }}
        />
      )}

      {/* 현재 페이지 — 드래그에 따라 오른쪽으로 이동 */}
      <div
        className="h-full w-full relative z-10"
        style={dragX > 0 ? {
          transform: `translateX(${dragX}px)`,
          transition: dragging ? "none" : "transform 0.28s cubic-bezier(0.25,0.46,0.45,0.94)",
          boxShadow: "-8px 0 24px rgba(0,0,0,0.5)",
        } : undefined}
      >
        {children}
      </div>
    </div>
  );
}
