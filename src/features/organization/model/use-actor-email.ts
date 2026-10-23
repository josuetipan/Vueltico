import { useSession } from "@/features/auth/model/use-session";

export function useActorEmail(): string {
  const { session } = useSession();
  return session?.email ?? "superadmin@vueltico.demo";
}
