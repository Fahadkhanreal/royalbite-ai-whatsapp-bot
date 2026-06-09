import { PageHeader } from "@/components/common/page-header"
import { getRestaurantSettings } from "@/lib/repositories/admin-data"
import { Settings as SettingsIcon, Phone, MapPin, Volume2, KeyRound, Mail } from "lucide-react"
import { ChangePassword } from "./change-password"
import { ChangeEmail } from "./change-email"

export default async function SettingsPage() {
  const settings = await getRestaurantSettings()

  return (
    <div className="space-y-8">
      <PageHeader title="Settings" description="Configure your restaurant profile, bot greeting, and voice settings." />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Restaurant Profile */}
        <div className="rounded-xl p-6" style={{ background: "rgba(20,15,12,0.6)", border: "1px solid rgba(201,162,39,0.12)", boxShadow: "0 4px 24px rgba(0,0,0,0.2)" }}>
          <h3 className="text-lg font-playfair font-bold mb-5 flex items-center gap-2" style={{ color: "#F8F5F0" }}>
            <SettingsIcon className="size-5" style={{ color: "#C9A227" }} />
            Restaurant Profile
          </h3>
          <div className="space-y-4">
            {[
              { id: "name", label: "Restaurant Name", value: settings.restaurantName },
              { id: "phone", label: "Phone Number", icon: Phone, value: settings.phone },
              { id: "address", label: "Address", icon: MapPin, value: settings.address },
            ].map((field) => (
              <div key={field.id} className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-2" style={{ color: "#F8F5F0" }}>
                  {field.icon && <field.icon className="size-4" style={{ color: "#C9A227" }} />}
                  {field.label}
                </label>
                <input defaultValue={field.value} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:border-[#C9A227]"
                  style={{ background: "rgba(10,10,10,0.6)", border: "1px solid rgba(201,162,39,0.2)", color: "#F8F5F0" }} />
              </div>
            ))}
            <button className="w-full py-2.5 rounded-xl text-sm font-playfair font-bold transition-all hover:shadow-[0_0_40px_rgba(201,162,39,0.6)] hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, #C9A227, #A67D1F)", color: "#0A0A0A", boxShadow: "0 0 20px rgba(201,162,39,0.3)" }}>
              Save Changes
            </button>
          </div>
        </div>

        {/* Bot Configuration */}
        <div className="rounded-xl p-6" style={{ background: "rgba(20,15,12,0.6)", border: "1px solid rgba(201,162,39,0.12)", boxShadow: "0 4px 24px rgba(0,0,0,0.2)" }}>
          <h3 className="text-lg font-playfair font-bold mb-5 flex items-center gap-2" style={{ color: "#F8F5F0" }}>
            <SettingsIcon className="size-5" style={{ color: "#C9A227" }} />
            Bot Configuration
          </h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: "#F8F5F0" }}>Bot Tone</label>
              <textarea defaultValue={settings.botTone} rows={3} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{ background: "rgba(10,10,10,0.6)", border: "1px solid rgba(201,162,39,0.2)", color: "#F8F5F0" }} />
            </div>
            <button className="w-full py-2.5 rounded-xl text-sm font-playfair font-bold transition-all hover:shadow-[0_0_40px_rgba(201,162,39,0.6)] hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, #C9A227, #A67D1F)", color: "#0A0A0A", boxShadow: "0 0 20px rgba(201,162,39,0.3)" }}>
              Save Changes
            </button>
          </div>
        </div>

        {/* Voice Settings */}
        <div className="rounded-xl p-6 lg:col-span-2" style={{ background: "rgba(20,15,12,0.6)", border: "1px solid rgba(201,162,39,0.12)", boxShadow: "0 4px 24px rgba(0,0,0,0.2)" }}>
          <h3 className="text-lg font-playfair font-bold mb-5 flex items-center gap-2" style={{ color: "#F8F5F0" }}>
            <Volume2 className="size-5" style={{ color: "#C9A227" }} />
            Voice Settings
          </h3>
          <div className="grid gap-4 md:grid-cols-2 mb-4">
            {[{ id: "voice-lang", label: "Voice Language", value: "en-US" },
              { id: "voice-gender", label: "Voice Gender", value: "Female" }].map((field) => (
              <div key={field.id} className="space-y-1.5">
                <label className="text-sm font-medium" style={{ color: "#F8F5F0" }}>{field.label}</label>
                <input defaultValue={field.value} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{ background: "rgba(10,10,10,0.6)", border: "1px solid rgba(201,162,39,0.2)", color: "#F8F5F0" }} />
              </div>
            ))}
          </div>
          <button className="w-full py-2.5 rounded-xl text-sm font-playfair font-bold transition-all hover:shadow-[0_0_40px_rgba(201,162,39,0.6)] hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, #C9A227, #A67D1F)", color: "#0A0A0A", boxShadow: "0 0 20px rgba(201,162,39,0.3)" }}>
            Save Changes
          </button>
        </div>
      </div>

      {/* Change Email */}
      <ChangeEmail />

      {/* Change Password */}
      <ChangePassword />
    </div>
  )
}
