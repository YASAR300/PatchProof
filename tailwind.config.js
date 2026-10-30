/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        sidebar: "var(--sidebar)",
        surface: {
          DEFAULT: "var(--surface)",
          raised: "var(--surface-raised)",
          hover: "var(--surface-hover)",
          selected: "var(--surface-selected)",
        },
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        text: {
          DEFAULT: "var(--text)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
          muted: "var(--text-secondary)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          foreground: "var(--accent-foreground)",
        },
        danger: {
          DEFAULT: "var(--danger)",
          hover: "var(--danger-hover)",
          foreground: "var(--danger-foreground)",
        },
        state: {
          danger: {
            bg: "var(--state-danger-bg)",
            border: "var(--state-danger-border)",
            fg: "var(--state-danger-fg)",
          },
          warning: {
            bg: "var(--state-warning-bg)",
            border: "var(--state-warning-border)",
            fg: "var(--state-warning-fg)",
          },
          success: {
            bg: "var(--state-success-bg)",
            border: "var(--state-success-border)",
            fg: "var(--state-success-fg)",
          },
          info: {
            bg: "var(--state-info-bg)",
            border: "var(--state-info-border)",
            fg: "var(--state-info-fg)",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "0.875rem" }], // 11px
        xs: ["0.75rem", { lineHeight: "1rem" }],           // 12px
        sm: ["0.8125rem", { lineHeight: "1.125rem" }],     // 13px (Linear base)
        base: ["0.875rem", { lineHeight: "1.25rem" }],     // 14px
        md: ["1rem", { lineHeight: "1.5rem" }],            // 16px
        lg: ["1.125rem", { lineHeight: "1.625rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],        // 20px
      },
      borderRadius: {
        badge: "4px",
        control: "6px",
        panel: "8px",
        dialog: "12px",
      },
    },
  },
  plugins: [],
};
