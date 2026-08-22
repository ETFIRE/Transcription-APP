import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mic, Video, ArrowRight } from 'lucide-react'

const modes = [
  {
    icon: Video,
    title: 'Remote — Video conference',
    body: 'Scribe hosts the call so it can pull the audio straight from the source. When available, it separates a track per participant, so “who said what” comes almost for free.',
    points: ['Integrated conference room', 'Per-participant audio tracks', 'No plugins to install'],
  },
  {
    icon: Mic,
    title: 'In person — Dictaphone',
    body: 'Meeting in a room? Scribe becomes a smart recorder using your device microphone, handling long sessions and interruptions, then diarizes speakers after the fact.',
    points: ['Uses the device microphone', 'Robust for long meetings', 'Post-hoc speaker diarization'],
  },
]

export function ModesSection() {
  return (
    <section id="modes" className="border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Two ways to capture, one pipeline
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Remote or in the room, both modes feed the exact same processing chain — transcription,
            diarization, classification, and reporting.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {modes.map((mode) => (
            <Card key={mode.title} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <mode.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-xl font-semibold">{mode.title}</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="leading-relaxed text-muted-foreground">{mode.body}</p>
                <ul className="space-y-2">
                  {mode.points.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                      {p}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Button size="lg" asChild className="gap-2">
            <Link href="/capture">
              Choose a capture mode
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
