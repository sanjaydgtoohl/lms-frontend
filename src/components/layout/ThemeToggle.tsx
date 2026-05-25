import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`app-theme-toggle ${isDark ? 'app-theme-toggle--dark' : ''}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <span className="app-theme-toggle__thumb" aria-hidden />
      <Sun className="app-theme-toggle__icon app-theme-toggle__icon--sun" aria-hidden />
      <Moon className="app-theme-toggle__icon app-theme-toggle__icon--moon" aria-hidden />
    </button>
  );
};

export default ThemeToggle;
