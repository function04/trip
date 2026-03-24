"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface PortalPopupProps {
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Renders overlay + content directly into document.body via a portal.
 * This bypasses any CSS transform on parent elements (e.g. PageSwipe),
 * ensuring position:fixed works relative to the actual viewport.
 */
export default function PortalPopup({ onClose, children }: PortalPopupProps) {
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      {/* 딤 배경 */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(8px) saturate(70%)",
          WebkitBackdropFilter: "blur(8px) saturate(70%)",
        }}
      />
      {/* 팝업 카드 — 뷰포트 정중앙 */}
      <div style={{
        position: "fixed", zIndex: 201,
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "calc(100vw - 40px)",
        maxWidth: 390,
        maxHeight: "80vh",
        overflowY: "auto",
        borderRadius: 26,
        background: "rgba(30,32,36,0.55)",
        backdropFilter: "blur(60px) saturate(180%) brightness(1.1)",
        WebkitBackdropFilter: "blur(60px) saturate(180%) brightness(1.1)",
        border: "1px solid rgba(255,255,255,0.18)",
        boxShadow: "0 12px 60px rgba(0,0,0,0.55), inset 0 1.5px 0 rgba(255,255,255,0.13)",
        padding: "20px 18px 18px",
      }}>
        {children}
      </div>
    </>,
    document.body
  );
}
