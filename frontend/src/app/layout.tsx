import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ToastContainer } from '../components/ui/Toast';
import { ThemeSync } from '../components/layout/ThemeSync';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | CaféAI',
    default: 'CaféAI — Quản lý Quán Cà Phê thông minh',
  },
  description:
    'Hệ thống quản lý quán cà phê tích hợp AI: đặt hàng, kho nguyên liệu, phân tích kinh doanh, marketing tự động.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('cafeai-theme-settings');
                  if (saved) {
                    var data = JSON.parse(saved);
                    var state = data.state;
                    if (state) {
                      // Apply dark/light mode
                      var mode = state.mode || 'system';
                      var isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                      if (isDark) {
                        document.documentElement.classList.add('dark');
                      } else {
                        document.documentElement.classList.remove('dark');
                      }
                      
                      // Apply shades
                      if (state.shades) {
                        for (var key in state.shades) {
                          document.documentElement.style.setProperty('--theme-amber-' + key, state.shades[key]);
                        }
                      }
                      
                      // Apply sidebar colors
                      if (state.colors) {
                        var colors = state.colors;
                        if (colors.sidebarBg) document.documentElement.style.setProperty('--theme-sidebar-bg', colors.sidebarBg);
                        if (colors.sidebarFg) document.documentElement.style.setProperty('--theme-sidebar-fg', colors.sidebarFg);
                        if (colors.sidebarActiveBg) document.documentElement.style.setProperty('--theme-sidebar-active-bg', colors.sidebarActiveBg);
                        if (colors.sidebarActiveFg) document.documentElement.style.setProperty('--theme-sidebar-active-fg', colors.sidebarActiveFg);
                        if (colors.sidebarBorder) document.documentElement.style.setProperty('--theme-sidebar-border', colors.sidebarBorder);
                      }
                    }
                  }
                } catch(e) {}
              })();
            `
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-150">
        <ThemeSync />
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
