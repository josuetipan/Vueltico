import { createGetCurrentSessionUseCase } from "../model/get-current-session";
import { createSignInUseCase } from "../model/sign-in";
import { createSignOutUseCase } from "../model/sign-out";
import { mockSessionRepository } from "@/entities/session/api/mock-session-repository";

const repo = mockSessionRepository;

export const identityUseCases = {
  getCurrentSession: createGetCurrentSessionUseCase(repo),
  signIn: createSignInUseCase(repo),
  signOut: createSignOutUseCase(repo),
};
