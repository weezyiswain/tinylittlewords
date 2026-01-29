"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, LogIn, LogOut, Plus, Sparkles } from "lucide-react";
import type { User } from "@supabase/supabase-js";

import { cn } from "@/lib/utils";
import { AVATAR_OPTIONS } from "@/lib/avatars";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type KidProfile = {
  id: string;
  display_name: string;
  avatar_id: string;
};

const CALLBACK_URL =
  typeof window !== "undefined"
    ? `${window.location.origin}/auth/callback`
    : "";

export default function ParentsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [kids, setKids] = useState<KidProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [showAddKid, setShowAddKid] = useState(false);
  const [newKidName, setNewKidName] = useState("");
  const [newKidAvatar, setNewKidAvatar] = useState(AVATAR_OPTIONS[0]!.id);
  const [addKidBusy, setAddKidBusy] = useState(false);
  const [errorParam, setErrorParam] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search).get("error");
    setErrorParam(p);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setUser(s?.user ?? null);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setUser(s?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !supabase) return;
    const client = supabase;
    const fetchKids = async () => {
      const { data } = await client
        .from("kid_profiles")
        .select("id,display_name,avatar_id")
        .eq("parent_id", user.id)
        .order("created_at", { ascending: true });
      setKids((data ?? []) as KidProfile[]);
    };
    void fetchKids();
  }, [user]);

  useEffect(() => {
    if (!user || !supabase) return;
    const client = supabase;
    const ensureProfile = async () => {
      const { data: existing } = await client
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();
      if (!existing) {
        await client.from("profiles").insert({
          id: user.id,
          email: user.email ?? undefined,
        });
      }
    };
    void ensureProfile();
  }, [user]);

  const handleEmailAuth = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setAuthError(null);
      setAuthBusy(true);
      if (!supabase) {
        setAuthError("Auth not available.");
        setAuthBusy(false);
        return;
      }
      try {
        if (authMode === "signup") {
          const { error } = await supabase.auth.signUp({ email, password });
          if (error) throw error;
          setAuthError(null);
          setAuthMode("signin");
          setPassword("");
          // Optional: show "Check your email" message. For testing, some configs auto-confirm.
        } else {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          setAuthError(null);
        }
      } catch (err) {
        setAuthError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setAuthBusy(false);
      }
    },
    [authMode, email, password]
  );

  const handleOAuth = useCallback(
    (provider: "google" | "facebook") => {
      if (!supabase) return;
      supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${CALLBACK_URL}?next=/parents` },
      });
    },
    []
  );

  const handleSignOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setKids([]);
  }, []);

  const handleAddKid = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user || !supabase || !newKidName.trim()) return;
      setAddKidBusy(true);
      setAuthError(null);
      try {
        const { data, error } = await supabase
          .from("kid_profiles")
          .insert({
            parent_id: user.id,
            display_name: newKidName.trim(),
            avatar_id: newKidAvatar,
          })
          .select("id,display_name,avatar_id")
          .single();
        if (error) throw error;
        setKids((prev) => [...prev, data as KidProfile]);
        setNewKidName("");
        setNewKidAvatar(AVATAR_OPTIONS[0]!.id);
        setShowAddKid(false);
      } catch (err) {
        setAuthError(
          err instanceof Error ? err.message : "Could not add kid profile."
        );
      } finally {
        setAddKidBusy(false);
      }
    },
    [user, newKidName, newKidAvatar]
  );

  if (loading) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-4">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden px-4 py-8 pt-[calc(env(safe-area-inset-top,0)+2rem)] sm:px-10 sm:py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-[-12%] h-64 w-64 rounded-full bg-gradient-to-br from-teal-200/60 via-teal-100/40 to-transparent blur-3xl" />
        <div className="absolute -bottom-24 right-[-10%] h-72 w-72 rounded-full bg-gradient-to-br from-amber-200/55 via-amber-100/35 to-transparent blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-xl space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/60 bg-white/85 text-muted-foreground shadow-[0_10px_20px_rgba(20,184,166,0.15)] transition hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
            aria-label="Back to home"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </Link>
          <h1 className="text-xl font-bold text-foreground">For parents</h1>
        </div>

        {errorParam === "auth" && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Sign-in was cancelled or something went wrong. Try again below.
          </div>
        )}

        {!user ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-[0_18px_45px_rgba(20,184,166,0.15)] backdrop-blur">
              <h2 className="text-lg font-semibold">Sign in or create an account</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Optional. Use the app without signing in anytime.
              </p>

              <form onSubmit={handleEmailAuth} className="mt-5 space-y-4">
                <div>
                  <label
                    htmlFor="parents-email"
                    className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    Email
                  </label>
                  <Input
                    id="parents-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-2"
                    required
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label
                    htmlFor="parents-password"
                    className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    Password
                  </label>
                  <Input
                    id="parents-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-2"
                    required={authMode === "signin"}
                    autoComplete={authMode === "signup" ? "new-password" : "current-password"}
                  />
                </div>
                {authError && (
                  <p className="text-sm text-amber-700">{authError}</p>
                )}
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="submit"
                    disabled={authBusy}
                    className="bg-gradient-to-r from-teal-500 via-teal-400 to-amber-400 text-white hover:opacity-90"
                  >
                    {authMode === "signin" ? "Sign in" : "Create account"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode((m) => (m === "signin" ? "signup" : "signin"));
                      setAuthError(null);
                    }}
                    className="text-sm font-medium text-primary underline underline-offset-2"
                  >
                    {authMode === "signin"
                      ? "Create an account instead"
                      : "Sign in instead"}
                  </button>
                </div>
              </form>

              <div className="mt-6 border-t border-white/60 pt-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Or continue with
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOAuth("google")}
                    className="gap-2"
                  >
                    <LogIn className="h-4 w-4" aria-hidden />
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOAuth("facebook")}
                    className="gap-2"
                  >
                    <LogIn className="h-4 w-4" aria-hidden />
                    Facebook
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Google and Facebook sign-in require configuration in your
                  Supabase project. Email sign-in works out of the box.
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-[0_18px_45px_rgba(20,184,166,0.15)] backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Kid profiles</h2>
                  <p className="text-sm text-muted-foreground">
                    Add profiles for your kids. No passwords—just a name and a buddy.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => setShowAddKid((v) => !v)}
                  className="shrink-0 gap-2"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  Add kid
                </Button>
              </div>

              {showAddKid && (
                <form
                  onSubmit={handleAddKid}
                  className="mt-5 space-y-4 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4"
                >
                  <div>
                    <label
                      htmlFor="new-kid-name"
                      className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      Display name
                    </label>
                    <Input
                      id="new-kid-name"
                      value={newKidName}
                      onChange={(e) => setNewKidName(e.target.value)}
                      placeholder="e.g. Sam"
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Buddy
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {AVATAR_OPTIONS.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => setNewKidAvatar(a.id)}
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full text-lg transition",
                            a.bg,
                            newKidAvatar === a.id
                              ? "ring-2 ring-primary ring-offset-2"
                              : "opacity-70 hover:opacity-100"
                          )}
                          aria-label={a.name}
                          title={a.name}
                        >
                          {a.emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  {authError && (
                    <p className="text-sm text-amber-700">{authError}</p>
                  )}
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={addKidBusy || !newKidName.trim()}
                      className="bg-primary text-primary-foreground"
                    >
                      {addKidBusy ? "Adding…" : "Add"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddKid(false);
                        setNewKidName("");
                        setAuthError(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              <ul className="mt-5 space-y-3">
                {kids.length === 0 && !showAddKid && (
                  <li className="rounded-xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
                    No kid profiles yet. Tap &quot;Add kid&quot; to create one.
                  </li>
                )}
                {kids.map((k) => {
                  const av = AVATAR_OPTIONS.find((a) => a.id === k.avatar_id) ?? AVATAR_OPTIONS[0]!;
                  return (
                    <li
                      key={k.id}
                      className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-sm"
                    >
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full text-xl",
                          av.bg
                        )}
                      >
                        {av.emoji}
                      </div>
                      <span className="font-medium text-foreground">
                        {k.display_name}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-[0_18px_45px_rgba(20,184,166,0.12)] backdrop-blur">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Sparkles className="h-5 w-5 text-primary" aria-hidden />
                Subscription
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Coming later. No payments or upgrades during this test—everything
                is free to use.
              </p>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/70 bg-white/80 p-5 shadow-[0_18px_45px_rgba(255,232,179,0.25)] backdrop-blur">
              <div>
                <h2 className="text-lg font-semibold">Feedback</h2>
                <p className="text-sm text-muted-foreground">
                  We&apos;d love to hear from you—your feedback shapes what we build next.
                </p>
              </div>
              <Link href="/feedback?from=parents" className="shrink-0">
                <Button type="button" variant="outline" className="gap-2">
                  Give feedback
                </Button>
              </Link>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleSignOut}
                className="gap-2 text-muted-foreground"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Sign out
              </Button>
            </div>
          </motion.div>
        )}

        {!user && (
            <div className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-[0_18px_45px_rgba(251,191,36,0.15)] backdrop-blur">
            <h2 className="text-lg font-semibold">Feedback</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              We&apos;d love to hear from you—your feedback shapes what we build next.
            </p>
            <Link href="/feedback?from=parents" className="mt-4 inline-block">
              <Button type="button" variant="outline">
                Give feedback
              </Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
