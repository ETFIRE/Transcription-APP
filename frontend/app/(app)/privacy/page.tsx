import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ShieldCheck, Lock, Clock, Trash2, FileWarning, Users } from 'lucide-react'

const principles = [
  {
    icon: Lock,
    title: 'Consent before capture',
    body: 'Every capture starts with an explicit consent step. Participants are informed that the meeting is recorded and transcribed, and a visible indicator is shown throughout.',
  },
  {
    icon: Clock,
    title: 'Retention windows',
    body: 'Raw recordings follow a configurable retention period (default 30 days), after which only the structured report is kept unless you choose otherwise.',
  },
  {
    icon: Trash2,
    title: 'Right to erasure',
    body: 'Any participant can request deletion of their voice data and transcript segments at any time, and the request is honored across the meeting record.',
  },
  {
    icon: Users,
    title: 'Biometric awareness',
    body: 'Voices can be considered biometric personal data. Diarization and identification are treated as sensitive processing with least-privilege access.',
  },
  {
    icon: FileWarning,
    title: 'Sub-processor DPAs',
    body: 'Transcription and LLM providers act as sub-processors. Each is covered by a data processing agreement, and audio can be scoped to minimize what leaves the platform.',
  },
  {
    icon: ShieldCheck,
    title: 'Anonymization',
    body: 'Transcripts can be anonymized — replacing named speakers with generic labels — for sharing or longer-term analytics.',
  },
]

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-10">
      <PageHeader
        title="Privacy & ethics"
        description="How Scribe handles sensitive meeting data — mapped to the project's GDPR analysis."
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {principles.map((p) => (
          <Card key={p.title}>
            <CardHeader>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <p.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-base font-semibold">{p.title}</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-border bg-muted p-4 text-sm text-muted-foreground">
        This is a pre-production prototype. It uses sample data and does not persist real recordings.
        Consent, retention, and erasure are represented in the interface to validate the intended flow.
      </div>
    </div>
  )
}
