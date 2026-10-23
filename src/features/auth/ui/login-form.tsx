import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { Eye, EyeOff, Lock, LogIn, Mail, Users } from "lucide-react";
import { getRoleHomePath } from "@/entities/session";
import { MOCK_USER_ACCOUNTS } from "@/entities/session/api/mock-users";
import { useSession } from "@/features/auth/model/use-session";
import { identityUseCases } from "@/features/auth/api/identity-composition";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

export function LoginForm() {
  const navigate = useNavigate();
  const { setSession } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [demoPick, setDemoPick] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoOptions = useMemo(
    () => [
      { value: "", label: "—" },
      ...MOCK_USER_ACCOUNTS.map((a) => ({
        value: a.session.id,
        label: a.email,
      })),
    ],
    [],
  );

  function onDemoChange(userId: string) {
    setDemoPick(userId);
    const account = MOCK_USER_ACCOUNTS.find((a) => a.session.id === userId);
    if (!account) return;
    setEmail(account.email);
    setPassword(account.password);
    setError(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await identityUseCases.signIn({ email, password });
      if (!result.ok) {
        setError(result.error === "empty_fields" ? "Complete los campos." : "Acceso denegado.");
        return;
      }
      setSession(result.session);
      navigate(getRoleHomePath(result.session.role));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="login-email">Usuario</Label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/45"
              aria-hidden
            />
            <Input
              id="login-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="h-11 border-border bg-background pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="login-password">Contraseña</Label>
            <Link
              to="/login/recuperar-contrasena"
              className="text-sm font-normal text-primary hover:underline"
            >
              Recuperar contraseña
            </Link>
          </div>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/45"
              aria-hidden
            />
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="h-11 border-border bg-background pl-10 pr-10"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-foreground/45 transition-colors hover:text-foreground disabled:pointer-events-none"
              onClick={() => setShowPassword((v) => !v)}
              disabled={loading}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden />
              ) : (
                <Eye className="h-4 w-4" aria-hidden />
              )}
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <p className="text-sm font-normal text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" className="h-11 w-full text-base font-normal" disabled={loading}>
        {loading ? (
          "…"
        ) : (
          <>
            <LogIn className="h-4 w-4" aria-hidden />
            Entrar
          </>
        )}
      </Button>

      <div className="space-y-2 pt-2">
        <Label htmlFor="login-demo" className="inline-flex items-center gap-2">
          <Users className="h-4 w-4 text-foreground/45" aria-hidden />
          Demo
        </Label>
        <select
          id="login-demo"
          value={demoPick}
          onChange={(e) => onDemoChange(e.target.value)}
          disabled={loading}
          className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          {demoOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </form>
  );
}
