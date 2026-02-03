"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"exchanging" | "done" | "error">("exchanging");

  useEffect(() => {
    if (!supabase) {
      setStatus("error");
      return;
    }
    const code = searchParams?.get("code");
    const next = searchParams?.get("next") ?? "/parents";
    if (!code) {
      router.replace(next);
      return;
    }
    supabase.auth
      .exchangeCodeForSession(code)
      .then(() => {
        setStatus("done");
        router.replace(next);
      })
      .catch(() => {
        setStatus("error");
        router.replace("/parents?error=auth");
      });
  }, [router, searchParams]);

  return (
    <main className="flex min-h-[calc(var(--app-height,100dvh)+var(--safe-bottom))] flex-col items-center justify-center px-4">
      {status === "exchanging" && (
        <p className="text-muted-foreground">Signing you in…</p>
      )}
      {status === "error" && (
        <p className="text-amber-700">
          Something went wrong. Try again from the Parents page.
        </p>
      )}
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<main className="flex min-h-[calc(var(--app-height,100dvh)+var(--safe-bottom))] flex-col items-center justify-center px-4"><p className="text-muted-foreground">Loading…</p></main>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
