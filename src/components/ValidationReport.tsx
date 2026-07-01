import type { ValidationResult } from '../types'
import { BLACKLIST_CATEGORIES } from '../engine/blacklist'
import { cn } from '../lib/utils'

interface Props {
  validation: ValidationResult
}

const LEVEL_STYLE: Record<string, string> = {
  pass: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  fail: 'bg-red-50 border-red-200 text-red-700',
  flag: 'bg-amber-50 border-amber-200 text-amber-700',
  unknown: 'bg-surface-50 border-surface-200 text-surface-600',
}

const LEVEL_DOT: Record<string, string> = {
  pass: 'bg-emerald-500',
  fail: 'bg-red-500',
  flag: 'bg-amber-500',
  unknown: 'bg-surface-400',
}

const CATEGORY_LABEL: Record<string, string> = {
  spec: 'Spec Match',
  title: 'Title Mapping',
  department: 'Department',
  blacklist: 'Blacklist',
  geo: 'Geography',
  tenure: 'Tenure',
  dual: 'Dual Employment',
  dead: 'Profile Health',
  special: 'Special Rules',
}

export default function ValidationReport({ validation }: Props) {
  const { overall, titleMapping, rules, flags, deadContact, blacklisted } = validation

  const overallColor = overall === 'pass' ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
    : overall === 'fail' ? 'text-red-700 bg-red-50 border-red-300'
    : 'text-amber-700 bg-amber-50 border-amber-300'

  const grouped = rules.reduce((acc, r) => {
    const cat = r.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(r)
    return acc
  }, {} as Record<string, typeof rules>)

  return (
    <div className="space-y-3">
      <div className={cn('p-3 rounded-lg border flex items-center gap-2', overallColor)}>
        <div className={cn('w-2.5 h-2.5 rounded-full', LEVEL_DOT[overall])} />
        <div>
          <span className="font-bold capitalize text-sm">{overall}</span>
          {blacklisted && <span className="ml-2 badge-red text-[10px]">Blacklisted</span>}
          {deadContact && <span className="ml-2 badge-red text-[10px]">Dead Contact</span>}
          {flags.length > 0 && (
            <span className="ml-2 badge-amber text-[10px]">{flags.length} flag(s)</span>
          )}
        </div>
      </div>

      {titleMapping.level && (
        <div className="flex flex-wrap gap-2">
          <span className="badge-blue text-xs">Level: {titleMapping.level}</span>
          {titleMapping.department && (
            <span className="badge-green text-xs">Dept: {titleMapping.department}</span>
          )}
          {titleMapping.demoted && (
            <span className="badge-amber text-xs" title={titleMapping.demotionNote}>
              Demoted ⚠️
            </span>
          )}
        </div>
      )}

      <div className="space-y-2">
        {Object.entries(grouped).map(([cat, catRules]) => (
          <div key={cat}>
            <h5 className="text-[10px] font-bold text-surface-500 uppercase tracking-wider mb-1">
              {CATEGORY_LABEL[cat] || cat}
            </h5>
            <div className="space-y-1">
              {catRules.map((r, i) => (
                <div key={i} className={cn(
                  'flex items-start gap-2 px-2.5 py-1.5 rounded border text-xs',
                  LEVEL_STYLE[r.level],
                )}>
                  <div className={cn('w-1.5 h-1.5 rounded-full mt-0.5 flex-shrink-0', LEVEL_DOT[r.level])} />
                  <span>{r.message}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {blacklisted && (
        <details className="text-xs text-surface-500">
          <summary className="cursor-pointer hover:text-surface-700 font-medium">View blacklist categories checked</summary>
          <div className="mt-2 space-y-1 pl-2">
            {BLACKLIST_CATEGORIES.map(c => (
              <div key={c.category} className="text-[10px]">
                <span className="font-medium">{c.category}:</span>{' '}
                <span className="text-surface-500">{c.keywords.join(', ')}</span>
                <span className="text-surface-500"> — {c.reason}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
