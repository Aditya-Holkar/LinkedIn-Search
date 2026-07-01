import type { TIGERDSpec, ExtractedProfile, ValidationResult, RuleResult } from '../types'
import { mapTitle, levelQualifiesForSpec } from './titleMapping'
import { isBlacklisted, getBlacklistMatch } from './blacklist'
import { checkGeography } from './geoMapping'

export function validateProfile(profile: ExtractedProfile, spec: TIGERDSpec): ValidationResult {
  const rules: RuleResult[] = []
  const flags: string[] = []

  const titleMapping = mapTitle(profile.title)

  let deadContact = false
  let blacklisted = false

  // 1. Spec match: title level
  if (titleMapping.level) {
    const qualifies = levelQualifiesForSpec(titleMapping.level, spec.targetTitle)
    rules.push({
      rule: 'Title level matches spec',
      category: 'spec',
      level: qualifies ? 'pass' : 'fail',
      message: qualifies
        ? `"${profile.title}" → ${titleMapping.level} (qualifies for ${spec.targetTitle})`
        : `"${profile.title}" → ${titleMapping.level} (does NOT qualify for ${spec.targetTitle})`,
    })
    if (!qualifies) flags.push('title_level_mismatch')
  } else {
    rules.push({
      rule: 'Title level could not be mapped',
      category: 'title',
      level: 'unknown',
      message: `Could not determine level for "${profile.title}"`,
    })
  }

  // 2. Spec match: department
  if (titleMapping.department) {
    rules.push({
      rule: 'Department identified',
      category: 'department',
      level: 'pass',
      message: `Department: ${titleMapping.department}`,
    })
  } else {
    rules.push({
      rule: 'Department identified',
      category: 'department',
      level: 'unknown',
      message: 'Could not identify department from title',
    })
  }

  // 3. Demotion note
  if (titleMapping.demoted) {
    flags.push('demoted')
    rules.push({
      rule: 'Title demotion',
      category: 'title',
      level: 'flag',
      message: titleMapping.demotionNote,
    })
  }

  // 4. Blacklist check
  blacklisted = isBlacklisted(profile.title)
  if (blacklisted) {
    const match = getBlacklistMatch(profile.title)
    rules.push({
      rule: 'Title blacklist check',
      category: 'blacklist',
      level: 'fail',
      message: `Title contains blacklisted keyword: "${match}"`,
    })
    flags.push('blacklisted')
  } else {
    rules.push({
      rule: 'Title blacklist check',
      category: 'blacklist',
      level: 'pass',
      message: 'Title is not blacklisted',
    })
  }

  // 5. Geography check
  const geoMatch = checkGeography(profile.location, spec.countries)
  rules.push({
    rule: 'Geography match',
    category: 'geo',
    level: geoMatch ? 'pass' : 'fail',
    message: geoMatch
      ? `Location "${profile.location}" matches spec countries`
      : `Location "${profile.location}" does NOT match spec countries: ${spec.countries.join(', ')}`,
  })
  if (!geoMatch) flags.push('geo_mismatch')

  // 6. Current tenure check
  if (profile.currentTenureYears > 5) {
    rules.push({
      rule: 'Long tenure check',
      category: 'tenure',
      level: 'flag',
      message: `Current role: ${profile.currentTenureYears} years (> 5yr threshold) — suspected`,
    })
    flags.push('long_tenure')
  } else {
    rules.push({
      rule: 'Long tenure check',
      category: 'tenure',
      level: 'pass',
      message: `Current role tenure: ${profile.currentTenureYears} years (within threshold)`,
    })
  }

  // 7. Dual employment check
  if (profile.isDualEmployed) {
    rules.push({
      rule: 'Dual employment',
      category: 'dual',
      level: 'flag',
      message: 'Listed at 2+ companies simultaneously',
    })
    flags.push('dual_employment')
  } else {
    rules.push({
      rule: 'Dual employment',
      category: 'dual',
      level: 'pass',
      message: 'Single current employer',
    })
  }

  // 8. Dead contact check
  if (!profile.hasPresent) {
    const hasEndDates = profile.previousRoles.some(r => r.endDate && r.endDate !== '')
    if (!hasEndDates) {
      deadContact = true
      rules.push({
        rule: 'Dead contact check',
        category: 'dead',
        level: 'fail',
        message: 'Missing "Present" and no end dates in experience — incomplete/abandoned profile',
      })
      flags.push('dead_contact')
    } else {
      rules.push({
        rule: 'Dead contact check',
        category: 'dead',
        level: 'pass',
        message: 'Has "Present" in current role — active profile',
      })
    }
  } else {
    rules.push({
      rule: 'Dead contact check',
      category: 'dead',
      level: 'pass',
      message: 'Has "Present" in current role — active profile',
    })
  }

  // 9. C-Level + Company size rule (only if c-level)
  if (titleMapping.level === 'c-level') {
    const companySizeOk = spec.employeeSizeMax < 1000
    rules.push({
      rule: 'C-Level & company size',
      category: 'special',
      level: companySizeOk ? 'pass' : 'flag',
      message: companySizeOk
        ? `C-level at company size ${spec.employeeSizeMin}-${spec.employeeSizeMax} — reachable`
        : `C-level at ${spec.employeeSizeMax}+ employees — consider targeting VP/Director instead`,
    })
    if (!companySizeOk) flags.push('c-level_large_company')
  }

  // Determine overall
  const hasFails = rules.some(r => r.level === 'fail')
  const hasFlags = rules.some(r => r.level === 'flag')
  const hasUnknown = rules.some(r => r.level === 'unknown')

  let overall: 'pass' | 'fail' | 'flag' | 'error'
  if (deadContact || blacklisted) {
    overall = 'fail'
  } else if (hasFails) {
    overall = 'fail'
  } else if (hasFlags) {
    overall = 'flag'
  } else if (hasUnknown) {
    overall = 'flag'
  } else {
    overall = 'pass'
  }

  return {
    profileId: '',
    overall,
    titleMapping,
    rules,
    flags,
    deadContact,
    blacklisted,
  }
}
