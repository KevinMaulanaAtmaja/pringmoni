"use client";

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          color: "#111827",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 420,
            margin: 16,
            padding: 24,
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            textAlign: "center",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18 }}>Koneksi Terputus</h2>
          <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.6 }}>
            Tidak dapat memuat halaman. Periksa koneksi internet Anda lalu coba lagi.
          </p>
          <button
            type="button"
            onClick={() => unstable_retry()}
            style={{
              marginTop: 8,
              padding: "10px 18px",
              border: 0,
              borderRadius: 8,
              background: "#15803d",
              color: "#ffffff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Coba Lagi
          </button>
        </div>
      </body>
    </html>
  );
}
