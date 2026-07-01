import type { GeoGroup } from '../types'

export const GEO_COUNTRIES: Record<GeoGroup, { label: string; countries: { code: string; name: string }[] }> = {
  APAC: {
    label: 'Asia Pacific',
    countries: [
      { code: 'AU', name: 'Australia' },
      { code: 'NZ', name: 'New Zealand' },
      { code: 'IN', name: 'India' },
      { code: 'JP', name: 'Japan' },
      { code: 'CN', name: 'China' },
      { code: 'KR', name: 'South Korea' },
      { code: 'SG', name: 'Singapore' },
      { code: 'HK', name: 'Hong Kong' },
      { code: 'MY', name: 'Malaysia' },
      { code: 'ID', name: 'Indonesia' },
      { code: 'TH', name: 'Thailand' },
      { code: 'VN', name: 'Vietnam' },
      { code: 'PH', name: 'Philippines' },
      { code: 'TW', name: 'Taiwan' },
      { code: 'BD', name: 'Bangladesh' },
      { code: 'PK', name: 'Pakistan' },
      { code: 'LK', name: 'Sri Lanka' },
      { code: 'MM', name: 'Myanmar' },
      { code: 'KH', name: 'Cambodia' },
      { code: 'NP', name: 'Nepal' },
      { code: 'BN', name: 'Brunei' },
    ],
  },
  EMEA: {
    label: 'Europe, Middle East & Africa',
    countries: [
      { code: 'DE', name: 'Germany' },
      { code: 'AT', name: 'Austria' },
      { code: 'CH', name: 'Switzerland' },
      { code: 'SE', name: 'Sweden' },
      { code: 'NO', name: 'Norway' },
      { code: 'DK', name: 'Denmark' },
      { code: 'FI', name: 'Finland' },
      { code: 'BE', name: 'Belgium' },
      { code: 'NL', name: 'Netherlands' },
      { code: 'LU', name: 'Luxembourg' },
      { code: 'GB', name: 'United Kingdom' },
      { code: 'IE', name: 'Ireland' },
      { code: 'FR', name: 'France' },
      { code: 'IT', name: 'Italy' },
      { code: 'ES', name: 'Spain' },
      { code: 'PT', name: 'Portugal' },
      { code: 'PL', name: 'Poland' },
      { code: 'CZ', name: 'Czech Republic' },
      { code: 'HU', name: 'Hungary' },
      { code: 'RO', name: 'Romania' },
      { code: 'AE', name: 'UAE' },
      { code: 'SA', name: 'Saudi Arabia' },
      { code: 'QA', name: 'Qatar' },
      { code: 'KW', name: 'Kuwait' },
      { code: 'IL', name: 'Israel' },
      { code: 'TR', name: 'Turkey' },
      { code: 'ZA', name: 'South Africa' },
      { code: 'NG', name: 'Nigeria' },
      { code: 'KE', name: 'Kenya' },
      { code: 'RU', name: 'Russia' },
    ],
  },
  LATAM: {
    label: 'Latin America',
    countries: [
      { code: 'US', name: 'United States' },
      { code: 'CA', name: 'Canada' },
      { code: 'MX', name: 'Mexico' },
      { code: 'BR', name: 'Brazil' },
      { code: 'AR', name: 'Argentina' },
      { code: 'CL', name: 'Chile' },
      { code: 'CO', name: 'Colombia' },
      { code: 'PE', name: 'Peru' },
      { code: 'UY', name: 'Uruguay' },
      { code: 'CR', name: 'Costa Rica' },
      { code: 'PA', name: 'Panama' },
      { code: 'DO', name: 'Dominican Republic' },
    ],
  },
}

export function getAllCountryNames(): string[] {
  return Object.values(GEO_COUNTRIES).flatMap(g => g.countries.map(c => c.name))
}

export function checkGeography(location: string, specCountries: string[]): boolean {
  const loc = location.toLowerCase()
  return specCountries.some(c => loc.includes(c.toLowerCase()))
}
