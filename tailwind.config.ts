import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // <-- THIS IS CRUCIAL
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // ... rest of your config
};
export default config;