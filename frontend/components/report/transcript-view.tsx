import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ToneBadge } from '@/components/scribe-badges'
import { formatClock } from '@/lib/mock-data'
import type { Meeting } from '@/lib/types'

const avatarTones = [
  'bg-chart-1/15 text-chart-1',
  'bg-chart-2/15 text-chart-2',
  'bg-chart-3/20 text-chart-3',
  'bg-chart-5/15 text-chart-5',
]

export function TranscriptView({ meeting }: { meeting: Meeting }) {
  // Sécurisation : on gère les cas où la prop s'appelle 'segments' ou 'transcript'
  const segments = meeting?.segments || (meeting as any)?.transcript || []
  const participants = meeting?.participants || []
  
  const speakerIndex = new Map(participants.map((p: any, i: number) => [p.id, i]))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Transcript</h3>
          <span className="text-xs text-muted-foreground">{segments.length} segments · diarized</span>
        </div>
      </CardHeader>
      <CardContent>
        <ol className="space-y-5">
          {segments.map((seg: any, index: number) => {
            const speaker = participants.find((p: any) => p.id === seg.speakerId)
            const idx = speakerIndex.get(seg.speakerId) ?? 0
            
            // Format de temps compatible avec les deux structures (mock / production n8n)
            const displayTime = seg.start 
              ? formatClock(seg.start) 
              : (seg.time || '0:00')

            // Nom du speaker (fallback sur la chaine directe si speakerId ne correspond à rien)
            const speakerName = speaker?.name || seg.speaker || 'Intervenant'

            return (
              <li key={seg.id || index} className="flex gap-3">
                <span
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarTones[idx % avatarTones.length]}`}
                >
                  {speaker?.initials || speakerName.substring(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{speakerName}</span>
                    <span className="font-mono text-xs text-muted-foreground">{displayTime}</span>
                    {seg.tone && <ToneBadge tone={seg.tone} className="text-[10px]" />}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{seg.text}</p>
                </div>
              </li>
            )
          })}
          {segments.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucune transcription disponible pour le moment.</p>
          )}
        </ol>
      </CardContent>
    </Card>
  )
}