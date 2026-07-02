import { useState, useRef, useCallback } from 'react'
import { cn } from '../lib/utils'
import {
  searchCompany,
  generateDorks,
  type CompanySearchResult,
  type DorkGroup,
} from '../utils/companySearch'

type Phase = 'idle' | 'searching' | 'done' | 'error'

const AUTO_TIMEOUT = 8000

export default function CompanyEnricher() {
  const [company, setCompany] = useState('')
  const [address, setAddress] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [result, setResult] = useState<CompanySearchResult | null>(null)
  const [dorkGroups, setDorkGroups] = useState<DorkGroup[]>([])
  const [error, setError] = useState<string | null>(null)
  const [copiedIdx, setCopiedIdx] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<'auto' | 'dork'>('auto')
  const abortRef = useRef<AbortController | null>(null)

  const handleSearch = useCallback(async () => {
    const trimmed = company.trim()
    if (!trimmed) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setPhase('searching')
    setError(null)
    setResult(null)
    setDorkGroups([])
    setActiveSection('auto')

    const timeoutId = setTimeout(() => controller.abort(), AUTO_TIMEOUT)

    try {
      const res = await searchCompany(trimmed, address, controller.signal)
      clearTimeout(timeoutId)
      setResult(res)
      const dorks = generateDorks(trimmed, address || undefined, res.domain || undefined)
      setDorkGroups(dorks)

      if (!res.autoFound) {
        setError('Auto-discovery found nothing (site may block CORS). Try the dorks below.')
        setActiveSection('dork')
      }
      setPhase('done')
    } catch (err: any) {
      clearTimeout(timeoutId)
      if (err?.name === 'AbortError') {
        setError('Auto-discovery timed out (CORS likely blocking). Showing dorks instead.')
      } else {
        setError(String(err?.message || 'Search failed'))
      }
      const dorks = generateDorks(trimmed, address || undefined)
      setDorkGroups(dorks)
      setActiveSection('dork')
      setPhase('done')
    }
  }, [company, address])

  const handleCopy = useCallback(async (text: string, idx: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 2000)
    } catch { }
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }, [handleSearch])

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-surface-900">🏢 Company Enricher</h2>
        <p className="text-sm text-surface-500 mt-0.5">
          Find email format, addresses, phone numbers &amp; timezone for any company
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white border border-surface-200 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-surface-700 mb-1">Company Name</label>
            <input
              type="text"
              value={company}
              onChange={e => setCompany(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Hiscox, Siemens, BMW"
              className="input"
              disabled={phase === 'searching'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Address / Country</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Germany, Munich, London"
              className="input"
              disabled={phase === 'searching'}
            />
          </div>
        </div>
        <button
          onClick={handleSearch}
          disabled={!company.trim() || phase === 'searching'}
          className="btn-primary"
        >
          {phase === 'searching' ? 'Searching...' : '🔍 Enrich'}
        </button>
      </div>

      {/* Loading */}
      {phase === 'searching' && (
        <div className="bg-white border border-surface-200 rounded-xl p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-surface-500">
            Trying auto-discovery (Wikipedia, domain fetch)...<br />
            <span className="text-xs text-surface-400">Times out after 8s if CORS blocks it</span>
          </p>
        </div>
      )}

      {/* Error banner */}
      {error && phase === 'done' && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
          {error}
        </div>
      )}

      {/* Results */}
      {phase === 'done' && dorkGroups.length > 0 && (
        <>
          {/* Toggle */}
          {result?.autoFound && (
            <div className="flex gap-1 p-1 bg-surface-100 rounded-xl w-fit">
              <button
                onClick={() => setActiveSection('auto')}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg transition-all',
                  activeSection === 'auto'
                    ? 'bg-white text-surface-900 shadow-sm border border-surface-200'
                    : 'text-surface-500 hover:text-surface-700',
                )}
              >
                🤖 Auto-Discovery
              </button>
              <button
                onClick={() => setActiveSection('dork')}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg transition-all',
                  activeSection === 'dork'
                    ? 'bg-white text-surface-900 shadow-sm border border-surface-200'
                    : 'text-surface-500 hover:text-surface-700',
                )}
              >
                🔎 Google Dorks
              </button>
            </div>
          )}

          {/* Auto Discovery Results */}
          {activeSection === 'auto' && result && (
            <div className="space-y-4">
              <div className="bg-white border border-surface-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-surface-50 border-b border-surface-200 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-surface-800">{result.company}</h3>
                  {result.websiteUrl && (
                    <a
                      href={result.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand-600 hover:underline"
                    >
                      {result.domain}
                    </a>
                  )}
                </div>
                {result.description && (
                  <div className="px-4 py-3 text-sm text-surface-600 border-b border-surface-100">
                    {result.description.slice(0, 300)}
                  </div>
                )}
              </div>

              <SectionCard title="📧 Email Format">
                {result.emailFormat ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <code className="px-3 py-1.5 bg-brand-50 text-brand-800 border border-brand-200 rounded-lg font-mono text-sm font-semibold">
                        {result.emails.find(e => e.type === 'person')?.address.split('@')[0]?.includes('.')
                          ? `${result.emailFormat}@${result.domain?.replace(/^www\./, '')}`
                          : `${result.emailFormat}@domain`}
                      </code>
                    </div>
                    <p className="text-xs text-surface-500">Pattern: <span className="font-mono">{result.emailFormat}</span></p>
                    {result.emails.length > 0 && (
                      <div className="pt-2 border-t border-surface-100">
                        <p className="text-xs font-semibold text-surface-600 mb-1.5">Emails found ({result.emails.length}):</p>
                        <div className="flex flex-wrap gap-1.5">
                          {result.emails.map((e, i) => (
                            <span
                              key={i}
                              className={cn(
                                'px-2 py-0.5 rounded text-xs font-mono border',
                                e.type === 'person'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-surface-50 text-surface-600 border-surface-200',
                              )}
                            >
                              {e.address}
                              <span className={cn(
                                'ml-1 text-[9px] uppercase',
                                e.type === 'person' ? 'text-emerald-500' : 'text-surface-400',
                              )}>
                                {e.type}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-surface-500">No emails found.</p>
                )}
              </SectionCard>

              <SectionCard title="📍 Addresses">
                {result.filteredAddresses.length > 0 ? (
                  <div className="space-y-2">
                    {result.filteredAddresses.map((addr, i) => (
                      <div key={i} className="px-3 py-2 bg-surface-50 rounded-lg text-sm text-surface-700 font-mono text-xs">
                        {addr}
                      </div>
                    ))}
                    {address && result.addresses.length > result.filteredAddresses.length && (
                      <p className="text-xs text-surface-400 pt-1">
                        Showing {result.filteredAddresses.length} of {result.addresses.length} addresses (filtered to "{address}")
                      </p>
                    )}
                  </div>
                ) : result.addresses.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-amber-600">No addresses matching "{address}" found.</p>
                    <details className="text-xs text-surface-400">
                      <summary className="cursor-pointer hover:text-surface-600">Show all {result.addresses.length} addresses</summary>
                      <div className="mt-2 space-y-1">
                        {result.addresses.map((addr, i) => (
                          <div key={i} className="px-2 py-1 bg-surface-50 rounded text-xs font-mono">{addr}</div>
                        ))}
                      </div>
                    </details>
                  </div>
                ) : (
                  <p className="text-sm text-surface-500">No addresses found.</p>
                )}
              </SectionCard>

              <SectionCard title="📞 Phone Numbers">
                {result.phonesNonTollFree.length > 0 ? (
                  <div className="space-y-2">
                    {result.phonesNonTollFree.map((p, i) => (
                      <div key={i} className="px-3 py-2 bg-surface-50 rounded-lg text-sm text-surface-700 font-mono text-xs flex items-center justify-between">
                        <span>{p.formatted}</span>
                        <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Direct
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-surface-500">No phones found.</p>
                )}
              </SectionCard>

              <SectionCard title="🕐 Timezone">
                {result.timezone ? (
                  <div className="space-y-1">
                    <code className="px-3 py-1.5 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-lg font-mono text-sm font-semibold">
                      {result.timezone}
                    </code>
                    <p className="text-xs text-surface-500 mt-1">
                      {address ? `Based on: ${address}` : 'Based on found addresses'}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-surface-500">Could not detect.</p>
                )}
              </SectionCard>
            </div>
          )}

          {/* Dork Results */}
          {activeSection === 'dork' && (
            <div className="space-y-4">
              {dorkGroups.map((group, gi) => (
                <div key={gi} className="bg-white border border-surface-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-surface-50 border-b border-surface-200">
                    <h3 className="text-sm font-bold text-surface-800">{group.label}</h3>
                  </div>
                  <div className="divide-y divide-surface-100">
                    {group.dorks.map((dork, di) => {
                      const idx = `${gi}-${di}`
                      return (
                        <div key={di} className="p-4 space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-surface-800">{dork.label}</p>
                              <p className="text-xs text-surface-500 mt-0.5">{dork.description}</p>
                            </div>
                            <button
                              onClick={() => handleCopy(dork.query, idx)}
                              className="btn-secondary btn-sm shrink-0"
                            >
                              {copiedIdx === idx ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                          <div className="bg-surface-50 rounded-lg p-3">
                            <a
                              href={`https://www.google.com/search?q=${encodeURIComponent(dork.query)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-surface-700 font-mono hover:text-brand-600 break-all"
                            >
                              {dork.query}
                            </a>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}

              <div className="text-xs text-surface-500 text-center py-2">
                Click a dork to copy, or click the link to open in Google
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {phase === 'idle' && (
        <div className="text-center py-12 text-surface-500 text-sm">
          Enter a company name and click <strong>Enrich</strong>
        </div>
      )}
    </div>
  )
}

function SectionCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white border border-surface-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 bg-surface-50 border-b border-surface-200">
        <h3 className="text-sm font-bold text-surface-800">{title}</h3>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}
