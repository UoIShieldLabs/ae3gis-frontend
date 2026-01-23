"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch - render nothing until mounted
  if (!mounted) {
    return (
      <div className="p-2 w-9 h-9 rounded-lg bg-[var(--card-bg)] border border-[var(--border)]" />
    );
  }

  return <ThemeToggleInner />;
}

function ThemeToggleInner() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border)] hover:bg-[var(--card-hover)] transition-colors"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-[var(--foreground)]" />
      ) : (
        <Sun className="w-5 h-5 text-[var(--foreground)]" />
      )}
    </button>
  );
}
