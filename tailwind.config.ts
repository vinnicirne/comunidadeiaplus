import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        border: "var(--border)",
        surface: "#0c1322",
        "surface-dim": "#070e1d",
        "surface-container-lowest": "#070e1d",
        "surface-container-low": "#111827",
        "surface-container": "#141b2b",
        "surface-container-high": "#1e293b",
        "surface-container-highest": "#283548",
        "surface-variant": "#1f293d",
        "on-surface": "#f8fafc",
        "on-surface-variant": "#94a3b8",
        outline: "#64748b",
        "outline-variant": "#334155",
        primary: "#6366f1",
        "primary-container": "#4f46e5",
        "primary-fixed": "#312e81",
        "primary-fixed-dim": "#818cf8",
        "on-primary": "#ffffff",
        "on-primary-fixed": "#e0e7ff",
        secondary: "#818cf8",
        "secondary-container": "#3730a3",
        "secondary-fixed": "#312e81",
        "secondary-fixed-dim": "#a5b4fc",
        "on-secondary-fixed": "#e0e7ff",
        tertiary: "#38bdf8",
        "tertiary-container": "#0369a1",
        "tertiary-fixed": "#0c4a6e",
        "tertiary-fixed-dim": "#7dd3fc",
        "on-tertiary-fixed": "#e0f2fe",
        error: "#f87171",
        "error-container": "#7f1d1d",
        "on-error": "#ffffff"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "space-xl": "2rem",
        "space-lg": "1.5rem",
        "margin": "2rem",
        "space-xs": "0.25rem",
        "gutter-sm": "1rem",
        "gutter-lg": "2rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "gutter": "1.5rem",
        "margin-lg": "3rem",
        "margin-sm": "1rem"
      },
      fontFamily: {
        "body-md": ["Inter"],
        "label-md": ["Inter"],
        "body-sm": ["Inter"],
        "headline-xl-mobile": ["Inter"],
        "headline-xl": ["Inter"],
        "headline-lg-mobile": ["Inter"],
        "label-sm": ["Inter"],
        "headline-lg": ["Inter"],
        "code-md": ["JetBrains Mono"],
        "headline-md": ["Inter"],
        "body-lg": ["Inter"],
        "headline-sm": ["Inter"]
      },
      fontSize: {
        "body-md": ["15px", { "lineHeight": "24px", "letterSpacing": "0em", "fontWeight": "400" }],
        "label-md": ["14px", { "lineHeight": "20px", "letterSpacing": "0.005em", "fontWeight": "500" }],
        "body-sm": ["13px", { "lineHeight": "20px", "letterSpacing": "0em", "fontWeight": "400" }],
        "headline-xl-mobile": ["28px", { "lineHeight": "34px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "headline-xl": ["36px", { "lineHeight": "44px", "letterSpacing": "-0.025em", "fontWeight": "700" }],
        "headline-lg-mobile": ["22px", { "lineHeight": "28px", "letterSpacing": "-0.015em", "fontWeight": "600" }],
        "label-sm": ["12px", { "lineHeight": "16px", "letterSpacing": "0.01em", "fontWeight": "500" }],
        "headline-lg": ["28px", { "lineHeight": "36px", "letterSpacing": "-0.02em", "fontWeight": "600" }],
        "code-md": ["13px", { "lineHeight": "20px", "letterSpacing": "0em", "fontWeight": "400" }],
        "headline-md": ["20px", { "lineHeight": "28px", "letterSpacing": "-0.015em", "fontWeight": "600" }],
        "body-lg": ["18px", { "lineHeight": "28px", "letterSpacing": "-0.005em", "fontWeight": "400" }],
        "headline-sm": ["16px", { "lineHeight": "24px", "letterSpacing": "-0.01em", "fontWeight": "600" }]
      }
    },
  },
  plugins: [
    function({ addVariant }: { addVariant: (name: string, definition: string) => void }) {
      addVariant('light', 'html.light &');
    }
  ],
}
export default config
