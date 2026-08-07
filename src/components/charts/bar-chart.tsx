type Bar = { label: string; value: number };

/**
 * A small, self-contained magnitude chart. Deliberately plain SVG (no chart
 * library) so it stays a Server Component — the hover value rides the native
 * <title> tooltip rather than client-side JS.
 */
export function BarChart({
  data,
  color = "var(--color-primary)",
  height = 160,
  angledLabels = false,
}: {
  data: Bar[];
  color?: string;
  height?: number;
  angledLabels?: boolean;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const barWidth = 24;
  const gap = angledLabels ? 22 : 14;
  const leftMargin = angledLabels ? 60 : 0;
  const plotWidth = data.length * (barWidth + gap) - gap;
  const width = plotWidth + leftMargin;
  const bottomMargin = angledLabels ? 62 : 28;
  const chartHeight = height - bottomMargin;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${Math.max(width, 1)} ${height}`}
        width={Math.max(width, 1)}
        height={height}
        className="overflow-visible"
      >
        <line
          x1={leftMargin}
          y1={chartHeight}
          x2={width}
          y2={chartHeight}
          stroke="var(--color-border)"
          strokeWidth={1}
        />
        {data.map((d, i) => {
          const x = leftMargin + i * (barWidth + gap);
          const cx = x + barWidth / 2;
          const h = max === 0 ? 0 : (d.value / max) * (chartHeight - 18);
          const y = chartHeight - h;
          return (
            <g key={`${d.label}-${i}`}>
              <title>{`${d.label}: ${d.value}`}</title>
              {d.value > 0 && (
                <text
                  x={cx}
                  y={y - 6}
                  textAnchor="middle"
                  className="fill-ink-muted"
                  style={{ font: "500 11px var(--font-sans)" }}
                >
                  {d.value}
                </text>
              )}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(h, 1)}
                rx={4}
                fill={color}
              />
              {angledLabels ? (
                <text
                  x={cx}
                  y={chartHeight + 10}
                  textAnchor="end"
                  transform={`rotate(-40 ${cx} ${chartHeight + 10})`}
                  className="fill-ink-faint"
                  style={{ font: "500 10.5px var(--font-sans)" }}
                >
                  {d.label}
                </text>
              ) : (
                <text
                  x={cx}
                  y={height - 8}
                  textAnchor="middle"
                  className="fill-ink-faint"
                  style={{ font: "500 10.5px var(--font-sans)" }}
                >
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
