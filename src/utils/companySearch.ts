export interface FoundEmail {
  address: string
  type: 'person' | 'generic'
}

export interface FoundPhone {
  number: string
  formatted: string
  tollFree: boolean
  note?: string
}

export interface CompanySearchResult {
  company: string
  country: string
  domain: string | null
  websiteUrl: string | null
  description: string | null
  emails: FoundEmail[]
  emailFormat: string | null
  phones: FoundPhone[]
  phonesNonTollFree: FoundPhone[]
  addresses: string[]
  filteredAddresses: string[]
  timezone: string | null
  autoFound: boolean
  errors: string[]
}

const PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
]

const GENERIC_EMAIL_PREFIXES = new Set([
  'info', 'contact', 'support', 'sales', 'hello', 'team', 'hi', 'help',
  'admin', 'jobs', 'careers', 'press', 'media', 'pr', 'partners',
  'billing', 'accounts', 'feedback', 'newsletter', 'noc', 'webmaster',
  'postmaster', 'abuse', 'enquiries', 'enquiry', 'office', 'mail',
  'service', 'services', 'hr', 'recruitment', 'marketing',
])

const COUNTRY_TZ: Record<string, string> = {
  DE: 'Europe/Berlin', AT: 'Europe/Vienna', CH: 'Europe/Zurich',
  GB: 'Europe/London', FR: 'Europe/Paris', IT: 'Europe/Rome',
  ES: 'Europe/Madrid', PT: 'Europe/Lisbon', NL: 'Europe/Amsterdam',
  BE: 'Europe/Brussels', LU: 'Europe/Luxembourg', DK: 'Europe/Copenhagen',
  SE: 'Europe/Stockholm', NO: 'Europe/Oslo', FI: 'Europe/Helsinki',
  PL: 'Europe/Warsaw', CZ: 'Europe/Prague', HU: 'Europe/Budapest',
  RO: 'Europe/Bucharest', RU: 'Europe/Moscow', TR: 'Europe/Istanbul',
  IE: 'Europe/Dublin', US: 'America/New_York', CA: 'America/Toronto',
  MX: 'America/Mexico_City', BR: 'America/Sao_Paulo', AR: 'America/Argentina/Buenos_Aires',
  CL: 'America/Santiago', CO: 'America/Bogota', JP: 'Asia/Tokyo',
  CN: 'Asia/Shanghai', HK: 'Asia/Hong_Kong', SG: 'Asia/Singapore',
  IN: 'Asia/Kolkata', KR: 'Asia/Seoul', AU: 'Australia/Sydney',
  NZ: 'Pacific/Auckland', ZA: 'Africa/Johannesburg', NG: 'Africa/Lagos',
  KE: 'Africa/Nairobi', AE: 'Asia/Dubai', SA: 'Asia/Riyadh',
  QA: 'Asia/Qatar', IL: 'Asia/Jerusalem', MY: 'Asia/Kuala_Lumpur',
  ID: 'Asia/Jakarta', TH: 'Asia/Bangkok', VN: 'Asia/Ho_Chi_Minh',
  PH: 'Asia/Manila', TW: 'Asia/Taipei', BD: 'Asia/Dhaka',
  PK: 'Asia/Karachi', LK: 'Asia/Colombo',
}

const COUNTRY_CITIES: Record<string, string[]> = {
  germany: ['germany', 'deutschland', 'de', 'berlin', 'munich', 'münchen', 'hamburg', 'frankfurt',
    'cologne', 'köln', 'stuttgart', 'düsseldorf', 'dusseldorf', 'leipzig', 'dresden', 'hannover',
    'nürnberg', 'nuremberg', 'bremen', 'bonn', 'dortmund', 'essen', 'bielefeld', 'mannheim',
    'baden', 'bayern', 'bavaria', 'sachsen', 'hessen', 'nordrhein', 'westfalen', 'arnulfstraße',
    'schönhauser'],
  'united kingdom': ['uk', 'united kingdom', 'great britain', 'england', 'scotland', 'wales',
    'northern ireland', 'london', 'manchester', 'birmingham', 'glasgow', 'edinburgh', 'liverpool',
    'bristol', 'leeds', 'sheffield', 'newcastle', 'belfast', 'cardiff', 'southampton', 'oxford',
    'cambridge', 'maidenhead', 'colchester', 'york', 'ec2n', 'ec3', 'sw1', 'w1', 'n1', 'se1'],
  france: ['france', 'frankreich', 'fr', 'paris', 'lyon', 'marseille', 'bordeaux', 'toulouse',
    'lille', 'nice', 'strasbourg', 'nantes', 'montpellier', 'rennes', 'grenoble', 'rouen',
    'boulevard', 'avenue', 'bordeaux', 'neuilly', 'le-de-France'],
  usa: ['usa', 'united states', 'america', 'us', 'new york', 'california', 'chicago', 'los angeles',
    'san francisco', 'atlanta', 'miami', 'boston', 'seattle', 'houston', 'dallas', 'denver',
    'washington', 'philadelphia', 'phoenix', 'detroit', 'minneapolis', 'tampa', 'orlando',
    'charlotte', 'raleigh', 'nashville', 'portland', 'las vegas', 'san diego', 'austin',
    'concourse', 'parkway', 'peachtree', 'madison avenue', '5th avenue', 'nyc', 'silicon valley',
    'pitts bay road', 'bishopsgate'],
  spain: ['spain', 'spanien', 'es', 'madrid', 'barcelona', 'valencia', 'seville', 'sevilla',
    'bilbao', 'malaga', 'málaga', 'palma', 'alicante', 'granada', 'murcia', 'zaragoza'],
  italy: ['italy', 'italien', 'it', 'rome', 'rom', 'milan', 'milano', 'naples', 'napoli',
    'turin', 'torino', 'florence', 'firenze', 'venice', 'venezia', 'bologna', 'genoa', 'genova'],
  netherlands: ['netherlands', 'niederlande', 'nl', 'holland', 'amsterdam', 'rotterdam', 'the hague',
    'den haag', 'utrecht', 'eindhoven', 'groningen', 'maastricht', 'leiden', 'delft'],
  belgium: ['belgium', 'belgien', 'be', 'brussels', 'brüssel', 'antwerp', 'antwerpen', 'gent',
    'ghent', 'charleroi', 'liege', 'lüttich', 'bruges', 'brugge'],
  switzerland: ['switzerland', 'schweiz', 'suisse', 'swiss', 'ch', 'zurich', 'zürich', 'geneva',
    'genf', 'genève', 'basel', 'bern', 'berne', 'lausanne', 'lugano'],
  austria: ['austria', 'österreich', 'at', 'vienna', 'wien', 'salzburg', 'graz', 'linz',
    'innsbruck', 'klagenfurt'],
  sweden: ['sweden', 'schweden', 'se', 'stockholm', 'gothenburg', 'göteborg', 'malmö', 'uppsala',
    'lund', 'helsingborg'],
  denmark: ['denmark', 'dänemark', 'dk', 'copenhagen', 'kopenhagen', 'københavn', 'aarhus',
    'odense', 'aalborg'],
  norway: ['norway', 'norwegen', 'no', 'oslo', 'bergen', 'trondheim', 'stavanger', 'tromsø'],
  finland: ['finland', 'finnland', 'fi', 'helsinki', 'espoo', 'tampere', 'turku', 'oulu'],
  poland: ['poland', 'polen', 'pl', 'warsaw', 'warschau', 'warszawa', 'krakow', 'kraków',
    'wroclaw', 'wrocław', 'gdansk', 'gdańsk', 'poznan', 'poznań', 'lodz', 'łódź'],
  'czech republic': ['czech', 'tschechien', 'cz', 'prague', 'praha', 'brno', 'ostrava', 'pilsen'],
  hungary: ['hungary', 'ungarn', 'hu', 'budapest', 'debrecen', 'szeged', 'pecs', 'pécs'],
  portugal: ['portugal', 'pt', 'lisbon', 'lisboa', 'porto', 'braga', 'coimbra', 'faro'],
  ireland: ['ireland', 'irland', 'ie', 'dublin', 'cork', 'galway', 'limerick', 'belfast'],
  japan: ['japan', 'jp', 'tokyo', 'tokio', 'osaka', 'kyoto', 'yokohama', 'nagoya', 'sapporo',
    'kobe', 'fukuoka', 'kawasaki', 'saitama'],
  china: ['china', 'cn', 'beijing', 'peking', 'shanghai', 'guangzhou', 'shenzhen', 'tianjin',
    'hangzhou', 'chengdu', 'nanjing', 'wuhan', 'xiamen'],
  india: ['india', 'in', 'mumbai', 'bombay', 'delhi', 'bangalore', 'bengaluru', 'hyderabad',
    'chennai', 'madras', 'kolkata', 'calcutta', 'ahmedabad', 'pune', 'jaipur'],
  australia: ['australia', 'au', 'sydney', 'melbourne', 'brisbane', 'perth', 'adelaide',
    'gold coast', 'canberra', 'newcastle', 'hobart'],
  'united arab emirates': ['uae', 'united arab emirates', 'dubai', 'abu dhabi', 'sharjah',
    'ajman', 'ras al khaimah'],
  singapore: ['singapore', 'sg', 'singapur'],
  'hong kong': ['hong kong', 'hk', 'hongkong'],
  'south korea': ['south korea', 'korea', 'kr', 'seoul', 'busan', 'incheon', 'daegu'],
  brazil: ['brazil', 'brasilien', 'br', 'são paulo', 'sao paulo', 'rio de janeiro', 'brasília',
    'salvador', 'fortaleza', 'belo horizonte', 'curitiba'],
  mexico: ['mexico', 'mx', 'mexiko', 'mexico city', 'ciudad de méxico', 'guadalajara', 'monterrey',
    'cancun', 'tijuana'],
  canada: ['canada', 'ca', 'kanada', 'toronto', 'vancouver', 'montreal', 'calgary', 'edmonton',
    'ottawa', 'quebec', 'winnipeg'],
  russia: ['russia', 'russland', 'ru', 'moscow', 'moskau', 'moskva', 'st petersburg',
    'saint petersburg', 'novosibirsk', 'yekaterinburg'],
  turkey: ['turkey', 'türkei', 'tr', 'istanbul', 'ankara', 'izmir', 'antalya', 'bursa'],
  'south africa': ['south africa', 'südafrika', 'za', 'johannesburg', 'cape town', 'durban',
    'pretoria', 'port elizabeth'],
  nigeria: ['nigeria', 'ng', 'lagos', 'abuja', 'ibadan', 'kano', 'port harcourt'],
  kenya: ['kenya', 'ke', 'nairobi', 'mombasa', 'kisumu', 'eldoret'],
}

function isTollFree(phone: string): boolean {
  const cleaned = phone.replace(/[^0-9+]/g, '')

  // North America (+1): 800/888/877/866/855/844/833/822
  if (/^\+?1\s*[-\s]?8(00|22|33|44|55|66|77|88)\b/.test(cleaned)) return true

  // UK freephone: 0800, 0808, 0500
  if (/^(\+?44\s*|0)800\b/.test(phone)) return true
  if (/^(\+?44\s*|0)808\b/.test(phone)) return true
  if (/^(\+?44\s*|0)500\b/.test(phone)) return true

  // Germany / Austria / Switzerland / Netherlands / Belgium / Luxembourg: 0800
  if (/^(\+?49\s*|0)800\b/.test(phone)) return true
  if (/^(\+?43\s*|0)800\b/.test(phone)) return true
  if (/^(\+?41\s*|0)800\b/.test(phone)) return true
  if (/^(\+?31\s*|0)800\b/.test(phone)) return true
  if (/^(\+?32\s*|0)800\b/.test(phone)) return true
  if (/^(\+?352\s*|0)800\b/.test(phone)) return true

  // France: 0800, 0805, 0809
  if (/^(\+?33\s*|0)80[05]\b/.test(phone)) return true

  // Italy: 800, 803, 840, 841, 892 (numero verde / servizi)
  if (/^(\+?39\s*|0)800\b/.test(phone)) return true
  if (/^(\+?39\s*|0)803\b/.test(phone)) return true
  if (/^(\+?39\s*|0)840\b/.test(phone)) return true
  if (/^(\+?39\s*|0)841\b/.test(phone)) return true
  if (/^(\+?39\s*|0)892\b/.test(phone)) return true

  // Spain: 900, 800
  if (/^(\+?34\s*|0)900\b/.test(phone)) return true
  if (/^(\+?34\s*|0)800\b/.test(phone)) return true

  // Sweden: 020, 0200
  if (/^(\+?46\s*|0)20\b/.test(phone)) return true

  // Denmark: 80 (freephone starts with 80)
  if (/^(\+?45\s*|0)80\d{2,}\b/.test(cleaned)) return true

  // Norway: 800, 810
  if (/^(\+?47\s*|0)800\b/.test(phone)) return true
  if (/^(\+?47\s*|0)810\b/.test(phone)) return true

  // Poland: 800
  if (/^(\+?48\s*|0)800\b/.test(phone)) return true

  // Finland: 0800
  if (/^(\+?358\s*|0)800\b/.test(phone)) return true

  // Portugal: 800
  if (/^(\+?351\s*|0)800\b/.test(phone)) return true

  // Ireland: 1800
  if (/^(\+?353\s*|0)1800\b/.test(phone)) return true

  // Australia: 1800, 1300
  if (/^(\+?61\s*|0)1800\b/.test(phone)) return true
  if (/^(\+?61\s*|0)1300\b/.test(phone)) return true

  // New Zealand: 0800, 0508
  if (/^(\+?64\s*|0)800\b/.test(phone)) return true
  if (/^(\+?64\s*|0)508\b/.test(phone)) return true

  // Japan: 0120
  if (/^(\+?81\s*|0)120\b/.test(phone)) return true

  // India: 1800, 1860
  if (/^(\+?91\s*|0)1800\b/.test(phone)) return true
  if (/^(\+?91\s*|0)1860\b/.test(phone)) return true

  // Brazil: 0800, 0300
  if (/^(\+?55\s*|0)800\b/.test(phone)) return true
  if (/^(\+?55\s*|0)300\b/.test(phone)) return true

  // Mexico: 800
  if (/^(\+?52\s*|0)800\b/.test(phone)) return true

  // China: 800
  if (/^(\+?86\s*|0)800\b/.test(phone)) return true

  // Hong Kong: 800
  if (/^(\+?852\s*|0)800\b/.test(phone)) return true

  // Singapore: 1800
  if (/^(\+?65\s*|0)1800\b/.test(phone)) return true

  // Malaysia: 1800, 1300
  if (/^(\+?60\s*|0)1800\b/.test(phone)) return true
  if (/^(\+?60\s*|0)1300\b/.test(phone)) return true

  // Thailand: 1800
  if (/^(\+?66\s*|0)1800\b/.test(phone)) return true

  // Indonesia: 0800, 007
  if (/^(\+?62\s*|0)800\b/.test(phone)) return true
  if (/^(\+?62\s*|0)07\b/.test(phone)) return true

  // Philippines: 1800
  if (/^(\+?63\s*|0)1800\b/.test(phone)) return true

  // Taiwan: 0800, 0809
  if (/^(\+?886\s*|0)800\b/.test(phone)) return true

  // South Korea: 080, 1544, 1566
  if (/^(\+?82\s*|0)80\b/.test(phone)) return true

  // Russia: 8-800
  if (/^(\+?7\s*|8)\s*800\b/.test(phone)) return true

  // UAE: 800
  if (/^(\+?971\s*|0)800\b/.test(phone)) return true

  // South Africa: 0800
  if (/^(\+?27\s*|0)800\b/.test(phone)) return true

  // Turkey: 0800
  if (/^(\+?90\s*|0)800\b/.test(phone)) return true

  // International Freephone: +800 / 00800
  if (/^\+800\b/.test(cleaned)) return true
  if (/^00800\b/.test(cleaned)) return true

  return false
}

function isGenericEmail(email: string): boolean {
  const prefix = email.split('@')[0].toLowerCase()
  return GENERIC_EMAIL_PREFIXES.has(prefix) || /^\d+$/.test(prefix)
}

function guessEmailFormat(emails: FoundEmail[]): string | null {
  const personEmails = emails.filter(e => e.type === 'person')
  if (personEmails.length === 0) return null

  const formats = new Map<string, number>()

  for (const e of personEmails) {
    const [prefix] = e.address.split('@')
    if (!prefix) continue
    if (prefix.includes('.')) {
      const parts = prefix.split('.')
      if (parts.length === 2) formats.set('first.last', (formats.get('first.last') || 0) + 1)
      else formats.set(`first.last.${parts.length - 1}`, (formats.get(`first.last.${parts.length - 1}`) || 0) + 1)
    } else if (prefix.includes('_')) {
      formats.set('first_last', (formats.get('first_last') || 0) + 1)
    } else if (prefix.includes('-')) {
      formats.set('first-last', (formats.get('first-last') || 0) + 1)
    } else if (/^[a-z]+$/.test(prefix)) {
      formats.set('first', (formats.get('first') || 0) + 1)
    } else {
      formats.set('custom', (formats.get('custom') || 0) + 1)
    }
  }

  if (formats.size === 0) return null
  let best = ''
  let bestCount = 0
  for (const [fmt, count] of formats) {
    if (count > bestCount) { best = fmt; bestCount = count }
  }
  return best
}

function extractEmails(text: string): FoundEmail[] {
  const found: FoundEmail[] = []
  const seen = new Set<string>()

  const mailtoMatches = text.match(/mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi)
  if (mailtoMatches) {
    for (const m of mailtoMatches) {
      const addr = m.replace(/^mailto:/i, '').toLowerCase()
      if (!seen.has(addr)) {
        seen.add(addr)
        found.push({ address: addr, type: isGenericEmail(addr) ? 'generic' : 'person' })
      }
    }
  }

  const textMatches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)
  if (textMatches) {
    for (const raw of textMatches) {
      const addr = raw.toLowerCase()
      if (!seen.has(addr) && !addr.startsWith('cdn-cgi')) {
        seen.add(addr)
        found.push({ address: addr, type: isGenericEmail(addr) ? 'generic' : 'person' })
      }
    }
  }

  return found
}

function extractPhones(text: string): FoundPhone[] {
  const found: FoundPhone[] = []
  const seen = new Set<string>()

  const phonePatterns = [
    /\+?\d{1,3}[\s-]?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{0,4}/g,
    /\(?\d{3,5}\)?[\s.-]?\d{2,4}[\s.-]?\d{2,4}[\s.-]?\d{2,4}/g,
  ]

  for (const pattern of phonePatterns) {
    const matches = text.match(pattern)
    if (matches) {
      for (const raw of matches) {
        const cleaned = raw.replace(/[^\d+]/g, '')
        if (cleaned.length < 6 || cleaned.length > 15) continue
        if (seen.has(cleaned)) continue
        seen.add(cleaned)
        const tf = isTollFree(raw)
        found.push({
          number: cleaned,
          formatted: raw.trim(),
          tollFree: tf,
          note: tf ? 'Toll-free' : undefined,
        })
      }
    }
  }

  return found
}

function extractAddresses(text: string): string[] {
  const found: string[] = []
  const seen = new Set<string>()

  const patterns = [
    /\d+\s+[A-Za-zÀ-ÿ\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Plaza|Way|Square|Circle|Cir|Parkway|Pkwy|Highway|Hwy|Close|Place|Pl|Terrace|Tce)[,\s]+[A-Za-zÀ-ÿ\s]+,?\s*[A-Z]{2,3}\s*\d{4,6}/g,
    /[A-Za-zÀ-ÿ\s]+\d{1,5}[A-Za-z]?[,\s]+[A-Za-zÀ-ÿ\s]+[,\s]+\d{5,6}[\s]*[A-Za-zÀ-ÿ]*/g,
    /(?:Straße|Strasse|Str\.|Allee|Platz|Weg|Gasse|Damm|Ring|Chaussee|Steg)\s+\d{1,5}[,\s]+[A-Za-zÀ-ÿ\s]+\d{5,6}/gi,
    /\d{1,5}\s+(?:[A-Za-zÀ-ÿ]+\s){1,4}(?:Straße|Strasse|Str\.|Allee|Platz|Weg|Gasse)/gi,
    /[A-Za-zÀ-ÿ]+\s+\d{1,5}[a-z]?,\s*\d{5}\s+[A-Za-zÀ-ÿ]+/g,
  ]

  for (const pattern of patterns) {
    const matches = text.match(pattern)
    if (matches) {
      for (const addr of matches) {
        const key = addr.toLowerCase().replace(/\s+/g, ' ').trim()
        if (!seen.has(key)) {
          seen.add(key)
          found.push(addr.trim())
        }
      }
    }
  }

  return found
}

function guessTimezoneFromCountry(country: string): string | null {
  const upper = country.trim().toUpperCase()
  if (COUNTRY_TZ[upper]) return COUNTRY_TZ[upper]

  const byName: Record<string, string> = {
    'germany': 'Europe/Berlin', 'austria': 'Europe/Vienna', 'switzerland': 'Europe/Zurich',
    'united kingdom': 'Europe/London', 'uk': 'Europe/London', 'france': 'Europe/Paris',
    'italy': 'Europe/Rome', 'spain': 'Europe/Madrid', 'portugal': 'Europe/Lisbon',
    'netherlands': 'Europe/Amsterdam', 'belgium': 'Europe/Brussels',
    'united states': 'America/New_York', 'usa': 'America/New_York',
    'canada': 'America/Toronto', 'australia': 'Australia/Sydney',
    'japan': 'Asia/Tokyo', 'china': 'Asia/Shanghai', 'india': 'Asia/Kolkata',
    'brazil': 'America/Sao_Paulo', 'mexico': 'America/Mexico_City',
    'south korea': 'Asia/Seoul', 'singapore': 'Asia/Singapore',
    'hong kong': 'Asia/Hong_Kong', 'uae': 'Asia/Dubai',
    'south africa': 'Africa/Johannesburg', 'nigeria': 'Africa/Lagos',
  }

  return byName[country.toLowerCase().trim()] || null
}

function guessTimezoneFromAddress(addresses: string[]): string | null {
  const cityTz: Record<string, string> = {
    'berlin': 'Europe/Berlin', 'munich': 'Europe/Berlin', 'munchen': 'Europe/Berlin',
    'hamburg': 'Europe/Berlin', 'frankfurt': 'Europe/Berlin', 'cologne': 'Europe/Berlin',
    'stuttgart': 'Europe/Berlin', 'paris': 'Europe/Paris', 'london': 'Europe/London',
    'manchester': 'Europe/London', 'amsterdam': 'Europe/Amsterdam',
    'brussels': 'Europe/Brussels', 'dublin': 'Europe/Dublin',
    'madrid': 'Europe/Madrid', 'milan': 'Europe/Rome', 'rome': 'Europe/Rome',
    'zurich': 'Europe/Zurich', 'vienna': 'Europe/Vienna',
    'new york': 'America/New_York', 'chicago': 'America/Chicago',
    'los angeles': 'America/Los_Angeles', 'san francisco': 'America/Los_Angeles',
    'atlanta': 'America/New_York', 'miami': 'America/New_York',
    'tokyo': 'Asia/Tokyo', 'shanghai': 'Asia/Shanghai', 'beijing': 'Asia/Shanghai',
    'hong kong': 'Asia/Hong_Kong', 'singapore': 'Asia/Singapore',
    'sydney': 'Australia/Sydney', 'melbourne': 'Australia/Sydney',
  }

  for (const addr of addresses) {
    const lower = addr.toLowerCase()
    for (const [city, tz] of Object.entries(cityTz)) {
      if (lower.includes(city)) return tz
    }
  }

  return null
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '').replace(/^-|-$/g, '')
}

function generateDomains(name: string, country?: string): string[] {
  const slug = slugify(name)
  const domains: string[] = []

  if (country) {
    const cc = country.trim().toLowerCase()
    const tldMap: Record<string, string> = {
      germany: 'de', austria: 'at', switzerland: 'ch', france: 'fr',
      italy: 'it', spain: 'es', netherlands: 'nl', belgium: 'be',
      sweden: 'se', norway: 'no', denmark: 'dk', finland: 'fi',
      poland: 'pl', 'czech republic': 'cz', 'united kingdom': 'co.uk',
      uk: 'co.uk',
    }
    const tld = tldMap[cc]
    if (tld) {
      domains.push(`www.${slug}.${tld}`)
      domains.push(`${slug}.${tld}`)
    }
  }

  domains.push(`www.${slug}.com`)
  domains.push(`${slug}.com`)
  domains.push(`www.${slug}.io`)
  domains.push(`${slug}.io`)
  domains.push(`www.${slug}.org`)
  domains.push(`${slug}.org`)

  return [...new Set(domains)]
}

async function fetchViaProxy(url: string, signal?: AbortSignal): Promise<string | null> {
  for (const proxy of PROXIES) {
    try {
      const proxyUrl = proxy(url)
      const res = await fetch(proxyUrl, { signal, redirect: 'follow' })
      if (res.ok) {
        const text = await res.text()
        if (text.length > 100 && !text.includes('Access denied') && !text.includes('404 Not Found')) {
          return text
        }
      }
    } catch { }
  }
  return null
}

async function tryFetchPages(domain: string, signal?: AbortSignal): Promise<string[]> {
  const htmlPages: string[] = []

  const paths = [
    '/', '/contact', '/contact-us', '/kontakt', '/about', '/about-us',
    '/ueber-uns', '/locations', '/standorte', '/impressum',
    '/contact-us/', '/contact/', '/about-us/',
  ]

  for (const path of paths) {
    const url = `https://${domain}${path}`
    const html = await fetchViaProxy(url, signal)
    if (html) htmlPages.push(html)
  }

  return htmlPages
}

async function searchWikipedia(company: string, signal?: AbortSignal): Promise<{
  title: string; description: string | null; domain: string | null; wikidataId: string | null
} | null> {
  const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srwhat=text&srsearch=${encodeURIComponent(company)}&format=json&origin=*&srlimit=3`
  try {
    const res = await fetch(searchUrl, { signal })
    const data = await res.json()
    const pages = data?.query?.search
    if (!pages || pages.length === 0) return null
    const title = pages[0].title

    const propsUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageprops|extracts&titles=${encodeURIComponent(title)}&format=json&origin=*&exintro=1&explaintext=1`
    const propsRes = await fetch(propsUrl, { signal })
    const propsData = await propsRes.json()
    const pageObj = Object.values(propsData?.query?.pages || {})[0] as any
    if (!pageObj) return null

    const wikidataId: string | null = pageObj?.pageprops?.wikibase_item || null
    const extract: string | null = pageObj?.extract || null

    let domain: string | null = null
    if (extract) {
      const m = extract.match(/website[:\s]+(?:https?:\/\/)?([a-z0-9.-]+\.[a-z]{2,})/i)
      if (m) domain = m[1].replace(/[.]+$/, '')
    }

    return { title, description: extract || null, domain, wikidataId }
  } catch { return null }
}

async function getWikidataWebsite(id: string, signal?: AbortSignal): Promise<string | null> {
  try {
    const url = `https://www.wikidata.org/wiki/Special:EntityData/${id}.json`
    const res = await fetch(url, { signal })
    const data = await res.json()
    const entity = data?.entities?.[id]
    if (!entity) return null

    const claim = entity?.claims?.P856?.[0]?.mainsnak?.datavalue?.value
    if (claim) return claim.replace(/^https?:\/\//, '').replace(/\/$/, '')

    const altClaim = entity?.claims?.P1324?.[0]?.mainsnak?.datavalue?.value
    if (altClaim) return altClaim.replace(/^https?:\/\//, '').replace(/\/$/, '')

    return null
  } catch { return null }
}

function parseHtmlText(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')

  const scripts = doc.querySelectorAll('script, style, nav, header, footer, noscript')
  scripts.forEach(s => s.remove())

  const body = doc.body || doc.documentElement
  return body?.textContent || ''
}

export async function searchCompany(
  company: string,
  country: string,
  signal?: AbortSignal
): Promise<CompanySearchResult> {
  const result: CompanySearchResult = {
    company,
    country,
    domain: null,
    websiteUrl: null,
    description: null,
    emails: [],
    emailFormat: null,
    phones: [],
    phonesNonTollFree: [],
    addresses: [],
    filteredAddresses: [],
    timezone: null,
    autoFound: false,
    errors: [],
  }

  // Phase 1: Discover website
  const wiki = await searchWikipedia(company, signal)
  if (wiki?.domain) {
    result.domain = wiki.domain
    result.websiteUrl = `https://${wiki.domain}`
    result.description = wiki.description
  }

  if (wiki?.wikidataId) {
    const wdDomain = await getWikidataWebsite(wiki.wikidataId, signal)
    if (wdDomain) {
      result.domain = wdDomain
      result.websiteUrl = `https://${wdDomain}`
    }
  }

  // Phase 2: Try domain guessing if no domain found
  if (!result.domain) {
    const guessDomains = generateDomains(company, country)
    for (const d of guessDomains) {
      if (signal?.aborted) break
      const html = await fetchViaProxy(`https://${d}`, signal)
      if (html && html.length > 200) {
        result.domain = d
        result.websiteUrl = `https://${d}`
        break
      }
    }
  }

  // Phase 3: Fetch pages
  if (result.domain) {
    const htmlPages = await tryFetchPages(result.domain, signal)
    for (const html of htmlPages) {
      if (signal?.aborted) break
      const text = parseHtmlText(html)

      const emails = extractEmails(html)
      const phones = extractPhones(text)
      const addresses = extractAddresses(text)

      for (const e of emails) {
        if (!result.emails.find(x => x.address === e.address)) {
          result.emails.push(e)
        }
      }
      for (const p of phones) {
        if (!result.phones.find(x => x.number === p.number)) {
          result.phones.push(p)
        }
      }
      for (const a of addresses) {
        if (!result.addresses.includes(a)) {
          result.addresses.push(a)
        }
      }
    }

    result.emailFormat = guessEmailFormat(result.emails)

    // Filter toll-free
    result.phonesNonTollFree = result.phones.filter(p => !p.tollFree)

    // First found address → try to detect timezone from city
    result.timezone = guessTimezoneFromAddress(result.addresses) || guessTimezoneFromCountry(country)

    result.autoFound = result.emails.length > 0 || result.phones.length > 0 || result.addresses.length > 0
  }

  // Phase 4: Try data aggregation sites as fallback
  if (!result.autoFound || !result.emailFormat || result.phonesNonTollFree.length === 0) {
    const { phones, addresses, emails } = await tryDataSources(company, signal)
    for (const p of phones) {
      if (!result.phones.find(x => x.number === p.number)) result.phones.push(p)
    }
    for (const a of addresses) {
      if (!result.addresses.includes(a)) result.addresses.push(a)
    }
    for (const e of emails) {
      if (!result.emails.find(x => x.address === e.address)) result.emails.push(e)
    }
    if (!result.emailFormat) result.emailFormat = guessEmailFormat(result.emails)
    result.phonesNonTollFree = result.phones.filter(p => !p.tollFree)
    result.autoFound = result.emails.length > 0 || result.phones.length > 0 || result.addresses.length > 0
  }

  result.filteredAddresses = filterAddressesByCountry(result.addresses, country)

  if (!result.domain) {
    result.errors.push('Could not find company website. Try the dorks below.')
  }

  return result
}

export function filterAddressesByCountry(addresses: string[], query: string): string[] {
  if (!query.trim()) return addresses
  const q = query.toLowerCase().trim()

  const terms = COUNTRY_CITIES[q] || COUNTRY_CITIES[q.replace(/\s+$/, '')] || [q]

  return addresses.filter(addr => {
    const lower = addr.toLowerCase()
    return terms.some(term => lower.includes(term))
  })
}

const DATA_SITE_URLS = [
  (slug: string) => `https://www.crunchbase.com/organization/${slug.replace(/[^a-z0-9-]/g, '')}`,
  (slug: string) => `https://contactout.com/company/${slug}`,
]

async function tryDataSources(
  company: string, signal?: AbortSignal
): Promise<{ phones: FoundPhone[]; addresses: string[]; emails: FoundEmail[] }> {
  const phones: FoundPhone[] = []
  const addresses: string[] = []
  const emails: FoundEmail[] = []
  const seenPhones = new Set<string>()
  const seenAddresses = new Set<string>()
  const seenEmails = new Set<string>()

  const slug = slugify(company)
  for (const buildUrl of DATA_SITE_URLS) {
    if (signal?.aborted) break
    const url = buildUrl(slug)
    const html = await fetchViaProxy(url, signal)
    if (!html) continue
    const text = parseHtmlText(html)
    if (text.length < 200) continue

    for (const p of extractPhones(text)) {
      if (!seenPhones.has(p.number)) { seenPhones.add(p.number); phones.push(p) }
    }
    for (const a of extractAddresses(text)) {
      if (!seenAddresses.has(a)) { seenAddresses.add(a); addresses.push(a) }
    }
    for (const e of extractEmails(html)) {
      if (!seenEmails.has(e.address)) { seenEmails.add(e.address); emails.push(e) }
    }
  }

  return { phones, addresses, emails }
}

export interface DorkGroup {
  label: string
  dorks: { label: string; query: string; description: string }[]
}

export function generateDorks(company: string, country?: string, _domain?: string): DorkGroup[] {
  const slug = slugify(company)
  const groups: DorkGroup[] = []

  groups.push({ label: '📧 Email Search', dorks: [{
    label: `Email patterns for ${company}`,
    query: `"@${slug}.com" OR "@${slug}.io" OR "@${slug}.de"`,
    description: `Search for email patterns across the web`,
  }]})

  groups.push({ label: '📞 Phone Search', dorks: [{
    label: country ? `${company} ${country} phone numbers` : `${company} phone numbers`,
    query: country
      ? `"${company}" "${country}" phone OR tel OR contact -800 -"toll" -"free"`
      : `"${company}" (phone OR tel OR contact) -800 -"toll" -"free"`,
    description: `Search for ${company} phone numbers${country ? ` in ${country}` : ''} — excludes toll-free`,
  }]})

  if (country) {
    groups.push({ label: '📍 Address Search', dorks: [{
      label: `${company} ${country} offices`,
      query: `"${company}" "${country}" ("address" OR "office" OR "location" OR "headquarters")`,
      description: `Search for ${company} offices specifically in ${country}`,
    }]})

    groups.push({ label: '🕐 Timezone / Hours', dorks: [{
      label: `Working hours / timezone`,
      query: `"${company}" "${country}" "hours" OR "time" OR "business hours"`,
      description: `Find business hours (implies timezone)`,
    }]})
  }

  const allInQuery = country
    ? `${company} "${country}" (email OR phone OR address OR office OR kontakt) -toll -free -"800-" -"1-800"`
    : `${company} (email OR phone OR address OR office) -toll -free -"800-" -"1-800"`
  groups.push({ label: '🔎 All-in-One Search', dorks: [{
    label: country ? `Everything for ${company} in ${country}` : 'Everything about this company',
    query: allInQuery,
    description: country ? `Broad search for ${company} contact info strictly in ${country}` : `Broad search for all contact info`,
  }]})

  const cf = country ? ` "${country}"` : ''
  groups.push({ label: 'ZoomInfo — company overview', dorks: [{
    label: 'Company directory with contact data',
    query: `site:zoominfo.com/pic "${company}"${cf} address OR phone`,
    description: 'ZoomInfo: company directory with contact data',
  }]})

  groups.push({ label: 'LinkedIn company page', dorks: [{
    label: 'Company description and locations',
    query: `site:linkedin.com/company "${company}"${cf} about OR address OR phone`,
    description: 'LinkedIn company page: description, locations',
  }]})

  groups.push({ label: 'RocketReach — company directory', dorks: [{
    label: 'Employee emails and phone numbers',
    query: `site:rocketreach.co "${company}"${cf} email OR phone OR address`,
    description: 'RocketReach: employee emails, phone numbers',
  }]})

  return groups
}
