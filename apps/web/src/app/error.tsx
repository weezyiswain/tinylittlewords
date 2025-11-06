"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ margin: "4rem auto", maxWidth: 600, textAlign: "center" }}>
      <h2>Something went wrong</h2>
      <p style={{ color: "#666" }}>{error?.message}</p>
      <button onClick={() => reset()} style={{ marginTop: 12, padding: "8px 14px", border: "1px solid #ccc", borderRadius: 8 }}>
        Try again
      </button>
    </div>
  );
}
