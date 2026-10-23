import { ForgotPasswordForm } from "@/features/auth/ui/forgot-password-form";
import { LoginAuthShell } from "@/pages/login/ui/login-auth-shell";

export function ForgotPasswordPage() {
  return (
    <LoginAuthShell title="Recuperar contraseña">
      <ForgotPasswordForm />
    </LoginAuthShell>
  );
}
