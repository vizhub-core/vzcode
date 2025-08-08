// Small helper to persist user prefs (theme + zenMode)
type Theme = "light" | "dark"; // Define the Theme type

// import type { Theme } from "."; // Remove this line if defining Theme here

const STORAGE_KEY = "vz_prefs_v1";

export type Prefs = {
  theme: Theme;
  zenMode: boolean;
};

export function loadPrefs(): Partial<Prefs> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const out: Partial<Prefs> = {};
    if (parsed.theme === "dark" || parsed.theme === "light") out.theme = parsed.theme;
    if (typeof parsed.zenMode === "boolean") out.zenMode = parsed.zenMode;
    return out;
  } catch {
    return {};
  }
}

export function savePrefs(p: Partial<Prefs>) {
  if (typeof window === "undefined") return;
  try {
    const existing = loadPrefs();
    const merged = { ...existing, ...p };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
  }
}
