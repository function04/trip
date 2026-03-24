"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface FABProps {
  onClick: () => void;
  label?: string;
}

export default function FAB({ onClick, label = "+" }: FABProps) {
  const portalRoot = useRef<HTMLElement | null>(null);

  useEffect(() => {
    portalRoot.current = document.body;
  }, []);

  const button = (
    <button
      onClick={onClick}
      className="md:hidden active:scale-90 transition-transform duration-100"
      style={{
        position: "fixed",
        bottom: "calc(88px + env(safe-area-inset-bottom, 0px))",
        right: 20,
        zIndex: 9999,
        width: 48, height: 48, borderRadius: 24,
        background: "var(--bg-elevated)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid var(--border-hover)",
        color: "var(--text-primary)", fontSize: 24, fontWeight: 300,
        outline: "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
      }}
    >
      {label}
    </button>
  );

  // 서버사이드에선 portal 못 씀 — 마운트 전엔 null
  if (typeof window === "undefined") return null;
  return createPortal(button, document.body);
}
