import type { SessionRepository } from "@/entities/session/api/session-repository";

export function createSignOutUseCase(repo: SessionRepository) {
  return () => repo.signOut();
}
