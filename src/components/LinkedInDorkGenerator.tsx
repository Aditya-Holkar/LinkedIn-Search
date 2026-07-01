import { useState, useMemo } from 'react'
import { SECTORS } from '../data/sectors'
import { BLACKLIST_CATEGORIES } from '../engine/blacklist'
import { cn } from '../lib/utils'

interface LevelDef {
  key: string
  label: string
  badge: string
  patterns: string[]
}

const LEVEL_DEFS: LevelDef[] = [
  {
    key: 'c-level',
    label: 'C-Level',
    badge: 'level-badge-cl',
    patterns: ['CEO', 'CFO', 'CTO', 'CIO', 'COO', 'CMO', 'CHRO', 'CSO', 'CDO', 'CPO', 'CAO', 'President', 'Founder', 'Chairman', 'Managing Director', 'Board Member'],
  },
  {
    key: 'vp',
    label: 'Vice President',
    badge: 'level-badge-vp',
    patterns: ['VP', 'SVP', 'EVP', 'AVP', 'Group VP', 'Global VP', 'Regional VP', 'Senior VP', 'Head of'],
  },
  {
    key: 'director',
    label: 'Director/Head',
    badge: 'level-badge-dir',
    patterns: ['Director', 'Senior Director', 'Executive Director', 'Group Director', 'Global Director', 'Regional Director', 'Head of'],
  },
  {
    key: 'manager',
    label: 'Manager',
    badge: 'level-badge-mgr',
    patterns: ['Manager', 'Senior Manager', 'Regional Manager', 'Global Manager', 'Group Manager', 'Team Lead', 'Supervisor', 'Lead', 'Assistant Director', 'Deputy Director', 'Associate Director'],
  },
  {
    key: 'staff',
    label: 'Staff',
    badge: 'level-badge-staff',
    patterns: ['Executive', 'Specialist', 'Associate', 'Representative', 'Analyst', 'Administrative', 'Coordinator', 'Officer', 'Agent', 'Consultant', 'Advisor', 'Engineer', 'Architect', 'Developer', 'Technician'],
  },
]

const EMP_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Self-employed'] as const
const LOC_TYPES = ['On-site', 'Hybrid', 'Remote'] as const

interface DorkSection {
  label: string
  value: string
  color: string
}

export default function LinkedInDorkGenerator() {
  const defaultExclusions = BLACKLIST_CATEGORIES.flatMap(c => c.keywords)

  const [industry, setIndustry] = useState('')
  const [location, setLocation] = useState('')
  const [empSizeMin, setEmpSizeMin] = useState('50')
  const [empSizeMax, setEmpSizeMax] = useState('5000')
  const [selectedLevels, setSelectedLevels] = useState<Set<string>>(new Set(['c-level', 'vp', 'director', 'manager']))
  const [selectedEmpTypes, setSelectedEmpTypes] = useState<Set<string>>(new Set(['Full-time']))
  const [selectedLocTypes, setSelectedLocTypes] = useState<Set<string>>(new Set())
  const [tenureMax, setTenureMax] = useState('5')
  const [requirePresent, setRequirePresent] = useState(true)
  const [exclusions, setExclusions] = useState<string[]>(defaultExclusions)
  const [exclusionInput, setExclusionInput] = useState('')
  const [copied, setCopied] = useState(false)

  const titleTerms = useMemo(() => {
    const terms = new Set<string>()
    for (const lv of LEVEL_DEFS) {
      if (selectedLevels.has(lv.key)) {
        for (const p of lv.patterns) terms.add(p)
      }
    }
    return [...terms]
  }, [selectedLevels])

  const levelSummary = useMemo(() => {
    return LEVEL_DEFS.filter(l => selectedLevels.has(l.key)).map(l => l.label).join(', ') || 'None'
  }, [selectedLevels])

  const titleDork = useMemo(() => {
    if (titleTerms.length === 0) return ''
    const quoted = titleTerms.map(t => `"${t}"`)
    if (quoted.length === 1) return quoted[0]
    return `(${quoted.join(' OR ')})`
  }, [titleTerms])

  const exclusionDork = useMemo(() => {
    const ex = exclusions.filter(e => e.split(' ').length <= 2).slice(0, 8)
    return ex.map(kw => `-"${kw}"`).join(' ')
  }, [exclusions])

  const sections: DorkSection[] = useMemo(() => {
    const result: DorkSection[] = [
      { label: 'Site', value: 'site:linkedin.com/in', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    ]
    if (industry) result.push({ label: 'Industry', value: `"${industry}"`, color: 'bg-teal-100 text-teal-800 border-teal-200' })
    if (location) result.push({ label: 'Location', value: `"${location}"`, color: 'bg-cyan-100 text-cyan-800 border-cyan-200' })
    if (titleDork) result.push({ label: 'Title Match', value: titleDork, color: 'bg-indigo-100 text-indigo-800 border-indigo-200' })
    if (exclusionDork) result.push({ label: 'Exclusions', value: exclusionDork, color: 'bg-red-100 text-red-800 border-red-200' })
    return result
  }, [industry, location, titleDork, exclusionDork])

  function toggleLevel(key: string) {
    setSelectedLevels(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function toggleSet(set: Set<string>, key: string, setter: (s: Set<string>) => void) {
    const next = new Set(set)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setter(next)
  }

  function toggleExclusion(kw: string) {
    setExclusions(prev =>
      prev.includes(kw) ? prev.filter(e => e !== kw) : [...prev, kw],
    )
  }

  function handleAddExclusion() {
    const kw = exclusionInput.trim().toLowerCase()
    if (kw && !exclusions.includes(kw)) {
      setExclusions(prev => [...prev, kw])
      setExclusionInput('')
    }
  }

  const allDorkParts = useMemo(() => {
    const parts: string[] = ['site:linkedin.com/in']
    if (industry) parts.push(`"${industry}"`)
    if (location) parts.push(`"${location}"`)
    if (titleDork) parts.push(titleDork)
    if (exclusionDork) parts.push(exclusionDork)
    return parts
  }, [industry, location, titleDork, exclusionDork])

  const allDorkText = allDorkParts.join(' ')

  async function handleCopy() {
    if (!allDorkText) return
    try {
      await navigator.clipboard.writeText(allDorkText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-surface-900">Google Dork Generator</h2>
        <p className="text-sm text-surface-500 mt-0.5">
          Build a Google dork to find LinkedIn profiles matching your criteria
        </p>
      </div>

      {/* Targeting Criteria */}
      <div className="bg-white border border-surface-200 rounded-xl p-4 sm:p-5 space-y-4">
        <h3 className="text-sm font-bold text-surface-800">Targeting Criteria</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Industry</label>
            <select
              value={industry}
              onChange={e => setIndustry(e.target.value)}
              className="select"
            >
              <option value="">— Select industry —</option>
              {SECTORS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. United Kingdom, Germany, APAC"
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Emp. Min</label>
              <input
                type="number" value={empSizeMin} min={0}
                onChange={e => setEmpSizeMin(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Emp. Max</label>
              <input
                type="number" value={empSizeMax} min={1}
                onChange={e => setEmpSizeMax(e.target.value)}
                className="input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Management Level */}
      <div className="bg-white border border-surface-200 rounded-xl p-4">
        <h3 className="text-sm font-bold text-surface-800 mb-3">Management Level</h3>
        <div className="flex flex-wrap gap-2">
          {LEVEL_DEFS.map(lv => {
            const active = selectedLevels.has(lv.key)
            return (
              <label
                key={lv.key}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-sm',
                  active
                    ? 'bg-brand-50 border-brand-300 text-brand-800 font-semibold'
                    : 'bg-white border-surface-200 text-surface-600 hover:bg-surface-50',
                )}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggleLevel(lv.key)}
                  className="w-4 h-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
                />
                {lv.label}
              </label>
            )
          })}
        </div>
      </div>

      {/* Profile Filters */}
      <div className="bg-white border border-surface-200 rounded-xl p-4 space-y-4">
        <h3 className="text-sm font-bold text-surface-800">Profile Filters</h3>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-surface-700 whitespace-nowrap">Max tenure:</label>
            <div className="flex items-center gap-1">
              <input
                type="number" value={tenureMax} min={0} max={50}
                onChange={e => setTenureMax(e.target.value)}
                className="w-16 px-2 py-1.5 text-sm border border-surface-300 rounded-lg"
              />
              <span className="text-xs text-surface-500">yrs</span>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={requirePresent}
              onChange={() => setRequirePresent(p => !p)}
              className="w-4 h-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-surface-700">Must have "Present"</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-surface-600 mb-1.5">Employment Type</label>
            <div className="flex flex-wrap gap-1.5">
              {EMP_TYPES.map(t => {
                const active = selectedEmpTypes.has(t)
                return (
                  <label
                    key={t}
                    className={cn(
                      'px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all text-xs',
                      active
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                        : 'bg-white border-surface-200 text-surface-500 hover:bg-surface-50',
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleSet(selectedEmpTypes, t, setSelectedEmpTypes)}
                      className="sr-only"
                    />
                    {t}
                  </label>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-600 mb-1.5">Location Type</label>
            <div className="flex flex-wrap gap-1.5">
              {LOC_TYPES.map(t => {
                const active = selectedLocTypes.has(t)
                return (
                  <label
                    key={t}
                    className={cn(
                      'px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all text-xs',
                      active
                        ? 'bg-purple-50 border-purple-300 text-purple-800 font-semibold'
                        : 'bg-white border-surface-200 text-surface-500 hover:bg-surface-50',
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleSet(selectedLocTypes, t, setSelectedLocTypes)}
                      className="sr-only"
                    />
                    {t}
                  </label>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Exclusion List */}
      <div className="bg-white border border-red-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-red-800">Exclusion Keywords</h3>
            <p className="text-xs text-surface-500 mt-0.5">
              Titles containing these keywords will be excluded from the search
            </p>
          </div>
          <button onClick={() => setExclusions(defaultExclusions)} className="btn-secondary btn-sm">Reset</button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {exclusions.map(kw => (
            <button
              key={kw}
              onClick={() => toggleExclusion(kw)}
              className={cn(
                'px-1.5 py-0.5 rounded text-[10px] border transition-all',
                exclusions.includes(kw)
                  ? 'bg-red-100 text-red-700 border-red-200'
                  : 'bg-surface-50 text-surface-500 border-surface-200',
              )}
            >
              {kw}
            </button>
          ))}
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
      </div>

      {/* Generated Dork — Section Wise */}
      {allDorkParts.length > 1 && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white border border-surface-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-surface-50 border-b border-surface-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-surface-800">Generated Dork — Section View</h3>
                <p className="text-xs text-surface-500">Each section is a building block of your search</p>
              </div>
              <button onClick={handleCopy} className="btn-primary btn-sm">
                {copied ? 'Copied!' : 'Copy Full Dork'}
              </button>
            </div>
            <div className="p-4 space-y-3">
              {sections.map((s, i) => (
                <div key={i} className={cn('border rounded-lg overflow-hidden', s.color)}>
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border-b bg-black/5">
                    {s.label}
                  </div>
                  <div className="px-3 py-2 text-xs font-mono break-all">
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-surface-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-brand-50 border-b border-surface-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand-800">Full Dork (single line)</h3>
                <p className="text-xs text-surface-500">Copy this into Google search</p>
              </div>
              <button onClick={handleCopy} className="btn-secondary btn-sm">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="p-4">
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(allDorkText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-surface-700 font-mono hover:text-brand-600 break-all"
              >
                {allDorkText}
              </a>
            </div>
          </div>

          <div className="text-xs text-surface-500 space-y-0.5">
            <p>Targeting: {industry || 'Any industry'} · {location || 'Any location'} · Levels: {levelSummary} · Emp size: {empSizeMin}-{empSizeMax}</p>
            <p>Filters: {selectedEmpTypes.size > 0 ? [...selectedEmpTypes].join(', ') : 'Any type'} · {selectedLocTypes.size > 0 ? [...selectedLocTypes].join(', ') : 'Any location type'} · Max tenure: {tenureMax}yr · {requirePresent ? 'Present required' : 'Present not required'}</p>
            <p>Exclusions: {exclusions.length} keyword(s) · Title patterns: {titleTerms.length > 0 ? titleTerms.slice(0, 8).join(', ') + (titleTerms.length > 8 ? '...' : '') : 'None'}</p>
          </div>
        </div>
      )}

      {allDorkParts.length <= 1 && (
        <div className="text-center py-12 text-surface-500 text-sm">
          Fill in the criteria above to generate the dork
        </div>
      )}
    </div>
  )
}
