import { useCallback, useRef, useState } from 'react'
import { cn } from '../lib/utils'

interface Props {
  onFiles: (files: File[]) => void
  disabled?: boolean
}

export default function UploadZone({ onFiles, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf')
    if (files.length > 0) onFiles(files)
  }, [onFiles])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => f.type === 'application/pdf')
    if (files.length > 0) onFiles(files)
    e.target.value = ''
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
        dragging
          ? 'border-brand-400 bg-brand-50 scale-[1.01]'
          : 'border-surface-300 hover:border-brand-300 hover:bg-surface-50',
        disabled && 'opacity-50 pointer-events-none',
      )}
    >
      <input ref={inputRef} type="file" multiple accept=".pdf" onChange={handleChange} className="hidden" />
      <div className="space-y-2">
        <div className="text-4xl">📄</div>
        <p className="text-surface-700 font-medium">Drop LinkedIn profile PDFs here, or click to browse</p>
        <p className="text-surface-500 text-sm">Supports multiple PDF files at once</p>
      </div>
    </div>
  )
}
