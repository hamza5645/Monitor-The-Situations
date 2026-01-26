"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSituation } from "@/context/SituationContext";

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface StockGroup {
  title: string;
  stocks: StockData[];
}

export default function StocksPanel() {
  const { activeSituation } = useSituation();
  const [stockGroups, setStockGroups] = useState<StockGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const situationIdRef = useRef(activeSituation.id);

  const fetchStocks = useCallback(async () => {
    try {
      // Only send query params for non-default situations to maximize cache hits
      // Default situation will use API's built-in default stock groups
      const params = new URLSearchParams();

      if (activeSituation.id !== "default") {
        params.set("groups", JSON.stringify(activeSituation.stocks));
      }

      const queryString = params.toString();
      const response = await fetch(`/api/stocks${queryString ? `?${queryString}` : ""}`);
      if (response.ok) {
        const data = await response.json();
        setStockGroups(data.groups);
        setLastUpdate(new Date());
        setSecondsAgo(0);
      }
    } catch (error) {
      console.error("Failed to fetch stocks:", error);
    } finally {
      setLoading(false);
    }
  }, [activeSituation.stocks]);

  // Re-fetch when situation changes
  useEffect(() => {
    if (situationIdRef.current !== activeSituation.id) {
      situationIdRef.current = activeSituation.id;
      setLoading(true);
    }
    fetchStocks();
    // Refresh every 10 seconds for real-time feel
    const dataInterval = setInterval(fetchStocks, 10 * 1000);
    // Update seconds counter every second
    const tickInterval = setInterval(() => {
      setSecondsAgo((prev) => prev + 1);
    }, 1000);
    return () => {
      clearInterval(dataInterval);
      clearInterval(tickInterval);
    };
  }, [fetchStocks, activeSituation.id]);

  const formatPrice = (price: number) => {
    return price >= 1000 ? price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : price.toFixed(2);
  };

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <span className="flex items-center gap-2">
          MARKET DATA
          <span className="live-indicator" />
        </span>
        {lastUpdate && (
          <span className="ml-auto text-gray-500 font-normal font-mono text-[10px]">
            {secondsAgo}s ago
          </span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Loading market data...
          </div>
        ) : (
          <div className="space-y-4">
            {stockGroups.map((group) => (
              <div key={group.title}>
                <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">
                  {group.title}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {group.stocks.map((stock) => (
                    <div
                      key={stock.symbol}
                      className="bg-black/30 rounded p-2 text-xs"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-white">{stock.symbol}</div>
                          <div className="text-[10px] text-gray-500 truncate max-w-[80px]">
                            {stock.name}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono">${formatPrice(stock.price)}</div>
                          <div
                            className={
                              stock.change >= 0 ? "stock-up" : "stock-down"
                            }
                          >
                            {stock.change >= 0 ? "+" : ""}
                            {stock.changePercent.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
