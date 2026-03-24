"use client";

import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import SwipeBack from "@/components/layout/SwipeBack";
import PageSwipe from "@/components/layout/PageSwipe";
import SplashScreen from "@/components/layout/SplashScreen";
import PullToRefresh from "@/components/layout/PullToRefresh";
import BottomNav from "@/components/layout/BottomNav";
import UpdateBanner from "@/components/layout/UpdateBanner";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [splashDone, setSplashDone] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("splashDone") === "1";
    }
    return false;
  });
  const pathname = usePathname();

  useEffect(() => {
    // 항상 다크모드 고정
    document.documentElement.setAttribute("data-theme", "dark");
    document.documentElement.style.background = "#1e1f22";
    document.body.style.background = "#1e1f22";
  }, []);

  // 하단탭 항상 표시
  const hideBottomNav = false;

  return (
    <html lang="ko" style={{ height: "100%" }}>
      <head>
        <title>여행 플래너</title>
        <meta name="description" content="아일랜드 & 영국 여행 계획 & 가계부" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <meta name="theme-color" content="#1e1f22" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="여행 플래너" />
        <link rel="manifest" href="/trip/manifest.json" />
      </head>
      <body style={{ height: "100%", background: "#1e1f22", color: "var(--text-primary)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif" }}>

        {/* 스플래시 — 매 실행마다 표시 */}
        {!splashDone && (
          <SplashScreen onDone={() => { sessionStorage.setItem("splashDone", "1"); setSplashDone(true); }} />
        )}

        {/* PC 레이아웃 */}
        <div className="hidden md:flex h-full">
          <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((v) => !v)} />
          <main
            className="flex-1 overflow-y-auto transition-all duration-200"
            style={{ marginLeft: sidebarOpen ? 260 : 0 }}
          >
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="fixed top-3 left-3 z-50 w-8 h-8 flex items-center justify-center rounded-md bg-bg-secondary border border-border-default text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
              >
                ☰
              </button>
            )}
            <div className="max-w-6xl mx-auto p-8">{children}</div>
          </main>
        </div>

        {/* 모바일 레이아웃 */}
        <div className="md:hidden">
          <PageSwipe>
            <SwipeBack>
              <PullToRefresh>
                <div className="page-slide-in" style={{ paddingBottom: hideBottomNav ? 0 : 96, paddingTop: 0 }}>
                  {children}
                </div>
              </PullToRefresh>
            </SwipeBack>
          </PageSwipe>
          {!hideBottomNav && <BottomNav />}
          <UpdateBanner />
        </div>

      </body>
    </html>
  );
}
