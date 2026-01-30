/** Prevent static prerender of /play (uses searchParams, Supabase, client-only code). */
export const dynamic = "force-dynamic";

export default function PlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
