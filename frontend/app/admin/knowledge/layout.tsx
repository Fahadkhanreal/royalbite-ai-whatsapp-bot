import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Knowledge Base",
  description: "Manage RoyalBite AI knowledge base — add offers, policies, and FAQs that the chatbot uses to answer customer questions.",
}

export default function AdminKnowledgeLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
