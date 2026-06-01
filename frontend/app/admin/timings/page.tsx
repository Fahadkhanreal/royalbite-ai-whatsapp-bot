import { PageHeader } from "@/components/common/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getBusinessTimings } from "@/lib/repositories/admin-data"

export default async function TimingsPage() {
  const timings = await getBusinessTimings()

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  return (
    <div className="space-y-8">
      <PageHeader
        title="Business Timings"
        description="Set your restaurant's opening and closing times for each day."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {daysOfWeek.map((day, index) => {
          const timing = timings.find((t) => t.dayOfWeek === index)
          return (
            <Card key={day} className="border-white/10 bg-card/80">
              <CardHeader>
                <CardTitle className="text-base">{day}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {timing?.isOpen ? (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Opens</p>
                      <p className="font-medium">{timing.opensAt}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Closes</p>
                      <p className="font-medium">{timing.closesAt}</p>
                    </div>
                    {timing.notes && (
                      <div>
                        <p className="text-sm text-muted-foreground">Notes</p>
                        <p className="text-sm">{timing.notes}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Closed</p>
                )}
                <Button variant="outline" size="sm" className="w-full">
                  Edit
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
