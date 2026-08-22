'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mic, Pause, Play, Square, Loader2, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { formatClock } from '@/lib/mock-data'

type Phase = 'idle' | 'recording' | 'paused' | 'processing' | 'done'

const mockTranscript = [
  { speaker: 'Speaker 1', text: "Let's start divergent — no bad ideas for the next ten minutes on the onboarding flow." },
  { speaker: 'Speaker 2', text: 'What if we hide advanced settings entirely until the user hits a real need?' },
  { speaker: 'Speaker 3', text: 'Progressive setup — I like it. It matches how people actually ramp up.' },
]

export function DictaphoneRecorder({ title, onBack }: { title: string; onBack: () => void }) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [seconds, setSeconds] = useState(0)
  const [revealed, setRevealed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (phase === 'recording') {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [phase])

  // Simulate transcription after processing
  useEffect(() => {
    if (phase !== 'processing') return
    const t = setTimeout(() => setPhase('done'), 2200)
    return () => clearTimeout(t)
  }, [phase])

  useEffect(() => {
    if (phase !== 'done') return
    if (revealed >= mockTranscript.length) return
    const t = setTimeout(() => setRevealed((r) => r + 1), 500)
    return () => clearTimeout(t)
  }, [phase, revealed])

  const isRecording = phase === 'recording'

  return (
    <div className="mx-auto max-w-2xl">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 gap-1.5">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <Mic className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-base font-semibold leading-tight">{title}</h2>
                <p className="text-xs text-muted-foreground">Dictaphone mode</p>
              </div>
            </div>
            {isRecording && (
              <span className="inline-flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
                Recording
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Timer + waveform */}
          <div className="flex flex-col items-center gap-5 rounded-2xl border border-border bg-secondary/40 py-8">
            <span className="font-mono text-5xl tabular-nums tracking-tight">{formatClock(seconds)}</span>
            <Waveform active={isRecording} />
            <p className="text-xs text-muted-foreground">
              {phase === 'idle' && 'Ready to record from your microphone'}
              {phase === 'recording' && 'Capturing audio — long sessions are handled automatically'}
              {phase === 'paused' && 'Paused'}
              {phase === 'processing' && 'Uploading and transcribing…'}
              {phase === 'done' && 'Transcription complete'}
            </p>
          </div>

          {/* Controls */}
          {phase !== 'processing' && phase !== 'done' && (
            <div className="flex items-center justify-center gap-3">
              {phase === 'idle' && (
                <Button size="lg" className="gap-2" onClick={() => setPhase('recording')}>
                  <Mic className="h-4 w-4" />
                  Start recording
                </Button>
              )}
              {phase === 'recording' && (
                <>
                  <Button size="lg" variant="outline" className="gap-2" onClick={() => setPhase('paused')}>
                    <Pause className="h-4 w-4" />
                    Pause
                  </Button>
                  <Button size="lg" variant="destructive" className="gap-2" onClick={() => setPhase('processing')}>
                    <Square className="h-4 w-4" />
                    Stop & transcribe
                  </Button>
                </>
              )}
              {phase === 'paused' && (
                <>
                  <Button size="lg" className="gap-2" onClick={() => setPhase('recording')}>
                    <Play className="h-4 w-4" />
                    Resume
                  </Button>
                  <Button size="lg" variant="destructive" className="gap-2" onClick={() => setPhase('processing')}>
                    <Square className="h-4 w-4" />
                    Stop & transcribe
                  </Button>
                </>
              )}
            </div>
          )}

          {phase === 'processing' && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Running speech-to-text and speaker diarization…
            </div>
          )}

          {/* Mock transcript */}
          {phase === 'done' && (
            <div className="space-y-4">
              <div className="space-y-3 rounded-xl border border-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Transcript preview (sample)
                </p>
                {mockTranscript.slice(0, revealed).map((line, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold text-secondary-foreground">
                      {line.speaker.split(' ')[1]}
                    </span>
                    <p className="text-sm leading-relaxed">
                      <span className="font-medium">{line.speaker}: </span>
                      <span className="text-muted-foreground">{line.text}</span>
                    </p>
                  </div>
                ))}
                {revealed < mockTranscript.length && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Attributing speakers…
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-chart-2/10 p-3 text-sm text-chart-2">
                <CheckCircle2 className="h-4 w-4" />
                Report generated with decisions, themes, and actions.
              </div>

              <Button asChild size="lg" className="w-full gap-2">
                <Link href="/meetings/mtg-003">
                  View meeting report
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Waveform({ active }: { active: boolean }) {
  const bars = 40
  return (
    <div className="flex h-12 items-center gap-1" aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="w-1 rounded-full bg-brand/70"
          style={{
            height: active ? `${20 + Math.abs(Math.sin(i * 0.7)) * 80}%` : '12%',
            animation: active ? `wave 1s ease-in-out ${i * 0.04}s infinite alternate` : 'none',
          }}
        />
      ))}
      <style>{`@keyframes wave { from { transform: scaleY(0.35); } to { transform: scaleY(1); } }`}</style>
    </div>
  )
}
