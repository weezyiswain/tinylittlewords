"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { APP_VERSION } from "@/lib/app-version";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const PRICING_OPTIONS = [
  {
    value: "subscription",
    label: "Subscription",
    description:
      "About $3–4/month or $30–40/year for the whole family. Free: 3-letter words and some daily puzzles. Premium: 4–5 letter words, word packs, and progress tracking per kid.",
  },
  {
    value: "one_time",
    label: "One-time purchase",
    description: "About $20 to unlock everything.",
  },
  { value: "not_sure", label: "Not sure / I'd need to think about it", description: "" },
  { value: "wouldnt_pay", label: "I wouldn't pay for this", description: "" },
] as const;

const FEATURE_KEYS = [
  { id: "4-5-letter-words", label: "4–5 letter words" },
  { id: "word-packs", label: "Word packs / topics" },
  { id: "progress-per-kid", label: "Progress tracking per kid" },
  { id: "unlimited-daily", label: "Unlimited daily puzzles" },
  { id: "other", label: "Other (tell us in “Anything else” below)" },
] as const;

export default function FeedbackPage() {
  const [source, setSource] = useState<string>("app");
  const [whatWorked, setWhatWorked] = useState("");
  const [whatImprove, setWhatImprove] = useState("");
  const [anythingElse, setAnythingElse] = useState("");
  const [pricingPreference, setPricingPreference] = useState<string>("");
  const [featuresValued, setFeaturesValued] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search).get("from") ?? "app";
    setSource(p);
  }, []);

  useEffect(() => {
    if (!supabase || source !== "parents") return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setParentId(session?.user?.id ?? null);
    });
  }, [source]);

  const hasContent =
    whatWorked.trim().length > 0 ||
    whatImprove.trim().length > 0 ||
    anythingElse.trim().length > 0;

  const toggleFeature = useCallback((id: string) => {
    setFeaturesValued((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      if (!hasContent) {
        setError("Please add at least a little feedback in one of the boxes below.");
        return;
      }
      if (!supabase) {
        setError("Feedback isn't available right now. Please try again later.");
        return;
      }
      setSubmitting(true);
      try {
        const { error: err } = await supabase.from("feedback").insert({
          who: null,
          what_worked: whatWorked.trim() || null,
          what_improve: whatImprove.trim() || null,
          anything_else: anythingElse.trim() || null,
          email: email.trim() || null,
          pricing_preference: pricingPreference || null,
          features_valued: featuresValued.length > 0 ? featuresValued : null,
          source: source || "app",
          parent_id: parentId || null,
          app_version: APP_VERSION,
        });
        if (err) throw err;
        setSubmitted(true);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Something went wrong. Please try again.";
        setError(msg);
      } finally {
        setSubmitting(false);
      }
    },
    [
      whatWorked,
      whatImprove,
      anythingElse,
      email,
      pricingPreference,
      featuresValued,
      source,
      parentId,
      hasContent,
    ]
  );

  const backHref = "/parents";
  const backLabel = "Back to Parents";

  return (
    <main
      className="relative flex min-h-dvh flex-col overflow-y-auto px-4 py-8 pt-[calc(env(safe-area-inset-top,0)+2rem)] sm:px-10 sm:py-12"
      style={{ paddingBottom: "1.5rem" }}
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-[-12%] h-64 w-64 rounded-full bg-gradient-to-br from-teal-200/60 via-teal-100/40 to-transparent blur-3xl sm:h-72 sm:w-72" />
        <div className="absolute -bottom-24 right-[-10%] h-72 w-72 rounded-full bg-gradient-to-br from-amber-200/55 via-amber-100/35 to-transparent blur-3xl sm:h-80 sm:w-80" />
        <div className="absolute bottom-1/3 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-gradient-to-br from-sky-200/40 via-sky-100/25 to-transparent blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-xl space-y-6">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
          aria-label={backLabel}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Back
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="rounded-2xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(20,184,166,0.15)] backdrop-blur sm:p-8"
        >
          {submitted ? (
            <div className="space-y-4 text-center">
              <h1 className="text-xl font-bold sm:text-2xl">Thanks for your feedback!</h1>
              <p className="text-muted-foreground">
                We really appreciate it. Your input helps us make Tiny Little Words better
                for everyone.
              </p>
              <Link href={backHref}>
                <Button
                  type="button"
                  variant="default"
                  className="mt-4 gap-2 bg-gradient-to-r from-teal-500 via-teal-400 to-amber-400 text-white hover:opacity-90"
                >
                  Back to Parents
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-bold sm:text-2xl">Give feedback</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  We&apos;re in a parent-feedback phase. Your input helps us improve Tiny
                  Little Words and decide what to offer next.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  This form is for parents and guardians.
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  You can skip any question, but we&apos;d love to hear at least a little
                  about what worked or what could be better.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    We&apos;re considering two ways to support Tiny Little Words. Which
                    sounds closer to what you&apos;d prefer?
                  </label>
                  <div className="mt-3 space-y-3" role="radiogroup" aria-label="Pricing preference">
                    {PRICING_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        className={cn(
                          "flex cursor-pointer gap-3 rounded-lg border border-input bg-background px-3 py-2.5 transition hover:border-primary/40 focus-within:ring-2 focus-within:ring-primary/60 focus-within:ring-offset-2 focus-within:ring-offset-background",
                          pricingPreference === opt.value && "border-primary/50 bg-primary/5"
                        )}
                      >
                        <input
                          type="radio"
                          name="pricing"
                          value={opt.value}
                          checked={pricingPreference === opt.value}
                          onChange={() => setPricingPreference(opt.value)}
                          className="mt-1 h-4 w-4 shrink-0 border-input text-primary focus:ring-primary/60"
                        />
                        <div className="min-w-0">
                          <span className="text-sm font-medium text-foreground">
                            {opt.label}
                          </span>
                          {opt.description && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {opt.description}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Which premium features would you value most?{" "}
                    <span className="text-muted-foreground">(Select any that apply.)</span>
                  </label>
                  <div className="mt-3 space-y-2" role="group" aria-label="Features valued">
                    {FEATURE_KEYS.map((f) => (
                      <label
                        key={f.id}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border border-input bg-background px-3 py-2.5 transition hover:border-primary/40 focus-within:ring-2 focus-within:ring-primary/60 focus-within:ring-offset-2 focus-within:ring-offset-background"
                      >
                        <input
                          type="checkbox"
                          checked={featuresValued.includes(f.id)}
                          onChange={() => toggleFeature(f.id)}
                          className="h-4 w-4 shrink-0 rounded border-input text-primary focus:ring-primary/60"
                        />
                        <span className="text-sm text-foreground">{f.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="feedback-what-worked"
                    className="block text-sm font-medium text-foreground"
                  >
                    What worked well?
                  </label>
                  <Textarea
                    id="feedback-what-worked"
                    value={whatWorked}
                    onChange={(e) => setWhatWorked(e.target.value)}
                    placeholder="e.g. My kid loved the 3-letter words, the avatar kept them engaged…"
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label
                    htmlFor="feedback-what-improve"
                    className="block text-sm font-medium text-foreground"
                  >
                    What could be better?
                  </label>
                  <Textarea
                    id="feedback-what-improve"
                    value={whatImprove}
                    onChange={(e) => setWhatImprove(e.target.value)}
                    placeholder="e.g. Hard to tap on mobile, would love more topics…"
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label
                    htmlFor="feedback-anything-else"
                    className="block text-sm font-medium text-foreground"
                  >
                    Anything else you&apos;d like to share?
                  </label>
                  <Textarea
                    id="feedback-anything-else"
                    value={anythingElse}
                    onChange={(e) => setAnythingElse(e.target.value)}
                    placeholder="Open-ended — ideas, bugs, feature requests…"
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label
                    htmlFor="feedback-email"
                    className="block text-sm font-medium text-foreground"
                  >
                    Email{" "}
                    <span className="text-muted-foreground">
                      (optional, if you&apos;d like a reply)
                    </span>
                  </label>
                  <Input
                    id="feedback-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-2"
                  />
                </div>

                {error && (
                  <p className="text-sm text-amber-700" role="alert">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-teal-500 via-teal-400 to-amber-400 text-white hover:opacity-90"
                >
                  {submitting ? "Sending…" : "Send feedback"}
                </Button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </main>
  );
}
