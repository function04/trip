// 여행 시작일 기준으로 오늘이 Day 몇인지 계산 (영국 시간 기준)
// TRIP_START_DATE는 Day 1에 해당하는 날짜 (ISO 형식 "YYYY-MM-DD")
export const TRIP_START_DATE = "2025-07-01"; // ← 실제 여행 시작일로 수정 필요
export const TOTAL_DAYS = 12;

export function getTodayDayNumber(): number | null {
  // 영국 시간 기준으로 오늘 날짜를 YYYY-MM-DD로 가져옴
  const ukDateStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());

  const today = new Date(ukDateStr + "T00:00:00");
  const start = new Date(TRIP_START_DATE + "T00:00:00");

  const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const day = diff + 1; // Day 1 = 시작일

  if (day < 1 || day > TOTAL_DAYS) return null;
  return day;
}
