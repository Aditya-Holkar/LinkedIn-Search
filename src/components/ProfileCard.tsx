import type { UploadedProfile } from '../types'
import { cn } from '../lib/utils'
import ExtractionPreview from './ExtractionPreview'
import ValidationReport from './ValidationReport'

interface Props {
  profile: UploadedProfile
  specSelected: boolean
  onUpdateExtraction: (id: string, extraction: UploadedProfile['extraction']) => void
  onValidate: (id: string) => void
  onRemove: (id: string) => void
  onToggleHidden: (id: string) => void
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  uploading: { label: 'Uploading...', cls: 'badge-gray' },
  parsing: { label: 'Parsing PDF...', cls: 'badge-blue' },
  extracted: { label: 'Ready', cls: 'badge-green' },
  validating: { label: 'Validating...', cls: 'badge-amber' },
  done: { label: 'Done', cls: 'badge-green' },
  error: { label: 'Error', cls: 'badge-red' },
}

export default function ProfileCard({ profile, specSelected, onUpdateExtraction, onValidate, onRemove, onToggleHidden }: Props) {
  const { id, fileName, status, extraction, validation, error, hidden } = profile
  const badge = STATUS_BADGE[status] || STATUS_BADGE.error

  return (
    <div className={cn('card overflow-hidden transition-all animate-slide-up', hidden && 'opacity-40')}>
      <div className="flex items-center justify-between gap-2 px-4 py-3 bg-surface-50 border-b border-surface-200">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-surface-800 truncate">{fileName}</span>
          <span className={badge.cls}>{badge.label}</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {validation && (
            <button
              onClick={() => onToggleHidden(id)}
              className="text-sm text-surface-500 hover:text-surface-600"
              title={hidden ? 'Show in results' : 'Hide from results'}
            >
              {hidden ? '👁‍🗨' : '👁'}
            </button>
          )}
          <button onClick={() => onRemove(id)} className="text-surface-500 hover:text-red-600 text-sm ml-1">✕</button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {status === 'error' && (
          <p className="text-sm text-red-600">{error || 'Failed to process'}</p>
        )}

        {status === 'parsing' && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin h-6 w-6 border-2 border-brand-600 border-t-transparent rounded-full" />
            <span className="ml-2 text-sm text-surface-500">Extracting text from PDF...</span>
          </div>
        )}

        {extraction && (
          <>
            <ExtractionPreview extraction={extraction} onChange={updated => onUpdateExtraction(id, updated)} />

            {!validation && specSelected && (
              <button
                onClick={() => onValidate(id)}
                className="btn-primary w-full"
              >
                Validate Against Spec
              </button>
            )}

            {!validation && !specSelected && (
              <p className="text-xs text-amber-600 text-center">Select a TIGER+D spec first to validate</p>
            )}
          </>
        )}

        {validation && <ValidationReport validation={validation} />}
      </div>
    </div>
  )
}
