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
        surface: {
          DEFAULT: "var(--surface)",
          raised: "var(--surface-raised)",
        },
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        text: {
          DEFAULT: "var(--text)",
          muted: "var(--text-muted)",
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
        semantic: {
          red: "var(--semantic-red)",
          green: "var(--semantic-green)",
          amber: "var(--semantic-amber)",
          orange: "var(--semantic-orange)",
          gray: "var(--semantic-gray)",
          neutral: "var(--semantic-neutral)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "0.875rem" }], // 11px
        xs: ["0.75rem", { lineHeight: "1rem" }],           // 12px
        sm: ["0.8125rem", { lineHeight: "1.125rem" }],     // 13px (Linear dashboard base)
        base: ["0.875rem", { lineHeight: "1.25rem" }],     // 14px
        md: ["1rem", { lineHeight: "1.5rem" }],            // 16px
      },
    },
  },
  plugins: [],
};
