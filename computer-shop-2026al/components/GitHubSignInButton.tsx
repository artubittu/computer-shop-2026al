"use client";

import { authClient } from "@/lib/auth-client";

export default function GitHubSignInButton() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <span>Ładowanie...</span>;
  }

  if (session) {
    return (
      <div>
        <span>{session.user.name}</span>

        <button
          type="button"
          onClick={() => authClient.signOut()}
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
    <button type="button" onClick={handleSignIn}>
      Zaloguj przez GitHub
    </button>
  );
}