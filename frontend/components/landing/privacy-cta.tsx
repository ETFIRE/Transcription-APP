import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShieldCheck, Lock, Trash2, Clock } from 'lucide-react'

const points = [
  { icon: Lock, title: 'Consent first', body: 'Participants are asked to consent before any recording starts.' },
  { icon: Clock, title: 'Defined retention', body: 'Recordings and transcripts follow a configurable retention window.' },
  { icon: Trash2, title: 'Right to erasure', body: 'Any participant can request deletion of their data at any time.' },
]

export function PrivacyCta() {
  return (
    <section id="privacy" className="border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-brand" />
              Privacy & ethics by design
            </span>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              A meeting recording is sensitive. We treat it that way.
            </h2>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              Voices are personal data. Scribe is built around consent, transparency, and control — so
              your team can adopt it with confidence.
            </p>
            <Button size="lg" asChild className="mt-6">
              <Link href="/privacy">Read our privacy approach</Link>
            </Button>
          </div>
          <div className="space-y-4">
            {points.map((p) => (
              <div key={p.title} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <p.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-semibold">{p.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <p className="text-sm text-muted-foreground">Scribe — intelligent meeting assistant.</p>
        <p className="text-sm text-muted-foreground">A pre-production prototype. Frontend demo with sample data.</p>
      </div>
    </footer>
  )
}
