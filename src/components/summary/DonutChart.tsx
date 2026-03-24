"use client";

import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { formatKRW } from "@/lib/currency";

interface DonutChartProps {
  data: { name: string; value: number; color: string }[];
  total: number;
  label: string;
  color?: string;
}

const COLORS = [
  "#7289da", "#43b581", "#faa61a", "#ed4245", "#b9bbbe",
  "#5865f2", "#eb459e", "#3ba55c", "#f47fff", "#a3b1c6",
  "#ffd983", "#80848e", "#57f287", "#fee75c", "#ed4245",
];

const SIZE = 160;

export default function DonutChart({ data, total, label }: DonutChartProps) {
  const chartData = data.filter((d) => d.value > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 12 }}>
        {label}
      </div>

      {/* 고정 크기 컨테이너 — ResponsiveContainer 0×0 버그 회피 */}
      <div style={{ position: "relative", width: SIZE, height: SIZE, flexShrink: 0 }}>
        {chartData.length > 0 ? (
          <PieChart width={SIZE} height={SIZE}>
            <Pie
              data={chartData}
              cx={SIZE / 2}
              cy={SIZE / 2}
              innerRadius={50}
              outerRadius={70}
              dataKey="value"
              stroke="none"
              paddingAngle={2}
            >
              {chartData.map((entry, idx) => (
                <Cell key={entry.name} fill={entry.color || COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [formatKRW(Number(value)), ""]}
              contentStyle={{
                background: "rgba(43,45,49,0.97)",
                border: "1px solid var(--border-hover)",
                borderRadius: 10,
                color: "var(--text-primary)",
                fontSize: 12,
                padding: "7px 11px",
              }}
              itemStyle={{ color: "var(--text-primary)" }}
              labelStyle={{ color: "var(--text-secondary)", fontSize: 11 }}
            />
          </PieChart>
        ) : (
          <div style={{ width: SIZE, height: SIZE, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{
              width: 120, height: 120, borderRadius: 60,
              border: "3px solid rgba(255,255,255,0.07)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ color: "var(--text-tertiary)", fontSize: 11 }}>데이터 없음</span>
            </div>
          </div>
        )}

        {/* 중앙 합계 */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          pointerEvents: "none",
        }}>
          <div style={{ fontSize: 9, color: "var(--text-tertiary)", marginBottom: 2 }}>합계</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2, textAlign: "center" }}>
            {formatKRW(total)}
          </div>
        </div>
      </div>

      {/* 범례 */}
      <div style={{ marginTop: 14, width: "100%", display: "flex", flexDirection: "column", gap: 5 }}>
        {chartData.slice(0, 6).map((entry, idx) => (
          <div key={entry.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{
                width: 8, height: 8, borderRadius: 4, flexShrink: 0,
                background: entry.color || COLORS[idx % COLORS.length],
              }} />
              <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{entry.name}</span>
            </div>
            <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500 }}>
              {formatKRW(entry.value)}
            </span>
          </div>
        ))}
        {chartData.length > 6 && (
          <div style={{ fontSize: 10, color: "var(--text-tertiary)", textAlign: "center", marginTop: 2 }}>
            외 {chartData.length - 6}개 카테고리
          </div>
        )}
      </div>
    </div>
  );
}
