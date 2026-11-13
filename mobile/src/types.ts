export type BudgetTier = 'Shoestring' | 'Moderate' | 'Premium';

export type SearchInput = {
  origin: string;
  destination: string;
  departureDate: string;
  duration: number;
  travellers: number;
  budget: BudgetTier;
};

export type Deal = {
  id: string;
  category: 'Flight' | 'Stay' | 'Getting around';
  provider: string;
  title: string;
  detail: string;
  price: number;
  icon: string;
  accent: string;
};

export type TripPlan = SearchInput & {
  id: string;
  createdAt: string;
  source: 'demo' | 'live';
  aiSummary: string;
  deals: Deal[];
  itinerary: string[];
  totalPrice: number;
};

export type Profile = {
  name: string;
  email: string;
};

export type TabKey = 'explore' | 'trips' | 'saved' | 'profile';
