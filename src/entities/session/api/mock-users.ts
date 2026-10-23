import type { UserSession } from "@/entities/session";

export type MockUserAccount = {
  /** Correo de acceso (usuario) */
  email: string;
  /** Contraseña mock — solo entorno de demostración */
  password: string;
  session: UserSession;
};

export const MOCK_USER_ACCOUNTS: MockUserAccount[] = [
  {
    email: "superadmin@vueltico.demo",
    password: "demo123",
    session: {
      id: "usr-sa-001",
      email: "superadmin@vueltico.demo",
      fullName: "Ana Morales",
      role: "superadmin",
      tenant: null,
      avatarInitials: "AM",
    },
  },
  {
    email: "admin@andina.demo",
    password: "demo123",
    session: {
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
  },
  {
    email: "operador@andina.demo",
    password: "demo123",
    session: {
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
  },
  {
    email: "cajero.cumbaya@andina.demo",
    password: "demo123",
    session: {
      id: "usr-op-002",
      email: "cajero.cumbaya@andina.demo",
      fullName: "Diego Ortiz",
      role: "operator",
      tenant: {
        id: "ten-ec-001",
        legalName: "Comercial Andina Cía. Ltda.",
        tradeName: "Andina Retail",
        ruc: "1790123456001",
      },
      avatarInitials: "DO",
    },
  },
];

export function findMockUserAccount(
  email: string,
  password: string,
): MockUserAccount | null {
  const normalizedEmail = email.trim().toLowerCase();
  return (
    MOCK_USER_ACCOUNTS.find(
      (account) =>
        account.email.toLowerCase() === normalizedEmail && account.password === password,
    ) ?? null
  );
}
