"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type { SituationConfig, SituationsState, LayoutConfig } from "@/types/situation";
import { DEFAULT_LAYOUT } from "@/types/situation";
import { PRESET_SITUATIONS, DEFAULT_SITUATION } from "@/data/presetSituations";

const STORAGE_KEY = "mts-situations-v1";

interface SituationContextValue {
  activeSituation: SituationConfig;
  activeSituationId: string;
  activeLayout: LayoutConfig;
  presetSituations: SituationConfig[];
  customSituations: SituationConfig[];
  allSituations: SituationConfig[];
  setActiveSituation: (id: string) => void;
  updateActiveLayout: (layout: LayoutConfig) => void;
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
    return { activeSituationId: "default", customSituations: [], presetLayoutOverrides: {} };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as SituationsState;
      // Ensure presetLayoutOverrides exists
      if (!parsed.presetLayoutOverrides) {
        parsed.presetLayoutOverrides = {};
      }
      return parsed;
    }
  } catch (e) {
    console.error("Failed to load situations state:", e);
  }
  return { activeSituationId: "default", customSituations: [], presetLayoutOverrides: {} };
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
    customSituations: [],
    presetLayoutOverrides: {}
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

  // Get the active layout for the current situation
  const activeLayout = useMemo(() => {
    const situationId = state.activeSituationId || "default";

    // Check if it's a preset with an override
    if (activeSituation.isPreset && state.presetLayoutOverrides?.[situationId]) {
      return state.presetLayoutOverrides[situationId];
    }

    // Use the situation's own layout or default
    return activeSituation.layout || DEFAULT_LAYOUT;
  }, [state.activeSituationId, state.presetLayoutOverrides, activeSituation]);

  const allSituations = useMemo(() => {
    return [...PRESET_SITUATIONS, ...state.customSituations];
  }, [state.customSituations]);

  const setActiveSituation = useCallback((id: string) => {
    setState((prev) => ({ ...prev, activeSituationId: id }));
  }, []);

  // Update layout for the active situation
  const updateActiveLayout = useCallback((layout: LayoutConfig) => {
    setState((prev) => {
      const situationId = prev.activeSituationId || "default";
      const situation = [...PRESET_SITUATIONS, ...prev.customSituations].find(s => s.id === situationId);

      if (!situation) return prev;

      if (situation.isPreset) {
        // For presets, store in presetLayoutOverrides
        return {
          ...prev,
          presetLayoutOverrides: {
            ...prev.presetLayoutOverrides,
            [situationId]: layout
          }
        };
      } else {
        // For custom situations, update the situation's layout field
        return {
          ...prev,
          customSituations: prev.customSituations.map((s) =>
            s.id === situationId
              ? { ...s, layout, updatedAt: new Date().toISOString() }
              : s
          )
        };
      }
    });
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
      layout: config.layout || DEFAULT_LAYOUT,
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

    // Get the layout - either from override (for presets) or from the situation
    let layout = source.layout || DEFAULT_LAYOUT;
    if (source.isPreset && state.presetLayoutOverrides?.[id]) {
      layout = state.presetLayoutOverrides[id];
    }

    const newSituation: SituationConfig = {
      ...source,
      id: newId,
      name: newName,
      isPreset: false,
      createdAt: now,
      updatedAt: now,
      layout,
    };

    setState((prev) => ({
      ...prev,
      customSituations: [...prev.customSituations, newSituation],
      activeSituationId: newId,
    }));

    return newId;
  }, [allSituations, state.presetLayoutOverrides]);

  const value: SituationContextValue = useMemo(() => ({
    activeSituation,
    activeSituationId: state.activeSituationId || "default",
    activeLayout,
    presetSituations: PRESET_SITUATIONS,
    customSituations: state.customSituations,
    allSituations,
    setActiveSituation,
    updateActiveLayout,
    createCustomSituation,
    updateCustomSituation,
    deleteCustomSituation,
    duplicateSituation,
  }), [
    activeSituation,
    state.activeSituationId,
    activeLayout,
    state.customSituations,
    allSituations,
    setActiveSituation,
    updateActiveLayout,
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
