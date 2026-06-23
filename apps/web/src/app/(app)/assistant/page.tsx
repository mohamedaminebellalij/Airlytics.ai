'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, TrendingDown, TrendingUp, Compass } from 'lucide-react';
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
      {/* Avatar */}
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

      {/* Bubble */}
      <div className={cn('max-w-[75%]', isUser ? 'items-end flex flex-col' : '')}>
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

    await new Promise(r => setTimeout(r, 1800));

    const assistantMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: `J'analyse votre demande concernant **"${text}"**.\n\nD'après mes données en temps réel, voici mon analyse :\n\n- Probabilité de baisse : **74%** dans les 5 prochains jours\n- Signal actuel : **BUY** sur la route principale\n- Confiance du modèle : **82%**\n\nJe vous recommande d'attendre encore 2–3 jours pour une économie potentielle de **~15%**.`,
      chips: ['WAIT', 'ACT_NOW'],
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
              · Données temps réel · GPT-4 + modèles de prédiction
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
            <div className="px-4 py-3 rounded-xl card flex items-center gap-1.5">
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
