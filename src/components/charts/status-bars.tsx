type Row = { label: string; value: number; colorVar: string };

export function StatusBars({ rows }: { rows: Row[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));

  return (
    <div className="flex flex-col gap-3.5">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="mb-1 flex items-center justify-between text-[13px]">
            <span className="font-medium text-ink">{r.label}</span>
            <span className="font-mono text-[12px] text-ink-muted">{r.value}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-surface-sunken">
            <div
              className="h-2 rounded-full"
              style={{
                width: `${(r.value / max) * 100}%`,
                backgroundColor: r.colorVar,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
