"use client";

import { useState, useEffect, useCallback, useRef } from "react";

function getStoredValue<T>(key: string, initialValue: T): T {
  if (typeof window === "undefined") return initialValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return initialValue;
  }
}

export type SetLocalStorageValue<T> = (value: T | ((prev: T) => T)) => void;

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, SetLocalStorageValue<T>] {
  const initialRef = useRef(initialValue);
  initialRef.current = initialValue;

  const [storedValue, setStoredValue] = useState<T>(() =>
    getStoredValue(key, initialValue)
  );

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key) return;
      if (e.newValue === null) {
        setStoredValue(initialRef.current);
        return;
      }
      try {
        setStoredValue(JSON.parse(e.newValue));
      } catch {
        // Ignore parse errors
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next =
          typeof value === "function" ? (value as (p: T) => T)(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch (error) {
          console.error(`Error setting localStorage key "${key}":`, error);
        }
        return next;
      });
    },
    [key]
  );

  return [storedValue, setValue];
}
