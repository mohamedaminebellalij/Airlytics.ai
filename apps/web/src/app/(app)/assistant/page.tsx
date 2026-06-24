'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, TrendingDown, TrendingUp, Compass, Globe, Search } from 'lucide-react';
import { mockMessages } from '@/lib/mock-data';
import { searchAirports, findAirport } from '@/lib/airports';
import type { ChatMessage, VerdictChip } from '@airlytics/types';
import { cn } from '@/lib/utils';

const suggestedQuestions = [
  'Analyse CDG→JFK juillet 2026',
  'Rabat vers Nice, quand partir ?',
  'Où partir avec 200€ ce week-end ?',
  'Meilleur moment pour Bangkok ?',
  'Comparer Air France vs Delta CDG→NYC',
];

const chipConfig: Record<VerdictChip, { label: string; icon: React.ReactNode; color: string }> = {
  WAIT:    { label: 'ATTENDRE', icon: <TrendingUp size={10} />,    color: '--wait' },
  EXPLORER:{ label: 'EXPLORER', icon: <Compass size={10} />,       color: '--accent-blue' },
  ACT_NOW: { label: 'ACHETER',  icon: <TrendingDown size={10} />, color: '--buy' },
};

interface ParsedAirport { iata: string; name: string; pos: number }

function extractAirports(text: string): ParsedAirport[] {
  const words = text.toLowerCase().split(/[\s,;→\-\/]+/).filter(w => w.length >= 2);
  const found: ParsedAirport[] = [];

  for (let i = 0; i < words.length; i++) {
    const w = words[i];

    // Try as IATA code (3 letters)
    if (w.length === 3 && /^[a-z]{3}$/.test(w)) {
      const ap = findAirport(w.toUpperCase());
      if (ap && !found.find(f => f.iata === ap.iata)) {
        found.push({ iata: ap.iata, name: ap.city, pos: i });
        continue;
      }
    }

    // Try 2-word city name first
    if (i + 1 < words.length) {
      const two = w + ' ' + words[i + 1];
      const r2 = searchAirports(two);
      if (r2.length > 0 &&
          (r2[0].city.toLowerCase().startsWith(w) || r2[0].cityEn.toLowerCase().startsWith(w)) &&
          !found.find(f => f.iata === r2[0].iata)) {
        found.push({ iata: r2[0].iata, name: r2[0].city, pos: i });
        i++;
        continue;
      }
    }

    // Try single word city name (minimum 3 chars)
    if (w.length >= 3) {
      const results = searchAirports(w);
      if (results.length > 0) {
        const r = results[0];
        const cityLower = r.city.toLowerCase();
        const cityEnLower = r.cityEn.toLowerCase();
        if ((cityLower.startsWith(w) || cityEnLower.startsWith(w)) &&
            !found.find(f => f.iata === r.iata)) {
          found.push({ iata: r.iata, name: r.city, pos: i });
        }
      }
    }
  }

  return found.sort((a, b) => a.pos - b.pos);
}

function extractPeriod(text: string): string | null {
  const q = text.toLowerCase();
  const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  for (const m of months) {
    if (q.includes(m)) {
      const yearMatch = q.match(/\b(202[4-9]|203\d)\b/);
      return yearMatch ? `${m} ${yearMatch[1]}` : m;
    }
  }
  if (/ce week.?end|ce weekend/i.test(q)) return 'ce week-end';
  if (/semaine prochaine/i.test(q)) return 'la semaine prochaine';
  if (/mois prochain/i.test(q)) return 'le mois prochain';
  if (/cet.?[eé]t[eé]/i.test(q)) return 'cet été';
  if (/cet.?automne/i.test(q)) return 'cet automne';
  if (/\d{1,2}[\/\-]\d{1,2}/.test(q)) return 'la date indiquée';
  const daysMatch = q.match(/dans (\d+) (jour|jours)/);
  if (daysMatch) return `dans ${daysMatch[1]} jours`;
  const weeksMatch = q.match(/dans (\d+) (semaine|semaines)/);
  if (weeksMatch) return `dans ${weeksMatch[1]} semaines`;
  if (/\b(202[5-9]|203\d)\b/.test(q)) return q.match(/\b(202[5-9]|203\d)\b/)![0];
  return null;
}

function generateRouteAnalysis(
  origin: string, dest: string,
  originName: string, destName: string,
  period: string
): { content: string; chips: VerdictChip[] } {
  const seed = (origin + dest).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const price = 180 + (seed % 620);
  const proba = 55 + (seed % 35);
  const trend = seed % 3 === 0 ? 'BUY' : seed % 3 === 1 ? 'WAIT' : 'RISK';
  const delta = trend === 'BUY' ? -(5 + seed % 15) : trend === 'WAIT' ? 2 + seed % 6 : 8 + seed % 12;
  const chips: VerdictChip[] = trend === 'BUY' ? ['ACT_NOW'] : trend === 'WAIT' ? ['WAIT'] : ['WAIT', 'EXPLORER'];
  const bestIn = 3 + (seed % 12);

  return {
    content: `✈️ **Analyse ${originName} (${origin}) → ${destName} (${dest})** · ${period}\n\n` +
      `🔍 Données agrégées Skyscanner · Google Flights · Kayak :\n\n` +
      `• Prix actuel moyen : **${price}€** (aller-retour)\n` +
      `• Signal IA : **${trend}** — confiance **${proba}%**\n` +
      `• Variation prévue sur 7j : **${delta > 0 ? '+' : ''}${delta}%**\n` +
      `• Fenêtre optimale d\'achat : **dans ${bestIn} jours**\n\n` +
      (trend === 'BUY'
        ? `✅ **Recommandation : ACHETER maintenant** — les prix remontent dans ${bestIn} jours. Économie estimée : ~${Math.round(price * Math.abs(delta) / 100)}€.`
        : trend === 'WAIT'
        ? `⏳ **Recommandation : ATTENDRE** — une baisse est probable dans 7–10 jours. Surveillez les alertes.`
        : `⚠️ **Attention : tendance haussière** — si le voyage est fixé, réservez dans les 48h.`),
    chips,
  };
}

function generateResponse(
  userText: string,
  awaitingPeriodFor: { origin: string; dest: string; originName: string; destName: string } | null,
  setAwaitingPeriodFor: (v: null) => void
): { content: string; chips?: VerdictChip[] } {
  const q = userText.toLowerCase();

  // ─── Awaiting period: user just provided it ───────────────────────────────
  if (awaitingPeriodFor) {
    setAwaitingPeriodFor(null);
    const { origin, dest, originName, destName } = awaitingPeriodFor;
    const period = extractPeriod(userText) ?? userText.trim();
    return generateRouteAnalysis(origin, dest, originName, destName, period);
  }

  // ─── Extract airports from user message ───────────────────────────────────
  const airports = extractAirports(userText);

  // ─── Budget query ─────────────────────────────────────────────────────────
  if (q.includes('budget') || q.includes('pas cher') || q.includes('moins cher') || q.match(/\d+\s*€/)) {
    const budget = q.match(/(\d+)\s*€/)?.[1] ?? '300';
    return {
      content: `🔍 **Budget ${budget}€ depuis Paris — meilleures destinations IA :**\n\n` +
        `• **Madrid** (MAD) — dès **89€** A/R · Skyscanner ↓ BUY\n` +
        `• **Lisbonne** (LIS) — dès **112€** A/R · Google Flights ↓ BUY\n` +
        `• **Marrakech** (RAK) — dès **98€** A/R · Kayak ↓ BUY\n` +
        `• **Prague** (PRG) — dès **97€** A/R · Signal → BUY\n` +
        `• **Istanbul** (IST) — dès **145€** A/R · Signal → WAIT\n\n` +
        `📊 Données actualisées en temps réel. Je recommande **Madrid** — historiquement -18% les mardis.`,
      chips: ['ACT_NOW', 'EXPLORER'],
    };
  }

  // ─── Route with 2 airports detected ──────────────────────────────────────
  if (airports.length >= 2) {
    const origin = airports[0];
    const dest = airports[1];
    const period = extractPeriod(userText);

    if (!period) {
      // Ask for period before analysis
      return {
        content: `✈️ **J'ai bien noté la route ${origin.name} (${origin.iata}) → ${dest.name} (${dest.iata})**\n\n` +
          `Pour vous donner une analyse précise, pourriez-vous me préciser votre **période de voyage** ?\n\n` +
          `Exemples :\n• *"juillet 2026"*\n• *"la semaine prochaine"*\n• *"dans 3 semaines"*\n• *"cet été"*`,
        chips: ['EXPLORER'],
      };
    }

    return generateRouteAnalysis(origin.iata, dest.iata, origin.name, dest.name, period);
  }

  // ─── Comparison airlines ──────────────────────────────────────────────────
  if (q.includes('comparer') || q.includes(' vs ') || q.includes('versus')) {
    return {
      content: `📊 **Comparaison Air France vs Delta — CDG→NYC**\n\nDonnées Skyscanner · Google Flights :\n\n| | Air France AF006 | Delta DL264 |\n|---|---|---|\n| Prix actuel | **462€** | **498€** |\n| Prédiction IA | ↓ BUY (81%) | → WAIT (62%) |\n| Évolution 7j | -12.4% | +5.2% |\n| Direct | ✓ 8h45 | ✓ 8h55 |\n\n✅ **Recommandation : Air France** — meilleur signal/prix.`,
      chips: ['ACT_NOW'],
    };
  }

  // ─── Specific destinations ────────────────────────────────────────────────
  if (airports.length === 1) {
    const ap = airports[0];
    const period = extractPeriod(userText);
    const seed = ap.iata.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const price = 180 + (seed % 500);
    const bestMonth = ['octobre', 'novembre', 'janvier', 'février', 'mars'][seed % 5];
    return {
      content: `🌍 **Analyse ${ap.name} (${ap.iata})${period ? ' · ' + period : ''}**\n\n` +
        `Données agrégées Skyscanner · Google Flights :\n` +
        `• Fourchette actuelle depuis Paris : **${price}€ – ${price + 120}€** A/R\n` +
        `• Basse saison recommandée : **${bestMonth}** (prix -25–35%)\n` +
        `• Signal actuel : **WAIT** — une baisse attendue dans 10 jours\n\n` +
        `⏳ Je recommande d'attendre encore 8–12 jours avant de réserver.`,
      chips: ['WAIT', 'EXPLORER'],
    };
  }

  // ─── Weekend / deals ──────────────────────────────────────────────────────
  if (q.includes('week-end') || q.includes('weekend') || q.includes('partir') || q.includes('destination')) {
    return {
      content: `🗺️ **Meilleures destinations ce week-end depuis Paris** — Données en temps réel :\n\n` +
        `🇪🇸 **Madrid** (MAD) — **89€** A/R · Direct · ↓ -15% · Skyscanner\n` +
        `🇲🇦 **Marrakech** (RAK) — **98€** A/R · Direct · ↓ -11% · Google Flights\n` +
        `🇵🇹 **Lisbonne** (LIS) — **112€** A/R · Direct · ↓ -8% · Kayak\n` +
        `🇬🇧 **Londres** (LHR) — **67€** A/R · Direct · ↓ -22% ⭐ DEAL\n\n` +
        `🔥 **Londres est le meilleur deal** du week-end — prix d'erreur tarifaire détecté !`,
      chips: ['ACT_NOW', 'EXPLORER'],
    };
  }

  // ─── Alert tracking ───────────────────────────────────────────────────────
  if (q.includes('alerte') || q.includes('notification') || q.includes('suivi')) {
    return {
      content: `🔔 **Vos alertes actives**\n\n• **CDG → JFK** — Alerte 420€ · Prix actuel 462€ *(encore 42€)*\n• **CDG → BKK** — Alerte 580€ · Prix actuel 612€ *(encore 32€)*\n• **ORY → MAD** — Alerte 80€ · Prix actuel 89€ — **bientôt !** ⚡\n\nSurveillance en continu. Notification email dès qu'un seuil est atteint.`,
      chips: ['ACT_NOW'],
    };
  }

  // ─── Default ──────────────────────────────────────────────────────────────
  return {
    content: `🤖 **Analyse en cours…**\n\nJ'ai cherché des informations sur **"${userText}"**.\n\nPour une analyse précise, dites-moi :\n• La **route** (ex: *"Rabat Nice"* ou *"CDG JFK"*)\n• La **période** (ex: *"juillet 2026"*)\n• Votre **budget** (ex: *"moins de 300€"*)\n\nJe consulte Skyscanner, Google Flights et Kayak pour des données fiables en temps réel.`,
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

function Message({ msg }: { msg: ChatMessage }) {
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
        <div
          className="rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
          style={{
            background: isUser ? 'var(--accent-blue)' : 'var(--bg-card)',
            color: isUser ? 'white' : 'var(--text-primary)',
            border: isUser ? 'none' : '1px solid var(--border)',
          }}
          dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }}
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
  const [awaitingPeriodFor, setAwaitingPeriodFor] = useState<{
    origin: string; dest: string; originName: string; destName: string;
  } | null>(null);
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

    // Simulate web search for route or destination queries
    const airports = extractAirports(text);
    const needsSearch = airports.length >= 1 || text.toLowerCase().includes('prix') || text.toLowerCase().includes('vol');

    if (needsSearch) {
      setIsSearching(true);
      await new Promise(r => setTimeout(r, 800));
      setIsSearching(false);
    }

    await new Promise(r => setTimeout(r, needsSearch ? 700 : 1000));

    // Capture awaitingPeriodFor before calling generateResponse (which may set it to null)
    const currentAwaiting = awaitingPeriodFor;
    let newAwaitingPeriodFor: { origin: string; dest: string; originName: string; destName: string } | null = null;

    // Check if we need to set awaitingPeriodFor
    if (!currentAwaiting) {
      const detectedAirports = extractAirports(text);
      if (detectedAirports.length >= 2 && !extractPeriod(text)) {
        newAwaitingPeriodFor = {
          origin: detectedAirports[0].iata,
          dest: detectedAirports[1].iata,
          originName: detectedAirports[0].name,
          destName: detectedAirports[1].name,
        };
      }
    }

    const response = generateResponse(text, currentAwaiting, () => {});

    setAwaitingPeriodFor(newAwaitingPeriodFor);

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
              · Skyscanner · Google Flights · Kayak · <Search size={10} className="inline" /> Temps réel
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
                  Recherche Skyscanner · Google Flights · Kayak…
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

      {/* Suggested questions */}
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
        {awaitingPeriodFor && (
          <div className="mb-2 px-3 py-2 rounded-lg text-xs flex items-center gap-2"
               style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)', border: '1px solid var(--border-accent)' }}>
            <Bot size={12} />
            En attente de la période pour {awaitingPeriodFor.originName} → {awaitingPeriodFor.destName}
          </div>
        )}
        <form
          onSubmit={e => { e.preventDefault(); send(input); }}
          className="flex gap-2 p-2 rounded-xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={awaitingPeriodFor ? 'Indiquez votre période de voyage…' : 'Posez une question sur vos vols…'}
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
