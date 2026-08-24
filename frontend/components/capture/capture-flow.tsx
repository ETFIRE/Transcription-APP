'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/page-header'
import { ConsentScreen } from '@/components/capture/consent-screen'
import { DictaphoneRecorder } from '@/components/capture/dictaphone-recorder'
import { VisioCapture } from './visio-wireframe'
import type { CaptureMode } from '@/lib/types'
import { Mic, Video, ArrowRight, Check } from 'lucide-react'

type Step = 'mode' | 'consent' | 'capture'

const modeOptions: {
  id: CaptureMode
  icon: React.ElementType
  title: string
  subtitle: string
  points: string[]
}[] = [
  {
    id: 'video',
    icon: Video,
    title: 'Video conference',
    subtitle: 'Remote meeting',
    points: ['Scribe hosts the call', 'Audio pulled at the source', 'A track per participant'],
  },
  {
    id: 'dictaphone',
    icon: Mic,
    title: 'Dictaphone',
    subtitle: 'In-person meeting',
    points: ['Records the device mic', 'Handles long sessions', 'Diarizes speakers after'],
  },
]

const steps: { id: Step; label: string }[] = [
  { id: 'mode', label: 'Mode' },
  { id: 'consent', label: 'Consent' },
  { id: 'capture', label: 'Capture' },
]

export function CaptureFlow() {
  const [step, setStep] = useState<Step>('mode')
  const [mode, setMode] = useState<CaptureMode | null>(null)
  const [title, setTitle] = useState('')

  const currentIndex = steps.findIndex((s) => s.id === step)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
      <PageHeader
        title="New capture"
        description="Choose how you want to capture this meeting, confirm consent, then record."
      />

      {/* Stepper */}
      <ol className="mt-6 flex items-center gap-2">
        {steps.map((s, i) => {
          const done = i < currentIndex
          const active = i === currentIndex
          return (
            <li key={s.id} className="flex flex-1 items-center gap-2 last:flex-none">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : done
                      ? 'bg-chart-2 text-primary-foreground'
                      : 'bg-secondary text-muted-foreground'
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className={`text-sm font-medium ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
                {s.label}
              </span>
              {i < steps.length - 1 && <span className="hidden h-px flex-1 bg-border sm:block" />}
            </li>
          )
        })}
      </ol>

      <div className="mt-8">
        {step === 'mode' && (
          <div className="grid gap-5 sm:grid-cols-2">
            {modeOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setMode(opt.id)
                  setStep('consent')
                }}
                className="group text-left"
              >
                <Card className="h-full transition-all hover:border-brand hover:shadow-md">
                  <CardContent className="flex h-full flex-col gap-4 pt-6">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                      <opt.icon className="h-6 w-6" />
                    </span>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {opt.subtitle}
                      </p>
                      <h3 className="text-xl font-semibold">{opt.title}</h3>
                    </div>
                    <ul className="space-y-2">
                      {opt.points.map((p) => (
                        <li key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                          {p}
                        </li>
                      ))}
                    </ul>
                    <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-brand">
                      Select
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        )}

        {step === 'consent' && mode && (
          <ConsentScreen
            mode={mode}
            onBack={() => setStep('mode')}
            onConfirm={(t) => {
              setTitle(t)
              setStep('capture')
            }}
          />
        )}

        {step === 'capture' && mode === 'dictaphone' && (
          <DictaphoneRecorder title={title} onBack={() => setStep('consent')} />
        )}
        {step === 'capture' && mode === 'video' && (
          <VisioCapture title={title} onBack={() => setStep('consent')} />
        )}
      </div>
    </div>
  )
}
