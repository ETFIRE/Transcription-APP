import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ActionStatusBadge, PriorityBadge } from '@/components/scribe-badges'
import { CheckCircle2, Circle, Clock, CalendarDays } from 'lucide-react'
import { formatDate } from '@/lib/mock-data'
import type { Meeting } from '@/lib/types'

export function DecisionsCard({ meeting }: { meeting: Meeting }) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-base font-semibold">Decisions</h3>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {meeting.decisions.map((d) => (
            <li key={d.id} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-chart-2" />
              <span className="text-sm leading-relaxed">{d.text}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

const statusIcon = {
  open: Circle,
  'in-progress': Clock,
  done: CheckCircle2,
}

export function ActionsCard({ meeting }: { meeting: Meeting }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Action items</h3>
          <span className="text-xs text-muted-foreground">
            {meeting.actions.filter((a) => a.status !== 'done').length} open
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {meeting.actions.map((a) => {
            const owner = meeting.participants.find((p) => p.id === a.ownerId)
            const Icon = statusIcon[a.status]
            return (
              <li key={a.id} className="rounded-xl border border-border p-3">
                <div className="flex items-start gap-2.5">
                  <Icon
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      a.status === 'done'
                        ? 'text-chart-2'
                        : a.status === 'in-progress'
                          ? 'text-chart-1'
                          : 'text-muted-foreground'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${a.status === 'done' ? 'text-muted-foreground line-through' : ''}`}>
                      {a.title}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="bg-secondary text-[9px] text-secondary-foreground">
                            {owner?.initials ?? '?'}
                          </AvatarFallback>
                        </Avatar>
                        {owner?.name ?? 'Unassigned'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(a.due)}
                      </span>
                      <PriorityBadge priority={a.priority} className="text-[10px]" />
                      <ActionStatusBadge status={a.status} className="text-[10px]" />
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
