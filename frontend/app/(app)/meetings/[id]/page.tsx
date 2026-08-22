import { notFound } from 'next/navigation'
import { getMeeting, meetings } from '@/lib/mock-data'
import { ReportHeader } from '@/components/report/report-header'
import { TranscriptView } from '@/components/report/transcript-view'
import { DecisionsCard, ActionsCard } from '@/components/report/actions-panel'
import { ParticipantsCard } from '@/components/report/participants-card'

export function generateStaticParams() {
  return meetings.map((m) => ({ id: m.id }))
}

export default async function MeetingReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const meeting = getMeeting(id)

  if (!meeting) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <ReportHeader meeting={meeting} />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <TranscriptView meeting={meeting} />
        </div>
        <div className="space-y-6">
          <DecisionsCard meeting={meeting} />
          <ActionsCard meeting={meeting} />
          <ParticipantsCard meeting={meeting} />
        </div>
      </div>
    </div>
  )
}
