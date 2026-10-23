import { Link } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { requestPasswordReset } from "@/features/auth/model/request-password-reset";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await requestPasswordReset(email);
      if (!result.ok) {
        setError(
          result.error === "empty_fields"
            ? "Indique su correo."
            : "Correo no válido.",
        );
        return;
      }
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="space-y-6">
        <p className="text-sm font-normal text-foreground" role="status">
          Revisa tu bandeja de entrada.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-normal text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Volver al login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="recover-email">Correo</Label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/45"
            aria-hidden
          />
          <Input
            id="recover-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="h-11 border-border bg-background pl-10"
          />
        </div>
      </div>

      {error ? (
        <p className="text-sm font-normal text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" className="h-11 w-full text-base font-normal" disabled={loading}>
        {loading ? "…" : "Enviar enlace"}
      </Button>

      <Link
        to="/login"
        className="inline-flex items-center gap-2 text-sm font-normal text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver al login
      </Link>
    </form>
  );
}
