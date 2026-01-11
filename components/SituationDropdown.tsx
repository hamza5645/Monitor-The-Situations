"use client";

import { useState, useRef, useEffect } from "react";
import { useSituation } from "@/context/SituationContext";

interface SituationDropdownProps {
  onOpenModal: () => void;
  onEditSituation: (id: string) => void;
}

export default function SituationDropdown({ onOpenModal, onEditSituation }: SituationDropdownProps) {
  const {
    activeSituation,
    presetSituations,
    customSituations,
    setActiveSituation,
    deleteCustomSituation,
  } = useSituation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (id: string) => {
    setActiveSituation(id);
    setIsOpen(false);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Delete this custom situation?")) {
      deleteCustomSituation(id);
    }
  };

  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setIsOpen(false);
    onEditSituation(id);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Dropdown trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-red-950/40 hover:bg-red-900/50 border border-red-900/50 rounded text-xs text-red-100 transition-colors"
      >
        <span className="text-red-500">&#9679;</span>
        <span className="max-w-[100px] truncate">{activeSituation.name}</span>
        <svg
          className={`w-3 h-3 text-red-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-black/95 border border-red-900/50 rounded shadow-lg shadow-red-900/20 z-50 overflow-hidden">
          {/* Presets section */}
          <div className="p-2 border-b border-red-900/30">
            <p className="text-[10px] uppercase tracking-wider text-red-400/50 px-2 mb-1">Presets</p>
            {presetSituations.map((situation) => (
              <button
                key={situation.id}
                onClick={() => handleSelect(situation.id)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors ${
                  activeSituation.id === situation.id
                    ? "bg-red-900/40 text-white"
                    : "text-red-100 hover:bg-red-900/20"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={activeSituation.id === situation.id ? "text-red-400" : "text-red-900"}>
                    &#9679;
                  </span>
                  {situation.name}
                </span>
                {activeSituation.id === situation.id && (
                  <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* Custom situations section */}
          {customSituations.length > 0 && (
            <div className="p-2 border-b border-red-900/30">
              <p className="text-[10px] uppercase tracking-wider text-red-400/50 px-2 mb-1">Custom</p>
              {customSituations.map((situation) => (
                <div
                  key={situation.id}
                  onClick={() => handleSelect(situation.id)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs cursor-pointer transition-colors ${
                    activeSituation.id === situation.id
                      ? "bg-red-900/40 text-white"
                      : "text-red-100 hover:bg-red-900/20"
                  }`}
                >
                  <span className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={activeSituation.id === situation.id ? "text-red-400" : "text-red-900"}>
                      &#9679;
                    </span>
                    <span className="truncate">{situation.name}</span>
                  </span>
                  <span className="flex items-center gap-1 ml-2">
                    <button
                      onClick={(e) => handleEdit(e, situation.id)}
                      className="p-1 hover:bg-red-900/30 rounded text-gray-500 hover:text-red-400 transition-colors"
                      title="Edit"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, situation.id)}
                      className="p-1 hover:bg-red-900/30 rounded text-gray-500 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* New situation button */}
          <div className="p-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenModal();
              }}
              className="w-full flex items-center justify-center gap-2 px-2 py-2 bg-red-900/20 hover:bg-red-900/30 border border-red-900/30 rounded text-xs text-red-400 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Situation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
