export type TitleLevel = 'c-level' | 'vp' | 'director' | 'manager' | 'staff'

export type TitleLevelSpec = 'c-level' | 'vp' | 'vp+' | 'director' | 'director+' | 'manager' | 'manager+' | 'staff' | 'staff+'

export type GeoGroup = 'APAC' | 'EMEA' | 'LATAM'

export type Department = 'HR' | 'IT' | 'Sales' | 'Marketing' | 'Finance' | 'Admin' | 'Facilities'

export type ValidationLevel = 'pass' | 'fail' | 'flag' | 'unknown'

export interface TIGERDSpec {
  id: string
  name: string
  targetTitle: TitleLevelSpec
  industry: string
  geoGroup: GeoGroup
  countries: string[]
  employeeSizeMin: number
  employeeSizeMax: number
  revenue: string
  domainLimit: number
}

export interface PreviousRole {
  title: string
  company: string
  startDate: string
  endDate: string
  durationYears: number
}

export interface ExtractedProfile {
  name: string
  title: string
  company: string
  location: string
  linkedinUrl: string
  hasPresent: boolean
  currentTenureYears: number
  employmentType: string
  locationType: string
  previousRoles: PreviousRole[]
  isDualEmployed: boolean
  rawText: string
}

export interface RuleResult {
  rule: string
  category: 'title' | 'department' | 'blacklist' | 'tenure' | 'dual' | 'dead' | 'special' | 'geo' | 'spec' | 'emp_type' | 'loc_type'
  level: ValidationLevel
  message: string
}

export interface TitleMappingResult {
  level: TitleLevel | null
  department: Department | null
  demoted: boolean
  demotionNote: string
}

export interface ValidationResult {
  profileId: string
  overall: 'pass' | 'fail' | 'flag' | 'error'
  titleMapping: TitleMappingResult
  rules: RuleResult[]
  flags: string[]
  deadContact: boolean
  blacklisted: boolean
}

export type UploadStatus = 'uploading' | 'parsing' | 'extracted' | 'validating' | 'done' | 'error'

export interface UploadedProfile {
  id: string
  fileName: string
  status: UploadStatus
  extraction: ExtractedProfile | null
  validation: ValidationResult | null
  hidden: boolean
  error?: string
}
