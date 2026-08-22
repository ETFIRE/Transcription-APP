import type { Meeting } from './types'

export function themeCounts(meetings: Meeting[]) {
  const counts = new Map<string, number>()
  for (const m of meetings) {
    for (const t of m.themes) {
      counts.set(t, (counts.get(t) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([theme, count]) => ({ theme, count }))
    .sort((a, b) => b.count - a.count)
}

export function actionStatusCounts(meetings: Meeting[]) {
  let open = 0
  let inProgress = 0
  let done = 0
  for (const m of meetings) {
    for (const a of m.actions) {
      if (a.status === 'open') open++
      else if (a.status === 'in-progress') inProgress++
      else done++
    }
  }
  return { open, inProgress, done, total: open + inProgress + done }
}

export function meetingsPerWeek(meetings: Meeting[]) {
  // Group by ISO week label (using date) — simplified to last few weeks
  const buckets = new Map<string, number>()
  for (const m of meetings) {
    const d = new Date(m.date)
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    buckets.set(label, (buckets.get(label) ?? 0) + 1)
  }
  return [...buckets.entries()].map(([label, count]) => ({ label, count })).reverse()
}

export function totals(meetings: Meeting[]) {
  const minutes = meetings.reduce((sum, m) => sum + m.durationMinutes, 0)
  const actions = actionStatusCounts(meetings)
  return {
    meetings: meetings.length,
    hours: Math.round((minutes / 60) * 10) / 10,
    openActions: actions.open + actions.inProgress,
    decisions: meetings.reduce((sum, m) => sum + m.decisions.length, 0),
  }
}
