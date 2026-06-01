import { AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-2xl border border-border/70 bg-card/70 p-8 text-muted-foreground">
      <Loader2 className="size-5 animate-spin" />
      <span>{label}</span>
    </div>
  )
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <Card className="border-dashed bg-card/70 text-center">
      <CardContent className="p-8">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
      </CardContent>
    </Card>
  )
}

export function ErrorState({ title = "Something went wrong", description, retryLabel = "Try again", onRetry }: { title?: string; description?: string; retryLabel?: string; onRetry?: () => void }) {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardContent className="flex flex-col items-start gap-3 p-6">
        <div className="flex items-center gap-2 font-semibold text-destructive">
          <AlertTriangle className="size-5" />
          {title}
        </div>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        {onRetry ? <Button onClick={onRetry}>{retryLabel}</Button> : null}
      </CardContent>
    </Card>
  )
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-80" />
    </div>
  )
}
