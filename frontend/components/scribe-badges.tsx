import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ActionStatus, CaptureMode, Priority, Tone } from '@/lib/types'
import { Mic, Video } from 'lucide-react'

const toneStyles: Record<Tone, string> = {
  Positive: 'bg-chart-2/12 text-chart-2 border-chart-2/25',
  Neutral: 'bg-muted text-muted-foreground border-border',
  Tense: 'bg-destructive/12 text-destructive border-destructive/25',
  Focused: 'bg-chart-1/12 text-chart-1 border-chart-1/25',
  Decisive: 'bg-chart-3/15 text-chart-3 border-chart-3/30',
}

export function ToneBadge({ tone, className }: { tone: Tone; className?: string }) {
  return (
    <Badge variant="outline" className={cn('font-medium', toneStyles[tone], className)}>
      {tone}
    </Badge>
  )
}

export function ThemeBadge({ theme, className }: { theme: string; className?: string }) {
  return (
    <Badge variant="secondary" className={cn('font-medium text-secondary-foreground', className)}>
      {theme}
    </Badge>
  )
}

const actionStatusStyles: Record<ActionStatus, string> = {
  open: 'bg-muted text-muted-foreground border-border',
  'in-progress': 'bg-chart-1/12 text-chart-1 border-chart-1/25',
  done: 'bg-chart-2/12 text-chart-2 border-chart-2/25',
}

const actionStatusLabels: Record<ActionStatus, string> = {
  open: 'Open',
  'in-progress': 'In progress',
  done: 'Done',
}

export function ActionStatusBadge({ status, className }: { status: ActionStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn('font-medium', actionStatusStyles[status], className)}>
      {actionStatusLabels[status]}
    </Badge>
  )
}

const priorityStyles: Record<Priority, string> = {
  high: 'bg-destructive/12 text-destructive border-destructive/25',
  medium: 'bg-chart-3/15 text-chart-3 border-chart-3/30',
  low: 'bg-muted text-muted-foreground border-border',
}

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <Badge variant="outline" className={cn('font-medium capitalize', priorityStyles[priority], className)}>
      {priority}
    </Badge>
  )
}

export function ModeBadge({ mode, className }: { mode: CaptureMode; className?: string }) {
  const Icon = mode === 'video' ? Video : Mic
  return (
    <Badge variant="outline" className={cn('gap-1.5 font-medium', className)}>
      <Icon className="h-3 w-3" />
      {mode === 'video' ? 'Video conference' : 'Dictaphone'}
    </Badge>
  )
}
