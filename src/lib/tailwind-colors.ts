// Tailwind CSS Full Color Palette — hex + rgb for inline styles
// Value format: "colorFamily-shade/opacity" (e.g., "sky-950/70", "white/80", "transparent")

// ─── Color Families ────────────────────────────────────────────────────────────

export const TW_FAMILIES = [
  "slate", "gray", "zinc", "neutral", "stone",
  "red", "orange", "amber", "yellow", "lime",
  "green", "emerald", "teal", "cyan", "sky",
  "blue", "indigo", "violet", "purple", "fuchsia",
  "pink", "rose",
] as const;

export type TwFamily = (typeof TW_FAMILIES)[number];

export const TW_SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
export type TwShade = (typeof TW_SHADES)[number];

// ─── Full Palette (hex + rgb) ──────────────────────────────────────────────────

export interface ColorEntry {
  hex: string;
  rgb: [number, number, number];
}

export const TW_PALETTE: Record<string, ColorEntry> = {
  // Special
  transparent: { hex: "transparent", rgb: [0, 0, 0] },
  white: { hex: "#ffffff", rgb: [255, 255, 255] },
  black: { hex: "#000000", rgb: [0, 0, 0] },

  // Slate
  "slate-50":  { hex: "#f8fafc", rgb: [248, 250, 252] },
  "slate-100": { hex: "#f1f5f9", rgb: [241, 245, 249] },
  "slate-200": { hex: "#e2e8f0", rgb: [226, 232, 240] },
  "slate-300": { hex: "#cbd5e1", rgb: [203, 213, 225] },
  "slate-400": { hex: "#94a3b8", rgb: [148, 163, 184] },
  "slate-500": { hex: "#64748b", rgb: [100, 116, 139] },
  "slate-600": { hex: "#475569", rgb: [71, 85, 105] },
  "slate-700": { hex: "#334155", rgb: [51, 65, 85] },
  "slate-800": { hex: "#1e293b", rgb: [30, 41, 59] },
  "slate-900": { hex: "#0f172a", rgb: [15, 23, 42] },
  "slate-950": { hex: "#020617", rgb: [2, 6, 23] },

  // Gray
  "gray-50":  { hex: "#f9fafb", rgb: [249, 250, 251] },
  "gray-100": { hex: "#f3f4f6", rgb: [243, 244, 246] },
  "gray-200": { hex: "#e5e7eb", rgb: [229, 231, 235] },
  "gray-300": { hex: "#d1d5db", rgb: [209, 213, 219] },
  "gray-400": { hex: "#9ca3af", rgb: [156, 163, 175] },
  "gray-500": { hex: "#6b7280", rgb: [107, 114, 128] },
  "gray-600": { hex: "#4b5563", rgb: [75, 85, 99] },
  "gray-700": { hex: "#374151", rgb: [55, 65, 81] },
  "gray-800": { hex: "#1f2937", rgb: [31, 41, 55] },
  "gray-900": { hex: "#111827", rgb: [17, 24, 39] },
  "gray-950": { hex: "#030712", rgb: [3, 7, 18] },

  // Zinc
  "zinc-50":  { hex: "#fafafa", rgb: [250, 250, 250] },
  "zinc-100": { hex: "#f4f4f5", rgb: [244, 244, 245] },
  "zinc-200": { hex: "#e4e4e7", rgb: [228, 228, 231] },
  "zinc-300": { hex: "#d4d4d8", rgb: [212, 212, 216] },
  "zinc-400": { hex: "#a1a1aa", rgb: [161, 161, 170] },
  "zinc-500": { hex: "#71717a", rgb: [113, 113, 122] },
  "zinc-600": { hex: "#52525b", rgb: [82, 82, 91] },
  "zinc-700": { hex: "#3f3f46", rgb: [63, 63, 70] },
  "zinc-800": { hex: "#27272a", rgb: [39, 39, 42] },
  "zinc-900": { hex: "#18181b", rgb: [24, 24, 27] },
  "zinc-950": { hex: "#09090b", rgb: [9, 9, 11] },

  // Neutral
  "neutral-50":  { hex: "#fafafa", rgb: [250, 250, 250] },
  "neutral-100": { hex: "#f5f5f5", rgb: [245, 245, 245] },
  "neutral-200": { hex: "#e5e5e5", rgb: [229, 229, 229] },
  "neutral-300": { hex: "#d4d4d4", rgb: [212, 212, 212] },
  "neutral-400": { hex: "#a3a3a3", rgb: [163, 163, 163] },
  "neutral-500": { hex: "#737373", rgb: [115, 115, 115] },
  "neutral-600": { hex: "#525252", rgb: [82, 82, 82] },
  "neutral-700": { hex: "#404040", rgb: [64, 64, 64] },
  "neutral-800": { hex: "#262626", rgb: [38, 38, 38] },
  "neutral-900": { hex: "#171717", rgb: [23, 23, 23] },
  "neutral-950": { hex: "#0a0a0a", rgb: [10, 10, 10] },

  // Stone
  "stone-50":  { hex: "#fafaf9", rgb: [250, 250, 249] },
  "stone-100": { hex: "#f5f5f4", rgb: [245, 245, 244] },
  "stone-200": { hex: "#e7e5e4", rgb: [231, 229, 228] },
  "stone-300": { hex: "#d6d3d1", rgb: [214, 211, 209] },
  "stone-400": { hex: "#a8a29e", rgb: [168, 162, 158] },
  "stone-500": { hex: "#78716c", rgb: [120, 113, 108] },
  "stone-600": { hex: "#57534e", rgb: [87, 83, 78] },
  "stone-700": { hex: "#44403c", rgb: [68, 64, 60] },
  "stone-800": { hex: "#292524", rgb: [41, 37, 36] },
  "stone-900": { hex: "#1c1917", rgb: [28, 25, 23] },
  "stone-950": { hex: "#0c0a09", rgb: [12, 10, 9] },

  // Red
  "red-50":  { hex: "#fef2f2", rgb: [254, 242, 242] },
  "red-100": { hex: "#fee2e2", rgb: [254, 226, 226] },
  "red-200": { hex: "#fecaca", rgb: [254, 202, 202] },
  "red-300": { hex: "#fca5a5", rgb: [252, 165, 165] },
  "red-400": { hex: "#f87171", rgb: [248, 113, 113] },
  "red-500": { hex: "#ef4444", rgb: [239, 68, 68] },
  "red-600": { hex: "#dc2626", rgb: [220, 38, 38] },
  "red-700": { hex: "#b91c1c", rgb: [185, 28, 28] },
  "red-800": { hex: "#991b1b", rgb: [153, 27, 27] },
  "red-900": { hex: "#7f1d1d", rgb: [127, 29, 29] },
  "red-950": { hex: "#450a0a", rgb: [69, 10, 10] },

  // Orange
  "orange-50":  { hex: "#fff7ed", rgb: [255, 247, 237] },
  "orange-100": { hex: "#ffedd5", rgb: [255, 237, 213] },
  "orange-200": { hex: "#fed7aa", rgb: [254, 215, 170] },
  "orange-300": { hex: "#fdba74", rgb: [253, 186, 116] },
  "orange-400": { hex: "#fb923c", rgb: [251, 146, 60] },
  "orange-500": { hex: "#f97316", rgb: [249, 115, 22] },
  "orange-600": { hex: "#ea580c", rgb: [234, 88, 12] },
  "orange-700": { hex: "#c2410c", rgb: [194, 65, 12] },
  "orange-800": { hex: "#9a3412", rgb: [154, 52, 18] },
  "orange-900": { hex: "#7c2d12", rgb: [124, 45, 18] },
  "orange-950": { hex: "#431407", rgb: [67, 20, 7] },

  // Amber
  "amber-50":  { hex: "#fffbeb", rgb: [255, 251, 235] },
  "amber-100": { hex: "#fef3c7", rgb: [254, 243, 199] },
  "amber-200": { hex: "#fde68a", rgb: [253, 230, 138] },
  "amber-300": { hex: "#fcd34d", rgb: [252, 211, 77] },
  "amber-400": { hex: "#fbbf24", rgb: [251, 191, 36] },
  "amber-500": { hex: "#f59e0b", rgb: [245, 158, 11] },
  "amber-600": { hex: "#d97706", rgb: [217, 119, 6] },
  "amber-700": { hex: "#b45309", rgb: [180, 83, 9] },
  "amber-800": { hex: "#92400e", rgb: [146, 64, 14] },
  "amber-900": { hex: "#78350f", rgb: [120, 53, 15] },
  "amber-950": { hex: "#451a03", rgb: [69, 26, 3] },

  // Yellow
  "yellow-50":  { hex: "#fefce8", rgb: [254, 252, 232] },
  "yellow-100": { hex: "#fef9c3", rgb: [254, 249, 195] },
  "yellow-200": { hex: "#fef08a", rgb: [254, 240, 138] },
  "yellow-300": { hex: "#fde047", rgb: [253, 224, 71] },
  "yellow-400": { hex: "#facc15", rgb: [250, 204, 21] },
  "yellow-500": { hex: "#eab308", rgb: [234, 179, 8] },
  "yellow-600": { hex: "#ca8a04", rgb: [202, 138, 4] },
  "yellow-700": { hex: "#a16207", rgb: [161, 98, 7] },
  "yellow-800": { hex: "#854d0e", rgb: [133, 77, 14] },
  "yellow-900": { hex: "#713f12", rgb: [113, 63, 18] },
  "yellow-950": { hex: "#422006", rgb: [66, 32, 6] },

  // Lime
  "lime-50":  { hex: "#f7fee7", rgb: [247, 254, 231] },
  "lime-100": { hex: "#ecfccb", rgb: [236, 252, 203] },
  "lime-200": { hex: "#d9f99d", rgb: [217, 249, 157] },
  "lime-300": { hex: "#bef264", rgb: [190, 242, 100] },
  "lime-400": { hex: "#a3e635", rgb: [163, 230, 53] },
  "lime-500": { hex: "#84cc16", rgb: [132, 204, 22] },
  "lime-600": { hex: "#65a30d", rgb: [101, 163, 13] },
  "lime-700": { hex: "#4d7c0f", rgb: [77, 124, 15] },
  "lime-800": { hex: "#3f6212", rgb: [63, 98, 18] },
  "lime-900": { hex: "#365314", rgb: [54, 83, 20] },
  "lime-950": { hex: "#1a2e05", rgb: [26, 46, 5] },

  // Green
  "green-50":  { hex: "#f0fdf4", rgb: [240, 253, 244] },
  "green-100": { hex: "#dcfce7", rgb: [220, 252, 231] },
  "green-200": { hex: "#bbf7d0", rgb: [187, 247, 208] },
  "green-300": { hex: "#86efac", rgb: [134, 239, 172] },
  "green-400": { hex: "#4ade80", rgb: [74, 222, 128] },
  "green-500": { hex: "#22c55e", rgb: [34, 197, 94] },
  "green-600": { hex: "#16a34a", rgb: [22, 163, 74] },
  "green-700": { hex: "#15803d", rgb: [21, 128, 61] },
  "green-800": { hex: "#166534", rgb: [22, 101, 52] },
  "green-900": { hex: "#14532d", rgb: [20, 83, 45] },
  "green-950": { hex: "#052e16", rgb: [5, 46, 22] },

  // Emerald
  "emerald-50":  { hex: "#ecfdf5", rgb: [236, 253, 245] },
  "emerald-100": { hex: "#d1fae5", rgb: [209, 250, 229] },
  "emerald-200": { hex: "#a7f3d0", rgb: [167, 243, 208] },
  "emerald-300": { hex: "#6ee7b7", rgb: [110, 231, 183] },
  "emerald-400": { hex: "#34d399", rgb: [52, 211, 153] },
  "emerald-500": { hex: "#10b981", rgb: [16, 185, 129] },
  "emerald-600": { hex: "#059669", rgb: [5, 150, 105] },
  "emerald-700": { hex: "#047857", rgb: [4, 120, 87] },
  "emerald-800": { hex: "#065f46", rgb: [6, 95, 70] },
  "emerald-900": { hex: "#064e3b", rgb: [6, 78, 59] },
  "emerald-950": { hex: "#022c22", rgb: [2, 44, 34] },

  // Teal
  "teal-50":  { hex: "#f0fdfa", rgb: [240, 253, 250] },
  "teal-100": { hex: "#ccfbf1", rgb: [204, 251, 241] },
  "teal-200": { hex: "#99f6e4", rgb: [153, 246, 228] },
  "teal-300": { hex: "#5eead4", rgb: [94, 234, 212] },
  "teal-400": { hex: "#2dd4bf", rgb: [45, 212, 191] },
  "teal-500": { hex: "#14b8a6", rgb: [20, 184, 166] },
  "teal-600": { hex: "#0d9488", rgb: [13, 148, 136] },
  "teal-700": { hex: "#0f766e", rgb: [15, 118, 110] },
  "teal-800": { hex: "#115e59", rgb: [17, 94, 89] },
  "teal-900": { hex: "#134e4a", rgb: [19, 78, 74] },
  "teal-950": { hex: "#042f2e", rgb: [4, 47, 46] },

  // Cyan
  "cyan-50":  { hex: "#ecfeff", rgb: [236, 254, 255] },
  "cyan-100": { hex: "#cffafe", rgb: [207, 250, 254] },
  "cyan-200": { hex: "#a5f3fc", rgb: [165, 243, 252] },
  "cyan-300": { hex: "#67e8f9", rgb: [103, 232, 249] },
  "cyan-400": { hex: "#22d3ee", rgb: [34, 211, 238] },
  "cyan-500": { hex: "#06b6d4", rgb: [6, 182, 212] },
  "cyan-600": { hex: "#0891b2", rgb: [8, 145, 178] },
  "cyan-700": { hex: "#0e7490", rgb: [14, 116, 144] },
  "cyan-800": { hex: "#155e75", rgb: [21, 94, 117] },
  "cyan-900": { hex: "#164e63", rgb: [22, 78, 99] },
  "cyan-950": { hex: "#083344", rgb: [8, 51, 68] },

  // Sky
  "sky-50":  { hex: "#f0f9ff", rgb: [240, 249, 255] },
  "sky-100": { hex: "#e0f2fe", rgb: [224, 242, 254] },
  "sky-200": { hex: "#bae6fd", rgb: [186, 230, 253] },
  "sky-300": { hex: "#7dd3fc", rgb: [125, 211, 252] },
  "sky-400": { hex: "#38bdf8", rgb: [56, 189, 248] },
  "sky-500": { hex: "#0ea5e9", rgb: [14, 165, 233] },
  "sky-600": { hex: "#0284c7", rgb: [2, 132, 199] },
  "sky-700": { hex: "#0369a1", rgb: [3, 105, 161] },
  "sky-800": { hex: "#075985", rgb: [7, 89, 133] },
  "sky-900": { hex: "#0c4a6e", rgb: [12, 74, 110] },
  "sky-950": { hex: "#082f49", rgb: [8, 47, 73] },

  // Blue
  "blue-50":  { hex: "#eff6ff", rgb: [239, 246, 255] },
  "blue-100": { hex: "#dbeafe", rgb: [219, 234, 254] },
  "blue-200": { hex: "#bfdbfe", rgb: [191, 219, 254] },
  "blue-300": { hex: "#93c5fd", rgb: [147, 197, 253] },
  "blue-400": { hex: "#60a5fa", rgb: [96, 165, 250] },
  "blue-500": { hex: "#3b82f6", rgb: [59, 130, 246] },
  "blue-600": { hex: "#2563eb", rgb: [37, 99, 235] },
  "blue-700": { hex: "#1d4ed8", rgb: [29, 78, 216] },
  "blue-800": { hex: "#1e40af", rgb: [30, 64, 175] },
  "blue-900": { hex: "#1e3a8a", rgb: [30, 58, 138] },
  "blue-950": { hex: "#172554", rgb: [23, 37, 84] },

  // Indigo
  "indigo-50":  { hex: "#eef2ff", rgb: [238, 242, 255] },
  "indigo-100": { hex: "#e0e7ff", rgb: [224, 231, 255] },
  "indigo-200": { hex: "#c7d2fe", rgb: [199, 210, 254] },
  "indigo-300": { hex: "#a5b4fc", rgb: [165, 180, 252] },
  "indigo-400": { hex: "#818cf8", rgb: [129, 140, 248] },
  "indigo-500": { hex: "#6366f1", rgb: [99, 102, 241] },
  "indigo-600": { hex: "#4f46e5", rgb: [79, 70, 229] },
  "indigo-700": { hex: "#4338ca", rgb: [67, 56, 202] },
  "indigo-800": { hex: "#3730a3", rgb: [55, 48, 163] },
  "indigo-900": { hex: "#312e81", rgb: [49, 46, 129] },
  "indigo-950": { hex: "#1e1b4b", rgb: [30, 27, 75] },

  // Violet
  "violet-50":  { hex: "#f5f3ff", rgb: [245, 243, 255] },
  "violet-100": { hex: "#ede9fe", rgb: [237, 233, 254] },
  "violet-200": { hex: "#ddd6fe", rgb: [221, 214, 254] },
  "violet-300": { hex: "#c4b5fd", rgb: [196, 181, 253] },
  "violet-400": { hex: "#a78bfa", rgb: [167, 139, 250] },
  "violet-500": { hex: "#8b5cf6", rgb: [139, 92, 246] },
  "violet-600": { hex: "#7c3aed", rgb: [124, 58, 237] },
  "violet-700": { hex: "#6d28d9", rgb: [109, 40, 217] },
  "violet-800": { hex: "#5b21b6", rgb: [91, 33, 182] },
  "violet-900": { hex: "#4c1d95", rgb: [76, 29, 149] },
  "violet-950": { hex: "#2e1065", rgb: [46, 16, 101] },

  // Purple
  "purple-50":  { hex: "#faf5ff", rgb: [250, 245, 255] },
  "purple-100": { hex: "#f3e8ff", rgb: [243, 232, 255] },
  "purple-200": { hex: "#e9d5ff", rgb: [233, 213, 255] },
  "purple-300": { hex: "#d8b4fe", rgb: [216, 180, 254] },
  "purple-400": { hex: "#c084fc", rgb: [192, 132, 252] },
  "purple-500": { hex: "#a855f7", rgb: [168, 85, 247] },
  "purple-600": { hex: "#9333ea", rgb: [147, 51, 234] },
  "purple-700": { hex: "#7e22ce", rgb: [126, 34, 206] },
  "purple-800": { hex: "#6b21a8", rgb: [107, 33, 168] },
  "purple-900": { hex: "#581c87", rgb: [88, 28, 135] },
  "purple-950": { hex: "#3b0764", rgb: [59, 7, 100] },

  // Fuchsia
  "fuchsia-50":  { hex: "#fdf4ff", rgb: [253, 244, 255] },
  "fuchsia-100": { hex: "#fae8ff", rgb: [250, 232, 255] },
  "fuchsia-200": { hex: "#f5d0fe", rgb: [245, 208, 254] },
  "fuchsia-300": { hex: "#f0abfc", rgb: [240, 171, 252] },
  "fuchsia-400": { hex: "#e879f9", rgb: [232, 121, 249] },
  "fuchsia-500": { hex: "#d946ef", rgb: [217, 70, 239] },
  "fuchsia-600": { hex: "#c026d3", rgb: [192, 38, 211] },
  "fuchsia-700": { hex: "#a21caf", rgb: [162, 28, 175] },
  "fuchsia-800": { hex: "#86198f", rgb: [134, 25, 143] },
  "fuchsia-900": { hex: "#701a75", rgb: [112, 26, 117] },
  "fuchsia-950": { hex: "#4a044e", rgb: [74, 4, 78] },

  // Pink
  "pink-50":  { hex: "#fdf2f8", rgb: [253, 242, 248] },
  "pink-100": { hex: "#fce7f3", rgb: [252, 231, 243] },
  "pink-200": { hex: "#fbcfe8", rgb: [251, 207, 232] },
  "pink-300": { hex: "#f9a8d4", rgb: [249, 168, 212] },
  "pink-400": { hex: "#f472b6", rgb: [244, 114, 182] },
  "pink-500": { hex: "#ec4899", rgb: [236, 72, 153] },
  "pink-600": { hex: "#db2777", rgb: [219, 39, 119] },
  "pink-700": { hex: "#be185d", rgb: [190, 24, 93] },
  "pink-800": { hex: "#9d174d", rgb: [157, 23, 77] },
  "pink-900": { hex: "#831843", rgb: [131, 24, 67] },
  "pink-950": { hex: "#500724", rgb: [80, 7, 36] },

  // Rose
  "rose-50":  { hex: "#fff1f2", rgb: [255, 241, 242] },
  "rose-100": { hex: "#ffe4e6", rgb: [255, 228, 230] },
  "rose-200": { hex: "#fecdd3", rgb: [254, 205, 211] },
  "rose-300": { hex: "#fda4af", rgb: [253, 164, 175] },
  "rose-400": { hex: "#fb7185", rgb: [251, 113, 133] },
  "rose-500": { hex: "#f43f5e", rgb: [244, 63, 94] },
  "rose-600": { hex: "#e11d48", rgb: [225, 29, 72] },
  "rose-700": { hex: "#be123c", rgb: [190, 18, 60] },
  "rose-800": { hex: "#9f1239", rgb: [159, 18, 57] },
  "rose-900": { hex: "#881337", rgb: [136, 19, 55] },
  "rose-950": { hex: "#4c0519", rgb: [76, 5, 25] },
};

// ─── Parsed Color Type ─────────────────────────────────────────────────────────

export interface ParsedColor {
  /** Raw input value, e.g. "sky-950/70" */
  raw: string;
  /** Color key without opacity, e.g. "sky-950" */
  key: string;
  /** Opacity 0-100, default 100 */
  opacity: number;
  /** CSS rgba string, e.g. "rgba(8,47,73,0.7)" */
  rgba: string;
  /** Whether this is a "dark" color (luminance < 0.5) */
  isDark: boolean;
}

// ─── Parsing Utilities ─────────────────────────────────────────────────────────

/**
 * Parse a color value string into its components.
 * Formats: "sky-950", "sky-950/70", "white/80", "transparent"
 */
export function parseColorValue(value: string | undefined | null): ParsedColor {
  if (!value || value === "transparent") {
    return {
      raw: "transparent",
      key: "transparent",
      opacity: 0,
      rgba: "transparent",
      isDark: false,
    };
  }

  const parts = value.split("/");
  const key = parts[0];
  const opacity = parts[1] ? Math.min(100, Math.max(0, parseInt(parts[1], 10))) : 100;

  const entry = TW_PALETTE[key];
  if (!entry) {
    return {
      raw: value,
      key,
      opacity,
      rgba: "transparent",
      isDark: false,
    };
  }

  const alpha = opacity / 100;
  const [r, g, b] = entry.rgb;
  const rgba = alpha >= 1
    ? entry.hex
    : `rgba(${r}, ${g}, ${b}, ${alpha})`;

  return {
    raw: value,
    key,
    opacity,
    rgba,
    isDark: isDarkColor(key),
  };
}

/**
 * Build a color value string from key + opacity.
 * e.g. buildColorValue("sky-950", 70) → "sky-950/70"
 *      buildColorValue("white", 100) → "white"
 */
export function buildColorValue(key: string, opacity: number): string {
  if (key === "transparent") return "transparent";
  const clamped = Math.min(100, Math.max(0, Math.round(opacity)));
  return clamped >= 100 ? key : `${key}/${clamped}`;
}

// ─── Style Helpers ─────────────────────────────────────────────────────────────

/** Convert a color value to inline background style */
export function toBgStyle(value: string | undefined | null): React.CSSProperties {
  const parsed = parseColorValue(value);
  if (parsed.key === "transparent") return {};
  return { backgroundColor: parsed.rgba };
}

/** Convert a color value to inline text color style */
export function toTextStyle(value: string | undefined | null): React.CSSProperties {
  const parsed = parseColorValue(value);
  if (parsed.key === "transparent") return {};
  return { color: parsed.rgba };
}

// ─── Color Classification ──────────────────────────────────────────────────────

/**
 * Check if a color key is "dark" based on relative luminance.
 * Uses simplified sRGB luminance: 0.299R + 0.587G + 0.114B < 128
 */
export function isDarkColor(key: string): boolean {
  if (key === "transparent" || key === "white") return false;
  if (key === "black") return true;

  const entry = TW_PALETTE[key];
  if (!entry) return false;

  const [r, g, b] = entry.rgb;
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance < 128;
}

// ─── Admin UI Helpers ──────────────────────────────────────────────────────────

/** Get display label for a color key, e.g. "sky-950" → "Sky 950" */
export function colorLabel(key: string): string {
  if (key === "transparent") return "Transparent";
  if (key === "white") return "White";
  if (key === "black") return "Black";

  const parts = key.split("-");
  const family = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  const shade = parts[1];
  return `${family} ${shade}`;
}

/** Get all shades for a family, returns array of { key, hex, label } */
export function familyShades(family: string) {
  return TW_SHADES.map((shade) => {
    const key = `${family}-${shade}`;
    const entry = TW_PALETTE[key];
    return entry ? { key, hex: entry.hex, shade, label: colorLabel(key) } : null;
  }).filter(Boolean) as { key: string; hex: string; shade: TwShade; label: string }[];
}

/** Backdrop blur options */
export const BACKDROP_BLUR_OPTIONS = [
  { value: "none", label: "None" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Extra Large" },
  { value: "2xl", label: "2X Large" },
] as const;

export type BackdropBlur = (typeof BACKDROP_BLUR_OPTIONS)[number]["value"];
