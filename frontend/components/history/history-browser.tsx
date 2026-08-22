"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MeetingCard } from "@/components/meeting-card"
import { ALL_THEMES } from "@/lib/mock-data"
import type { CaptureMode, Meeting, Tone } from "@/lib/types"

const TONES: Tone[] = ["Positive", "Neutral", "Tense", "Focused", "Decisive"]

export function HistoryBrowser({ meetings }: { meetings: Meeting[] }) {
  const [query, setQuery] = useState("")
  const [theme, setTheme] = useState<string>("all")
  const [tone, setTone] = useState<string>("all")
  const [mode, setMode] = useState<string>("all")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return meetings.filter((m) => {
      if (q && !m.title.toLowerCase().includes(q) && !m.summary.toLowerCase().includes(q)) return false
      if (theme !== "all" && !m.themes.includes(theme)) return false
      if (tone !== "all" && m.tone !== (tone as Tone)) return false
      if (mode !== "all" && m.mode !== (mode as CaptureMode)) return false
      return true
    })
  }, [meetings, query, theme, tone, mode])

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search meetings..."
            className="pl-9"
            aria-label="Search meetings"
          />
        </div>
        <div className="grid grid-cols-3 gap-3 lg:flex lg:w-auto">
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger className="lg:w-40" aria-label="Filter by theme">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All themes</SelectItem>
              {ALL_THEMES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger className="lg:w-36" aria-label="Filter by tone">
              <SelectValue placeholder="Tone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tones</SelectItem>
              {TONES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger className="lg:w-40" aria-label="Filter by capture mode">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All modes</SelectItem>
              <SelectItem value="video">Video conference</SelectItem>
              <SelectItem value="dictaphone">Dictaphone</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? "meeting" : "meetings"}
      </p>

      {filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <MeetingCard key={m.id} meeting={m} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
          <p className="font-medium text-foreground">No meetings match your filters</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  )
}
