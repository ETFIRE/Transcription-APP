import type { Meeting } from './types'

export const ALL_THEMES = [
  'Product',
  'Roadmap',
  'Hiring',
  'Budget',
  'Marketing',
  'Design',
  'Engineering',
  'Client',
  'Retrospective',
] as const

export const meetings: Meeting[] = [
  {
    id: 'mtg-001',
    title: 'Q3 Product Roadmap Review',
    date: '2026-07-07T09:30:00',
    durationMinutes: 48,
    mode: 'video',
    status: 'completed',
    tone: 'Decisive',
    themes: ['Product', 'Roadmap', 'Engineering'],
    summary:
      'The team aligned on the Q3 roadmap, prioritizing the collaborative editing feature over the analytics dashboard. Engineering flagged capacity risk, and it was agreed to bring in one contractor. A go/no-go checkpoint was scheduled for the end of month.',
    participants: [
      { id: 'p1', name: 'Amelia Chen', role: 'Product Lead', initials: 'AC', speakingShare: 38 },
      { id: 'p2', name: 'Marcus Reyes', role: 'Eng Manager', initials: 'MR', speakingShare: 31 },
      { id: 'p3', name: 'Sofia Novak', role: 'Design Lead', initials: 'SN', speakingShare: 19 },
      { id: 'p4', name: 'Tom Fisher', role: 'Data', initials: 'TF', speakingShare: 12 },
    ],
    segments: [
      { id: 's1', speakerId: 'p1', start: 12, text: "Thanks everyone for joining. Let's lock the Q3 priorities today — I want us to walk out with a decision.", tone: 'Focused' },
      { id: 's2', speakerId: 'p2', start: 34, text: 'From engineering, collaborative editing is doable but it eats most of our capacity. The analytics dashboard would slip.', tone: 'Neutral' },
      { id: 's3', speakerId: 'p3', start: 58, text: "Design is ready on collaborative editing — the prototypes tested well. Analytics still needs another round.", tone: 'Positive' },
      { id: 's4', speakerId: 'p4', start: 79, text: "I'd push back slightly — a few enterprise accounts are asking specifically for analytics.", tone: 'Tense' },
      { id: 's5', speakerId: 'p1', start: 102, text: "Noted. Let's commit to collaborative editing for Q3 and revisit analytics in the first checkpoint. Marcus, can we cover the capacity gap?", tone: 'Decisive' },
      { id: 's6', speakerId: 'p2', start: 128, text: 'If we bring in one contractor for eight weeks, yes. I can have a spec ready by Friday.', tone: 'Neutral' },
    ],
    decisions: [
      { id: 'd1', text: 'Collaborative editing is the primary Q3 deliverable.' },
      { id: 'd2', text: 'Analytics dashboard deferred, revisited at the end-of-month checkpoint.' },
      { id: 'd3', text: 'Approve one contractor for eight weeks to cover engineering capacity.' },
    ],
    actions: [
      { id: 'a1', title: 'Draft contractor spec and budget', ownerId: 'p2', due: '2026-07-10', status: 'in-progress', priority: 'high' },
      { id: 'a2', title: 'Finalize collaborative editing designs', ownerId: 'p3', due: '2026-07-14', status: 'open', priority: 'medium' },
      { id: 'a3', title: 'Share enterprise analytics requirements', ownerId: 'p4', due: '2026-07-09', status: 'done', priority: 'medium' },
    ],
  },
  {
    id: 'mtg-002',
    title: 'Weekly Marketing Sync',
    date: '2026-07-06T14:00:00',
    durationMinutes: 27,
    mode: 'video',
    status: 'completed',
    tone: 'Positive',
    themes: ['Marketing', 'Client'],
    summary:
      'The launch campaign is on track. Paid channels are outperforming expectations; the team decided to reallocate a portion of the events budget to paid social. Case study production is slightly behind and needs a nudge.',
    participants: [
      { id: 'p5', name: 'Léa Dubois', role: 'Marketing Lead', initials: 'LD', speakingShare: 44 },
      { id: 'p6', name: 'Ken Adebayo', role: 'Growth', initials: 'KA', speakingShare: 33 },
      { id: 'p7', name: 'Priya Nair', role: 'Content', initials: 'PN', speakingShare: 23 },
    ],
    segments: [
      { id: 's1', speakerId: 'p5', start: 8, text: 'Quick round on the launch — where are we on channels?', tone: 'Focused' },
      { id: 's2', speakerId: 'p6', start: 25, text: 'Paid social is crushing it, cost per lead is down 22%. I think we should move budget there.', tone: 'Positive' },
      { id: 's3', speakerId: 'p7', start: 51, text: 'Content is close but the customer case study is waiting on approvals.', tone: 'Neutral' },
    ],
    decisions: [
      { id: 'd1', text: 'Reallocate 20% of the events budget to paid social.' },
    ],
    actions: [
      { id: 'a1', title: 'Move events budget to paid social', ownerId: 'p6', due: '2026-07-08', status: 'in-progress', priority: 'medium' },
      { id: 'a2', title: 'Chase case study approvals', ownerId: 'p7', due: '2026-07-09', status: 'open', priority: 'high' },
    ],
  },
  {
    id: 'mtg-003',
    title: 'On-site: Design Studio Workshop',
    date: '2026-07-03T10:00:00',
    durationMinutes: 92,
    mode: 'dictaphone',
    status: 'completed',
    tone: 'Focused',
    themes: ['Design', 'Product'],
    summary:
      'In-person working session captured via the dictaphone. The group ran a divergent-convergent exercise on onboarding. Three concepts were shortlisted; the "progressive setup" concept won. Follow-up usability tests were agreed.',
    participants: [
      { id: 'p8', name: 'Speaker 1', role: 'Facilitator', initials: 'S1', speakingShare: 41 },
      { id: 'p9', name: 'Speaker 2', role: 'Participant', initials: 'S2', speakingShare: 34 },
      { id: 'p10', name: 'Speaker 3', role: 'Participant', initials: 'S3', speakingShare: 25 },
    ],
    segments: [
      { id: 's1', speakerId: 'p8', start: 15, text: "Let's start divergent — no bad ideas for the next ten minutes on the onboarding flow.", tone: 'Focused' },
      { id: 's2', speakerId: 'p9', start: 44, text: 'What if we hide advanced settings entirely until the user hits a real need?', tone: 'Neutral' },
      { id: 's3', speakerId: 'p10', start: 70, text: 'Progressive setup — I like it. It matches how people actually ramp up.', tone: 'Positive' },
    ],
    decisions: [
      { id: 'd1', text: 'Adopt the "progressive setup" onboarding concept.' },
    ],
    actions: [
      { id: 'a1', title: 'Prepare usability test script', ownerId: 'p8', due: '2026-07-11', status: 'open', priority: 'medium' },
      { id: 'a2', title: 'Recruit 5 test participants', ownerId: 'p9', due: '2026-07-15', status: 'open', priority: 'low' },
    ],
  },
  {
    id: 'mtg-004',
    title: 'Budget Planning — FY27',
    date: '2026-06-30T11:00:00',
    durationMinutes: 63,
    mode: 'video',
    status: 'completed',
    tone: 'Tense',
    themes: ['Budget', 'Hiring'],
    summary:
      'Difficult conversation on next year budget. Hiring freeze debated; agreed to a partial freeze with two exceptions for critical roles. Tooling spend to be audited before renewal season.',
    participants: [
      { id: 'p11', name: 'Diane Roswell', role: 'Finance', initials: 'DR', speakingShare: 40 },
      { id: 'p12', name: 'Amelia Chen', role: 'Product Lead', initials: 'AC', speakingShare: 33 },
      { id: 'p13', name: 'Marcus Reyes', role: 'Eng Manager', initials: 'MR', speakingShare: 27 },
    ],
    segments: [
      { id: 's1', speakerId: 'p11', start: 20, text: 'We need to hold headcount flat unless there is a clear revenue tie.', tone: 'Tense' },
      { id: 's2', speakerId: 'p13', start: 46, text: 'A full freeze puts the roadmap at risk. I need at least two roles.', tone: 'Tense' },
      { id: 's3', speakerId: 'p12', start: 88, text: 'Can we agree on a partial freeze with named exceptions and revisit quarterly?', tone: 'Decisive' },
    ],
    decisions: [
      { id: 'd1', text: 'Partial hiring freeze with two named exceptions for critical roles.' },
      { id: 'd2', text: 'Audit tooling spend before renewals.' },
    ],
    actions: [
      { id: 'a1', title: 'Compile tooling spend audit', ownerId: 'p11', due: '2026-07-05', status: 'done', priority: 'high' },
      { id: 'a2', title: 'Document the two hiring exceptions', ownerId: 'p13', due: '2026-07-02', status: 'done', priority: 'medium' },
      { id: 'a3', title: 'Set quarterly budget review cadence', ownerId: 'p12', due: '2026-07-12', status: 'open', priority: 'low' },
    ],
  },
  {
    id: 'mtg-005',
    title: 'Sprint 14 Retrospective',
    date: '2026-06-27T16:00:00',
    durationMinutes: 41,
    mode: 'video',
    status: 'completed',
    tone: 'Neutral',
    themes: ['Retrospective', 'Engineering'],
    summary:
      'Standard retro. Velocity recovered after the incident last sprint. The team wants clearer ticket acceptance criteria and less context-switching. Two process experiments agreed for next sprint.',
    participants: [
      { id: 'p14', name: 'Marcus Reyes', role: 'Eng Manager', initials: 'MR', speakingShare: 30 },
      { id: 'p15', name: 'Yuki Tanaka', role: 'Engineer', initials: 'YT', speakingShare: 26 },
      { id: 'p16', name: 'Omar Haddad', role: 'Engineer', initials: 'OH', speakingShare: 24 },
      { id: 'p17', name: 'Grace Liu', role: 'QA', initials: 'GL', speakingShare: 20 },
    ],
    segments: [
      { id: 's1', speakerId: 'p14', start: 10, text: 'What went well this sprint?', tone: 'Neutral' },
      { id: 's2', speakerId: 'p15', start: 22, text: 'Velocity is back to normal, and the incident postmortem actions landed.', tone: 'Positive' },
      { id: 's3', speakerId: 'p16', start: 40, text: 'Too much context switching though — I was pulled onto three things at once.', tone: 'Tense' },
      { id: 's4', speakerId: 'p17', start: 63, text: 'Acceptance criteria were vague on two tickets, caused rework.', tone: 'Neutral' },
    ],
    decisions: [
      { id: 'd1', text: 'Trial a WIP limit of two items per engineer.' },
      { id: 'd2', text: 'Require acceptance criteria before a ticket enters the sprint.' },
    ],
    actions: [
      { id: 'a1', title: 'Add WIP limit to the board', ownerId: 'p14', due: '2026-06-29', status: 'done', priority: 'medium' },
      { id: 'a2', title: 'Update definition of ready', ownerId: 'p17', due: '2026-07-01', status: 'in-progress', priority: 'medium' },
    ],
  },
  {
    id: 'mtg-006',
    title: 'Client Kickoff — Northwind',
    date: '2026-06-24T13:30:00',
    durationMinutes: 55,
    mode: 'video',
    status: 'completed',
    tone: 'Positive',
    themes: ['Client', 'Product'],
    summary:
      'Kickoff with the Northwind account. Scope and success metrics agreed. Client is enthusiastic; main risk is their internal data access timeline. Weekly check-ins scheduled.',
    participants: [
      { id: 'p18', name: 'Amelia Chen', role: 'Product Lead', initials: 'AC', speakingShare: 35 },
      { id: 'p19', name: 'J. Whitmore', role: 'Client Sponsor', initials: 'JW', speakingShare: 40 },
      { id: 'p20', name: 'Ken Adebayo', role: 'Growth', initials: 'KA', speakingShare: 25 },
    ],
    segments: [
      { id: 's1', speakerId: 'p19', start: 18, text: "We're excited to get going. The main thing on our side is data access, it can take a while internally.", tone: 'Positive' },
      { id: 's2', speakerId: 'p18', start: 47, text: "Understood — let's put a milestone on data access so it doesn't block us.", tone: 'Focused' },
    ],
    decisions: [
      { id: 'd1', text: 'Weekly Thursday check-ins for the engagement.' },
    ],
    actions: [
      { id: 'a1', title: 'Send data access request checklist', ownerId: 'p18', due: '2026-06-26', status: 'done', priority: 'high' },
      { id: 'a2', title: 'Set up shared project space', ownerId: 'p20', due: '2026-06-27', status: 'done', priority: 'low' },
    ],
  },
]

export function getMeeting(id: string): Meeting | undefined {
  return meetings.find((m) => m.id === id)
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
