import Link from "next/link"
import { ArrowUpRight, CheckSquare, Clock, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import { ModeBadge, ThemeBadge, ToneBadge } from "@/components/scribe-badges"
import { formatDate, formatDuration } from "@/lib/mock-data"
import { actionStatusCounts } from "@/lib/stats"
import type { Meeting } from "@/lib/types"

export function MeetingCard({ meeting }: { meeting: Meeting }) {
  const actions = actionStatusCounts([meeting])
  const openCount = actions.open + actions.inProgress

  return (
    <Link href={`/meetings/${meeting.id}`} className="group block">
      <Card className="h-full p-5 transition-colors hover:border-primary/40 hover:bg-accent/40">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">{formatDate(meeting.date)}</span>
            <h3 className="text-pretty font-medium leading-tight text-foreground">{meeting.title}</h3>
          </div>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{meeting.summary}</p>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <ToneBadge tone={meeting.tone} />
          {meeting.themes.slice(0, 2).map((t) => (
            <ThemeBadge key={t} theme={t} />
          ))}
          <ModeBadge mode={meeting.mode} />
        </div>

        <div className="mt-4 flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {formatDuration(meeting.durationMinutes)}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {meeting.participants.length}
          </span>
          <span className="flex items-center gap-1.5">
            <CheckSquare className="h-3.5 w-3.5" />
            {openCount} open
          </span>
        </div>
      </Card>
    </Link>
  )
}
