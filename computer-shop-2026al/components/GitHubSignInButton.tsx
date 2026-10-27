"use client";

import { authClient } from "@/lib/auth-client";

export default function GitHubSignInButton() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="h-10 w-40 animate-pulse rounded-lg bg-slate-800" />
    );
  }

  if (session) {
    const userName = session.user.name || "Użytkownik";
    const initial = userName.charAt(0).toUpperCase();

    return (
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
          {initial}
        </div>

        <span className="max-w-32 truncate text-sm font-semibold text-slate-100">
          {userName}
        </span>

        <div className="h-6 w-px bg-slate-700" />

        <button
          type="button"
          onClick={() => authClient.signOut()}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          Wyloguj
        </button>
      </div>
    );
  }

  const handleSignIn = async () => {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/",
    });
  };

  return (
    <button
      type="button"
      onClick={handleSignIn}
      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
    >
      Zaloguj przez GitHub
    </button>
  );
}