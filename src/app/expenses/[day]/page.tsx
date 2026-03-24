import { TOTAL_DAYS } from "@/lib/constants";
import ExpenseDayClient from "./ExpenseDayClient";

export function generateStaticParams() {
  return Array.from({ length: TOTAL_DAYS }, (_, i) => ({
    day: String(i + 1),
  }));
}

export default async function ExpenseDayPage({
  params,
}: {
  params: Promise<{ day: string }>;
}) {
  const { day } = await params;
  return <ExpenseDayClient dayNumber={Number(day)} />;
}
