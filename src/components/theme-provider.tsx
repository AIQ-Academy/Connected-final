"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme?: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const THEME_STORAGE_KEY = "theme";

function applyTheme(theme: Theme, disableTransition = false) {
  let transitionStyle: HTMLStyleElement | undefined;
  if (disableTransition) {
    transitionStyle = document.createElement("style");
    transitionStyle.appendChild(
      document.createTextNode("*,*::before,*::after{transition:none!important}"),
    );
    document.head.appendChild(transitionStyle);
    window.getComputedStyle(document.body);
  }
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  if (transitionStyle) {
    requestAnimationFrame(() => requestAnimationFrame(() => transitionStyle?.remove()));
  }
}

/**
 * Keeps theme state in React without rendering an executable script inside a
 * client component. The tiny pre-hydration initializer lives in Next's root
 * layout, where Next can safely manage it.
 */
export function ThemeProvider({
  children,
  defaultTheme = "light",
  disableTransitionOnChange = true,
}: {
  children: ReactNode;
  defaultTheme?: Theme;
  attribute?: "class";
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let initialTheme = defaultTheme;
    try {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "light" || stored === "dark") initialTheme = stored;
    } catch {
      // Storage can be unavailable in privacy-restricted browser contexts.
    }
    // Hydrate theme state from browser storage after the server render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(initialTheme);
    applyTheme(initialTheme);
    setMounted(true);
  }, [defaultTheme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyTheme(next, disableTransitionOnChange);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Keep the in-memory theme usable even when storage is unavailable.
    }
  }, [disableTransitionOnChange]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme: mounted ? theme : undefined, setTheme }),
    [mounted, setTheme, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
