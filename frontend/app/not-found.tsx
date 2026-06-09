import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist at RoyalBite.",
  robots: { index: false },
}

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6" style={{ background: "#0A0A0A" }}>
      <div className="max-w-md text-center space-y-6">
        <div className="text-8xl font-playfair font-bold" style={{ color: "#C9A227" }}>404</div>
        <h1 className="text-3xl font-playfair font-bold" style={{ color: "#F8F5F0" }}>
          Page Not Found
        </h1>
        <p style={{ color: "#A8B0B9" }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block btn-gold px-8 py-3 rounded-xl text-lg font-bold"
          style={{ color: "#0A0A0A" }}
        >
          Back to Home
        </Link>
      </div>
    </main>
  )
}
