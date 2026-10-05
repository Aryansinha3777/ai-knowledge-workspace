import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-5 right-5 w-10 h-10 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors btn-press z-50"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}