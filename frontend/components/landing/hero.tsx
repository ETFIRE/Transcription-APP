import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight, Mic, Video, Sparkles, CheckCircle2 } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
        <div className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            Meeting intelligence, end to end
          </span>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Every meeting, captured, understood, and actioned.
          </h1>
          <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
            Scribe records your meetings — remote or in the room — then transcribes them, attributes who
            said what, detects the tone and themes, and hands you a structured report with a ready-to-track
            action list.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild className="gap-2">
              <Link href="/capture">
                Start a capture
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/dashboard">View a sample report</Link>
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-chart-2" /> Consent-first recording
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-chart-2" /> Speaker diarization
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-chart-2" /> GDPR aware
            </span>
          </div>
        </div>

        <HeroPreview />
      </div>
    </section>
  )
}

function HeroPreview() {
  return (
    <div className="relative">
      <Card className="gap-0 overflow-hidden p-0 shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 items-center justify-center">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-destructive" />
            </span>
            <span className="text-sm font-medium">Q3 Product Roadmap Review</span>
          </div>
          <span className="font-mono text-xs text-muted-foreground">00:48:12</span>
        </div>
        <div className="grid gap-0 sm:grid-cols-5">
          <div className="space-y-3 border-border p-5 sm:col-span-3 sm:border-r">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Live transcript</p>
            {[
              { who: 'AC', name: 'Amelia', text: "Let's lock the Q3 priorities today.", accent: true },
              { who: 'MR', name: 'Marcus', text: 'Collaborative editing is doable but eats most of our capacity.' },
              { who: 'SN', name: 'Sofia', text: 'Design is ready — prototypes tested well.' },
            ].map((line) => (
              <div key={line.who} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold text-secondary-foreground">
                  {line.who}
                </span>
                <p className="text-sm leading-relaxed">
                  <span className="font-medium">{line.name}: </span>
                  <span className="text-muted-foreground">{line.text}</span>
                </p>
              </div>
            ))}
          </div>
          <div className="space-y-4 bg-secondary/40 p-5 sm:col-span-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tone</p>
              <p className="mt-1 text-sm font-medium">Decisive</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Themes</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {['Product', 'Roadmap', 'Eng'].map((t) => (
                  <span key={t} className="rounded-md bg-card px-2 py-0.5 text-xs font-medium">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Actions</p>
              <div className="mt-1.5 space-y-1.5">
                <p className="flex items-start gap-1.5 text-xs">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-chart-1" />
                  Draft contractor spec — Marcus
                </p>
                <p className="flex items-start gap-1.5 text-xs">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  Finalize designs — Sofia
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="pointer-events-none absolute -left-4 -top-4 hidden rounded-xl border border-border bg-card px-3 py-2 shadow-lg sm:flex sm:items-center sm:gap-2">
        <Video className="h-4 w-4 text-brand" />
        <span className="text-xs font-medium">Video mode</span>
      </div>
      <div className="pointer-events-none absolute -bottom-4 -right-4 hidden rounded-xl border border-border bg-card px-3 py-2 shadow-lg sm:flex sm:items-center sm:gap-2">
        <Mic className="h-4 w-4 text-brand" />
        <span className="text-xs font-medium">Dictaphone mode</span>
      </div>
    </div>
  )
}
