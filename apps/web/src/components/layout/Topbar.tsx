'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Moon, Sun, Bell } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { SearchModal } from './SearchModal';

export function Topbar() {
  const { theme, toggle } = useTheme();
  const [alerts] = useState(3);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <header
        className="flex items-center justify-between px-6 shrink-0 gap-4"
        style={{
          height: 'var(--topbar-h)',
          background: 'var(--bg-panel)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {/* Search ⌘K */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm cursor-pointer"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            width: 260,
          }}
        >
          <Search size={14} />
          <span className="flex-1 text-left">Rechercher un vol…</span>
          <kbd
            className="text-[10px] font-mono px-1.5 py-0.5 rounded"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}
          >
            ⌘K
          </kbd>
        </motion.button>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* LIVE badge */}
          <span
            className="live-pulse text-[11px] font-semibold font-mono px-2.5 py-1 rounded-full"
            style={{ background: 'var(--buy-dim)', color: 'var(--buy)' }}
          >
            LIVE
          </span>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-8 h-8 flex items-center justify-center rounded-md"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Bell size={16} />
            {alerts > 0 && (
              <span
                className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full text-[8px] flex items-center justify-center font-bold"
                style={{ background: 'var(--risk)', color: 'white' }}
              />
            )}
          </motion.button>

          {/* Theme toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggle}
            className="w-8 h-8 flex items-center justify-center rounded-md"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </motion.button>
        </div>
      </header>
    </>
  );
}
