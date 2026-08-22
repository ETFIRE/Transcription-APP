'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Video,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  ArrowLeft,
  ArrowRight,
  Users,
  Info,
} from 'lucide-react'

const participants = [
  { name: 'Amelia Chen', initials: 'AC', speaking: true, muted: false },
  { name: 'Marcus Reyes', initials: 'MR', speaking: false, muted: false },
  { name: 'Sofia Novak', initials: 'SN', speaking: false, muted: true },
  { name: 'Tom Fisher', initials: 'TF', speaking: false, muted: false },
]

const flow = [
  'Join integrated room',
  'Consent captured',
  'Per-participant audio tracks',
  'Transcribe + diarize',
  'Structured report',
]

export function VisioWireframe({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="mx-auto max-w-3xl">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 gap-1.5">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="mb-4 flex items-start gap-2 rounded-lg border border-border bg-muted p-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Wireframe preview. The live video room is a production feature (self-hosted SDK such as LiveKit or
        Jitsi). This mockup shows the flow and where the audio is captured per participant.
      </div>

      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <Video className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-base font-semibold leading-tight">{title}</h2>
                <p className="text-xs text-muted-foreground">Video conference mode</p>
              </div>
            </div>
            <Badge variant="outline" className="gap-1.5">
              <Users className="h-3 w-3" />
              {participants.length} joined
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 p-4">
          {/* Video grid */}
          <div className="grid grid-cols-2 gap-3">
            {participants.map((p) => (
              <div
                key={p.name}
                className={`relative flex aspect-video items-center justify-center rounded-xl border bg-secondary/60 ${
                  p.speaking ? 'border-brand ring-2 ring-brand/30' : 'border-border'
                }`}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-card text-sm font-semibold shadow-sm">
                  {p.initials}
                </span>
                <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-background/80 px-2 py-0.5 text-xs font-medium backdrop-blur">
                  {p.muted ? <MicOff className="h-3 w-3 text-muted-foreground" /> : <Mic className="h-3 w-3 text-chart-2" />}
                  {p.name.split(' ')[0]}
                </span>
                {p.speaking && (
                  <span className="absolute right-2 top-2 rounded-md bg-brand px-1.5 py-0.5 text-[10px] font-medium text-brand-foreground">
                    Track 1 · live
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Recording indicator */}
          <div className="flex items-center justify-between rounded-xl bg-secondary/40 px-4 py-2.5">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-destructive">
              <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
              Recording · separate track per participant
            </span>
            <span className="font-mono text-xs text-muted-foreground">00:12:40</span>
          </div>

          {/* Call controls (wireframe) */}
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" size="icon" aria-label="Mute">
              <Mic className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" aria-label="Camera">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" aria-label="Share screen">
              <MonitorUp className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="icon" aria-label="Leave">
              <PhoneOff className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Flow diagram */}
      <div className="mt-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Processing flow
        </p>
        <ol className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {flow.map((step, i) => (
            <li key={step} className="flex items-center gap-2">
              <span className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px]">
                  {i + 1}
                </span>
                {step}
              </span>
              {i < flow.length - 1 && <ArrowRight className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />}
            </li>
          ))}
        </ol>
      </div>

      <Button asChild size="lg" className="mt-6 w-full gap-2">
        <Link href="/meetings/mtg-001">
          View sample video report
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  )
}
