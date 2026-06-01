import { FileText, ImageIcon } from "lucide-react"

interface FilePreviewProps {
  name?: string
  type?: string
  url?: string
}

export function FilePreview({ name = "No file selected", type, url }: FilePreviewProps) {
  const isImage = !!type?.startsWith("image/") || !!url

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/70 p-4">
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {isImage ? <ImageIcon className="size-5" /> : <FileText className="size-5" />}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{name}</p>
        {type ? <p className="text-xs text-muted-foreground">{type}</p> : null}
      </div>
    </div>
  )
}

export function isSupportedUploadType(type: string) {
  return ["application/pdf", "text/plain", "text/markdown", "image/png", "image/jpeg", "image/webp"].includes(type)
}
