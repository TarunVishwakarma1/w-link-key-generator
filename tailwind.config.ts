import type { Config } from "tailwindcss";
const { nextui } = require("@nextui-org/react");

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'custom-shadow': '0 10px 20px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.1)',
        'custom-shadow-dark': '0 4px 6px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.25)',
      },
      backgroundColor: {
        'glass-light': 'rgba(255, 255, 255, 0.4)',
        'glass-dark': 'rgba(24, 24, 24, 0.4)',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      borderColor: {
        'glass-border-light': 'rgba(255, 255, 255, 0.2)',
        'glass-border-dark': 'rgba(255, 255, 255, 0.1)',
      },
    },
  },
  darkMode: ["class"],
  plugins: [nextui()],
};

export default config;
