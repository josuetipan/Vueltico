import type { UserSession } from "@/entities/session";
import { findMockUserAccount } from "@/entities/session/api/mock-users";
import type { SessionRepository } from "@/entities/session/api/session-repository";

export type SignInInput = {
  email: string;
  password: string;
};

export type SignInError = "invalid_credentials" | "empty_fields";

export type SignInResult =
  | { ok: true; session: UserSession }
  | { ok: false; error: SignInError };

export function createSignInUseCase(repository: SessionRepository) {
  return async function signIn(input: SignInInput): Promise<SignInResult> {
    const email = input.email.trim();
    const password = input.password;

    if (!email || !password) {
      return { ok: false, error: "empty_fields" };
    }

    const account = findMockUserAccount(email, password);
    if (!account) {
      return { ok: false, error: "invalid_credentials" };
    }

    const session = await repository.save(account.session);
    return { ok: true, session };
  };
}
