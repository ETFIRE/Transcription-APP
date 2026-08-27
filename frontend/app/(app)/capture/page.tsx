'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CaptureFlow } from '@/components/capture/capture-flow'
import { ShareMeetingButton } from '@/components/share-meeting-button'
import { Loader2 } from 'lucide-react'

function CaptureContent() {
  const searchParams = useSearchParams()
  const room = searchParams.get('room') || 'salon-principal'

  return (
    <div className="space-y-4">
      <div className="flex justify-end px-4 pt-2">
        <ShareMeetingButton meetingId={room} />
      </div>
      <CaptureFlow />
    </div>
  )
}

export default function CapturePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CaptureContent />
    </Suspense>
  )
}