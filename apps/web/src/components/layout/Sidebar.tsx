'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Brain, ArrowLeftRight, MessageSquare,
  Globe, Zap, Megaphone, ShieldCheck, ChevronRight, LogIn, LogOut,
} from 'lucide-react';
import { AirlyticsLogo } from '@/components/ui/AirlyticsLogo';
import { useAuth } from '@/lib/auth';

const NAV_ITEMS = [
  { href: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard',    adminOnly: false },
  { href: '/predict',    icon: Brain,            label: 'Prédiction',  adminOnly: false, badge: 'CORE', badgeGreen: false },
  { href: '/compare',    icon: ArrowLeftRight,   label: 'Comparer',    adminOnly: false },
  { href: '/assistant',  icon: MessageSquare,    label: 'Assistant IA', adminOnly: false },
  { href: '/explore',    icon: Globe,            label: 'Explorer',    adminOnly: false },
  { href: '/deals',      icon: Zap,              label: 'Smart Deals', adminOnly: false, badge: '12', badgeGreen: true },
  { href: '/ads',        icon: Megaphone,        label: 'Régie Pub',   adminOnly: true },
  { href: '/admin',      icon: ShieldCheck,      label: 'Admin',       adminOnly: true },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const initials = user
    ? user.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const visibleItems = NAV_ITEMS.filter(item => !item.adminOnly || user?.isAdmin);

  return (
    <aside
      className="h-screen flex flex-col shrink-0"
      style={{
        width: 'var(--sidebar-w)',
        minWidth: 'var(--sidebar-w)',
        background: 'var(--bg-panel)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center px-5 gap-3 shrink-0"
        style={{ height: 'var(--topbar-h)', borderBottom: '1px solid var(--border)' }}
      >
        <AirlyticsLogo size={28} />
        <span className="font-semibold text-[15px]" style={{ color: 'var(--text-primary)' }}>
          Airlytics<span style={{ color: 'var(--accent-blue)' }}>.ai</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        <p
          className="text-[10px] font-semibold uppercase tracking-widest px-3 py-2"
          style={{ color: 'var(--text-muted)' }}
        >
          Navigation
        </p>

        {visibleItems.map(item => {
          const active =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={`sidebar-item${active ? ' active' : ''}`}
              >
                <item.icon size={16} className="shrink-0" />
                <span className="flex-1">{item.label}</span>
                {'badge' in item && item.badge && (
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full font-mono"
                    style={{
                      background: item.badgeGreen ? 'var(--buy-dim)' : 'var(--accent-blue-dim)',
                      color: item.badgeGreen ? 'var(--buy)' : 'var(--accent-blue)',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
                {active && <ChevronRight size={12} style={{ color: 'var(--accent-blue)' }} />}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-3 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
        {ready && user ? (
          <>
            <div className="flex items-center gap-3 p-2.5 rounded-md mb-2" style={{ background: 'var(--bg-hover)' }}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                style={{ background: 'linear-gradient(135deg, #5b86ff, #2bd9a0)', color: 'white' }}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {user.name}
                </p>
                <p className="text-xs font-mono" style={{ color: user.isAdmin ? 'var(--risk)' : 'var(--accent-blue)' }}>
                  {user.isAdmin ? 'ADMIN' : user.plan.toUpperCase()}
                </p>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full">
              <motion.div
                whileHover={{ x: 2 }}
                className="sidebar-item text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                <LogOut size={14} />
                <span>Déconnexion</span>
              </motion.div>
            </button>
          </>
        ) : (
          <Link href="/login">
            <motion.div
              whileHover={{ x: 2 }}
              className="sidebar-item text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              <LogIn size={14} />
              <span>Connexion / Compte</span>
            </motion.div>
          </Link>
        )}
      </div>
    </aside>
  );
}
