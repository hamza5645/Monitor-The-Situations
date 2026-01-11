"use client";

import { useState, useMemo } from "react";
import { useSituation } from "@/context/SituationContext";
import type { StockGroupConfig, NewsFeedConfig, IntelAccountConfig } from "@/types/situation";
import { DEFAULT_SITUATION } from "@/data/presetSituations";

interface SituationModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSituationId?: string | null;
}

export default function SituationModal({ isOpen, onClose, editingSituationId }: SituationModalProps) {
  const {
    allSituations,
    createCustomSituation,
    updateCustomSituation,
    duplicateSituation,
  } = useSituation();

  // Get initial values based on editing situation
  const initialValues = useMemo(() => {
    if (editingSituationId) {
      const situation = allSituations.find((s) => s.id === editingSituationId);
      if (situation) {
        return {
          name: situation.name,
          lat: situation.flight.lat,
          lon: situation.flight.lon,
          zoom: situation.flight.zoom,
          stockGroups: [...situation.stocks],
          newsFeeds: [...situation.news.feeds],
          keywords: situation.news.keywords?.join(", ") || "",
          intelAccounts: [...situation.intel.accounts],
          categories: [...situation.intel.categories],
        };
      }
    }
    return {
      name: "",
      lat: DEFAULT_SITUATION.flight.lat,
      lon: DEFAULT_SITUATION.flight.lon,
      zoom: DEFAULT_SITUATION.flight.zoom,
      stockGroups: [{ title: "Stocks", symbols: [] }] as StockGroupConfig[],
      newsFeeds: [...DEFAULT_SITUATION.news.feeds],
      keywords: "",
      intelAccounts: [] as IntelAccountConfig[],
      categories: ["News", "Gov", "OSINT"],
    };
  }, [editingSituationId, allSituations]);

  // Form state - initialized from memoized values
  const [name, setName] = useState(initialValues.name);
  const [lat, setLat] = useState(initialValues.lat);
  const [lon, setLon] = useState(initialValues.lon);
  const [zoom, setZoom] = useState(initialValues.zoom);
  const [stockGroups, setStockGroups] = useState<StockGroupConfig[]>(initialValues.stockGroups);
  const [newsFeeds, setNewsFeeds] = useState<NewsFeedConfig[]>(initialValues.newsFeeds);
  const [keywords, setKeywords] = useState(initialValues.keywords);
  const [intelAccounts, setIntelAccounts] = useState<IntelAccountConfig[]>(initialValues.intelAccounts);
  const [categories, setCategories] = useState<string[]>(initialValues.categories);

  // Reset form when initial values change (modal opens with different situation)
  const [lastInitialName, setLastInitialName] = useState(initialValues.name);
  if (isOpen && lastInitialName !== initialValues.name) {
    setLastInitialName(initialValues.name);
    setName(initialValues.name);
    setLat(initialValues.lat);
    setLon(initialValues.lon);
    setZoom(initialValues.zoom);
    setStockGroups(initialValues.stockGroups);
    setNewsFeeds(initialValues.newsFeeds);
    setKeywords(initialValues.keywords);
    setIntelAccounts(initialValues.intelAccounts);
    setCategories(initialValues.categories);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const config = {
      name: name.trim(),
      flight: { lat, lon, zoom },
      stocks: stockGroups.filter((g) => g.symbols.length > 0),
      news: {
        feeds: newsFeeds,
        keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
      },
      intel: {
        accounts: intelAccounts,
        categories,
      },
    };

    if (editingSituationId) {
      const situation = allSituations.find((s) => s.id === editingSituationId);
      if (situation?.isPreset) {
        // If editing a preset, duplicate it as custom
        duplicateSituation(editingSituationId, name.trim());
      } else {
        updateCustomSituation(editingSituationId, config);
      }
    } else {
      createCustomSituation(config);
    }

    onClose();
  };

  // Stock group management
  const addStockGroup = () => {
    setStockGroups([...stockGroups, { title: "New Group", symbols: [] }]);
  };

  const updateStockGroupTitle = (index: number, title: string) => {
    const updated = [...stockGroups];
    updated[index].title = title;
    setStockGroups(updated);
  };

  const updateStockGroupSymbols = (index: number, symbolsStr: string) => {
    const updated = [...stockGroups];
    updated[index].symbols = symbolsStr.split(",").map((s) => {
      const trimmed = s.trim();
      return { symbol: trimmed, name: trimmed };
    }).filter((s) => s.symbol);
    setStockGroups(updated);
  };

  const removeStockGroup = (index: number) => {
    setStockGroups(stockGroups.filter((_, i) => i !== index));
  };

  // News feed management
  const addNewsFeed = () => {
    setNewsFeeds([...newsFeeds, { url: "", source: "" }]);
  };

  const updateNewsFeed = (index: number, field: "url" | "source", value: string) => {
    const updated = [...newsFeeds];
    updated[index][field] = value;
    setNewsFeeds(updated);
  };

  const removeNewsFeed = (index: number) => {
    setNewsFeeds(newsFeeds.filter((_, i) => i !== index));
  };

  // Intel account management
  const addIntelAccount = () => {
    setIntelAccounts([...intelAccounts, { handle: "", name: "", category: "News" }]);
  };

  const updateIntelAccount = (index: number, field: keyof IntelAccountConfig, value: string) => {
    const updated = [...intelAccounts];
    updated[index][field] = value;
    setIntelAccounts(updated);
  };

  const removeIntelAccount = (index: number) => {
    setIntelAccounts(intelAccounts.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  const isEditingPreset = editingSituationId && allSituations.find((s) => s.id === editingSituationId)?.isPreset;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-[#0a0a0a] border border-red-900/50 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-red-900/30">
          <h2 className="text-lg font-bold text-white">
            {editingSituationId ? (isEditingPreset ? "Duplicate Preset" : "Edit Situation") : "New Situation"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-130px)] p-4 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-red-400/50 mb-2">Situation Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Ukraine Conflict"
              className="w-full bg-black/30 border border-red-900/30 text-red-100 text-sm px-3 py-2 rounded placeholder:text-red-900/50 focus:outline-none focus:border-red-600/50"
              required
            />
          </div>

          {/* Flight Radar */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-red-400/50 mb-2">Flight Radar Location</label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.1"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/30 border border-red-900/30 text-red-100 text-sm px-3 py-2 rounded focus:outline-none focus:border-red-600/50"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.1"
                  value={lon}
                  onChange={(e) => setLon(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/30 border border-red-900/30 text-red-100 text-sm px-3 py-2 rounded focus:outline-none focus:border-red-600/50"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Zoom (1-15)</label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={zoom}
                  onChange={(e) => setZoom(parseInt(e.target.value) || 2)}
                  className="w-full bg-black/30 border border-red-900/30 text-red-100 text-sm px-3 py-2 rounded focus:outline-none focus:border-red-600/50"
                />
              </div>
            </div>
          </div>

          {/* Stock Groups */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-red-400/50 mb-2">Stock Groups</label>
            <div className="space-y-3">
              {stockGroups.map((group, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={group.title}
                    onChange={(e) => updateStockGroupTitle(index, e.target.value)}
                    placeholder="Group Title"
                    className="w-32 bg-black/30 border border-red-900/30 text-red-100 text-sm px-3 py-2 rounded placeholder:text-red-900/50 focus:outline-none focus:border-red-600/50"
                  />
                  <input
                    type="text"
                    value={group.symbols.map((s) => s.symbol).join(", ")}
                    onChange={(e) => updateStockGroupSymbols(index, e.target.value)}
                    placeholder="Symbols (e.g., LMT, RTX, ^VIX)"
                    className="flex-1 bg-black/30 border border-red-900/30 text-red-100 text-sm px-3 py-2 rounded placeholder:text-red-900/50 focus:outline-none focus:border-red-600/50"
                  />
                  <button
                    type="button"
                    onClick={() => removeStockGroup(index)}
                    className="px-2 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addStockGroup}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                + Add Stock Group
              </button>
            </div>
          </div>

          {/* News Feeds */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-red-400/50 mb-2">News Feeds</label>
            <div className="space-y-3">
              {newsFeeds.map((feed, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={feed.source}
                    onChange={(e) => updateNewsFeed(index, "source", e.target.value)}
                    placeholder="Source Name"
                    className="w-32 bg-black/30 border border-red-900/30 text-red-100 text-sm px-3 py-2 rounded placeholder:text-red-900/50 focus:outline-none focus:border-red-600/50"
                  />
                  <input
                    type="url"
                    value={feed.url}
                    onChange={(e) => updateNewsFeed(index, "url", e.target.value)}
                    placeholder="RSS Feed URL"
                    className="flex-1 bg-black/30 border border-red-900/30 text-red-100 text-sm px-3 py-2 rounded placeholder:text-red-900/50 focus:outline-none focus:border-red-600/50"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewsFeed(index)}
                    className="px-2 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addNewsFeed}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                + Add News Feed
              </button>
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-red-400/50 mb-2">News Keywords (comma-separated)</label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g., Ukraine, Kyiv, Zelensky"
              className="w-full bg-black/30 border border-red-900/30 text-red-100 text-sm px-3 py-2 rounded placeholder:text-red-900/50 focus:outline-none focus:border-red-600/50"
            />
          </div>

          {/* Intel Accounts */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-red-400/50 mb-2">Intel Accounts</label>
            <div className="space-y-3">
              {intelAccounts.map((account, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={account.handle}
                    onChange={(e) => updateIntelAccount(index, "handle", e.target.value.replace("@", ""))}
                    placeholder="@handle"
                    className="w-28 bg-black/30 border border-red-900/30 text-red-100 text-sm px-3 py-2 rounded placeholder:text-red-900/50 focus:outline-none focus:border-red-600/50"
                  />
                  <input
                    type="text"
                    value={account.name}
                    onChange={(e) => updateIntelAccount(index, "name", e.target.value)}
                    placeholder="Display Name"
                    className="flex-1 bg-black/30 border border-red-900/30 text-red-100 text-sm px-3 py-2 rounded placeholder:text-red-900/50 focus:outline-none focus:border-red-600/50"
                  />
                  <select
                    value={account.category}
                    onChange={(e) => updateIntelAccount(index, "category", e.target.value)}
                    className="w-24 bg-black/30 border border-red-900/30 text-red-100 text-sm px-2 py-2 rounded focus:outline-none focus:border-red-600/50"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeIntelAccount(index)}
                    className="px-2 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addIntelAccount}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                + Add Intel Account
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-red-900/30">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-red-900/50 hover:bg-red-800/60 border border-red-900/50 text-red-100 text-sm rounded transition-colors"
          >
            {editingSituationId ? (isEditingPreset ? "Create Copy" : "Save Changes") : "Create Situation"}
          </button>
        </div>
      </div>
    </div>
  );
}
