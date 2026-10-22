"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  USER_ROLES,
  getRoleHomePath,
  type UserRole,
} from "../../domain/session";
import { mockSessionRepository } from "../../infrastructure/mock-session-repository";
import { useSession } from "../hooks/use-session";
import { getRoleLabel } from "@/shared/config/navigation";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/presentation/components/ui/card";

const MOCK_BY_ROLE: Record<UserRole, Parameters<typeof mockSessionRepository.save>[0]> = {
  superadmin: {
    id: "usr-sa-001",
    email: "superadmin@vueltico.demo",
    fullName: "Ana Morales",
    role: "superadmin",
    tenant: null,
    avatarInitials: "AM",
  },
  company_admin: {
    id: "usr-ca-001",
    email: "admin@andina.demo",
    fullName: "Carlos Vega",
    role: "company_admin",
    tenant: {
      id: "ten-ec-001",
      legalName: "Comercial Andina Cía. Ltda.",
      tradeName: "Andina Retail",
      ruc: "1790123456001",
    },
    avatarInitials: "CV",
  },
  operator: {
    id: "usr-op-001",
    email: "operador@andina.demo",
    fullName: "María Salinas",
    role: "operator",
    tenant: {
      id: "ten-ec-001",
      legalName: "Comercial Andina Cía. Ltda.",
      tradeName: "Andina Retail",
      ruc: "1790123456001",
    },
    avatarInitials: "MS",
  },
};

export function LoginForm() {
  const router = useRouter();
  const { setSession } = useSession();
  const [role, setRole] = useState<UserRole>("company_admin");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const session = await mockSessionRepository.save(MOCK_BY_ROLE[role]);
      setSession(session);
      router.push(getRoleHomePath(role));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Iniciar sesión (prototipo)</CardTitle>
        <CardDescription>
          Seleccione un perfil simulado. No es autenticación real.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Perfil</legend>
            {USER_ROLES.map((r) => (
              <label key={r} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="role"
                  value={r}
                  checked={role === r}
                  onChange={() => setRole(r)}
                />
                {getRoleLabel(r)}
              </label>
            ))}
          </fieldset>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Ingresando…" : "Entrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
