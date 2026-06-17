import { CircleHelpIcon } from "lucide-react"

export default function HelpPage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <CircleHelpIcon className="size-5" />
            <h1 className="text-xl font-semibold">Help</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Get help and documentation.
          </p>
        </div>
      </div>
    </div>
  )
}
