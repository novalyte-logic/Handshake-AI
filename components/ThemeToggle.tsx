'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg text-xs font-semibold text-[#626B78] dark:text-[#9CA3AF] hover:text-[#171D27] dark:hover:text-[#F3F4F6] bg-[#FAF9F6] dark:bg-[#161D2A] border border-[#E5E9E7] dark:border-[#2A3447] hover:bg-[#F3FCF8] dark:hover:bg-[#222C3D] transition-colors flex items-center space-x-1.5 cursor-pointer"
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme"
    >
      {isDarkMode ? (
        <>
          <Sun className="w-4 h-4 text-[#2DD4BF]" />
          <span className="hidden sm:inline text-[11px]">Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-[#009B87]" />
          <span className="hidden sm:inline text-[11px]">Dark Mode</span>
        </>
      )}
    </button>
  );
};
