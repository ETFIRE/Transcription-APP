import { CalendarClock, CheckSquare, Clock, Gavel } from "lucide-react"
import { Card } from "@/components/ui/card"
import { totals } from "@/lib/stats"
import type { Meeting } from "@/lib/types"

export function StatTiles({ meetings }: { meetings: Meeting[] }) {
  const t = totals(meetings)
  const tiles = [
    { label: "Meetings captured", value: t.meetings, icon: CalendarClock },
    { label: "Hours transcribed", value: `${t.hours}h`, icon: Clock },
    { label: "Open actions", value: t.openActions, icon: CheckSquare },
    { label: "Decisions logged", value: t.decisions, icon: Gavel },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {tiles.map((tile) => (
        <Card key={tile.label} className="flex flex-col gap-3 p-5">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            <tile.icon className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="text-2xl font-semibold tabular-nums text-foreground">{tile.value}</div>
            <div className="text-xs text-muted-foreground">{tile.label}</div>
          </div>
        </Card>
      ))}
    </div>
  )
}
