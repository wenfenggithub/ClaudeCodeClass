import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // 低饱和、暖色调；昼夜两套
        ink: {
          50: "#F7F5F2",
          100: "#EDE9E2",
          200: "#D8D2C7",
          300: "#B6AEA1",
          400: "#8C8478",
          500: "#5D574E",
          600: "#3F3A33",
          700: "#2B2823",
          800: "#1B1916",
          900: "#0F0E0C",
        },
        // 主色：温柔的薰衣草紫，避免高饱和蓝
        moon: {
          50: "#F4F0F8",
          100: "#E6DEF0",
          200: "#CDBEE0",
          300: "#A998C0",
          400: "#857298",
          500: "#65557A",
          600: "#4B3F5B",
          700: "#332B3F",
          800: "#1F1A26",
          900: "#100D14",
        },
        // 强调色：暖琥珀（用于 CTA、警示，避免红色）
        amber: {
          50: "#FBF3E6",
          100: "#F3E1BC",
          200: "#E8C786",
          300: "#D7A653",
          400: "#B98835",
          500: "#8E6722",
        },
        // 评分色阶（不出现红色）
        score: {
          low: "#A998C0",
          mid: "#D7A653",
          high: "#9CB89C",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "PingFang SC",
          "Microsoft YaHei",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      fontSize: {
        // 整体字号偏大，睡前友好
        xs: ["0.8125rem", { lineHeight: "1.5" }],
        sm: ["0.9375rem", { lineHeight: "1.6" }],
        base: ["1.0625rem", { lineHeight: "1.7" }],
        lg: ["1.1875rem", { lineHeight: "1.6" }],
        xl: ["1.4375rem", { lineHeight: "1.4" }],
        "2xl": ["1.75rem", { lineHeight: "1.3" }],
        "3xl": ["2.25rem", { lineHeight: "1.2" }],
      },
      borderRadius: {
        soft: "1rem",
        pill: "9999px",
      },
      boxShadow: {
        soft: "0 6px 24px -8px rgba(0,0,0,0.08)",
        "soft-dark": "0 6px 24px -8px rgba(0,0,0,0.5)",
      },
      animation: {
        "breathe-in": "breatheIn 4s ease-in-out forwards",
        "breathe-hold": "breatheHold 7s linear forwards",
        "breathe-out": "breatheOut 8s ease-in-out forwards",
      },
      keyframes: {
        breatheIn: {
          "0%": { transform: "scale(0.6)", opacity: "0.7" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        breatheHold: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
        },
        breatheOut: {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(0.6)", opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
