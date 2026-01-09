'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="p-2.5 rounded-lg border border-sidebar-border bg-sidebar-accent transition-colors">
        <div className="w-5 h-5" />
      </button>
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="p-2.5 rounded-lg border border-sidebar-border bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-foreground transition-all duration-200 group"
      aria-label="Theme umschalten"
    >
      {isDark ? (
        <FiSun size={20} className="group-hover:rotate-90 transition-transform duration-300" />
      ) : (
        <FiMoon size={20} className="group-hover:-rotate-12 transition-transform duration-300" />
      )}
    </button>
  );
}
