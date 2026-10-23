import { LoginForm } from "@/features/auth/ui/login-form";
import { LoginAuthShell } from "@/pages/login/ui/login-auth-shell";

export function LoginPage() {
  return (
    <LoginAuthShell title="Acceder a la plataforma">
      <LoginForm />
    </LoginAuthShell>
  );
}
