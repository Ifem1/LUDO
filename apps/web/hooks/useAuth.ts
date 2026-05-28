"use client";

import { useCallback } from "react";
import { useAuthStore } from "@/store/auth-store";
import {
  createAccount as createAccountFn,
  signIn as signInFn,
  changePassword as changePasswordFn,
} from "@/lib/auth/account";

export function useAuth() {
  const { email, address, account, signIn: setSignedIn, signOut } = useAuthStore();

  const signUp = useCallback(
    async (newEmail: string, password: string) => {
      const signed = await createAccountFn(newEmail, password);
      setSignedIn(signed);
      return signed;
    },
    [setSignedIn]
  );

  const signIn = useCallback(
    async (signInEmail: string, password: string) => {
      const signed = await signInFn(signInEmail, password);
      setSignedIn(signed);
      return signed;
    },
    [setSignedIn]
  );

  const changePassword = useCallback(
    async (oldPassword: string, newPassword: string) => {
      if (!email) throw new Error("not_signed_in");
      await changePasswordFn(email, oldPassword, newPassword);
    },
    [email]
  );

  return {
    email,
    address,
    account,
    isSignedIn: Boolean(account),
    signUp,
    signIn,
    signOut,
    changePassword,
    shortAddress: address ? `${address.slice(0, 6)}…${address.slice(-4)}` : null,
  };
}
