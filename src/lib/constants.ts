export const TOTAL_DAYS = 12;

export const CITIES = [
  "맨체스터",
  "리버풀",
  "런던",
  "옥스퍼드",
  "케임브리지",
  "더블린",
] as const;

export type City = (typeof CITIES)[number];

export const CATEGORIES = [
  "식비",
  "카페",
  "지하철",
  "트램",
  "버스",
  "택시",
  "기차",
  "숙소",
  "항공",
  "티켓",
  "기념품",
  "쇼핑",
  "마트",
  "통신",
  "기타",
] as const;

// 가계부(trip) 입력시 사용할 카테고리 — 기차는 여행전 예약 항목이므로 제외
export const TRIP_CATEGORIES = [
  "식비",
  "카페",
  "지하철",
  "트램",
  "버스",
  "택시",
  "숙소",
  "티켓",
  "기념품",
  "쇼핑",
  "마트",
  "통신",
  "기타",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const PAYERS = ["구도현", "김상윤", "n빵"] as const;
export type Payer = (typeof PAYERS)[number];

export const CURRENCIES = ["GBP", "EUR", "KRW"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const PAYMENT_METHODS = ["card", "cash"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const CURRENCY_LABELS: Record<string, string> = {
  GBP: "£ 파운드",
  EUR: "€ 유로",
  KRW: "₩ 원",
};

export const PAYMENT_LABELS: Record<string, string> = {
  card: "카드",
  cash: "현금",
};

export const PAYER_LABELS: Record<string, string> = {
  구도현: "구도현",
  김상윤: "김상윤",
  "n빵": "n빵",
};
