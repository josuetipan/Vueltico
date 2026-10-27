import { cn } from "@/shared/lib/utils";
import { Label } from "@/shared/ui/label";

type SelectFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  error?: string;
  className?: string;
  disabled?: boolean;
  hideLabel?: boolean;
  /** `toolbar`: compacto, alineado con DataTableToolbar. */
  variant?: "default" | "toolbar";
};

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  error,
  className,
  disabled,
  hideLabel,
  variant = "default",
}: SelectFieldProps) {
  const isToolbar = variant === "toolbar";

  return (
    <div className={cn(isToolbar ? "min-w-0 space-y-1" : hideLabel ? "" : "space-y-2", className)}>
      {hideLabel ? null : (
        <Label
          htmlFor={id}
          className={cn(isToolbar && "text-xs font-medium text-muted-foreground")}
        >
          {label}
        </Label>
      )}
      <select
        id={id}
        value={value}
        disabled={disabled}
        aria-label={hideLabel ? label : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "flex w-full rounded-md border border-input bg-background px-2.5 py-1 text-sm shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isToolbar ? "h-8" : "h-9 shadow-sm",
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
