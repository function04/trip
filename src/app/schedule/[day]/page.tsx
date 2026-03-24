import { TOTAL_DAYS } from "@/lib/constants";
import ScheduleDayClient from "./ScheduleDayClient";

export function generateStaticParams() {
  return Array.from({ length: TOTAL_DAYS }, (_, i) => ({
    day: String(i + 1),
  }));
}

export default async function ScheduleDayPage({
  params,
}: {
  params: Promise<{ day: string }>;
}) {
  const { day } = await params;
  return <ScheduleDayClient dayNumber={Number(day)} />;
}
