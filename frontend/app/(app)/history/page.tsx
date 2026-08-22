import { PageHeader } from "@/components/page-header"
import { HistoryBrowser } from "@/components/history/history-browser"
import { meetings } from "@/lib/mock-data"

export default function HistoryPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Meeting history" description="Search and filter every meeting Scribe has captured." />
      <HistoryBrowser meetings={meetings} />
    </div>
  )
}
