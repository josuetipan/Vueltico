import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/presentation/components/ui/button";

type StatePanelProps = {
  variant: "loading" | "empty" | "error";
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

export function StatePanel({
  variant,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: StatePanelProps) {
  const Icon =
    variant === "loading" ? Loader2 : variant === "error" ? AlertCircle : Inbox;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 px-6 py-16 text-center",
        className,
      )}
      role={variant === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      <div
        className={cn(
          "mb-4 flex h-12 w-12 items-center justify-center rounded-full",
          variant === "error" && "bg-destructive/10 text-destructive",
          variant === "empty" && "bg-muted text-muted-foreground",
          variant === "loading" && "bg-accent/10 text-accent",
        )}
      >
        <Icon
          className={cn("h-6 w-6", variant === "loading" && "animate-spin")}
          aria-hidden
        />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {actionLabel && onAction ? (
        <Button className="mt-6" variant="outline" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
