import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ToneBadge, ThemeBadge, ModeBadge } from '@/components/scribe-badges'
import { ArrowLeft, CalendarDays, Clock, Download, Share2, FileText } from 'lucide-react'
import { formatDateTime, formatDuration } from '@/lib/mock-data'
import type { Meeting } from '@/lib/types'

export function ReportHeader({ meeting }: { meeting: Meeting }) {
  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="gap-1.5">
        <Link href="/history">
          <ArrowLeft className="h-4 w-4" />
          All meetings
        </Link>
      </Button>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <ModeBadge mode={meeting.mode} />
            <ToneBadge tone={meeting.tone} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{meeting.title}</h1>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {formatDateTime(meeting.date)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {formatDuration(meeting.durationMinutes)}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {meeting.themes.map((t) => (
              <ThemeBadge key={t} theme={t} />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-brand" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Summary</h2>
          </div>
          <p className="mt-3 text-pretty leading-relaxed">{meeting.summary}</p>
        </CardContent>
      </Card>
    </div>
  )
}
