export interface ParsedExpense {
  description?: string;
  amount?: number;
  currency?: "GBP" | "EUR" | "KRW";
  paymentMethod?: "card" | "cash";
  paidBy?: "구도현" | "김상윤" | "n빵";
  category?: string;
}

const CURRENCY_MAP: Record<string, "GBP" | "EUR" | "KRW"> = {
  파운드: "GBP",
  "£": "GBP",
  gbp: "GBP",
  유로: "EUR",
  "€": "EUR",
  eur: "EUR",
  원: "KRW",
  "₩": "KRW",
  krw: "KRW",
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  지하철: ["지하철", "metro", "tube", "subway", "underground"],
  트램: ["트램", "tram"],
  버스: ["버스", "bus"],
  택시: ["택시", "taxi", "uber", "bolt"],
  기차: ["기차", "train", "rail"],
  식비: ["점심", "저녁", "아침", "밥", "식당", "레스토랑", "restaurant"],
  카페: ["커피", "카페", "cafe", "coffee", "tea"],
  기념품: ["기념품", "선물", "gift", "souvenir"],
  쇼핑: ["쇼핑", "shopping", "옷", "clothes"],
  마트: ["마트", "mart", "grocery", "슈퍼"],
  티켓: ["티켓", "입장료", "입장", "ticket", "museum", "박물관"],
  통신: ["통신", "sim", "데이터", "유심"],
  숙소: ["숙소", "호텔", "hotel", "hostel"],
  항공: ["항공", "비행기", "flight", "airplane"],
};

export function smartParse(input: string): ParsedExpense {
  const result: ParsedExpense = {};
  let remaining = input.trim();

  // 1. Extract amount + currency
  const amountRegex =
    /([\d,.]+)\s*(파운드|유로|원|£|€|₩|gbp|eur|krw)/i;
  const match = remaining.match(amountRegex);
  if (match) {
    result.amount = parseFloat(match[1].replace(/,/g, ""));
    result.currency = CURRENCY_MAP[match[2].toLowerCase()];
    remaining = remaining.replace(match[0], " ").trim();
  }

  // 2. Extract payment method
  if (/카드/.test(remaining)) {
    result.paymentMethod = "card";
    remaining = remaining.replace(/카드/, " ").trim();
  } else if (/현금/.test(remaining)) {
    result.paymentMethod = "cash";
    remaining = remaining.replace(/현금/, " ").trim();
  }

  // 3. Extract payer
  if (/구도현|도현/.test(remaining)) {
    result.paidBy = "구도현";
    remaining = remaining.replace(/구?도현/, " ").trim();
  } else if (/김상윤|상윤/.test(remaining)) {
    result.paidBy = "김상윤";
    remaining = remaining.replace(/김?상윤/, " ").trim();
  } else if (/n빵|엔빵|N빵/.test(remaining)) {
    result.paidBy = "n빵";
    remaining = remaining.replace(/[nN]빵|엔빵/, " ").trim();
  }

  // 4. Auto-detect category
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => remaining.toLowerCase().includes(kw.toLowerCase()))) {
      result.category = cat;
      break;
    }
  }

  // 5. Remaining text is the description
  remaining = remaining.replace(/\s+/g, " ").trim();
  if (remaining.length > 0) {
    result.description = remaining;
  }

  return result;
}
