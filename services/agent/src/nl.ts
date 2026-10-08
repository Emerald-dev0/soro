import type { Intent, LanguageCode } from '@soro/types';

export interface DetectedUtterance {
  language: LanguageCode;
  intent: Intent;
  entities: Record<string, string | number | boolean>;
  confidence: number | null;
}

const PIDGIN_MARKERS = ['abeg', 'dey', 'remain', 'how much dey', 'wuna', 'no get', 'oga', 'buy me', 'dey my'];
const YORUBA_MARKERS = ['mo fẹ', 'mo fe', 'iye', 'owo', 'tó', 'wa ninu', 'e se', 'jowo', 'se wa'];

export function detectLanguage(text: string): LanguageCode {
  // Strip diacritics so tonal Yoruba (ẹ́, ọ̀, tó) matches plain markers.
  const t = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const yo = YORUBA_MARKERS.filter((m) => t.includes(m)).length;
  const pcm = PIDGIN_MARKERS.filter((m) => t.includes(m)).length;
  if (yo > pcm && yo > 0) return 'yo';
  if (pcm > 0) return 'pcm';
  return 'en';
}

function amount(text: string): number | undefined {
  const m = text.replace(/,/g, '').match(/(\d+(?:\.\d+)?)\s*(?:naira|ngn|₦)?/i);
  if (m && m[1]) return Math.round(Number(m[1]) * 100);
  return undefined;
}

function network(text: string): string | undefined {
  const t = text.toLowerCase();
  if (t.includes('mtn')) return 'MTN';
  if (t.includes('airtel')) return 'AIRTEL';
  if (t.includes('glo')) return 'GLO';
  if (t.includes('9mobile') || t.includes('etisalat')) return '9MOBILE';
  return undefined;
}

/**
 * Deterministic NLU for the hackathon: maps an utterance to a structured
 * intent. A real LLM provider (configured via env) can replace this without
 * changing downstream contracts. The confidence is null unless the LLM path
 * provides one — never fabricated.
 */
export function understandUtterance(text: string): DetectedUtterance {
  const t = text.toLowerCase();
  const language = detectLanguage(text);
  const entities: Record<string, string | number | boolean> = {};
  const a = amount(text);
  if (a !== undefined) entities['amount_minor'] = a;
  const net = network(text);
  if (net) entities['network'] = net;

  let intent: Intent = 'UNKNOWN';
  if (/balance|how much (money |)remain|iye.*account|how much.*account|how much dey/.test(t)) intent = 'GET_BALANCE';
  else if (/email.*statement|send.*statement|statement.*email/.test(t)) intent = 'SEND_STATEMENT_EMAIL';
  else if (/transaction|statement|history|what did i|what transactions|spend today/.test(t)) intent = 'GET_TRANSACTION_HISTORY';
  else if (/transfer|send \d|send .*(money|naira)|pay .* to|wallimini|wire/.test(t)) intent = 'TRANSFER_MONEY';
  else if (/airtime|recharge|top ?up|buy me \d+ naira airtime/.test(t)) intent = 'PURCHASE_AIRTIME';
  else if (/data/.test(t) && /(plan|recommend|best|which|find me)/.test(t)) intent = 'RECOMMEND_DATA_PLAN';
  else if (/data|buy me.*data|purchase data|need data/.test(t)) intent = 'PURCHASE_DATA';
  else if (/statement/.test(t)) intent = 'GET_STATEMENT';
  else if (/beneficiar|recipient|my brother|my mum|my mother|my sister/.test(t)) intent = t.includes('send') || t.includes('transfer') ? 'TRANSFER_MONEY' : 'GET_BENEFICIARIES';
  else if (/speak to someone|human|agent|escalate|customer care/.test(t)) intent = 'ESCALATE_TO_HUMAN';
  else if (/complain|not recognize|don't recognize|i don t recognize|fraud|suspicious/.test(t)) intent = 'CREATE_SUPPORT_CASE';
  else if (/transfer status|where.*transfer|hasn't arrived|haven't arrived|not arrived/.test(t)) intent = 'GET_TRANSFER_STATUS';
  else if (/^(yes|yeah|yep|correct|confirm)/i.test(text.trim())) intent = 'CONFIRM';
  else if (/^(no|cancel|stop|abort)/i.test(text.trim())) intent = 'CANCEL';
  else if (/help|what can you do/.test(t)) intent = 'HELP';
  return { language, intent, entities, confidence: null };
}
