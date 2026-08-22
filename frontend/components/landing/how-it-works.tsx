import { FileText, ListChecks, Tags, Users } from 'lucide-react'

const steps = [
  {
    icon: Users,
    title: 'Capture & attribute',
    body: 'Record the meeting and automatically attribute each passage to the right speaker.',
  },
  {
    icon: FileText,
    title: 'Transcribe',
    body: 'Turn speech into an accurate, timestamped transcript you can search and revisit.',
  },
  {
    icon: Tags,
    title: 'Classify tone & themes',
    body: 'Detect the overall mood of the meeting and surface the recurring topics discussed.',
  },
  {
    icon: ListChecks,
    title: 'Report & track',
    body: 'Generate a structured report with decisions and actions — owners, due dates, statuses.',
  },
]

export function HowItWorks() {
  return (
    <section id="how" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            From raw audio to accountable outcomes
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Four steps run automatically after every meeting.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.title} className="relative rounded-2xl border border-border bg-card p-6">
              <span className="absolute right-5 top-5 font-mono text-sm text-muted-foreground">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-foreground">
                <step.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
