'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { AirlyticsLogo } from '@/components/ui/AirlyticsLogo';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, ready } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirect = searchParams.get('redirect') ?? '/dashboard';
  const reason = searchParams.get('reason');

  useEffect(() => {
    if (ready && user) {
      router.replace(redirect);
    }
  }, [ready, user, router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Remplissez tous les champs.'); return; }
    setError('');
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (!ok) { setError('Email ou mot de passe invalide.'); return; }
    router.push(redirect);
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg-base)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text-primary)',
    fontSize: 14,
    padding: '10px 40px 10px 40px',
    width: '100%',
    outline: 'none',
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg-base)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[400px]"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <AirlyticsLogo size={36} />
          <span className="font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>
            Airlytics<span style={{ color: 'var(--accent-blue)' }}>.ai</span>
          </span>
        </div>

        <div className="card p-7">
          <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Connexion</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Accédez à vos prédictions et alertes
          </p>

          {reason === 'admin' && (
            <div className="mb-4 px-4 py-3 rounded-md text-sm flex items-center gap-2"
                 style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)', border: '1px solid var(--border-accent)' }}>
              <ShieldCheck size={14} />
              Accès réservé aux administrateurs. Connectez-vous avec votre compte admin.
            </div>
          )}

          {error && (
            <div className="mb-4 px-4 py-3 rounded-md text-sm"
                 style={{ background: 'var(--risk-dim)', color: 'var(--risk)', border: '1px solid var(--risk-border)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
                     style={{ color: 'var(--text-muted)' }}>
                Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2"
                     style={{ color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
                     style={{ color: 'var(--text-muted)' }}>
                Mot de passe
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2"
                     style={{ color: 'var(--text-muted)' }} />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={inputStyle}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                <input type="checkbox" className="rounded" style={{ accentColor: 'var(--accent-blue)' }} />
                Se souvenir de moi
              </label>
              <button type="button" className="text-xs" style={{ color: 'var(--accent-blue)' }}>
                Mot de passe oublié ?
              </button>
            </div>

            <Button
              type="submit"
              loading={loading}
              fullWidth
              size="md"
              icon={<ArrowRight size={14} />}
            >
              Se connecter
            </Button>
          </form>

          <div className="mt-4 pt-4 text-center" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Pas encore de compte ?{' '}
              <Link href="/register" className="font-semibold" style={{ color: 'var(--accent-blue)' }}>
                S&apos;inscrire gratuitement
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
          En continuant, vous acceptez nos{' '}
          <span style={{ color: 'var(--accent-blue)' }}>Conditions d&apos;utilisation</span>
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
