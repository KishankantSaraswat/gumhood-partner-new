# Theme & Tokenized Design System

An enterprise SaaS frontend requires a scalable theme architecture that supports multi-brand styling, accent colors, light/dark modes, and elevation surfaces without polluting JSX with inline styles.

---

## 1. CSS Variable Architecture (`globals.css`)

Define all core design tokens in `:root`, and override only the accent or surface variables in theme selectors:

```css
/* ── Root Design System Tokens ────────────────────────────────────────── */
:root {
  /* Default Primary Brand (Indigo / Blue) */
  --color-primary: #4f6ef7;
  --color-primary-hover: #3b5bdb;
  --color-primary-light: #eff2ff;
  --color-primary-glow: rgba(79, 110, 247, 0.45);
  --shadow-primary: 0 8px 24px rgba(79, 110, 247, 0.35);

  /* Surfaces & Backgrounds */
  --color-bg: #f8fafc;
  --color-surface: #ffffff;
  --color-surface-hover: #f1f5f9;

  /* Borders & Dividers */
  --color-border: rgba(226, 232, 240, 0.9);
  --color-border-strong: #cbd5e1;

  /* Typography */
  --color-text: #0f172a;
  --color-text-muted: #64748b;

  /* Radii Scale */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 18px;

  /* Shadows */
  --shadow-card: 0 2px 10px rgba(15, 23, 42, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

/* ── Multi-Brand Accent Themes ───────────────────────────────────────── */
[data-theme="blue"] {
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-primary-light: #dbeafe;
  --color-primary-glow: rgba(59, 130, 246, 0.45);
  --shadow-primary: 0 8px 24px rgba(59, 130, 246, 0.35);
}

[data-theme="green"] {
  --color-primary: #10b981;
  --color-primary-hover: #059669;
  --color-primary-light: #d1fae5;
  --color-primary-glow: rgba(16, 185, 129, 0.45);
  --shadow-primary: 0 8px 24px rgba(16, 185, 129, 0.35);
}

[data-theme="orange"] {
  --color-primary: #f97316;
  --color-primary-hover: #ea580c;
  --color-primary-light: #ffedd5;
  --color-primary-glow: rgba(249, 115, 22, 0.45);
  --shadow-primary: 0 8px 24px rgba(249, 115, 22, 0.35);
}

[data-theme="violet"] {
  --color-primary: #8b5cf6;
  --color-primary-hover: #7c3aed;
  --color-primary-light: #f3e8ff;
  --color-primary-glow: rgba(139, 92, 246, 0.45);
  --shadow-primary: 0 8px 24px rgba(139, 92, 246, 0.35);
}

[data-theme="yellow"] {
  --color-primary: #eab308;
  --color-primary-hover: #ca8a04;
  --color-primary-light: #fef9c3;
  --color-primary-glow: rgba(234, 179, 8, 0.45);
  --shadow-primary: 0 8px 24px rgba(234, 179, 8, 0.35);
}

/* ── Dark Mode Token Inversion ───────────────────────────────────────── */
[data-mode="dark"],
.dark {
  --color-bg: #090d16;
  --color-surface: #111827;
  --color-surface-hover: #1f2937;
  --color-border: rgba(55, 65, 81, 0.8);
  --color-border-strong: #4b5563;
  --color-text: #f9fafb;
  --color-text-muted: #9ca3af;
  --shadow-card: 0 4px 16px rgba(0, 0, 0, 0.35);
}
```

---

## 2. Core Surface & Control Utility Classes

Always style surfaces and elements with standardized token classes:

```css
/* ── Common Card / Surface ── */
.common-surface {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

/* ── Standard Input ── */
.input {
  height: 38px;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-glow);
}

/* ── Primary Action Button ── */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 38px;
  padding: 0 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  background-color: var(--color-primary);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-primary);
  transition: all 0.15s ease;
  cursor: pointer;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
  transform: translateY(-1px);
}
```

---

## 3. React Theme Context & Selector (`ThemeContext.tsx`)

A zero-friction provider that persists the user's selected theme and mode in `localStorage`:

```tsx
import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeColor = "blue" | "green" | "orange" | "violet" | "yellow";
type Mode = "light" | "dark";

interface ThemeContextType {
  theme: ThemeColor;
  setTheme: (t: ThemeColor) => void;
  mode: Mode;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeColor>("blue");
  const [mode, setModeState] = useState<Mode>("light");

  useEffect(() => {
    const savedTheme = (localStorage.getItem("app-theme") as ThemeColor) || "blue";
    const savedMode = (localStorage.getItem("app-mode") as Mode) || "light";
    setTheme(savedTheme);
    setMode(savedMode);
  }, []);

  const setTheme = (t: ThemeColor) => {
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("app-theme", t);
  };

  const setMode = (m: Mode) => {
    setModeState(m);
    document.documentElement.setAttribute("data-mode", m);
    if (m === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("app-mode", m);
  };

  const toggleMode = () => setMode(mode === "light" ? "dark" : "light");

  return (
    <ThemeContext.Provider value={{ theme, setTheme, mode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
```

---

## 4. Compact Theme Switcher Component

```tsx
import React from "react";
import { useTheme } from "./ThemeContext";
import { Sun, Moon } from "lucide-react";

export function ThemeSelector() {
  const { theme, setTheme, mode, toggleMode } = useTheme();

  const THEMES: { id: "blue" | "green" | "orange" | "violet" | "yellow"; bg: string }[] = [
    { id: "blue", bg: "bg-blue-500" },
    { id: "green", bg: "bg-emerald-500" },
    { id: "orange", bg: "bg-orange-500" },
    { id: "violet", bg: "bg-purple-500" },
    { id: "yellow", bg: "bg-yellow-500" },
  ];

  return (
    <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => setTheme(t.id)}
          className={`w-4 h-4 rounded-full ${t.bg} cursor-pointer transition-transform ${
            theme === t.id ? "scale-125 ring-2 ring-primary ring-offset-1" : "opacity-70 hover:opacity-100"
          }`}
          title={`Switch to ${t.id} theme`}
        />
      ))}
      <div className="w-[1px] h-3 bg-slate-300 mx-0.5" />
      <button
        type="button"
        onClick={toggleMode}
        className="text-slate-600 hover:text-slate-900 cursor-pointer p-0.5"
        title="Toggle dark mode"
      >
        {mode === "light" ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
```

