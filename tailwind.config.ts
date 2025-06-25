
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Samsung Blue Titanium Color Scheme
        samsung: {
          blue: "hsl(var(--samsung-blue-primary))",      // #0066FF
          'blue-light': "hsl(var(--samsung-blue-light))", // #4285FF
          'blue-dark': "hsl(var(--samsung-blue-dark))",   // #2C5AA0
        },
        titanium: {
          light: "hsl(var(--titanium-light))",           // #D1D9E6
          medium: "hsl(var(--titanium-medium))",         // #9DB2CC
          dark: "hsl(var(--titanium-dark))",             // #3D4852
          white: "hsl(var(--titanium-white))",           // #F5F6F8
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": {
            textShadow: "0 0 8px #0066FF, 0 0 12px #4285FF",
          },
          "50%": {
            textShadow: "0 0 16px #4285FF, 0 0 32px #0066FF",
          },
        },
        "dot-flash": {
          "0%": { opacity: "0.2" },
          "50%": { opacity: "1" },
          "100%": { opacity: "0.2" },
        },
        "samsung-gradient": {
          "0%, 100%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "dot-flash": "dot-flash 1.2s infinite",
        "samsung-gradient": "samsung-gradient 3s ease infinite",
      },
      backgroundImage: {
        'samsung-gradient': 'linear-gradient(135deg, hsl(var(--samsung-blue-primary)), hsl(var(--samsung-blue-light)))',
        'titanium-gradient': 'linear-gradient(135deg, hsl(var(--titanium-light)), hsl(var(--titanium-white)))',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
