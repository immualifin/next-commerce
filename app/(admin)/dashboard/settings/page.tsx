import { Settings2Icon } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <Settings2Icon className="size-5" />
            <h1 className="text-xl font-semibold">Settings</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage application settings and preferences.
          </p>
        </div>
      </div>
    </div>
  )
}
