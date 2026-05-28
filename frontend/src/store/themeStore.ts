import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemePreset = 'coffee' | 'emerald' | 'indigo' | 'rose' | 'slate' | 'custom';

export interface ThemeColors {
  primary: string;
  sidebarBg: string;
  sidebarFg: string;
  sidebarActiveBg: string;
  sidebarActiveFg: string;
  sidebarBorder: string;
}

export interface ThemePresetConfig {
  name: string;
  colors: ThemeColors;
  shades: Record<string, string>;
}

export const PRESETS: Record<Exclude<ThemePreset, 'custom'>, ThemePresetConfig> = {
  coffee: {
    name: 'Cà phê cổ điển (Amber)',
    colors: {
      primary: '#b45309', // Amber 700
      sidebarBg: '#78350f', // Amber 900
      sidebarFg: '#fde68a', // Amber 200
      sidebarActiveBg: '#b45309', // Amber 700
      sidebarActiveFg: '#ffffff',
      sidebarBorder: '#92400e', // Amber 800
    },
    shades: {
      '50': '#fffbeb',
      '100': '#fef3c7',
      '200': '#fde68a',
      '300': '#fcd34d',
      '400': '#fbbf24',
      '500': '#f59e0b',
      '600': '#d97706',
      '700': '#b45309',
      '800': '#92400e',
      '850': '#8b4d1b',
      '900': '#78350f',
      '950': '#451a03',
    },
  },
  emerald: {
    name: 'Bạc hà tươi mát (Teal)',
    colors: {
      primary: '#0f766e', // Teal 700
      sidebarBg: '#115e59', // Teal 800
      sidebarFg: '#ccfbf1', // Teal 100
      sidebarActiveBg: '#0f766e', // Teal 700
      sidebarActiveFg: '#ffffff',
      sidebarBorder: '#134e4a', // Teal 900
    },
    shades: {
      '50': '#f0fdfa',
      '100': '#ccfbf1',
      '200': '#99f6e4',
      '300': '#5eead4',
      '400': '#2dd4bf',
      '500': '#14b8a6',
      '600': '#0d9488',
      '700': '#0f766e',
      '800': '#115e59',
      '850': '#114b47',
      '900': '#134e4a',
      '950': '#042f2e',
    },
  },
  indigo: {
    name: 'Công nghệ hiện đại (Indigo)',
    colors: {
      primary: '#4338ca', // Indigo 700
      sidebarBg: '#312e81', // Indigo 900
      sidebarFg: '#e0e7ff', // Indigo 100
      sidebarActiveBg: '#4338ca', // Indigo 700
      sidebarActiveFg: '#ffffff',
      sidebarBorder: '#3730a3', // Indigo 800
    },
    shades: {
      '50': '#eef2ff',
      '100': '#e0e7ff',
      '200': '#c7d2fe',
      '300': '#a5b4fc',
      '400': '#818cf8',
      '500': '#6366f1',
      '600': '#4f46e5',
      '700': '#4338ca',
      '800': '#3730a3',
      '850': '#322b91',
      '900': '#312e81',
      '950': '#1e1b4b',
    },
  },
  rose: {
    name: 'Dâu tây ngọt ngào (Rose)',
    colors: {
      primary: '#be185d', // Rose 700
      sidebarBg: '#881337', // Rose 900
      sidebarFg: '#ffe4e6', // Rose 100
      sidebarActiveBg: '#be185d', // Rose 700
      sidebarActiveFg: '#ffffff',
      sidebarBorder: '#9f1239', // Rose 800
    },
    shades: {
      '50': '#fff1f2',
      '100': '#ffe4e6',
      '200': '#fecdd3',
      '300': '#fda4af',
      '400': '#fb7185',
      '500': '#f43f5e',
      '600': '#e11d48',
      '700': '#be185d',
      '800': '#9f1239',
      '850': '#921135',
      '900': '#881337',
      '950': '#4c0519',
    },
  },
  slate: {
    name: 'Tối giản thanh lịch (Slate)',
    colors: {
      primary: '#334155', // Slate 700
      sidebarBg: '#0f172a', // Slate 900
      sidebarFg: '#cbd5e1', // Slate 300
      sidebarActiveBg: '#334155', // Slate 700
      sidebarActiveFg: '#ffffff',
      sidebarBorder: '#1e293b', // Slate 800
    },
    shades: {
      '50': '#f8fafc',
      '100': '#f1f5f9',
      '200': '#e2e8f0',
      '300': '#cbd5e1',
      '400': '#94a3b8',
      '500': '#64748b',
      '600': '#475569',
      '700': '#334155',
      '800': '#1e293b',
      '850': '#161f30',
      '900': '#0f172a',
      '950': '#020617',
    },
  },
};

export interface ThemeStore {
  mode: ThemeMode;
  preset: ThemePreset;
  colors: ThemeColors;
  shades: Record<string, string>;
  setMode: (mode: ThemeMode) => void;
  setPreset: (preset: ThemePreset) => void;
  setCustomColor: (key: keyof ThemeColors, color: string) => void;
  resetToDefault: () => void;
}

// Hex shade generator utilities
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    const clamped = Math.max(0, Math.min(1, color));
    return Math.round(255 * clamped).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function generateShadesFromHex(hex: string): Record<string, string> {
  const { h, s } = hexToHsl(hex);
  return {
    '50': hslToHex(h, Math.min(s, 95), 97),
    '100': hslToHex(h, Math.min(s, 95), 93),
    '200': hslToHex(h, Math.min(s, 90), 85),
    '300': hslToHex(h, Math.min(s, 85), 75),
    '400': hslToHex(h, Math.min(s, 80), 65),
    '500': hex,
    '600': hslToHex(h, Math.min(s, 85), 45),
    '700': hslToHex(h, Math.min(s, 90), 35),
    '800': hslToHex(h, Math.min(s, 95), 25),
    '850': hslToHex(h, Math.min(s, 95), 20),
    '900': hslToHex(h, Math.min(s, 95), 15),
    '950': hslToHex(h, Math.min(s, 100), 8),
  };
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      mode: 'system',
      preset: 'coffee',
      colors: { ...PRESETS.coffee.colors },
      shades: { ...PRESETS.coffee.shades },

      setMode: (mode) => set({ mode }),

      setPreset: (preset) => {
        if (preset === 'custom') {
          set({ preset });
        } else {
          set({
            preset,
            colors: { ...PRESETS[preset].colors },
            shades: { ...PRESETS[preset].shades },
          });
        }
      },

      setCustomColor: (key, color) => {
        const currentColors = { ...get().colors, [key]: color };
        
        // If the primary color changed, recalculate shades automatically
        let newShades = { ...get().shades };
        if (key === 'primary') {
          newShades = generateShadesFromHex(color);
        }

        set({
          preset: 'custom',
          colors: currentColors,
          shades: newShades,
        });
      },

      resetToDefault: () => {
        set({
          mode: 'system',
          preset: 'coffee',
          colors: { ...PRESETS.coffee.colors },
          shades: { ...PRESETS.coffee.shades },
        });
      },
    }),
    {
      name: 'cafeai-theme-settings',
    }
  )
);
