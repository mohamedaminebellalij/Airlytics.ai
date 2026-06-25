import { Injectable } from '@nestjs/common';
import axios from 'axios';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `Tu es Airlytics AI, un assistant spécialisé dans l'analyse des prix de vols et la prédiction des tendances tarifaires.
Tu analyzes les routes aériennes, donnes des recommandations d'achat (BUY/WAIT/RISK), et aides les voyageurs à trouver les meilleures offres.
Tu utilises des données de Skyscanner, Google Flights, Kayak. Réponds toujours en français.
Sois concis, précis, et donne des chiffres concrets. Format markdown autorisé.`;

const PROVIDERS = [
  {
    name: 'deepseek',
    url: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
    envKey: 'DEEPSEEK_API_KEY',
  },
  {
    name: 'groq',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile',
    envKey: 'GROQ_API_KEY',
  },
  {
    name: 'openrouter',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'deepseek/deepseek-chat-v3-0324:free',
    envKey: 'OPENROUTER_API_KEY',
  },
];

@Injectable()
export class AiService {
  async chat(messages: ChatMessage[]): Promise<string> {
    const allMessages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ];

    for (const provider of PROVIDERS) {
      const apiKey = process.env[provider.envKey];
      if (!apiKey) continue;

      try {
        const response = await axios.post(
          provider.url,
          { model: provider.model, messages: allMessages, max_tokens: 1024, temperature: 0.7 },
          {
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            timeout: 30000,
          },
        );
        return response.data.choices[0].message.content;
      } catch {
        continue;
      }
    }

    // Fallback: intelligent mock response
    return this.mockResponse(messages[messages.length - 1]?.content ?? '');
  }

  private mockResponse(userMessage: string): string {
    const q = userMessage.toLowerCase();
    if (q.includes('budget') || q.match(/\d+\s*€/)) {
      return '🔍 **Budget détecté** — Pour un voyage économique, je recommande Madrid (89€), Lisbonne (98€) ou Marrakech (119€). Ce sont les meilleures options qualité/prix actuellement.';
    }
    if (q.includes('quand') || q.includes('moment') || q.includes('meilleur')) {
      return '📊 **Analyse saisonnière** — Le meilleur moment pour réserver est généralement 6-8 semaines à l\'avance pour l\'Europe, 3-4 mois pour les long-courriers. Je surveille les signaux IA pour vous alerter au bon moment.';
    }
    return '✈️ **Airlytics AI** — Posez-moi une question sur une route, un budget, ou une destination. Ex: *"CDG vers Bangkok en juillet"* ou *"Meilleur deal ce week-end"*.';
  }
}
