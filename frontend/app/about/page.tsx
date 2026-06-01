import { FloatingWhatsAppButton } from "@/components/common/floating-whatsapp-button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function AboutPage() {
  const values = [
    "Accuracy in every answer",
    "Warm Pakistani hospitality",
    "Customer-first service",
    "Secure data handling",
    "Admin-controlled knowledge",
    "Fast & reliable responses",
  ]

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="border-b border-border/40 px-6 py-20">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">About RoyalBite</p>
            <h1 className="text-5xl font-bold tracking-tight">Premium Pakistani flavor with smart service.</h1>
          </div>
          <p className="text-xl leading-8 text-muted-foreground">
            RoyalBite AI helps customers feel like they are chatting with a friendly restaurant waiter: warm, fast, accurate, and always focused on food quality.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl space-y-12">
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
              <CardContent className="space-y-4 p-8">
                <h3 className="text-2xl font-bold">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To transform how restaurants connect with customers through intelligent, warm, and accurate WhatsApp conversations that feel like talking to a trusted waiter.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="space-y-4 p-8">
                <h3 className="text-2xl font-bold">Our Promise</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Every customer interaction is backed by verified restaurant data, managed by your admin team, ensuring accuracy, reliability, and the premium experience your customers deserve.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Core Values */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Core Values</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {values.map((value) => (
                <div key={value} className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 p-4 hover:bg-card transition-colors">
                  <CheckCircle className="size-5 flex-shrink-0 text-primary" />
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Dashboard */}
          <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
            <CardContent className="space-y-4 p-8">
              <h3 className="text-2xl font-bold">Admin-Controlled Knowledge</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our admin dashboard keeps menu, timings, offers, policies, documents, and order operations updated so customers receive reliable answers. You stay in control of what your AI says.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <FloatingWhatsAppButton />
    </main>
  )
}
