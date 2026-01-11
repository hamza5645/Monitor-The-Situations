"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getRandomQuote, Quote } from "@/lib/quotes";

interface LoadingScreenProps {
  onComplete: () => void;
}

// Check session storage outside of React lifecycle
function hasSeenLoading(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem("loading-seen") === "true";
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  // Use lazy initialization to check session storage
  const [quote] = useState<Quote | null>(() => hasSeenLoading() ? null : getRandomQuote());
  const [isVisible, setIsVisible] = useState(() => !hasSeenLoading());
  const completedRef = useRef(false);

  const handleDismiss = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setIsVisible(false);
    sessionStorage.setItem("loading-seen", "true");
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    // If already seen, call onComplete immediately
    if (!isVisible) {
      onComplete();
      return;
    }

    // Auto-dismiss after 3 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 3000);

    return () => clearTimeout(timer);
  }, [isVisible, onComplete, handleDismiss]);

  if (!isVisible) return null;

  return (
    <div className="loading-overlay" onClick={handleDismiss}>
      <div className="loading-title">MONITORING THE SITUATION</div>

      {quote && (
        <div className="loading-quote">
          &ldquo;{quote.text}&rdquo;
          <div className="mt-4">
            <span className="leader">— {quote.leader}</span>
            <span className="text-gray-600 ml-2">({quote.country})</span>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-600 animate-pulse">
        Click anywhere to continue
      </div>
    </div>
  );
}
