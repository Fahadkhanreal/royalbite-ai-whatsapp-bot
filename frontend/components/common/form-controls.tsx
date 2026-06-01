import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  description?: string
}

export function TextField({ label, error, description, id, ...props }: FieldProps) {
  const fieldId = id ?? props.name

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId}>{label}</Label>
      <Input id={fieldId} aria-invalid={!!error} {...props} />
      {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}

export function SubmitButton({ pending, children }: { pending?: boolean; children: ReactNode }) {
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Please wait..." : children}
    </Button>
  )
}
