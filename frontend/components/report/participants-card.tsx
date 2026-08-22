import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { Meeting } from '@/lib/types'

export function ParticipantsCard({ meeting }: { meeting: Meeting }) {
  const sorted = [...meeting.participants].sort((a, b) => b.speakingShare - a.speakingShare)
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Speaking time</h3>
          <span className="text-xs text-muted-foreground">{meeting.participants.length} people</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sorted.map((p) => (
          <div key={p.id} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{p.name}</span>
              <span className="text-muted-foreground">{p.speakingShare}%</span>
            </div>
            <Progress value={p.speakingShare} className="h-1.5" />
            <p className="text-xs text-muted-foreground">{p.role}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
