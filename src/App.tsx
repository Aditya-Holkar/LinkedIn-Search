import { useState, useCallback } from 'react'
import type { TIGERDSpec, UploadedProfile, ExtractedProfile } from './types'
import { validateProfile } from './engine/rules'
import { extractTextFromPDF, parseLinkedInProfile, ocrPage1 } from './utils/pdfExtractor'
import { cn } from './lib/utils'
import SpecManager from './components/SpecManager'
import UploadZone from './components/UploadZone'
import ProfileCard from './components/ProfileCard'
import BatchSummary from './components/BatchSummary'
import IndustryRolesPanel from './components/IndustryRolesPanel'
import LinkedInDorkGenerator from './components/LinkedInDorkGenerator'
import CompanyEnricher from './components/CompanyEnricher'
import ManualPage from './components/ManualPage'

type Tab = 'specs' | 'validate' | 'results' | 'roles' | 'dork' | 'enrich' | 'manual'

const TABS: { key: Tab; label: string }[] = [
  { key: 'manual', label: '📖 Manual' },
  { key: 'specs', label: '📋 Specs' },
  { key: 'validate', label: '📤 Validate' },
  { key: 'results', label: '📊 Results' },
  { key: 'roles', label: '🎯 Roles' },
  { key: 'dork', label: '🔗 Dork' },
  { key: 'enrich', label: '🏢 Company' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('specs')
  const [selectedSpec, setSelectedSpec] = useState<TIGERDSpec | null>(null)
  const [profiles, setProfiles] = useState<UploadedProfile[]>([])

  const handleSelectSpec = useCallback((spec: TIGERDSpec) => {
    setSelectedSpec(spec)
    setActiveTab('validate')
  }, [])

  const handleFiles = useCallback(async (files: File[]) => {
    const newProfiles: UploadedProfile[] = files.map(f => ({
      id: crypto.randomUUID(),
      fileName: f.name,
      status: 'parsing',
      extraction: null,
      validation: null,
      hidden: false,
    }))

    setProfiles(prev => [...prev, ...newProfiles])

    for (const [i, file] of files.entries()) {
      const profileIdx = (prev: UploadedProfile[]) => prev.findIndex(p => p.id === newProfiles[i].id)

      try {
        const { text, fontSizes } = await extractTextFromPDF(file)
        let extraction = parseLinkedInProfile({ text, fontSizes })

        if (!extraction.name || extraction.name.toLowerCase() === extraction.title.toLowerCase()) {
          try {
            const ocrText = await ocrPage1(file)
            const ocrExtraction = parseLinkedInProfile({ text: ocrText, fontSizes: [] })
            extraction = {
              ...extraction,
              name: (!extraction.name || extraction.name.toLowerCase() === extraction.title.toLowerCase()) && ocrExtraction.name ? ocrExtraction.name : extraction.name,
              title: !extraction.title && ocrExtraction.title ? ocrExtraction.title : extraction.title,
              company: !extraction.company && ocrExtraction.company ? ocrExtraction.company : extraction.company,
              location: !extraction.location && ocrExtraction.location ? ocrExtraction.location : extraction.location,
            }
          } catch {}
        }

        setProfiles(prev => {
          const idx = profileIdx(prev)
          if (idx === -1) return prev
          const updated = [...prev]
          updated[idx] = { ...updated[idx], extraction, status: 'extracted' }
          return updated
        })
      } catch (err) {
        setProfiles(prev => {
          const idx = profileIdx(prev)
          if (idx === -1) return prev
          const updated = [...prev]
          updated[idx] = { ...updated[idx], status: 'error', error: String(err) }
          return updated
        })
      }
    }
  }, [])

  const handleUpdateExtraction = useCallback((id: string, extraction: ExtractedProfile | null) => {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, extraction } : p))
  }, [])

  const handleValidate = useCallback((id: string) => {
    if (!selectedSpec) return
    setProfiles(prev => {
      const idx = prev.findIndex(p => p.id === id)
      if (idx === -1 || !prev[idx].extraction) return prev
      const updated = [...prev]
      const profile = updated[idx]
      const validation = validateProfile(profile.extraction!, selectedSpec)
      updated[idx] = { ...profile, validation, status: 'done' }
      return updated
    })
  }, [selectedSpec])

  const handleValidateAll = useCallback(() => {
    if (!selectedSpec) return
    setProfiles(prev => prev.map(p =>
      p.extraction && !p.validation
        ? { ...p, validation: validateProfile(p.extraction, selectedSpec), status: 'done' as const }
        : p
    ))
  }, [selectedSpec])

  const handleRemoveProfile = useCallback((id: string) => {
    setProfiles(prev => prev.filter(p => p.id !== id))
  }, [])

  const handleToggleHidden = useCallback((id: string) => {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, hidden: !p.hidden } : p))
  }, [])

  const handleClearAll = useCallback(() => {
    setProfiles([])
  }, [])

  const doneCount = profiles.filter(p => p.status === 'done' && p.validation).length

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="bg-white border-b border-surface-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold">
                CD
              </div>
              <div>
                <h1 className="text-lg font-bold text-surface-900">CDQA Profile Validator</h1>
                <p className="text-xs text-surface-500 hidden sm:block">Contact Discovery & Quality Assurance</p>
              </div>
            </div>
            {selectedSpec && (
              <div className="text-xs text-surface-500 bg-surface-50 px-3 py-1.5 rounded-lg border border-surface-200">
                Active spec: <span className="font-semibold text-surface-700">{selectedSpec.name}</span>
              </div>
            )}
          </div>

          <nav className="flex gap-1 mt-3 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            {TABS.map(t => {
              const count = t.key === 'validate' ? profiles.length : t.key === 'results' ? doneCount : null
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap',
                    activeTab === t.key
                      ? 'bg-brand-100 text-brand-800 font-semibold border border-brand-300 shadow-sm'
                      : 'text-surface-500 hover:text-surface-700 hover:bg-surface-100',
                  )}
                >
                  {t.label}
                  {count !== null && count > 0 && (
                    <span className={cn(
                      'ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full',
                      activeTab === t.key ? 'bg-brand-200 text-brand-800' : 'bg-surface-200 text-surface-600',
                    )}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'specs' && (
          <SpecManager onSelectSpec={handleSelectSpec} />
        )}

        {activeTab === 'validate' && (
          <div className="space-y-5 animate-fade-in">
            {!selectedSpec && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                No spec selected. Go to{' '}
                <button onClick={() => setActiveTab('specs')} className="underline font-semibold">Specs</button>
                {' '}tab to create or select one first.
              </div>
            )}

            <UploadZone onFiles={handleFiles} disabled={!selectedSpec} />

            {profiles.length > 0 && (
              <>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-white border border-surface-200 rounded-xl">
                  <span className="text-sm text-surface-600 font-medium">{profiles.length} profile(s) uploaded</span>
                  {selectedSpec && profiles.some(p => p.extraction && !p.validation) && (
                    <button
                      onClick={handleValidateAll}
                      className="btn-primary btn-sm"
                    >
                      Validate All ({profiles.filter(p => p.extraction && !p.validation).length})
                    </button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {profiles.map(p => (
                    <ProfileCard
                      key={p.id}
                      profile={p}
                      specSelected={selectedSpec !== null}
                      onUpdateExtraction={handleUpdateExtraction}
                      onValidate={handleValidate}
                      onRemove={handleRemoveProfile}
                      onToggleHidden={handleToggleHidden}
                    />
                  ))}
                </div>
              </>
            )}

            {profiles.length === 0 && selectedSpec && (
              <p className="text-center text-surface-500 text-sm py-12">
                Drop LinkedIn profile PDFs above to begin
              </p>
            )}
          </div>
        )}

        {activeTab === 'results' && (
          <BatchSummary
            profiles={profiles}
            spec={selectedSpec}
            onReset={handleClearAll}
            onRemove={handleRemoveProfile}
            onToggleHidden={handleToggleHidden}
          />
        )}

        {activeTab === 'roles' && (
          <IndustryRolesPanel />
        )}

        {activeTab === 'dork' && (
          <LinkedInDorkGenerator />
        )}

        {activeTab === 'enrich' && (
          <CompanyEnricher />
        )}

        {activeTab === 'manual' && (
          <ManualPage />
        )}
      </main>
    </div>
  )
}
