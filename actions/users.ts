"use server";

import { handleError } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export const loginAction = async (email: string, password: string) => {
  try {
    const client = await createClient();
    const { error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

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

    return {
      errorMessage: null,
      message:
        "Please check your email to confirm your account before logging in",
    };
  } catch (error) {
    return handleError(error);
  }
};
