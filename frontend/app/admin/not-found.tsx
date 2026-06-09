"use client"

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6" style={{ background: "#0A0A0A" }}>
      <div className="max-w-md text-center space-y-6">
        <div className="text-8xl font-playfair font-bold" style={{ color: "#C9A227" }}>404</div>
        <h1 className="text-3xl font-playfair font-bold" style={{ color: "#F8F5F0" }}>
          Page Not Found
        </h1>
        <p style={{ color: "#A8B0B9" }}>
          This admin page does not exist.
        </p>
        <a
          href="/admin/dashboard"
          className="inline-block btn-gold px-8 py-3 rounded-xl text-lg font-bold"
          style={{ color: "#0A0A0A" }}
        >
          Back to Dashboard
        </a>
      </div>
    </main>
  )
}
