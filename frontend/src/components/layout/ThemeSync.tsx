'use client';

import { useEffect } from 'react';
import { useThemeStore } from '../../store/themeStore';

export function ThemeSync() {
  const { mode, colors, preset, shades } = useThemeStore();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;

    // 1. Apply light/dark/system mode class
    const applyMode = (selectedMode: typeof mode) => {
      const isDark =
        selectedMode === 'dark' ||
        (selectedMode === 'system' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches);

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyMode(mode);

    // 2. Apply theme shades (brand colors)
    Object.entries(shades).forEach(([shade, value]) => {
      root.style.setProperty(`--theme-amber-${shade}`, value);
    });

    // 3. Apply sidebar color variables
    root.style.setProperty('--theme-sidebar-bg', colors.sidebarBg);
    root.style.setProperty('--theme-sidebar-fg', colors.sidebarFg);
    root.style.setProperty('--theme-sidebar-active-bg', colors.sidebarActiveBg);
    root.style.setProperty('--theme-sidebar-active-fg', colors.sidebarActiveFg);
    root.style.setProperty('--theme-sidebar-border', colors.sidebarBorder);

  }, [mode, colors, preset, shades]);

  // Listen for system theme preference changes when mode is set to 'system'
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (mode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const root = document.documentElement;
      if (e.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    // Use addEventListener or fallback addListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    } else {
      mediaQuery.addListener(handleSystemThemeChange);
      return () => mediaQuery.removeListener(handleSystemThemeChange);
    }
  }, [mode]);

  return null;
}
export default ThemeSync;
