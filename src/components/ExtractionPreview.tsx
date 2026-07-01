import type { ExtractedProfile } from '../types'

interface Props {
  extraction: ExtractedProfile
  onChange: (updated: ExtractedProfile) => void
}

export default function ExtractionPreview({ extraction, onChange }: Props) {
  const update = (field: string, value: string) => {
    onChange({ ...extraction, [field]: value })
  }

  const fields: { label: string; key: 'name' | 'title' | 'company' | 'location' | 'linkedinUrl' }[] = [
    { label: 'Full Name', key: 'name' },
    { label: 'Job Title', key: 'title' },
    { label: 'Company', key: 'company' },
    { label: 'Location', key: 'location' },
    { label: 'LinkedIn URL', key: 'linkedinUrl' },
  ]

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-bold text-surface-600 uppercase tracking-wider">Extracted Fields</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {fields.map(f => (
          <div key={f.key}>
            <label className="block text-xs text-surface-500 mb-0.5">{f.label}</label>
            <input
              type="text"
              value={extraction[f.key]}
              onChange={e => update(f.key, e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-surface-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-surface-500">
        <span className="flex items-center gap-1">
          <span className={`inline-block w-2 h-2 rounded-full ${extraction.hasPresent ? 'bg-emerald-500' : 'bg-red-500'}`} />
          Has "Present": {extraction.hasPresent ? 'Yes' : 'No'}
        </span>
        <span className="flex items-center gap-1">
          <span className={`inline-block w-2 h-2 rounded-full ${!extraction.isDualEmployed ? 'bg-emerald-500' : 'bg-red-500'}`} />
          Single employer: {extraction.isDualEmployed ? 'No (flagged)' : 'Yes'}
        </span>
      </div>
    </div>
  )
}
