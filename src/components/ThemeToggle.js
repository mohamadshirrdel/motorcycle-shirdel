'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const current = document.documentElement.dataset.theme || 'dark';
    setTheme(current);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('shirdel-theme', next);
    } catch {}
    setTheme(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'تغییر به تم روشن' : 'تغییر به تم تیره'}
      title={theme === 'dark' ? 'تم روشن' : 'تم تیره'}
      className={`rounded-xl border border-line bg-panel2 p-2.5 text-soft transition hover:border-accent hover:text-strong ${className}`}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
