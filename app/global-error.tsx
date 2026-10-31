"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: 40, background: "#0B1725", color: "#F2F7F9" }}>
        <h1 style={{ fontSize: 28 }}>The application failed to render.</h1>
        <p style={{ maxWidth: 560, color: "#A7B9C9" }}>
          This is a top-level failure, not a missing page. Retrying is safe; no tool state is stored server-side.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{ marginTop: 16, padding: "10px 16px", border: "2px solid #2DD4BF", color: "#2DD4BF", background: "transparent" }}
        >
          Retry
        </button>
      </body>
    </html>
  );
}
