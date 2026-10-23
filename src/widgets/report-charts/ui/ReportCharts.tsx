import { formatUsdFromCents } from "@/shared/lib/format";

export function ReportBarChart({
  data,
}: {
  data: { label: string; valueCents: number }[];
}) {
  const max = Math.max(...data.map((d) => d.valueCents), 1);
  return (
    <div className="flex h-56 items-end gap-2 border-b pb-2" role="img" aria-label="Gráfico de barras">
      {data.map((point) => (
        <div key={point.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
          <span className="text-[10px] text-muted-foreground">{formatUsdFromCents(point.valueCents)}</span>
          <div
            className="w-full rounded-t-md bg-primary/80"
            style={{ height: `${Math.round((point.valueCents / max) * 100)}%`, minHeight: 4 }}
          />
          <span className="truncate text-xs text-muted-foreground">{point.label}</span>
        </div>
      ))}
    </div>
  );
}

export function ReportLineChart({
  data,
}: {
  data: { label: string; valueCents: number }[];
}) {
  if (data.length === 0) return null;
  const max = Math.max(...data.map((d) => Math.abs(d.valueCents)), 1);
  const min = Math.min(...data.map((d) => d.valueCents));
  const height = 160;
  const width = Math.max(data.length * 48, 280);
  const points = data.map((d, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * (width - 24) + 12;
    const y = height - 12 - ((d.valueCents - min) / (max - min || 1)) * (height - 24);
    return `${x},${y}`;
  });
  return (
    <div className="overflow-x-auto">
      <svg width={width} height={height + 28} role="img" aria-label="Gráfico de líneas" className="text-primary">
        <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points.join(" ")} />
        {data.map((d, i) => {
          const x = (i / Math.max(data.length - 1, 1)) * (width - 24) + 12;
          const y = height - 12 - ((d.valueCents - min) / (max - min || 1)) * (height - 24);
          return <circle key={d.label} cx={x} cy={y} r="3" fill="currentColor" />;
        })}
      </svg>
      <div className="flex gap-2 text-xs text-muted-foreground">
        {data.map((d) => (
          <span key={d.label} className="shrink-0">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
