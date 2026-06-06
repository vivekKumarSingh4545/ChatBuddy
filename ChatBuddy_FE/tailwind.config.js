/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        dark_bg_1: "#090B11",
        dark_bg_2: "#131722",
        dark_bg_3: "#1A1F2E",
        dark_bg_4: "#090B11",
        dark_bg_5: "#212738",
        dark_bg_6: "#06070B",
        dark_border_1: "#1E293B",
        dark_border_2: "#334155",
        dark_hover_1: "#1F2638",
        dark_svg_1: "#94A3B8",
        dark_svg_2: "#64748B",
        blue_1: "#38BDF8",
        blue_2: "#0284C7",
        dark_text_1: "#F8FAFC",
        dark_text_2: "#94A3B8",
        dark_text_3: "#64748B",
        dark_text_4: "#E2E8F0",
        dark_text_5: "#CBD5E1",
        dark_scrollbar: "#1E293B",
        green_1: "#6366F1",
        green_2: "#4F46E5",
        green_3: "#4F46E5",
      },
    },
  },
  plugins: [],
};