"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ margin: "4rem auto", maxWidth: 600, textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Oops! Something went wrong</h1>
          <p style={{ color: "#555", marginBottom: 16 }}>
            {error?.message ?? "An unexpected error occurred."}
          </p>
          <button
            onClick={() => reset()}
            style={{ padding: "10px 18px", borderRadius: 8, border: "1px solid #ccc", background: "#fff", fontWeight: 600, cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
