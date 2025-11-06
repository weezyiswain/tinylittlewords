function ErrorPage({ statusCode }: { statusCode?: number }) {
  return (
    <div
      style={{
        margin: "4rem auto",
        maxWidth: 600,
        textAlign: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
        {statusCode ? `Error ${statusCode}` : "An error occurred"}
      </h1>
      <p style={{ color: "#555" }}>
        Sorry about that. Please try again or head back to the homepage.
      </p>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }: { res?: { statusCode?: number }; err?: { statusCode?: number } }) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 500;
  return { statusCode };
};

export default ErrorPage;
