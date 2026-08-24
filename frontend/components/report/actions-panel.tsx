import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ActionStatusBadge, PriorityBadge } from '@/components/scribe-badges'
import { CheckCircle2, Circle, Clock, CalendarDays } from 'lucide-react'
import { formatDate } from '@/lib/mock-data'
import type { Meeting } from '@/lib/types'

export function DecisionsCard({ meeting }: { meeting: Meeting }) {
  // Sécurisation : on garantit un tableau même si meeting.decisions est undefined
  const decisions = meeting?.decisions || []

  return (
    <Card>
      <CardHeader>
        <h3 className="text-base font-semibold">Decisions</h3>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {decisions.map((d: any, i: number) => (
            <li key={d?.id || i} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-chart-2" />
              <span className="text-sm leading-relaxed">{d?.text || d}</span>
            </li>
          ))}
          {decisions.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucune décision enregistrée.</p>
          )}
        </ul>
      </CardContent>
    </Card>
  )
}

const statusIcon: Record<string, any> = {
  open: Circle,
  'in-progress': Clock,
  done: CheckCircle2,
}

export function ActionsCard({ meeting }: { meeting: Meeting }) {
  // Sécurisation
  const actions = meeting?.actions || []
  const participants = meeting?.participants || []

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Action items</h3>
          <span className="text-xs text-muted-foreground">
            {actions.filter((a: any) => a?.status !== 'done').length} open
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {actions.map((a: any, i: number) => {
            const owner = participants.find((p: any) => p.id === a.ownerId)
            const Icon = statusIcon[a.status] || Circle
            return (
              <li key={a.id || i} className="rounded-xl border border-border p-3">
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
                      {a.title || a.text || 'Action non spécifiée'}
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
                      {a.due && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <CalendarDays className="h-3 w-3" />
                          {formatDate(a.due)}
                        </span>
                      )}
                      {a.priority && <PriorityBadge priority={a.priority} className="text-[10px]" />}
                      {a.status && <ActionStatusBadge status={a.status} className="text-[10px]" />}
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
          {actions.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucune action à afficher.</p>
          )}
        </ul>
      </CardContent>
    </Card>
  )
}