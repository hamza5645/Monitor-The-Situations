"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import LoadingScreen from "@/components/LoadingScreen";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { SituationProvider } from "@/context/SituationContext";

// Dynamic imports to avoid SSR issues with react-grid-layout
const Dashboard = dynamic(() => import("@/components/Dashboard"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-gray-500">Loading dashboard...</div>
    </div>
  ),
});

const MobileSwiper = dynamic(() => import("@/components/MobileSwiper"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-gray-500">Loading...</div>
    </div>
  ),
});

export default function Home() {
  const [showLoading, setShowLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Use useEffect for reliable cross-browser hydration detection
  useEffect(() => {
    setMounted(true);
  }, []);

  // Only call useIsMobile after mount to avoid hydration mismatch
  const isMobile = useIsMobile();

  const handleLoadingComplete = () => {
    setShowLoading(false);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-red-500 animate-pulse">INITIALIZING...</div>
      </div>
    );
  }

  return (
    <SituationProvider>
      <main className="min-h-screen bg-[#0a0a0a]">
        {showLoading && <LoadingScreen onComplete={handleLoadingComplete} />}

        <Header />

        <div
          className="pt-[50px]"
          style={{ height: "100vh" }}
        >
          {isMobile ? <MobileSwiper /> : <Dashboard />}
        </div>
      </main>
    </SituationProvider>
  );
}
