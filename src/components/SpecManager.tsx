import { useState, useEffect } from 'react'
import type { TIGERDSpec } from '../types'
import { loadSpecs, saveSpec, deleteSpec } from '../utils/storage'
import SpecForm from './SpecForm'
interface Props {
  onSelectSpec: (spec: TIGERDSpec) => void
}

export default function SpecManager({ onSelectSpec }: Props) {
  const [specs, setSpecs] = useState<TIGERDSpec[]>([])
  const [editing, setEditing] = useState<TIGERDSpec | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { setSpecs(loadSpecs()) }, [])

  const refresh = () => setSpecs(loadSpecs())

  const handleSave = (spec: TIGERDSpec) => {
    saveSpec(spec)
    refresh()
    setEditing(null)
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    deleteSpec(id)
    refresh()
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-surface-900">TIGER+D Spec Templates</h2>
          <p className="text-sm text-surface-500">Define targeting criteria for profile validation</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="btn-primary btn-sm self-start"
        >
          + New Spec
        </button>
      </div>

      {showForm && (
        <div className="card">
          <div className="card-body">
            <SpecForm initial={editing} onSave={handleSave} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {specs.length === 0 && !showForm && (
        <div className="card text-center py-10">
          <p className="text-surface-500 text-sm">No specs saved yet. Create one to start validating profiles.</p>
        </div>
      )}

      <div className="grid gap-3">
        {specs.map(spec => (
          <div key={spec.id} className="card hover:border-brand-200 transition-all animate-slide-up">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-3 p-4">
              <div className="space-y-2 w-full">
                <h3 className="font-semibold text-surface-900">{spec.name}</h3>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <span className="badge-blue">{spec.targetTitle}</span>
                  {spec.industry && <span className="badge-green">{spec.industry}</span>}
                  <span className="badge-purple">{spec.geoGroup} ({spec.countries.length} countries)</span>
                  <span className="badge-orange">{spec.employeeSizeMin}-{spec.employeeSizeMax} emp.</span>
                  <span className="badge-gray">Limit: {spec.domainLimit}/domain</span>
                </div>
              </div>
              <div className="flex gap-2 self-end sm:self-center">
                <button onClick={() => onSelectSpec(spec)} className="btn-primary btn-sm">Use</button>
                <button onClick={() => { setEditing(spec); setShowForm(true) }} className="btn-secondary btn-sm">Edit</button>
                <button onClick={() => handleDelete(spec.id)} className="btn-danger btn-sm">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
