import { createGetCurrentSessionUseCase } from "../application/use-cases/get-current-session";
import { createSignOutUseCase } from "../application/use-cases/sign-out";
import { mockSessionRepository } from "./mock-session-repository";

const repo = mockSessionRepository;

export const identityUseCases = {
  getCurrentSession: createGetCurrentSessionUseCase(repo),
  signOut: createSignOutUseCase(repo),
};
