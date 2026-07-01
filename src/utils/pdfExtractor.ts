import type { ExtractedProfile } from '../types'

export interface PDFExtractionResult {
  text: string
  fontSizes: number[]
}

const SECTION_HEADERS = ['contact', 'top skills', 'skills', 'languages', 'summary', 'about',
  'experience', 'education', 'certifications', 'projects', 'volunteer', 'publications', 'honors']

const MONTH = '(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)'

export async function extractTextFromPDF(file: File): Promise<PDFExtractionResult> {
  const arrayBuffer = await file.arrayBuffer()
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString()

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let text = ''
  const fontSizes: number[] = []
  let currentMax = 0

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const items = content.items as any[]

    let lastY = -1
    for (const item of items) {
      const y = Math.round(item.transform[5])
      const fs = Math.round(item.transform[0] * 10) / 10

      if (lastY !== -1 && y !== lastY) {
        text += '\n'
        fontSizes.push(currentMax)
        currentMax = 0
      } else if (lastY !== -1) {
        text += ' '
      }

      text += item.str
      if (fs > currentMax) currentMax = fs
      lastY = y
    }
    text += '\n'
    if (currentMax > 0) {
      fontSizes.push(currentMax)
      currentMax = 0
    }
  }

  return { text, fontSizes }
}

export function parseLinkedInProfile(result: PDFExtractionResult): ExtractedProfile {
  const rawLines = result.text.split('\n')
  const lines: string[] = []
  const fontSizes: number[] = []
  for (let i = 0; i < rawLines.length; i++) {
    const l = rawLines[i].trim()
    if (l) {
      lines.push(l)
      fontSizes.push(result.fontSizes[i] || 0)
    }
  }

  const name = extractName(lines, fontSizes)
  const linkedinUrl = extractLinkedInUrl(lines, result.text)
  const rawText = result.text
  const expStart = lines.findIndex(l => /^experience\b/i.test(l))
  let company = ''
  let title = ''
  let location = ''
  let dateSpan = ''
  let hasPresent = false
  let currentTenureYears = 0

  if (expStart !== -1) {
    const afterExp = lines.slice(expStart + 1)
    const durationRe = /^\d+\s*(?:year|yr)s?\s*(?:\d+\s*(?:month|mon)s?)?/i
    const dateRe = new RegExp(`^${MONTH}\\s+\\d{4}`, 'i')
    const sectionRe = /^(education|skills|languages|summary|about|certifications|projects|volunteer|honors|publications)/i

    let state: 'company' | 'nextOrTitle' | 'title' | 'date' | 'location' = 'company'

    for (const line of afterExp) {
      if (sectionRe.test(line) || line.startsWith('•') || line.startsWith('Page') || line.length < 2) break

      if (state === 'company') {
        company = line
        state = 'nextOrTitle'
      } else if (state === 'nextOrTitle') {
        if (durationRe.test(line)) continue
        if (dateRe.test(line)) {
          dateSpan = line
          state = 'location'
        } else {
          title = line
          state = 'title'
        }
      } else if (state === 'title') {
        if (dateRe.test(line)) {
          dateSpan = line
          state = 'location'
        }
      } else if (state === 'location') {
        location = line
        break
      }
    }

    hasPresent = /\bpresent\b/i.test(dateSpan)
    const tenureMatch = dateSpan.match(/\((\d+)\s*years?\s*(?:\d+\s*months?)?\)/i)
    if (tenureMatch) currentTenureYears = parseInt(tenureMatch[1], 10)
  }

  return {
    name,
    title,
    company,
    location,
    linkedinUrl,
    hasPresent,
    currentTenureYears,
    employmentType: '',
    locationType: '',
    previousRoles: [],
    isDualEmployed: false,
    rawText,
  }
}

const TITLE_WORDS = new Set([
  'manager', 'director', 'vp', 'vice', 'president', 'head', 'lead',
  'chief', 'officer', 'engineer', 'executive', 'specialist', 'coordinator',
  'analyst', 'consultant', 'associate', 'representative', 'assistant',
  'senior', 'junior', 'marketing', 'sales', 'product', 'project', 'brand',
  'digital', 'content', 'customer', 'relationship', 'management',
  'principal', 'staff', 'intern', 'trainee', 'partner', 'owner',
  'founder', 'co-founder', 'ceo', 'cto', 'cfo', 'coo', 'direct',
  'strategy', 'operations', 'development', 'design', 'creative',
  'technical', 'business', 'key', 'account', 'regional', 'global',
])

function extractName(lines: string[], fontSizes: number[]): string {
  const isHeader = (s: string) => SECTION_HEADERS.some(h => s.toLowerCase().startsWith(h))
  const expIdx = lines.findIndex(l => /^experience\b/i.test(l))
  const searchEnd = expIdx === -1 ? lines.length : expIdx

  const isNameLine = (s: string) => {
    if (isHeader(s) || /^page\s+\d+/i.test(s) || s.startsWith('www.') || s.startsWith('http')) return false
    const parts = s.split(/\s+/)
    if (parts.length < 2 || parts.length > 4) return false
    if (!/^[A-Z]/.test(parts[0]) || !/^[A-Z]/.test(parts[1])) return false
    const lowerWords = parts.map(w => w.replace(/[^a-z]/g, '').toLowerCase()).filter(Boolean)
    if (lowerWords.length >= 2 && lowerWords.every(w => TITLE_WORDS.has(w))) return false
    return true
  }

  let bestLine = ''
  let bestSize = 0

  for (let i = 0; i < searchEnd; i++) {
    if (!isNameLine(lines[i])) continue
    if (fontSizes[i] > bestSize) {
      bestSize = fontSizes[i]
      bestLine = lines[i]
    }
  }

  if (bestLine) return bestLine

  for (let i = 0; i < searchEnd; i++) {
    if (isHeader(lines[i]) || /^page\s+\d+/i.test(lines[i]) || lines[i].startsWith('www.') || lines[i].startsWith('http')) continue
    const parts = lines[i].split(/\s+/)
    if (parts.length < 2 || parts.length > 4) continue
    if (!/^[A-Z]/.test(parts[0]) || !/^[A-Z]/.test(parts[1])) continue
    return lines[i]
  }
  return lines[0] || ''
}

function extractLinkedInUrl(lines: string[], raw: string): string {
  const contactIdx = lines.findIndex(l => /^contact\b/i.test(l))
  const searchWindow = contactIdx === -1
    ? lines
    : lines.slice(Math.max(0, contactIdx - 1), contactIdx + 15)

  for (const line of searchWindow) {
    const m = line.match(/(?:www\.)?linkedin\.com\/in\/[\w.-]+/)
    if (m) {
      const url = m[0].replace(/[)\s]+$/, '')
      return url.startsWith('www.') ? url : 'www.' + url
    }
  }

  const joined = searchWindow.join('')
  const m = joined.match(/(?:www\.)?linkedin\.com\/in\/[\w.-]+/)
  if (m) {
    const url = m[0].replace(/[)\s]+$/, '')
    return url.startsWith('www.') ? url : 'www.' + url
  }

  const fallback = raw.match(/(?:www\.)?linkedin\.com\/in\/[\w.-]+/)
  if (fallback) {
    const url = fallback[0].replace(/[)\s]+$/, '')
    return url.startsWith('www.') ? url : 'www.' + url
  }
  return ''
}

export async function ocrPage1(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString()

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const page = await pdf.getPage(1)
  const viewport = page.getViewport({ scale: 2 })
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  await page.render({ canvasContext: ctx, viewport }).promise

  const Tesseract = await import('tesseract.js')
  const { data } = await Tesseract.recognize(canvas, 'eng', {
    logger: () => {},
  })
  return data.text
}
