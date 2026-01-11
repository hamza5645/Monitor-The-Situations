"use client";

import { useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import LoadingScreen from "@/components/LoadingScreen";
import { useIsMobile } from "@/hooks/useMediaQuery";

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

// Use useSyncExternalStore for hydration-safe mounted state
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function Home() {
  const [showLoading, setShowLoading] = useState(true);
  const mounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
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
  );
}
