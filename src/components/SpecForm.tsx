import { useState } from 'react'
import type { TIGERDSpec, TitleLevelSpec, GeoGroup } from '../types'
import { GEO_COUNTRIES } from '../engine/geoMapping'
import { getDefaultSpec } from '../utils/storage'
import { cn } from '../lib/utils'

interface Props {
  initial: TIGERDSpec | null
  onSave: (spec: TIGERDSpec) => void
  onCancel: () => void
}

const LEVELS: { value: TitleLevelSpec; label: string }[] = [
  { value: 'c-level', label: 'C-Level only' },
  { value: 'vp+', label: 'VP and above (VP, C-Level)' },
  { value: 'vp', label: 'VP only' },
  { value: 'director+', label: 'Director and above (Dir, VP, C-Level)' },
  { value: 'director', label: 'Director only' },
  { value: 'manager+', label: 'Manager and above (Mgr, Dir, VP, C-Level)' },
  { value: 'manager', label: 'Manager only' },
  { value: 'staff+', label: 'All levels (Staff and above)' },
  { value: 'staff', label: 'Staff only' },
]

const GEO_GROUPS: GeoGroup[] = ['APAC', 'EMEA', 'LATAM']

export default function SpecForm({ initial, onSave, onCancel }: Props) {
  const [spec, setSpec] = useState<TIGERDSpec>(initial || getDefaultSpec())

  const update = (patch: Partial<TIGERDSpec>) => setSpec(s => ({ ...s, ...patch }))

  const handleGeoChange = (group: GeoGroup) => {
    const countries = GEO_COUNTRIES[group].countries.map(c => c.name)
    setSpec(prev => ({ ...prev, geoGroup: group, countries }))
  }

  const toggleCountry = (country: string) => {
    setSpec(prev => {
      const next = prev.countries.includes(country)
        ? prev.countries.filter(c => c !== country)
        : [...prev.countries, country]
      return { ...prev, countries: next }
    })
  }

  const selectAll = () => {
    const all = GEO_COUNTRIES[spec.geoGroup].countries.map(c => c.name)
    setSpec(prev => ({ ...prev, countries: all }))
  }

  const deselectAll = () => {
    setSpec(prev => ({ ...prev, countries: [] }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...spec,
      id: spec.id || crypto.randomUUID(),
      name: spec.name || `Spec ${new Date().toLocaleDateString()}`,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-surface-700 mb-1">Spec Name</label>
          <input
            type="text" value={spec.name} required
            onChange={e => update({ name: e.target.value })}
            className="input"
            placeholder="e.g. IT Directors EMEA"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">Target Title (T)</label>
          <select
            value={spec.targetTitle}
            onChange={e => update({ targetTitle: e.target.value as TitleLevelSpec })}
            className="select"
          >
            {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">Industry (I)</label>
          <input
            type="text" value={spec.industry}
            onChange={e => update({ industry: e.target.value })}
            className="input"
            placeholder="e.g. IT, Healthcare"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">Geography Group (G)</label>
          <select
            value={spec.geoGroup}
            onChange={e => handleGeoChange(e.target.value as GeoGroup)}
            className="select"
          >
            {GEO_GROUPS.map(g => <option key={g} value={g}>{g} — {GEO_COUNTRIES[g].label}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Emp. Min (E)</label>
            <input
              type="number" value={spec.employeeSizeMin} min={0}
              onChange={e => update({ employeeSizeMin: parseInt(e.target.value) || 0 })}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Emp. Max (E)</label>
            <input
              type="number" value={spec.employeeSizeMax} min={1}
              onChange={e => update({ employeeSizeMax: parseInt(e.target.value) || 1000 })}
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">Revenue (R) — optional</label>
          <input
            type="text" value={spec.revenue}
            onChange={e => update({ revenue: e.target.value })}
            className="input"
            placeholder="e.g. $50M+"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1">Domain Limit (D)</label>
          <input
            type="number" value={spec.domainLimit} min={1}
            onChange={e => update({ domainLimit: parseInt(e.target.value) || 1 })}
            className="input"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-surface-700">Countries in {spec.geoGroup}</label>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-surface-500">{spec.countries.length}/{GEO_COUNTRIES[spec.geoGroup].countries.length} selected</span>
            <button type="button" onClick={selectAll} className="text-brand-600 hover:text-brand-800 font-medium">Select All</button>
            <button type="button" onClick={deselectAll} className="text-surface-500 hover:text-surface-700 font-medium">Clear</button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto border border-surface-200 rounded-lg p-3">
          {GEO_COUNTRIES[spec.geoGroup].countries.map(c => {
            const selected = spec.countries.includes(c.name)
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => toggleCountry(c.name)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer select-none',
                  selected
                    ? 'bg-blue-200 border-blue-400 text-blue-900 font-semibold shadow-sm'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50',
                )}
              >
                {selected ? '✓ ' : ''}{c.name} ({c.code})
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary">Save Spec</button>
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
      </div>
    </form>
  )
}
