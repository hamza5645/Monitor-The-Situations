"use client";

import { useState, useEffect } from "react";
import { getRandomQuote, Quote } from "@/lib/quotes";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if already seen this session
    const hasSeen = sessionStorage.getItem("loading-seen");
    if (hasSeen) {
      setIsVisible(false);
      onComplete();
      return;
    }

    // Set quote
    setQuote(getRandomQuote());

    // Auto-dismiss after 3 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("loading-seen", "true");
    onComplete();
  };

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
