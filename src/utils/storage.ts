import type { TIGERDSpec } from '../types'

const SPECS_KEY = 'cdqa_specs'

export function loadSpecs(): TIGERDSpec[] {
  try {
    const raw = localStorage.getItem(SPECS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveSpec(spec: TIGERDSpec): void {
  const specs = loadSpecs().filter(s => s.id !== spec.id)
  specs.push(spec)
  localStorage.setItem(SPECS_KEY, JSON.stringify(specs))
}

export function deleteSpec(id: string): void {
  const specs = loadSpecs().filter(s => s.id !== id)
  localStorage.setItem(SPECS_KEY, JSON.stringify(specs))
}

export function getDefaultSpec(): TIGERDSpec {
  return {
    id: '',
    name: '',
    targetTitle: 'director+',
    industry: '',
    geoGroup: 'APAC',
    countries: ['Australia', 'New Zealand'],
    employeeSizeMin: 0,
    employeeSizeMax: 5000,
    revenue: '',
    domainLimit: 1,
  }
}
