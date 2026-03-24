"use client";

import { useEffect, useState } from "react";

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 1200);
    const t2 = setTimeout(() => onDone(), 1700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#1e1f22",
      display: "flex", alignItems: "center", justifyContent: "center",
      paddingBottom: "15vh",
      opacity: fade ? 0 : 1,
      transition: "opacity 0.5s ease",
      pointerEvents: fade ? "none" : "auto",
    }}>
      <span style={{
        fontSize: 28,
        fontWeight: 700,
        color: "#ffffff",
        letterSpacing: "0.18em",
      }}>
        PLANNER
      </span>
    </div>
  );
}
