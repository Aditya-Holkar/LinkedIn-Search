import type { JobRole, Department, Level } from '../data/jobRoles'
import { getMajorRoles, getMinorRoles, DEPARTMENT_KEYWORDS } from '../data/jobRoles'
import { BLACKLIST_CATEGORIES } from './blacklist'

export interface RoleValidationResult {
  title: string
  role: JobRole | null
  type: 'major' | 'minor' | 'unclassified' | 'excluded'
  department: Department | null
  level: Level | null
  excludedBy: string | null
  matchedKeyword: string | null
}

const EXCLUSION_DEFAULTS = BLACKLIST_CATEGORIES.flatMap(c => c.keywords)

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
}

function titleMatchesRole(title: string, role: JobRole): boolean {
  const norm = normalize(title)
  const normRole = normalize(role.title)
  return norm.includes(normRole) || normRole.includes(norm)
}

export function findMatchingRole(
  title: string,
  majorRoles: JobRole[],
  minorRoles: JobRole[],
): { role: JobRole | null; matchedKeyword: string | null } {
  const norm = normalize(title)

  for (const role of majorRoles) {
    if (titleMatchesRole(title, role)) {
      return { role, matchedKeyword: null }
    }
  }

  for (const role of minorRoles) {
    if (titleMatchesRole(title, role)) {
      return { role, matchedKeyword: null }
    }
  }

  for (const [dept, keywords] of Object.entries(DEPARTMENT_KEYWORDS)) {
    for (const kw of keywords) {
      if (norm.includes(kw)) {
        return { role: null, matchedKeyword: `${dept}:${kw}` }
      }
    }
  }

  return { role: null, matchedKeyword: null }
}

export function isExcluded(title: string, customExclusions?: string[]): string | null {
  const norm = normalize(title)
  const allExclusions = [...new Set([...EXCLUSION_DEFAULTS, ...(customExclusions || [])])]
  for (const kw of allExclusions) {
    if (norm.includes(kw)) return kw
  }
  return null
}

export function validateRoleTitle(
  title: string,
  customExclusions?: string[],
): RoleValidationResult {
  const majorRoles = getMajorRoles()
  const minorRoles = getMinorRoles()

  const excludedBy = isExcluded(title, customExclusions)
  if (excludedBy) {
    return {
      title,
      role: null,
      type: 'excluded',
      department: null,
      level: null,
      excludedBy,
      matchedKeyword: null,
    }
  }

  const { role, matchedKeyword } = findMatchingRole(title, majorRoles, minorRoles)

  if (role) {
    return {
      title,
      role,
      type: role.type,
      department: role.department ?? null,
      level: role.level ?? null,
      excludedBy: null,
      matchedKeyword: null,
    }
  }

  return {
    title,
    role: null,
    type: 'unclassified',
    department: null,
    level: null,
    excludedBy: null,
    matchedKeyword,
  }
}

export function validateRoleTitles(
  titles: string[],
  customExclusions?: string[],
): RoleValidationResult[] {
  return titles.map(t => validateRoleTitle(t, customExclusions))
}

export function getRoleStats(results: RoleValidationResult[]): {
  major: number
  minor: number
  excluded: number
  unclassified: number
  total: number
} {
  return {
    major: results.filter(r => r.type === 'major').length,
    minor: results.filter(r => r.type === 'minor').length,
    excluded: results.filter(r => r.type === 'excluded').length,
    unclassified: results.filter(r => r.type === 'unclassified').length,
    total: results.length,
  }
}
