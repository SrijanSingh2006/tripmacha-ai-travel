import { BudgetTier, SearchInput, TripPlan } from '../types';

const budgetFactor: Record<BudgetTier, number> = {
  Shoestring: 0.72,
  Moderate: 1,
  Premium: 1.55,
};

export function formatRupees(value: number): string {
  return '₹' + Math.round(value).toLocaleString('en-IN');
}

export function formatDate(value: string): string {
  const date = new Date(value + 'T12:00:00');
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' });
}

export function dateAfter(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

export function makeDemoPlan(input: SearchInput, summary?: string): TripPlan {
  const factor = budgetFactor[input.budget];
  const nights = Math.max(1, input.duration - 1);
  const flight = Math.round(5420 * factor);
  const stay = Math.round(2850 * factor * nights);
  const local = Math.round(1250 * factor);
  const food = Math.round(1100 * factor * input.duration);
  const deals = [
    {
      id: 'flight-indigo',
      category: 'Flight' as const,
      provider: 'IndiGo',
      title: 'Non-stop · 2h 35m',
      detail: '6E 205 · 06:15 → 08:50',
      price: flight,
      icon: '✈',
      accent: '#EEF0FF',
    },
    {
      id: 'stay-casa',
      category: 'Stay' as const,
      provider: 'Casa Solana',
      title: 'Boutique stay · 4.7 ★',
      detail: 'Breakfast included · flexible cancel',
      price: stay,
      icon: '⌂',
      accent: '#E1F6EE',
    },
    {
      id: 'local-rides',
      category: 'Getting around' as const,
      provider: 'Local transfers',
      title: 'Airport pickup + 2 day passes',
      detail: 'Pre-planned rides · pay locally',
      price: local,
      icon: '↗',
      accent: '#FFF0E8',
    },
    {
      id: 'food-picks',
      category: 'Getting around' as const,
      provider: 'Food & experiences',
      title: 'Local favourites',
      detail: 'Curated picks · flexible plans',
      price: food,
      icon: '✦',
      accent: '#FFF7DE',
    },
  ];
  const destination = input.destination.trim() || 'Goa';
  const origin = input.origin.trim() || 'Bengaluru';
  const totalPrice = deals.reduce(
    (sum, deal) => sum + deal.price * (deal.category === 'Stay' ? 1 : input.travellers),
    0,
  );
  const dayNotes = [
    'Arrive, settle in and take an easy first evening nearby.',
    'Explore the best local sights with time for a long lunch.',
    'Keep the morning open, then discover a neighbourhood favourite.',
    'Take a slower start and make one last memory before dinner.',
    'Pick a local favourite and leave time to wander.',
    'Enjoy a flexible day with a scenic stop along the way.',
    'Wrap up gently and head home when you are ready.',
  ];

  return {
    ...input,
    origin,
    destination,
    id: 'trip-' + Date.now(),
    createdAt: new Date().toISOString(),
    source: 'demo',
    aiSummary:
      summary ||
      'A ' +
        input.duration +
        '-day ' +
        input.budget.toLowerCase() +
        ' escape from ' +
        origin +
        ' to ' +
        destination +
        ', with a relaxed first day and room to explore at your own pace.',
    deals,
    itinerary: dayNotes.slice(0, Math.max(1, Math.min(input.duration, dayNotes.length))),
    totalPrice,
  };
}

export function toLivePlan(input: SearchInput, payload: any): TripPlan | null {
  const raw = typeof payload === 'string' ? parseJson(payload) : payload;
  if (!raw || typeof raw !== 'object') return null;
  const items = [
    ...list(raw.flights, 'Flight'),
    ...list(raw.hotels || raw.stays, 'Stay'),
    ...list(raw.ground_transport || raw.transport || raw.cabs, 'Getting around'),
  ];
  if (items.length === 0) return null;
  const demo = makeDemoPlan(input, raw.chat_reply || raw.summary);
  const mapped = items.map((item, index) => ({
    id: String(item.id || 'live-' + index),
    category: item.category,
    provider: String(item.provider || item.airline || item.name || item.title || item.category),
    title: String(item.title || item.name || item.airline || 'Travel option'),
    detail: String(item.detail || item.description || item.departure_time || 'Live result'),
    price: numberFrom(item.price || item.amount || item.total_price),
    icon: item.category === 'Flight' ? '✈' : item.category === 'Stay' ? '⌂' : '↗',
    accent: item.category === 'Flight' ? '#EEF0FF' : item.category === 'Stay' ? '#E1F6EE' : '#FFF0E8',
  }));
  const deals = mapped.filter((item) => item.price > 0);
  if (deals.length === 0) return null;
  return {
    ...demo,
    source: 'live',
    deals,
    totalPrice: deals.reduce((sum, item) => sum + item.price, 0),
  };
}

function list(value: unknown, category: 'Flight' | 'Stay' | 'Getting around') {
  if (!Array.isArray(value)) return [];
  return value.map((item) => ({ ...(item || {}), category }));
}

function numberFrom(value: unknown): number {
  const parsed = Number(String(value ?? '').replace(/[^\d.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseJson(value: string): any {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
