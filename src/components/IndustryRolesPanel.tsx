import { useState, useMemo } from 'react'
import { cn } from '../lib/utils'
import { SECTORS, type Sector } from '../data/sectors'
import { getMajorRoles, getMinorRoles, type Department, type Level, DEPARTMENT_KEYWORDS } from '../data/jobRoles'
import { validateRoleTitle, type RoleValidationResult } from '../engine/roleValidator'
import { BLACKLIST_CATEGORIES } from '../engine/blacklist'

const DEPARTMENTS: Department[] = ['HR', 'IT', 'Sales', 'Marketing', 'Finance', 'Admin', 'Facilities']

const LEVEL_ORDER: Level[] = ['C-Level', 'VP', 'Director', 'Manager', 'Staff']

const LEVEL_FILTERS: { label: string; value: Level | 'all' }[] = [
  { label: 'All Levels', value: 'all' },
  { label: 'C-Level', value: 'C-Level' },
  { label: 'VP', value: 'VP' },
  { label: 'Director', value: 'Director' },
  { label: 'Manager', value: 'Manager' },
  { label: 'Staff', value: 'Staff' },
]

const DEPT_LABELS: Record<Department, string> = {
  HR: 'Human Resource',
  IT: 'Information Technology',
  Sales: 'Sales',
  Marketing: 'Marketing',
  Finance: 'Finance',
  Admin: 'Admin',
  Facilities: 'Facilities',
}

const DEPT_BADGE: Record<Department, string> = {
  HR: 'badge-pink',
  IT: 'badge-blue',
  Sales: 'badge-green',
  Marketing: 'badge-purple',
  Finance: 'badge-amber',
  Admin: 'badge-gray',
  Facilities: 'badge-teal',
}

const LEVEL_BADGE: Record<Level, string> = {
  'C-Level': 'level-badge-cl',
  'VP': 'level-badge-vp',
  'Director': 'level-badge-dir',
  'Manager': 'level-badge-mgr',
  'Staff': 'level-badge-staff',
}

export default function IndustryRolesPanel() {
  const defaultExclusions = BLACKLIST_CATEGORIES.flatMap(c => c.keywords)

  const [selectedSector, setSelectedSector] = useState<Sector | null>(null)
  const [levelFilter, setLevelFilter] = useState<Level | 'all'>('all')
  const [exclusions, setExclusions] = useState<string[]>(defaultExclusions)
  const [exclusionInput, setExclusionInput] = useState('')
  const [validationInput, setValidationInput] = useState('')
  const [validationResult, setValidationResult] = useState<RoleValidationResult | null>(null)

  const majorRoles = useMemo(() => getMajorRoles(), [])
  const minorRoles = useMemo(() => getMinorRoles(), [])

  const filteredMajorRoles = useMemo(() => {
    return majorRoles.filter(r => {
      if (levelFilter !== 'all' && r.level !== levelFilter) return false
      const norm = r.title.toLowerCase()
      return !exclusions.some(e => norm.includes(e.toLowerCase()))
    })
  }, [majorRoles, levelFilter, exclusions])

  const filteredMinorRoles = useMemo(() => {
    return minorRoles.filter(r => {
      if (levelFilter !== 'all' && r.level !== levelFilter) return false
      const norm = r.title.toLowerCase()
      return !exclusions.some(e => norm.includes(e.toLowerCase()))
    })
  }, [minorRoles, levelFilter, exclusions])

  const stats = useMemo(() => {
    const all = [...filteredMajorRoles, ...filteredMinorRoles]
    const byLevel: Record<string, number> = {}
    for (const r of all) {
      if (r.level) byLevel[r.level] = (byLevel[r.level] || 0) + 1
    }
    return { total: all.length, byLevel }
  }, [filteredMajorRoles, filteredMinorRoles])

  const rolesByDept = useMemo(() => {
    return DEPARTMENTS.map(dept => ({
      dept,
      label: DEPT_LABELS[dept],
      badge: DEPT_BADGE[dept],
      majors: filteredMajorRoles.filter(r => r.department === dept),
      minors: filteredMinorRoles.filter(r => r.department === dept),
    }))
  }, [filteredMajorRoles, filteredMinorRoles])

  function handleAddExclusion() {
    const kw = exclusionInput.trim().toLowerCase()
    if (kw && !exclusions.includes(kw)) {
      setExclusions(prev => [...prev, kw])
      setExclusionInput('')
    }
  }

  function toggleExclusion(kw: string) {
    setExclusions(prev =>
      prev.includes(kw) ? prev.filter(e => e !== kw) : [...prev, kw],
    )
  }

  function handleValidate() {
    const title = validationInput.trim()
    if (!title) return
    setValidationResult(validateRoleTitle(title, exclusions))
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-surface-900">Industry & Job Role Explorer</h2>
          <p className="text-sm text-surface-500 mt-0.5">
            {SECTORS.length} sectors · {majorRoles.length} major roles · {minorRoles.length} minor roles
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 text-xs text-surface-500">
          {LEVEL_ORDER.map(lv => (
            <span key={lv} className={`px-2 py-0.5 rounded ${LEVEL_BADGE[lv]}`}>
              {lv}: {stats.byLevel[lv] || 0}
            </span>
          ))}
        </div>
      </div>

      {/* Sector Selection */}
      <div className="card animate-slide-up">
        <div className="card-body space-y-3">
          <label className="block text-sm font-semibold text-surface-700">Select Sector (Industry)</label>
          <select
            value={selectedSector?.id ?? ''}
            onChange={e => {
              setSelectedSector(SECTORS.find(s => s.id === e.target.value) ?? null)
            }}
            className="select"
          >
            <option value="">— Choose a sector —</option>
            {SECTORS.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {selectedSector && (
            <div className="animate-fade-in">
              <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">
                Sub-Industries ({selectedSector.subIndustries.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedSector.subIndustries.map(si => (
                  <span key={si.id} className="chip-blue text-[11px]">{si.name}</span>
                ))}
              </div>
            </div>
          )}

          {!selectedSector && (
            <p className="text-sm text-surface-500 text-center py-6">
              Select a sector above to view sub-industries and relevant job roles
            </p>
          )}
        </div>
      </div>

      {/* Department Keyword Reference — shown when sector selected */}
      {selectedSector && (
        <div className="card border-brand-200 animate-slide-up">
          <div className="card-header bg-gradient-to-r from-brand-50 to-white">
            <h3 className="text-sm font-bold text-brand-800">Department Keyword Reference</h3>
            <p className="text-xs text-surface-500 mt-0.5">
              Keywords used to classify job titles into departments
            </p>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {(Object.entries(DEPARTMENT_KEYWORDS) as [Department, string[]][]).map(([dept, kws]) => (
                <div key={dept} className="border border-surface-200 rounded-lg p-2.5">
                  <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${DEPT_BADGE[dept]}`}>
                    {DEPT_LABELS[dept]}
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {kws.map(kw => (
                      <span key={kw} className="px-1.5 py-0.5 text-[10px] bg-surface-100 text-surface-600 rounded">{kw}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Level Filter */}
      {selectedSector && (
        <div className="card animate-slide-up">
          <div className="card-body">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-sm font-semibold text-surface-700 whitespace-nowrap">
                Filter by Level:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {LEVEL_FILTERS.map(f => {
                  const isActive = levelFilter === f.value
                  const level = f.value === 'all' ? null : f.value as Level
                  return (
                    <button
                      key={f.label}
                      onClick={() => setLevelFilter(f.value)}
                      className={cn(
                        'px-3 py-1.5 text-xs font-medium rounded-lg border transition-all',
                        isActive
                          ? level ? `${LEVEL_BADGE[level]} border-current shadow-sm` : 'bg-brand-100 text-brand-800 border-brand-300 shadow-sm font-semibold'
                          : 'bg-white text-surface-600 border-surface-300 hover:bg-surface-50',
                      )}
                    >
                      {f.label}
                      {f.value !== 'all' && stats.byLevel[f.value] !== undefined && (
                        <span className="ml-1 opacity-60">({stats.byLevel[f.value]})</span>
                      )}
                    </button>
                  )
                })}
              </div>
              <span className="text-xs text-surface-500 ml-auto">
                {stats.total} role{stats.total !== 1 ? 's' : ''} shown
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Roles Grid */}
      {selectedSector && (
        <div className="space-y-4 animate-slide-up">
          {/* Major Roles */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-surface-800">Major Roles — Department × Level</h3>
                <span className="badge-gray text-xs">{filteredMajorRoles.length}</span>
              </div>
              <p className="text-xs text-surface-500 mt-0.5">
                Primary designations formed by crossing each department with every seniority level
              </p>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {rolesByDept.filter(d => d.majors.length > 0).map(({ dept, label, badge, majors }) => (
                  <div key={dept} className="border border-surface-200 rounded-lg overflow-hidden">
                    <div className="px-3 py-2 bg-surface-50 border-b border-surface-200 flex items-center justify-between">
                      <span className={`badge text-[10px] uppercase tracking-wider ${badge}`}>{label}</span>
                      <button
                        onClick={() => {
                          const text = majors.map(r => r.title).join('\n')
                          navigator.clipboard.writeText(text).catch(() => {})
                        }}
                        className="text-[10px] text-surface-500 hover:text-surface-600 font-medium px-1.5 py-0.5 rounded hover:bg-surface-100 transition-colors"
                        title="Copy all role titles"
                      >
                        Copy All
                      </button>
                    </div>
                    <div className="p-2 space-y-0.5">
                      {majors.map(r => (
                        <div key={r.id} className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-surface-50 transition-colors text-xs">
                          <span className="font-medium text-surface-800">{r.title}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${LEVEL_BADGE[r.level!]}`}>
                            {r.level}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Minor Roles */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-surface-800">Minor Roles — Remaining Designations</h3>
                <span className="badge-gray text-xs">{filteredMinorRoles.length}</span>
              </div>
              <p className="text-xs text-surface-500 mt-0.5">
                Additional job titles that do not follow the strict Department × Level naming pattern
              </p>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {rolesByDept.filter(d => d.minors.length > 0).map(({ dept, label, badge, minors }) => (
                  <div key={dept} className="border border-surface-200 rounded-lg overflow-hidden">
                    <div className="px-3 py-2 bg-surface-50 border-b border-surface-200 flex items-center justify-between">
                      <span className={`badge text-[10px] uppercase tracking-wider ${badge}`}>{label}</span>
                      <button
                        onClick={() => {
                          const text = minors.map(r => r.title).join('\n')
                          navigator.clipboard.writeText(text).catch(() => {})
                        }}
                        className="text-[10px] text-surface-500 hover:text-surface-600 font-medium px-1.5 py-0.5 rounded hover:bg-surface-100 transition-colors"
                        title="Copy all role titles"
                      >
                        Copy All
                      </button>
                    </div>
                    <div className="p-2 space-y-0.5 max-h-64 overflow-y-auto">
                      {minors.map(r => (
                        <div key={r.id} className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-surface-50 transition-colors text-xs">
                          <span className="text-surface-700">{r.title}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${LEVEL_BADGE[r.level!]}`}>
                            {r.level}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5C Exclusion List */}
      <div className="card border-red-200 animate-slide-up">
        <div className="card-header bg-gradient-to-r from-red-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-red-800">5C: Title Blacklist</h3>
              <p className="text-xs text-surface-500 mt-0.5">Discard — no decision-making authority</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-surface-500">{exclusions.length} active</span>
              <button onClick={() => setExclusions(defaultExclusions)} className="btn-secondary btn-sm">Reset</button>
            </div>
          </div>
        </div>
        <div className="card-body space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {BLACKLIST_CATEGORIES.map(cat => {
              const activeCount = cat.keywords.filter(k => exclusions.includes(k)).length
              return (
                <div key={cat.category} className="border border-surface-200 rounded-lg p-2.5 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-surface-700">{cat.category}</span>
                    <span className="text-surface-500">{activeCount}/{cat.keywords.length}</span>
                  </div>
                  <p className="text-surface-500 mb-1.5 text-[11px]">{cat.reason}</p>
                  <div className="flex flex-wrap gap-1">
                    {cat.keywords.map(kw => {
                      const active = exclusions.includes(kw)
                      return (
                        <button
                          key={kw}
                          onClick={() => toggleExclusion(kw)}
                          className={cn(
                            'px-1.5 py-0.5 rounded text-[10px] border transition-all',
                            active
                              ? 'bg-red-100 text-red-700 border-red-200'
                              : 'bg-surface-50 text-surface-500 border-surface-200 hover:bg-surface-100',
                          )}
                        >
                          {kw}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={exclusionInput}
              onChange={e => setExclusionInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddExclusion() } }}
              placeholder="Add custom keyword..."
              className="input flex-1"
            />
            <button onClick={handleAddExclusion} className="btn-danger btn-sm">Add</button>
          </div>

          {exclusions.filter(k => !defaultExclusions.includes(k)).length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs text-surface-500">Custom:</span>
              {exclusions.filter(k => !defaultExclusions.includes(k)).map(kw => (
                <span key={kw} className="chip-amber inline-flex items-center gap-1">
                  {kw}
                  <button onClick={() => toggleExclusion(kw)} className="hover:text-amber-900 font-bold leading-none">×</button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Title Validation Tool */}
      <div className="card animate-slide-up">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-surface-800">Title Validation</h3>
            <span className="badge-gray text-[10px]">separate from role display</span>
          </div>
          <p className="text-xs text-surface-500 mt-0.5">
            Check any job title against the role database and exclusion list
          </p>
        </div>
        <div className="card-body space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={validationInput}
              onChange={e => setValidationInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleValidate() } }}
              placeholder="Enter a job title (e.g. VP of Engineering)..."
              className="input flex-1"
            />
            <button onClick={handleValidate} className="btn-primary btn-sm sm:self-auto">Validate</button>
          </div>

          {validationResult && (
            <div className={cn(
              'p-3 rounded-lg border text-sm animate-fade-in',
              validationResult.type === 'excluded' && 'bg-red-50 border-red-200 text-red-700',
              validationResult.type === 'major' && 'bg-emerald-50 border-emerald-200 text-emerald-700',
              validationResult.type === 'minor' && 'bg-blue-50 border-blue-200 text-blue-700',
              validationResult.type === 'unclassified' && 'bg-surface-50 border-surface-200 text-surface-600',
            )}>
              <div className="font-semibold mb-1.5 text-sm">"{validationResult.title}"</div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                <span>Classification: <strong className="capitalize">{validationResult.type}</strong></span>
                {validationResult.department && <span>Dept: <strong>{validationResult.department}</strong></span>}
                {validationResult.level && <span>Level: <strong>{validationResult.level}</strong></span>}
                {validationResult.role && <span>Matched: <strong>{validationResult.role.title}</strong></span>}
                {validationResult.excludedBy && <span>Blocked by: <strong>"{validationResult.excludedBy}"</strong></span>}
                {validationResult.matchedKeyword && <span>Keyword: <strong>{validationResult.matchedKeyword}</strong></span>}
                {validationResult.type === 'unclassified' && <span>No matching role found</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
