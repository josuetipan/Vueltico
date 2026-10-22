import type { Metadata } from "next";
import { LoginForm } from "@/modules/identity/presentation/components/login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <p className="mb-6 text-center text-sm font-semibold uppercase tracking-widest text-primary">
          Vueltico
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
