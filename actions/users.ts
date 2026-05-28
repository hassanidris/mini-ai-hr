"use server";

import { handleError } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/db/prisma";

async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 100,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        await new Promise((res) =>
          setTimeout(res, baseDelayMs * 2 ** (attempt - 1)),
        );
      }
    }
  }
  throw lastError;
}

async function getOrCreateUser(userId: string, email: string): Promise<void> {
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, email },
  });
}

export const loginAction = async (email: string, password: string) => {
  try {
    const client = await createClient();
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Reconciliation: idempotently ensure the Prisma User row exists in case
    // it was missed during sign-up (e.g. due to a transient DB failure).
    const userId = data.user?.id;
    if (userId) {
      await getOrCreateUser(userId, email).catch((err) =>
        console.error(
          `[login] reconciliation upsert failed for auth user ${userId}`,
          err,
        ),
      );
    }

    return { errorMessage: null };
  } catch (error) {
    console.error("Login error:", error);
    return handleError(error);
  }
};

export const logOutAction = async () => {
  try {
    const client = await createClient();
    const { error } = await client.auth.signOut();

    if (error) throw error;

    return { errorMessage: null };
  } catch (error) {
    console.error("Logout error:", error);
    return handleError(error);
  }
};

export const signUpAction = async (email: string, password: string) => {
  try {
    const client = await createClient();
    const { data, error } = await client.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    const userId = data.user?.id;
    if (!userId) throw new Error("User ID not found after sign up");

    // Add user to "users" table
    // ... rest of your code

    try {
      await withRetry(() => getOrCreateUser(userId, email));
    } catch (prismaError) {
      console.error(
        `[signUp] prisma.user.upsert failed for auth user ${userId} — row may need reconciliation on next login`,
        prismaError,
      );
      throw new Error(
        "Account created but profile setup failed. Please try logging in.",
      );
    }

    return {
      errorMessage: null,
      message:
        "Please check your email to confirm your account before logging in",
    };
  } catch (error) {
    return handleError(error);
  }
};
