import { Injectable, Logger } from '@nestjs/common';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ProviderStatus {
  name: string;
  model: string;
  configured: boolean;
  active?: boolean;
}

const SYSTEM_PROMPT = `Tu es Airlytics AI, un assistant spécialisé dans l'analyse des prix de vols et la prédiction des tendances tarifaires.
Tu analyzes les routes aériennes, donnes des recommandations d'achat (BUY/WAIT/RISK), et aides les voyageurs à trouver les meilleures offres.
Tu utilises des données de Skyscanner, Google Flights, Kayak. Réponds toujours en français.
Sois concis, précis, et donne des chiffres concrets. Format markdown autorisé.`;

const PROVIDERS = [
  { name: 'deepseek',   url: 'https://api.deepseek.com/v1/chat/completions',         model: 'deepseek-chat',                       envKey: 'DEEPSEEK_API_KEY' },
  { name: 'groq',       url: 'https://api.groq.com/openai/v1/chat/completions',       model: 'llama-3.3-70b-versatile',             envKey: 'GROQ_API_KEY' },
  { name: 'openrouter', url: 'https://openrouter.ai/api/v1/chat/completions',         model: 'deepseek/deepseek-chat-v3-0324:free', envKey: 'OPENROUTER_API_KEY' },
];

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  getStatus(): { providers: ProviderStatus[]; activeProvider: string | null } {
    const providers: ProviderStatus[] = PROVIDERS.map(p => ({
      name: p.name,
      model: p.model,
      configured: !!process.env[p.envKey],
    }));
    const first = PROVIDERS.find(p => !!process.env[p.envKey]);
    return { providers, activeProvider: first?.name ?? null };
  }

  async chat(messages: ChatMessage[]): Promise<{ content: string; provider: string }> {
    const allMessages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ];

    for (const provider of PROVIDERS) {
      const apiKey = process.env[provider.envKey];
      if (!apiKey) {
        this.logger.debug(`${provider.name}: no API key — skipping`);
        continue;
      }

      try {
        this.logger.log(`Calling ${provider.name} (${provider.model})…`);
        const res = await fetch(provider.url, {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: provider.model, messages: allMessages, max_tokens: 1024, temperature: 0.7 }),
          signal: AbortSignal.timeout(30000),
        });
        if (!res.ok) {
          const err = await res.text();
          this.logger.warn(`${provider.name} error ${res.status}: ${err}`);
          continue;
        }
        const data = await res.json() as { choices: { message: { content: string } }[] };
        const content = data.choices[0].message.content;
        this.logger.log(`✅ ${provider.name} responded (${content.length} chars)`);
        return { content, provider: provider.name };
      } catch (e) {
        this.logger.warn(`${provider.name} failed: ${e}`);
        continue;
      }
    }

    this.logger.warn('All providers failed — using fallback mock');
    return { content: this.mockResponse(messages[messages.length - 1]?.content ?? ''), provider: 'mock' };
  }

  private mockResponse(userMessage: string): string {
    const q = userMessage.toLowerCase();
    if (q.includes('budget') || q.match(/\d+\s*€/)) {
      return '🔍 **Budget détecté** — Pour un voyage économique, je recommande Madrid (89€), Lisbonne (98€) ou Marrakech (119€). Ce sont les meilleures options qualité/prix actuellement.';
    }
    if (q.includes('quand') || q.includes('moment') || q.includes('meilleur')) {
      return '📊 **Analyse saisonnière** — Le meilleur moment pour réserver est généralement 6-8 semaines à l\'avance pour l\'Europe, 3-4 mois pour les long-courriers.';
    }
    return '✈️ **Airlytics AI** — Posez-moi une question sur une route, un budget, ou une destination. Ex: *"CDG vers Bangkok en juillet"* ou *"Meilleur deal ce week-end"*.';
  }
}
