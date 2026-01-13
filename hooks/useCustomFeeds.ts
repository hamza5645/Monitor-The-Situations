"use client";

import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";

export interface CustomFeed {
  id: string;
  url: string;
  source: string;
  addedAt: string;
}

interface CustomFeedsState {
  feeds: CustomFeed[];
}

const STORAGE_KEY = "mts-custom-feeds-v1";
const DEFAULT_STATE: CustomFeedsState = { feeds: [] };

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function useCustomFeeds() {
  const [state, setState] = useLocalStorage<CustomFeedsState>(
    STORAGE_KEY,
    DEFAULT_STATE
  );

  const addFeed = useCallback(
    (url: string, source: string) => {
      const newFeed: CustomFeed = {
        id: generateId(),
        url: url.trim(),
        source: source.trim(),
        addedAt: new Date().toISOString(),
      };
      setState({
        feeds: [...state.feeds, newFeed],
      });
      return newFeed.id;
    },
    [state.feeds, setState]
  );

  const removeFeed = useCallback(
    (id: string) => {
      setState({
        feeds: state.feeds.filter((f) => f.id !== id),
      });
    },
    [state.feeds, setState]
  );

  const feedsForApi = useMemo(() => {
    return state.feeds.map((f) => ({
      url: f.url,
      source: f.source,
    }));
  }, [state.feeds]);

  const getFeedById = useCallback(
    (id: string): CustomFeed | undefined => {
      return state.feeds.find((f) => f.id === id);
    },
    [state.feeds]
  );

  return {
    feeds: state.feeds,
    feedsForApi,
    addFeed,
    removeFeed,
    getFeedById,
    hasFeeds: state.feeds.length > 0,
  };
}
