import type { SessionRepository } from "@/entities/session/api/session-repository";

export function createGetCurrentSessionUseCase(repo: SessionRepository) {
  return () => repo.getCurrent();
}
