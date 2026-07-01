const BLACKLIST_KEYWORDS = [
  'support', 'helpdesk', 'service desk', 'service delivery',
  'audit', 'training', 'sourcing', 'portfolio', 'program', 'project',
  'software', 'requirement', 'test', 'change',
  'interim', 'temporary', 'acting', 'contractor', 'freelancer', 'self employed', 'part time', 'remote',
  'retired', 'former',
  'intern', 'apprentice', 'student',
]

export function isBlacklisted(title: string): boolean {
  const lower = title.toLowerCase()
  return BLACKLIST_KEYWORDS.some(kw => lower.includes(kw))
}

export function getBlacklistMatch(title: string): string | null {
  const lower = title.toLowerCase()
  for (const kw of BLACKLIST_KEYWORDS) {
    if (lower.includes(kw)) return kw
  }
  return null
}

export const BLACKLIST_CATEGORIES: { category: string; keywords: string[]; reason: string }[] = [
  { category: 'Support roles', keywords: ['support', 'helpdesk', 'service desk', 'service delivery'], reason: 'Handles tickets, not budgets' },
  { category: 'Specialist functions', keywords: ['audit', 'training', 'sourcing', 'portfolio', 'program', 'project'], reason: 'Reviews/coordinates, does not decide' },
  { category: 'Implementation roles', keywords: ['software', 'requirement', 'test', 'change'], reason: 'Executes, does not purchase' },
  { category: 'Non-permanent', keywords: ['interim', 'temporary', 'acting', 'contractor', 'freelancer', 'self employed', 'part time', 'remote'], reason: 'Not a permanent decision-maker' },
  { category: 'Ex-employment', keywords: ['retired', 'former'], reason: 'No longer active' },
  { category: 'Entry-level', keywords: ['intern', 'apprentice', 'student'], reason: 'Not a permanent employee' },
]
