import { cn } from "@/shared/lib/utils";

export type SegmentTabItem<T extends string> = {
  id: T;
  label: string;
};

type SegmentTabsProps<T extends string> = {
  items: SegmentTabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  ariaLabel: string;
  className?: string;
};

export function SegmentTabs<T extends string>({
  items,
  value,
  onChange,
  ariaLabel,
  className,
}: SegmentTabsProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex max-w-full flex-wrap rounded-lg border border-border bg-muted/30 p-1",
        className,
      )}
      role="tablist"
      aria-label={ariaLabel}
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={value === item.id}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-normal transition-colors",
            value === item.id
              ? "bg-background text-foreground shadow-sm"
              : "text-foreground/70 hover:text-foreground",
          )}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
