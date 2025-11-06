import Link from "next/link";
import type { NextPageContext } from "next";

type ErrorProps = {
  statusCode?: number;
};

function ErrorPage({ statusCode }: ErrorProps) {
  const message = statusCode
    ? `An unexpected error (${statusCode}) occurred.`
    : "An unexpected error occurred.";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: 'system-ui, "Segoe UI", Helvetica, Arial, sans-serif',
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>Oops!</h1>
      <p style={{ fontSize: "1rem", maxWidth: "32rem", lineHeight: 1.6 }}>{message}</p>
      <Link
        href="/"
        style={{
          marginTop: "1.5rem",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0.6rem 1.5rem",
          borderRadius: "999px",
          background:
            "linear-gradient(135deg, #ff87cf 0%, #ffb973 50%, #6bdff9 100%)",
          color: "white",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Back to home
      </Link>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 500;
  return { statusCode };
};

export default ErrorPage;
