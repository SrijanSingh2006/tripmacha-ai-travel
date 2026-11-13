import { makeDemoPlan, toLivePlan } from './data/demo';
import { SearchInput, TripPlan } from './types';

const API_BASE = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '');

export async function buildTrip(input: SearchInput): Promise<TripPlan> {
  if (!API_BASE) return makeDemoPlan(input);

  try {
    const prompt =
      'Plan a ' +
      input.duration +
      '-day ' +
      input.budget.toLowerCase() +
      ' trip from ' +
      input.origin +
      ' to ' +
      input.destination +
      ' starting ' +
      input.departureDate +
      ' for ' +
      input.travellers +
      ' travellers.';
    const chatPromise = fetchWithTimeout(API_BASE + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, history: [] }),
    }, 9000)
      .then((response) => (response.ok ? response.json() : null))
      .catch(() => null);

    const query = new URLSearchParams({
      mode: 'diy',
      origin: input.origin,
      destination: input.destination,
      date: input.departureDate,
      duration: String(input.duration),
      budget: input.budget.toLowerCase(),
      guests: String(input.travellers),
    });
    const searchResponse = await fetchWithTimeout(
      API_BASE + '/api/scrape/trigger-search?' + query.toString(),
      { method: 'POST' },
      9000,
    );
    if (!searchResponse.ok) throw new Error('Search service is unavailable');
    const search = await searchResponse.json();
    const chat = await chatPromise;
    if (search.task_id) {
      const result = await pollTask(search.task_id);
      const livePlan = toLivePlan(input, result);
      if (livePlan) return { ...livePlan, aiSummary: chat?.chat_reply || livePlan.aiSummary };
    }
    return makeDemoPlan(input, chat?.chat_reply);
  } catch {
    return makeDemoPlan(input);
  }
}

async function pollTask(taskId: string): Promise<any> {
  for (let attempt = 0; attempt < 16; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    try {
      const response = await fetchWithTimeout(
        API_BASE + '/api/scrape/status/' + encodeURIComponent(taskId),
        undefined,
        5000,
      );
      if (!response.ok) continue;
      const result = await response.json();
      if (result.status === 'completed') return result.data;
      if (result.status === 'failed') return null;
    } catch {
      return null;
    }
  }
  return null;
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export const apiMode = API_BASE ? 'Connected API' : 'Offline demo';
