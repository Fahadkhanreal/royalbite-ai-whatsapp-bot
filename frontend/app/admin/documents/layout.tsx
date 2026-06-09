import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Documents",
  description: "Upload and manage RAG documents for RoyalBite AI — PDFs, text files, and knowledge sources for the chatbot.",
}

export default function AdminDocumentsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
