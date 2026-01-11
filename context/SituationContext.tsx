"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type { SituationConfig, SituationsState } from "@/types/situation";
import { PRESET_SITUATIONS, DEFAULT_SITUATION } from "@/data/presetSituations";

const STORAGE_KEY = "mts-situations-v1";

interface SituationContextValue {
  activeSituation: SituationConfig;
  activeSituationId: string;
  presetSituations: SituationConfig[];
  customSituations: SituationConfig[];
  allSituations: SituationConfig[];
  setActiveSituation: (id: string) => void;
  createCustomSituation: (config: Omit<SituationConfig, "id" | "isPreset" | "createdAt" | "updatedAt">) => string;
  updateCustomSituation: (id: string, config: Partial<SituationConfig>) => void;
  deleteCustomSituation: (id: string) => void;
  duplicateSituation: (id: string, newName: string) => string;
}

const SituationContext = createContext<SituationContextValue | null>(null);

// Helper to generate UUID
function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Load state from localStorage
function loadState(): SituationsState {
  if (typeof window === "undefined") {
    return { activeSituationId: "default", customSituations: [] };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as SituationsState;
    }
  } catch (e) {
    console.error("Failed to load situations state:", e);
  }
  return { activeSituationId: "default", customSituations: [] };
}

// Save state to localStorage
function saveState(state: SituationsState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save situations state:", e);
  }
}

export function SituationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SituationsState>({
    activeSituationId: "default",
    customSituations: []
  });
  const [mounted, setMounted] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    const loaded = loadState();
    setState(loaded);
    setMounted(true);
  }, []);

  // Save to storage when state changes (after mount)
  useEffect(() => {
    if (mounted) {
      saveState(state);
    }
  }, [state, mounted]);

  // Find the active situation
  const activeSituation = useMemo(() => {
    const all = [...PRESET_SITUATIONS, ...state.customSituations];
    return all.find((s) => s.id === state.activeSituationId) || DEFAULT_SITUATION;
  }, [state.activeSituationId, state.customSituations]);

  const allSituations = useMemo(() => {
    return [...PRESET_SITUATIONS, ...state.customSituations];
  }, [state.customSituations]);

  const setActiveSituation = useCallback((id: string) => {
    setState((prev) => ({ ...prev, activeSituationId: id }));
  }, []);

  const createCustomSituation = useCallback((
    config: Omit<SituationConfig, "id" | "isPreset" | "createdAt" | "updatedAt">
  ): string => {
    const id = generateId();
    const now = new Date().toISOString();
    const newSituation: SituationConfig = {
      ...config,
      id,
      isPreset: false,
      createdAt: now,
      updatedAt: now,
    };
    setState((prev) => ({
      ...prev,
      customSituations: [...prev.customSituations, newSituation],
      activeSituationId: id,
    }));
    return id;
  }, []);

  const updateCustomSituation = useCallback((id: string, updates: Partial<SituationConfig>) => {
    setState((prev) => ({
      ...prev,
      customSituations: prev.customSituations.map((s) =>
        s.id === id
          ? { ...s, ...updates, updatedAt: new Date().toISOString() }
          : s
      ),
    }));
  }, []);

  const deleteCustomSituation = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      customSituations: prev.customSituations.filter((s) => s.id !== id),
      activeSituationId: prev.activeSituationId === id ? "default" : prev.activeSituationId,
    }));
  }, []);

  const duplicateSituation = useCallback((id: string, newName: string): string => {
    const source = allSituations.find((s) => s.id === id);
    if (!source) return "";

    const newId = generateId();
    const now = new Date().toISOString();
    const newSituation: SituationConfig = {
      ...source,
      id: newId,
      name: newName,
      isPreset: false,
      createdAt: now,
      updatedAt: now,
    };

    setState((prev) => ({
      ...prev,
      customSituations: [...prev.customSituations, newSituation],
      activeSituationId: newId,
    }));

    return newId;
  }, [allSituations]);

  const value: SituationContextValue = useMemo(() => ({
    activeSituation,
    activeSituationId: state.activeSituationId || "default",
    presetSituations: PRESET_SITUATIONS,
    customSituations: state.customSituations,
    allSituations,
    setActiveSituation,
    createCustomSituation,
    updateCustomSituation,
    deleteCustomSituation,
    duplicateSituation,
  }), [
    activeSituation,
    state.activeSituationId,
    state.customSituations,
    allSituations,
    setActiveSituation,
    createCustomSituation,
    updateCustomSituation,
    deleteCustomSituation,
    duplicateSituation,
  ]);

  return (
    <SituationContext.Provider value={value}>
      {children}
    </SituationContext.Provider>
  );
}

export function useSituation(): SituationContextValue {
  const context = useContext(SituationContext);
  if (!context) {
    throw new Error("useSituation must be used within a SituationProvider");
  }
  return context;
}
