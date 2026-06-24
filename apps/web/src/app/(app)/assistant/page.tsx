'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, TrendingDown, TrendingUp, Compass, Globe, Search } from 'lucide-react';
import { mockMessages } from '@/lib/mock-data';
import type { ChatMessage, VerdictChip } from '@airlytics/types';
import { cn } from '@/lib/utils';

const suggestedQuestions = [
  'Analyse CDG→JFK du 16 juillet',
  'Où partir avec 200€ ce week-end ?',
  'Meilleur moment pour réserver Bangkok ?',
  'Comparer Air France vs Delta sur CDG→NYC',
  'Alertes actives sur mes vols suivis',
];

const chipConfig: Record<VerdictChip, { label: string; icon: React.ReactNode; color: string }> = {
  WAIT:    { label: 'ATTENDRE', icon: <TrendingUp size={10} />,    color: '--wait' },
  EXPLORER:{ label: 'EXPLORER', icon: <Compass size={10} />,       color: '--accent-blue' },
  ACT_NOW: { label: 'ACHETER',  icon: <TrendingDown size={10} />, color: '--buy' },
};

function generateResponse(userText: string): { content: string; chips?: VerdictChip[] } {
  const q = userText.toLowerCase();

  const routeMatch = q.match(/([a-z]{3})[→\->\/\s]+([a-z]{3})/i);
  const origin = routeMatch?.[1]?.toUpperCase();
  const dest = routeMatch?.[2]?.toUpperCase();

  if (q.includes('budget') || q.includes('pas cher') || q.includes('moins cher') || q.match(/\d+\s*€/)) {
    const budget = q.match(/(\d+)\s*€/)?.[1] ?? '300';
    return {
      content: `🔍 **Recherche en cours pour un budget de ${budget}€...**\n\nVoici les meilleures destinations IA détectées sous ${budget}€ depuis Paris :\n\n• **Madrid** (MAD) — dès **89€** · Signal : ↓ BUY\n• **Lisbonne** (LIS) — dès **112€** · Signal : ↓ BUY\n• **Rome** (FCO) — dès **134€** · Signal : → WAIT\n• **Prague** (PRG) — dès **97€** · Signal : ↓ BUY\n\nJe recommande **Madrid** — historiquement -18% les mardis.`,
      chips: ['ACT_NOW', 'EXPLORER'],
    };
  }

  if ((q.includes('comparer') || q.includes('vs')) && (q.includes('air france') || q.includes('delta') || q.includes('airlines'))) {
    return {
      content: `📊 **Comparaison Air France vs Delta — CDG→NYC**\n\nD'après les données en temps réel :\n\n| | Air France AF006 | Delta DL264 |\n|---|---|---|\n| Prix actuel | **462€** | **498€** |\n| Prédiction IA | ↓ BUY (81%) | → WAIT (62%) |\n| Évolution 7j | -12.4% | +5.2% |\n| Direct | ✓ 8h45 | ✓ 8h55 |\n\n✅ **Recommandation : Air France** — meilleur rapport signal/prix.`,
      chips: ['ACT_NOW'],
    };
  }

  if (q.includes('bangkok') || q.includes('bkk') || q.includes('asie') || q.includes('tokyo') || q.includes('nrt')) {
    const dest2 = q.includes('bangkok') || q.includes('bkk') ? 'Bangkok (BKK)' : 'Tokyo (NRT)';
    return {
      content: `🌏 **Analyse ${dest2} depuis Paris**\n\n🔎 Données web actuelles :\n• Basse saison : novembre–février (prix -35%)\n• Haute saison : juillet–août, décembre\n• Actuellement : prix **stables** → signal WAIT\n\n📈 Prévision IA sur 30 jours :\n• Probabilité de baisse : **58%**\n• Fenêtre optimale : **dans 12–18 jours**\n• Économie estimée : **~€85**\n\n⏳ Je recommande d'**attendre** encore 10 jours avant de réserver.`,
      chips: ['WAIT', 'EXPLORER'],
    };
  }

  if (origin && dest) {
    const seed = (origin + dest).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const price = 200 + (seed % 600);
    const proba = 55 + (seed % 35);
    const trend = seed % 3 === 0 ? 'BUY' : seed % 3 === 1 ? 'WAIT' : 'RISK';
    const delta = trend === 'BUY' ? -(5 + seed % 15) : trend === 'WAIT' ? 2 + seed % 6 : 8 + seed % 12;
    const chips: VerdictChip[] = trend === 'BUY' ? ['ACT_NOW'] : trend === 'WAIT' ? ['WAIT'] : ['WAIT', 'EXPLORER'];

    return {
      content: `✈️ **Analyse ${origin} → ${dest}**\n\n🔍 Recherche web + modèle IA en cours...\n\n• Prix actuel : **${price}€**\n• Signal : **${trend}** (confiance ${proba}%)\n• Variation prévue : **${delta > 0 ? '+' : ''}${delta}%** sur 7 jours\n• Volume de recherches : ${seed % 2 === 0 ? 'Élevé 📈' : 'Normal ➡'}\n\n${trend === 'BUY' ? `✅ **Recommandation : ACHETER maintenant** — les prix devraient remonter d'ici 5 jours.` : trend === 'WAIT' ? `⏳ **Recommandation : ATTENDRE** — une baisse est probable dans 7–10 jours.` : `⚠️ **Attention : prix en hausse** — si vous devez voyager, réservez rapidement.`}`,
      chips,
    };
  }

  if (q.includes('alerte') || q.includes('notification') || q.includes('suivi')) {
    return {
      content: `🔔 **Vos alertes actives**\n\n• **CDG → JFK** — Alerte à 420€ · Prix actuel 462€ (93€ de l'objectif)\n• **CDG → BKK** — Alerte à 580€ · Prix actuel 612€ (32€ de l'objectif)\n• **ORY → MAD** — Alerte à 80€ · Prix actuel 89€ — **bientôt déclenché !** ⚡\n\nJe surveille en continu et vous notifie par email dès qu'un seuil est atteint.`,
      chips: ['ACT_NOW'],
    };
  }

  if (q.includes('week-end') || q.includes('weekend') || q.includes('partir')) {
    return {
      content: `🗺️ **Destinations idéales ce week-end** — Recherche en cours...\n\nOffres flash détectées depuis Paris (aller-retour) :\n\n🇪🇸 **Madrid** — **89€** · Direct · ↓ -15% vs semaine dernière\n🇵🇹 **Lisbonne** — **112€** · Direct · ↓ -8%\n🇮🇹 **Rome** — **134€** · 1 escale · → stable\n🇬🇧 **Londres** — **67€** · Direct · ↓ -22% ⭐ DEAL DU JOUR\n\n🔥 **Londres est le meilleur deal** : prix d'erreur tarifaire possible !`,
      chips: ['ACT_NOW', 'EXPLORER'],
    };
  }

  return {
    content: `🤖 **Analyse en cours...**\n\nJ'ai cherché des informations concernant **"${userText}"**.\n\nD'après mes données en temps réel et l'analyse de l'internet :\n\n• Les prix moyens actuels sont **dans la norme saisonnière**\n• Mon modèle détecte un signal **modéré** sur cette requête\n• Confiance du modèle : **76%**\n\nPour une analyse plus précise, précisez votre route (ex: "CDG JFK") ou votre budget.`,
    chips: ['WAIT', 'EXPLORER'],
  };
}

function VerdictChips({ chips }: { chips: VerdictChip[] }) {
  return (
    <div className="flex gap-2 mt-3 flex-wrap">
      {chips.map(chip => {
        const cfg = chipConfig[chip];
        return (
          <span
            key={chip}
            className="inline-flex items-center gap-1.5 text-[10px] font-semibold font-mono px-2.5 py-1 rounded-full"
            style={{
              background: `var(${cfg.color}-dim)` as string,
              color: `var(${cfg.color})` as string,
              border: `1px solid var(${cfg.color}-border)` as string,
            }}
          >
            {cfg.icon}
            {cfg.label}
          </span>
        );
      })}
    </div>
  );
}

function Message({ msg, isSearching }: { msg: ChatMessage; isSearching?: boolean }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-3', isUser && 'flex-row-reverse')}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        style={{
          background: isUser
            ? 'linear-gradient(135deg, #5b86ff, #2bd9a0)'
            : 'var(--accent-blue-dim)',
        }}
      >
        {isUser
          ? <User size={14} color="white" />
          : <Bot size={14} style={{ color: 'var(--accent-blue)' }} />
        }
      </div>

      <div className={cn('max-w-[75%]', isUser ? 'items-end flex flex-col' : '')}>
        {isSearching && (
          <p className="text-[10px] flex items-center gap-1 mb-1.5" style={{ color: 'var(--text-muted)' }}>
            <Globe size={10} className="animate-spin" />
            Recherche web en cours…
          </p>
        )}
        <div
          className="rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
          style={{
            background: isUser ? 'var(--accent-blue)' : 'var(--bg-card)',
            color: isUser ? 'white' : 'var(--text-primary)',
            border: isUser ? 'none' : '1px solid var(--border)',
          }}
          dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
        />
        {msg.chips && <VerdictChips chips={msg.chips} />}
      </div>
    </motion.div>
  );
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || thinking) return;
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setThinking(true);

    const needsWebSearch = text.toLowerCase().includes('recherche') ||
      text.toLowerCase().includes('internet') ||
      text.toLowerCase().includes('actuel') ||
      text.toLowerCase().includes('maintenant');

    if (needsWebSearch) {
      setIsSearching(true);
      await new Promise(r => setTimeout(r, 900));
      setIsSearching(false);
    }

    await new Promise(r => setTimeout(r, needsWebSearch ? 900 : 1400));

    const response = generateResponse(text);
    const assistantMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: response.content,
      chips: response.chips,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, assistantMsg]);
    setThinking(false);
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-var(--topbar-h))]">
      {/* Header */}
      <div className="px-6 py-4 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
               style={{ background: 'var(--accent-blue-dim)' }}>
            <Bot size={18} style={{ color: 'var(--accent-blue)' }} />
          </div>
          <div>
            <h1 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
              Assistant IA Airlytics
            </h1>
            <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
              <span className="live-pulse" style={{ fontSize: 10 }}>En ligne</span>
              · Recherche web <Search size={10} className="inline" /> · LightGBM + Prophet
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {messages.map(msg => <Message key={msg.id} msg={msg} />)}

        {thinking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
                 style={{ background: 'var(--accent-blue-dim)' }}>
              <Bot size={14} style={{ color: 'var(--accent-blue)' }} />
            </div>
            <div className="px-4 py-3 rounded-xl card">
              {isSearching ? (
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <Globe size={12} className="animate-spin" style={{ color: 'var(--accent-blue)' }} />
                  Recherche sur internet…
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  {[0, 0.15, 0.3].map(delay => (
                    <motion.span
                      key={delay}
                      animate={{ y: [-3, 3, -3] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay }}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: 'var(--accent-blue)' }}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested */}
      <div className="px-6 pb-3 shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {suggestedQuestions.map(q => (
            <button
              key={q}
              onClick={() => send(q)}
              className="shrink-0 text-xs px-3 py-1.5 rounded-full transition-all whitespace-nowrap"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-6 pb-5 shrink-0">
        <form
          onSubmit={e => { e.preventDefault(); send(input); }}
          className="flex gap-2 p-2 rounded-xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Posez une question sur vos vols, destinations, prédictions…"
            className="flex-1 bg-transparent text-sm outline-none px-2"
            style={{ color: 'var(--text-primary)' }}
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!input.trim() || thinking}
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 disabled:opacity-40"
            style={{ background: 'var(--accent-blue)', color: 'white' }}
          >
            <Send size={14} />
          </motion.button>
        </form>
      </div>
    </div>
  );
}
