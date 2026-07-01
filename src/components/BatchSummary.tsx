import type { UploadedProfile, TIGERDSpec } from '../types'
import { cn } from '../lib/utils'

interface Props {
  profiles: UploadedProfile[]
  spec: TIGERDSpec | null
  onReset: () => void
  onRemove: (id: string) => void
  onToggleHidden: (id: string) => void
}

export default function BatchSummary({ profiles, spec, onReset, onRemove, onToggleHidden }: Props) {
  const allDone = profiles.filter(p => p.status === 'done' && p.validation)
  const done = allDone.filter(p => !p.hidden)
  if (done.length === 0 && allDone.length === 0) return null

  const visibleCount = done.length
  const hiddenCount = allDone.length - visibleCount

  const passed = done.filter(p => p.validation!.overall === 'pass')
  const flagged = done.filter(p => p.validation!.overall === 'flag')
  const failed = done.filter(p => p.validation!.overall === 'fail')

  const allFlags = done.flatMap(p => p.validation!.flags)
  const flagCounts = allFlags.reduce((acc, f) => {
    acc[f] = (acc[f] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-surface-900">Batch Results</h2>
          {spec && (
            <p className="text-xs text-surface-500 mt-0.5">
              Spec: <span className="font-medium text-surface-700">{spec.name}</span>
              {' · '}{spec.targetTitle}{spec.industry ? ` · ${spec.industry}` : ''}{' · '}{spec.geoGroup}
            </p>
          )}
        </div>
        <button onClick={onReset} className="btn-secondary btn-sm self-start">Clear All</button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-emerald-700">{passed.length}</div>
          <div className="text-xs text-emerald-600 font-medium">Passed</div>
        </div>
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-amber-700">{flagged.length}</div>
          <div className="text-xs text-amber-600 font-medium">Flagged</div>
        </div>
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-red-700">{failed.length}</div>
          <div className="text-xs text-red-600 font-medium">Failed</div>
        </div>
      </div>

      {hiddenCount > 0 && (
        <p className="text-xs text-surface-500">{hiddenCount} profile(s) hidden</p>
      )}

      {Object.keys(flagCounts).length > 0 && (
        <div className="card">
          <div className="card-body">
            <h4 className="text-sm font-bold text-surface-700 mb-2">Common Flags</h4>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(flagCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([flag, count]) => (
                  <span key={flag} className="chip-amber text-xs">
                    {flag.replace(/_/g, ' ')}: {count}
                  </span>
                ))}
            </div>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-200 bg-surface-50">
                <th className="text-left py-2.5 px-3 text-surface-500 font-semibold text-xs uppercase tracking-wider">Name</th>
                <th className="text-left py-2.5 px-3 text-surface-500 font-semibold text-xs uppercase tracking-wider">Title</th>
                <th className="text-left py-2.5 px-3 text-surface-500 font-semibold text-xs uppercase tracking-wider hidden sm:table-cell">Company</th>
                <th className="text-center py-2.5 px-3 text-surface-500 font-semibold text-xs uppercase tracking-wider">Level</th>
                <th className="text-center py-2.5 px-3 text-surface-500 font-semibold text-xs uppercase tracking-wider">Status</th>
                <th className="text-center py-2.5 px-3 text-surface-500 font-semibold text-xs uppercase tracking-wider w-16">Show</th>
                <th className="text-center py-2.5 px-3 text-surface-500 font-semibold text-xs uppercase tracking-wider w-10"></th>
              </tr>
            </thead>
            <tbody>
              {allDone.map(p => {
                const v = p.validation!
                const statusBadge = v.overall === 'pass' ? 'badge-green'
                  : v.overall === 'flag' ? 'badge-amber'
                  : 'badge-red'
                return (
                  <tr key={p.id} className={cn(
                    'border-b border-surface-100 hover:bg-surface-50 transition-colors',
                    p.hidden && 'opacity-40',
                  )}>
                    <td className="py-2.5 px-3 font-medium text-surface-800">{p.extraction?.name || p.fileName}</td>
                    <td className="py-2.5 px-3 text-surface-600 max-w-[200px] truncate">{p.extraction?.title || '-'}</td>
                    <td className="py-2.5 px-3 text-surface-600 hidden sm:table-cell">{p.extraction?.company || '-'}</td>
                    <td className="py-2.5 px-3 text-center">
                      {v.titleMapping.level && (
                        <span className="badge-blue text-[10px]">{v.titleMapping.level}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={cn('capitalize', statusBadge)}>{v.overall}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => onToggleHidden(p.id)}
                        className="text-surface-500 hover:text-surface-600"
                        title={p.hidden ? 'Show' : 'Hide'}
                      >
                        {p.hidden ? '👁‍🗨' : '👁'}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button onClick={() => onRemove(p.id)} className="text-surface-500 hover:text-red-500" title="Remove">✕</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-xs text-surface-500 text-right">
        {allDone.length} profile(s) validated
      </div>
    </div>
  )
}
