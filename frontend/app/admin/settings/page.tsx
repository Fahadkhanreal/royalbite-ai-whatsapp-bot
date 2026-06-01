import { PageHeader } from "@/components/common/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getRestaurantSettings } from "@/lib/repositories/admin-data"
import { Settings as SettingsIcon, Phone, MapPin, Volume2 } from "lucide-react"

export default async function SettingsPage() {
  const settings = await getRestaurantSettings()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Configure your restaurant profile, bot greeting, and voice settings."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Restaurant Profile */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="size-5 text-primary" />
              Restaurant Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Restaurant Name</Label>
              <Input id="name" defaultValue={settings.restaurantName} className="border-border/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                <Phone className="size-4" />
                Phone Number
              </Label>
              <Input id="phone" defaultValue={settings.phoneNumber} className="border-border/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="size-4" />
                Address
              </Label>
              <Input id="address" defaultValue={settings.address} className="border-border/50" />
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90">Save Changes</Button>
          </CardContent>
        </Card>

        {/* Bot Configuration */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="size-5 text-primary" />
              Bot Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="greeting" className="text-sm font-medium">Bot Greeting</Label>
              <Input id="greeting" defaultValue={settings.botGreeting} className="border-border/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language" className="text-sm font-medium">Language</Label>
              <Input id="language" defaultValue={settings.language} className="border-border/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-sm font-medium">Timezone</Label>
              <Input id="timezone" defaultValue={settings.timezone} className="border-border/50" />
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90">Save Changes</Button>
          </CardContent>
        </Card>

        {/* Voice Settings */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="size-5 text-primary" />
              Voice Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="voice-lang" className="text-sm font-medium">Voice Language</Label>
                <Input id="voice-lang" defaultValue={settings.voiceLanguage} className="border-border/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="voice-gender" className="text-sm font-medium">Voice Gender</Label>
                <Input id="voice-gender" defaultValue={settings.voiceGender} className="border-border/50" />
              </div>
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90">Save Changes</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
