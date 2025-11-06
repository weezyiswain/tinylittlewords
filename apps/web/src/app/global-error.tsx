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
        <div style={{ margin: "4rem auto", maxWidth: 600, textAlign: "center" }}>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Something went wrong</h1>
          <p style={{ marginTop: 8, color: "#666" }}>
            {error?.message ?? "An unexpected error occurred."}
          </p>
          <button
            onClick={() => reset()}
            style={{ marginTop: 16, padding: "10px 16px", borderRadius: 8, border: "1px solid #ddd", background: "white", fontWeight: 600 }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
