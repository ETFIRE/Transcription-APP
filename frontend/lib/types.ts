export type CaptureMode = 'video' | 'dictaphone'

export type MeetingStatus = 'completed' | 'processing'

export type Tone = 'Positive' | 'Neutral' | 'Tense' | 'Focused' | 'Decisive'

export type ActionStatus = 'open' | 'in-progress' | 'done'

export type Priority = 'low' | 'medium' | 'high'

export interface Participant {
  id: string
  name: string
  role: string
  initials: string
  /** share of speaking time, 0-100 */
  speakingShare: number
}

export interface TranscriptSegment {
  id: string
  speakerId: string
  /** seconds from start */
  start: number
  text: string
  tone?: Tone
}

export interface ActionItem {
  id: string
  title: string
  ownerId: string
  due: string
  status: ActionStatus
  priority: Priority
}

export interface Decision {
  id: string
  text: string
}

export interface Meeting {
  id: string
  title: string
  date: string
  durationMinutes: number
  mode: CaptureMode
  status: MeetingStatus
  tone: Tone
  themes: string[]
  summary: string
  participants: Participant[]
  segments: TranscriptSegment[]
  decisions: Decision[]
  actions: ActionItem[]
}
