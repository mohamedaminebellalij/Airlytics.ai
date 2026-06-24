'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { AirlyticsLogo } from '@/components/ui/AirlyticsLogo';
import { Button } from '@/components/ui/Button';

const PLANS = [
  { id: 'free', label: 'Gratuit', price: '0€/mois', features: ['5 prédictions/jour', '1 vol suivi', 'Alertes email'] },
  { id: 'pro',  label: 'Pro',     price: '9€/mois',  features: ['Illimité', 'Tous vols suivis', 'Smart Deals', 'Chatbot IA'] },
] as const;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [plan, setPlan] = useState<'free' | 'pro'>('free');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Nom requis';
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Email invalide';
    if (password.length < 8) e.password = '8 caractères minimum';
    if (password !== confirm) e.confirm = 'Les mots de passe ne correspondent pas';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false);
    router.push('/dashboard');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg-base)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px]"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <AirlyticsLogo size={36} />
          <span className="font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>
            Airlytics<span style={{ color: 'var(--accent-blue)' }}>.ai</span>
          </span>
        </div>

        <div className="card p-7">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: step >= s ? 'var(--accent-blue)' : 'var(--bg-base)',
                    color: step >= s ? 'white' : 'var(--text-muted)',
                    border: `1px solid ${step >= s ? 'var(--accent-blue)' : 'var(--border)'}`,
                  }}
                >
                  {step > s ? <Check size={12} /> : s}
                </div>
                <span className="text-xs" style={{ color: step >= s ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {s === 1 ? 'Informations' : 'Choisir un plan'}
                </span>
                {s < 2 && <div className="flex-1 h-px mx-1" style={{ background: step > s ? 'var(--accent-blue)' : 'var(--border)' }} />}
              </div>
            ))}
          </div>

          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-4">
              <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                Créer un compte
              </h1>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                Rejoignez 12 000+ voyageurs intelligents
              </p>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
                       style={{ color: 'var(--text-muted)' }}>
                  Nom complet
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2"
                       style={{ color: 'var(--text-muted)' }} />
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Mohamed Amine"
                    style={{ ...inputStyle, borderColor: errors.name ? 'var(--risk)' : undefined }}
                  />
                </div>
                {errors.name && <p className="text-xs mt-1" style={{ color: 'var(--risk)' }}>{errors.name}</p>}
              </div>

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
                    style={{ ...inputStyle, borderColor: errors.email ? 'var(--risk)' : undefined }}
                  />
                </div>
                {errors.email && <p className="text-xs mt-1" style={{ color: 'var(--risk)' }}>{errors.email}</p>}
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
                    placeholder="Min. 8 caractères"
                    style={{ ...inputStyle, borderColor: errors.password ? 'var(--risk)' : undefined }}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          style={{ color: 'var(--text-muted)' }}>
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs mt-1" style={{ color: 'var(--risk)' }}>{errors.password}</p>}
              </div>

              {/* Confirm */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
                       style={{ color: 'var(--text-muted)' }}>
                  Confirmer
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2"
                       style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    style={{ ...inputStyle, borderColor: errors.confirm ? 'var(--risk)' : undefined }}
                  />
                </div>
                {errors.confirm && <p className="text-xs mt-1" style={{ color: 'var(--risk)' }}>{errors.confirm}</p>}
              </div>

              <Button type="submit" fullWidth size="md" icon={<ArrowRight size={14} />}>
                Continuer
              </Button>
            </form>
          ) : (
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Choisir votre plan</h1>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                Commencez gratuitement, upgradez quand vous voulez
              </p>

              <div className="space-y-3">
                {PLANS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlan(p.id)}
                    className="w-full text-left p-4 rounded-xl transition-all"
                    style={{
                      background: plan === p.id ? 'var(--accent-blue-dim)' : 'var(--bg-base)',
                      border: `2px solid ${plan === p.id ? 'var(--accent-blue)' : 'var(--border)'}`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{p.label}</span>
                      <span className="font-mono font-bold text-sm" style={{ color: plan === p.id ? 'var(--accent-blue)' : 'var(--text-secondary)' }}>
                        {p.price}
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {p.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                          <Check size={11} style={{ color: plan === p.id ? 'var(--accent-blue)' : 'var(--buy)' }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>

              <Button
                onClick={handleSubmit}
                loading={loading}
                fullWidth
                size="md"
                icon={<ArrowRight size={14} />}
              >
                Créer mon compte · {PLANS.find(p => p.id === plan)?.price}
              </Button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-xs text-center"
                style={{ color: 'var(--text-muted)' }}
              >
                ← Retour
              </button>
            </motion.div>
          )}

          <div className="mt-4 pt-4 text-center" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Déjà un compte ?{' '}
              <Link href="/login" className="font-semibold" style={{ color: 'var(--accent-blue)' }}>
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
