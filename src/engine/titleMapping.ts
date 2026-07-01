import type { TitleLevel, Department, TitleMappingResult } from '../types'

const C_LEVEL_PATTERNS = ['ceo', 'cfo', 'cto', 'cio', 'coo', 'cmo', 'chro', 'cso', 'cdo', 'cpo', 'cao', 'president', 'founder', 'chairman', 'board member', 'managing director']
const VP_PATTERNS = ['vp ', 'svp ', 'evp ', 'avp ', 'group vp', 'global vp', 'regional vp', 'senior vp', 'vice president']
const DIRECTOR_PATTERNS = ['director', 'head of', 'head -', 'head ']
const MANAGER_PATTERNS = ['manager', 'team lead', 'supervisor', 'lead']
const STAFF_PATTERNS = ['executive', 'specialist', 'associate', 'representative', 'analyst', 'administrative', 'coordinator', 'officer', 'agent', 'consultant', 'advisor', 'engineer', 'architect', 'developer', 'technician']

const DEMOTION_PREFIXES: [string, TitleLevel][] = [
  ['assistant director', 'manager'],
  ['deputy director', 'manager'],
  ['associate director', 'manager'],
  ['assistant vp', 'director'],
  ['deputy vp', 'director'],
  ['associate vp', 'director'],
  ['assistant manager', 'staff'],
  ['deputy manager', 'staff'],
  ['associate manager', 'staff'],
]

const ACTING_PREFIXES = ['acting ', 'interim ', 'temporary ']

export const DEPARTMENT_KEYWORDS: Record<Department, string[]> = {
  HR: ['hr', 'human resource', 'talent', 'talent acquisition', 'recruitment', 'people', 'l&d', 'learning', 'training', 'hrbp', 'payroll', 'people operations', 'engagement', 'hris', 'culture', 'compensation', 'benefits', 'onboarding'],
  IT: ['it', 'information technology', 'technology', 'tech', 'digital', 'engineering', 'infrastructure', 'network', 'system', 'security', 'data', 'devops', 'cloud', 'software', 'cyber', 'application', 'architecture', 'technical', 'solutions', 'web', 'development', 'platform', 'product', 'ai', 'machine learning'],
  Sales: ['sales', 'business development', 'bd', 'account management', 'revenue', 'inside sales', 'field sales', 'key accounts', 'enterprise sales', 'channel sales', 'partnerships', 'sdr', 'bdr', 'ae', 'account executive', 'alliances', 'customer success'],
  Marketing: ['marketing', 'brand', 'communications', 'growth', 'pr', 'public relations', 'content', 'seo', 'sem', 'digital marketing', 'social media', 'campaign', 'demand gen', 'dg', 'product marketing', 'media', 'creative', 'design'],
  Finance: ['finance', 'accounting', 'treasury', 'fp&a', 'audit', 'tax', 'controller', 'accounts', 'payable', 'receivable', 'budgeting', 'financial planning', 'risk', 'compliance'],
  Admin: ['admin', 'administration', 'office', 'operations', 'ea', 'executive assistant', 'pa', 'personal assistant', 'administrative', 'secretarial', 'front desk', 'scheduling'],
  Facilities: ['facilities', 'facility', 'maintenance', 'workplace', 'real estate', 'estate', 'property', 'vendor', 'security', 'physical security', 'janitorial', 'safety'],
}

export function mapTitle(title: string): TitleMappingResult {
  const lower = title.toLowerCase().trim()

  for (const [prefix, _] of ACTING_PREFIXES) {
    if (lower.startsWith(prefix)) {
      return { level: null, department: null, demoted: false, demotionNote: 'Acting/Interim/Temporary title — likely blacklisted' }
    }
  }

  let demoted = false
  let demotionNote = ''

  for (const [prefix, targetLevel] of DEMOTION_PREFIXES) {
    if (lower.startsWith(prefix)) {
      demoted = true
      demotionNote = `"${prefix}" demotes to ${targetLevel}`
      const level = targetLevel as TitleLevel
      return { level, department: findDepartment(lower), demoted, demotionNote }
    }
  }

  const level = classifyLevel(lower)

  return { level, department: findDepartment(lower), demoted, demotionNote }
}

function classifyLevel(title: string): TitleLevel | null {
  for (const p of C_LEVEL_PATTERNS) {
    if (title.includes(p)) return 'c-level'
  }
  for (const p of VP_PATTERNS) {
    if (title.includes(p)) return 'vp'
  }
  for (const p of DIRECTOR_PATTERNS) {
    if (title.includes(p)) return 'director'
  }
  for (const p of MANAGER_PATTERNS) {
    if (title.includes(p)) return 'manager'
  }
  for (const p of STAFF_PATTERNS) {
    if (title.includes(p)) return 'staff'
  }
  return null
}

function findDepartment(title: string): Department | null {
  const lower = title.toLowerCase()
  for (const [dept, keywords] of Object.entries(DEPARTMENT_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return dept as Department
    }
  }
  return null
}

export function levelQualifiesForSpec(profileLevel: TitleLevel, specLevel: string): boolean {
  const order: TitleLevel[] = ['c-level', 'vp', 'director', 'manager', 'staff']
  const profileIndex = order.indexOf(profileLevel)
  if (profileIndex === -1) return false

  switch (specLevel) {
    case 'c-level':
      return profileLevel === 'c-level'
    case 'vp+':
      return profileIndex <= order.indexOf('vp')
    case 'vp':
      return profileLevel === 'vp'
    case 'director+':
      return profileIndex <= order.indexOf('director')
    case 'director':
      return profileLevel === 'director'
    case 'manager+':
      return profileIndex <= order.indexOf('manager')
    case 'manager':
      return profileLevel === 'manager'
    case 'staff+':
      return true
    case 'staff':
      return profileLevel === 'staff'
    default:
      return false
  }
}
