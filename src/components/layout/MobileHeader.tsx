"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

interface MobileHeaderProps {
  title: string;
}

export default function MobileHeader({ title }: MobileHeaderProps) {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    function handleScroll() {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollY.current;
        if (delta > 6 && currentY > 60) {
          setHidden(true);
        } else if (delta < -4) {
          setHidden(false);
        }
        lastScrollY.current = currentY;
        ticking.current = false;
      });
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="md:hidden sticky top-0 z-40"
      style={{
        background: "#1e1f22",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        transform: hidden ? "translateY(-100%)" : "translateY(0)",
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div style={{
        display: "flex", alignItems: "center",
        padding: "12px 20px",
        minHeight: 52,
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flex: 1, minWidth: 0 }}>
          <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
            <span style={{
              fontSize: 13, fontWeight: 700, color: "var(--text-primary)",
              letterSpacing: "0.08em", opacity: 0.9,
            }}>
              PLANNER
            </span>
          </Link>
          {title && (
            <>
              <span style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 300, flexShrink: 0 }}>|</span>
              <span style={{
                fontSize: 15, fontWeight: 700, color: "var(--text-primary)",
                letterSpacing: "-0.3px", minWidth: 0, wordBreak: "keep-all", overflowWrap: "break-word",
              }}>
                {title}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
