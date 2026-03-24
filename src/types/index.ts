export interface ExchangeRate {
  id: string;
  currency: "GBP" | "EUR";
  payment_method: "card" | "cash";
  rate_to_krw: number;
  updated_at: string;
}

export interface ScheduleDay {
  id: string;
  day_number: number;
  date: string | null;
  title: string | null;
  summary: string | null;
  google_maps_url: string | null;
  map_urls: string[] | null;
  city: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScheduleItem {
  id: string;
  day_id: string;
  seq: number;
  time_start: string | null;
  time_end: string | null;
  title: string;
  description: string | null;
  google_maps_url: string | null;
  map_urls: string[] | null;
  route_url: string | null;
  transport_type: string | null;
  transport_detail: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  expense_type: "trip" | "pre_trip";
  day_number: number | null;
  description: string;
  amount: number;
  currency: "GBP" | "EUR" | "KRW";
  payment_method: "card" | "cash";
  category: string;
  paid_by: "구도현" | "김상윤" | "n빵";
  city: string | null;
  time: string | null;
  booking_status: 'reserved' | 'needed' | 'on_site';
  london_pass: boolean;
  estimated_amount: number | null;
  created_at: string;
  updated_at: string;
}

export interface Accommodation {
  id: string;
  day_number: number;
  name: string;
  google_maps_url: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  reservation_number: string | null;
  notes: string | null;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string | null;
  is_checked: boolean;
  sort_order: number;
  created_at: string;
}

export interface UpgradeNote {
  id: string;
  title: string;
  description: string | null;
  priority: "high" | "medium" | "low";
  is_done: boolean;
  sort_order: number;
  created_at: string;
}
