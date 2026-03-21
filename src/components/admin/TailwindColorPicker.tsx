"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  TW_FAMILIES,
  TW_SHADES,
  TW_PALETTE,
  BACKDROP_BLUR_OPTIONS,
  parseColorValue,
  buildColorValue,
  colorLabel,
  familyShades,
  type BackdropBlur,
} from "@/lib/tailwind-colors";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface TailwindColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  showBlur?: boolean;
  blurValue?: BackdropBlur;
  onBlurChange?: (blur: BackdropBlur) => void;
}

// ─── Special colors row ────────────────────────────────────────────────────────

const SPECIAL_COLORS = [
  { key: "transparent", hex: "transparent", label: "Transparent" },
  { key: "white", hex: "#ffffff", label: "White" },
  { key: "black", hex: "#000000", label: "Black" },
] as const;

// ─── Checkerboard SVG for transparent preview ──────────────────────────────────

const CHECKER_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='8' height='8' fill='%23ccc'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%23ccc'/%3E%3Crect x='8' width='8' height='8' fill='%23fff'/%3E%3Crect y='8' width='8' height='8' fill='%23fff'/%3E%3C/svg%3E\")";

// ─── Component ─────────────────────────────────────────────────────────────────

export default function TailwindColorPicker({
  label,
  value,
  onChange,
  showBlur = false,
  blurValue = "none",
  onBlurChange,
}: TailwindColorPickerProps) {
  const [search, setSearch] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  // Parse current value
  const parsed = useMemo(() => parseColorValue(value), [value]);

  // Filtered families by search
  const filteredFamilies = useMemo(() => {
    if (!search.trim()) return [...TW_FAMILIES];
    const q = search.toLowerCase();
    return TW_FAMILIES.filter((f) => f.includes(q));
  }, [search]);

  // Handle swatch click
  const handleSwatchClick = useCallback(
    (key: string) => {
      const newValue = buildColorValue(key, parsed.opacity || 100);
      onChange(newValue);
    },
    [parsed.opacity, onChange]
  );

  // Handle opacity change
  const handleOpacityChange = useCallback(
    (opacity: number) => {
      if (parsed.key === "transparent") return;
      onChange(buildColorValue(parsed.key, opacity));
    },
    [parsed.key, onChange]
  );

  // Display label
  const displayLabel = useMemo(() => {
    if (parsed.key === "transparent") return "Transparent";
    const cl = colorLabel(parsed.key);
    return parsed.opacity < 100 ? `${cl} / ${parsed.opacity}%` : cl;
  }, [parsed]);

  return (
    <div className="space-y-2">
      {/* Header: label + current selection + toggle */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          {isExpanded ? "Collapse" : "Expand"}
        </button>
      </div>

      {/* Selected color preview */}
      <div className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg bg-white">
        <div
          className="w-8 h-8 rounded border border-gray-300 shrink-0"
          style={{
            backgroundImage: CHECKER_BG,
            backgroundSize: "16px 16px",
          }}
        >
          <div
            className="w-full h-full rounded"
            style={{
              backgroundColor: parsed.rgba,
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-gray-900 truncate block">
            {displayLabel}
          </span>
          <span className="text-xs text-gray-500">{value || "transparent"}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Search colors (e.g. sky, red, blue)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          {/* Special colors row */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 w-16 shrink-0">Special</span>
            <div className="flex gap-1">
              {SPECIAL_COLORS.map(({ key, hex }) => (
                <button
                  key={key}
                  type="button"
                  title={key}
                  onClick={() => handleSwatchClick(key)}
                  className={`w-6 h-6 rounded border-2 transition-all ${
                    parsed.key === key
                      ? "border-blue-500 ring-2 ring-blue-300 scale-110"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  style={{
                    backgroundColor: hex === "transparent" ? undefined : hex,
                    backgroundImage: hex === "transparent" ? CHECKER_BG : undefined,
                    backgroundSize: "8px 8px",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Color grid */}
          <div
            className="overflow-y-auto overflow-x-auto"
            style={{ maxHeight: "280px" }}
          >
            <table className="border-collapse">
              <thead>
                <tr>
                  <th className="text-xs text-gray-400 font-normal text-left pr-1 sticky left-0 bg-gray-50 z-10 w-16" />
                  {TW_SHADES.map((shade) => (
                    <th
                      key={shade}
                      className="text-[10px] text-gray-400 font-normal px-0.5 text-center"
                    >
                      {shade}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredFamilies.map((family) => {
                  const shades = familyShades(family);
                  return (
                    <tr key={family}>
                      <td className="text-xs text-gray-500 pr-1 sticky left-0 bg-gray-50 z-10 capitalize whitespace-nowrap">
                        {family}
                      </td>
                      {shades.map(({ key, hex }) => (
                        <td key={key} className="px-0.5 py-0.5">
                          <button
                            type="button"
                            title={`${key} (${hex})`}
                            onClick={() => handleSwatchClick(key)}
                            className={`w-5 h-5 rounded-sm border transition-all ${
                              parsed.key === key
                                ? "border-blue-500 ring-2 ring-blue-300 scale-125 z-10 relative"
                                : "border-transparent hover:border-gray-400 hover:scale-110"
                            }`}
                            style={{ backgroundColor: hex }}
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Opacity slider */}
          {parsed.key !== "transparent" && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 font-medium">
                  Opacity
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={parsed.opacity}
                    onChange={(e) =>
                      handleOpacityChange(parseInt(e.target.value, 10) || 0)
                    }
                    className="w-14 px-1.5 py-0.5 text-xs text-right border border-gray-300 rounded"
                  />
                  <span className="text-xs text-gray-400">%</span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={parsed.opacity}
                onChange={(e) => handleOpacityChange(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          )}

          {/* Backdrop blur dropdown */}
          {showBlur && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 font-medium whitespace-nowrap">
                Backdrop Blur
              </span>
              <select
                value={blurValue}
                onChange={(e) =>
                  onBlurChange?.(e.target.value as BackdropBlur)
                }
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-md"
              >
                {BACKDROP_BLUR_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Live preview with checkerboard */}
          <div className="space-y-1">
            <span className="text-xs text-gray-600 font-medium">Preview</span>
            <div
              className="w-full h-10 rounded-md border border-gray-300"
              style={{
                backgroundImage: CHECKER_BG,
                backgroundSize: "16px 16px",
              }}
            >
              <div
                className="w-full h-full rounded-md"
                style={{ backgroundColor: parsed.rgba }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
