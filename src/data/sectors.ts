export interface SubIndustry {
  id: string
  name: string
}

export interface Sector {
  id: string
  name: string
  subIndustries: SubIndustry[]
}

export const SECTORS: Sector[] = [
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    subIndustries: [
      { id: 'mfg-auto', name: 'Automotive Manufacturing' },
      { id: 'mfg-aero', name: 'Aerospace & Defense' },
      { id: 'mfg-electronics', name: 'Electronics Manufacturing' },
      { id: 'mfg-chemical', name: 'Chemicals & Pharmaceuticals' },
      { id: 'mfg-food', name: 'Food & Beverage Processing' },
      { id: 'mfg-textile', name: 'Textile & Apparel Manufacturing' },
      { id: 'mfg-machinery', name: 'Industrial Machinery & Equipment' },
      { id: 'mfg-metal', name: 'Metal Fabrication' },
      { id: 'mfg-plastic', name: 'Plastics & Rubber Products' },
      { id: 'mfg-furniture', name: 'Furniture & Fixtures' },
      { id: 'mfg-medical', name: 'Medical Device Manufacturing' },
      { id: 'mfg-semicon', name: 'Semiconductor Manufacturing' },
    ],
  },
  {
    id: 'business-services',
    name: 'Business Services',
    subIndustries: [
      { id: 'bs-mgmt-consulting', name: 'Management Consulting' },
      { id: 'bs-it-services', name: 'IT Services & Consulting' },
      { id: 'bs-legal', name: 'Legal Services' },
      { id: 'bs-accounting', name: 'Accounting & Tax Services' },
      { id: 'bs-marketing-ad', name: 'Marketing & Advertising' },
      { id: 'bs-staffing', name: 'Staffing & Recruitment' },
      { id: 'bs-facility-mgmt', name: 'Facility Management' },
      { id: 'bs-security', name: 'Security Services' },
      { id: 'bs-bpo', name: 'Business Process Outsourcing (BPO)' },
      { id: 'bs-market-research', name: 'Market Research' },
      { id: 'bs-logistics', name: 'Logistics & Supply Chain Services' },
      { id: 'bs-printing', name: 'Printing & Document Services' },
    ],
  },
  {
    id: 'technology',
    name: 'Technology',
    subIndustries: [
      { id: 'tech-software', name: 'Software Development' },
      { id: 'tech-cloud', name: 'Cloud Computing' },
      { id: 'tech-cyber', name: 'Cybersecurity' },
      { id: 'tech-ai-ml', name: 'Artificial Intelligence & ML' },
      { id: 'tech-data', name: 'Data Analytics & Big Data' },
      { id: 'tech-iot', name: 'IoT & Embedded Systems' },
      { id: 'tech-enterprise', name: 'Enterprise Software' },
      { id: 'tech-mobile', name: 'Mobile Application Development' },
      { id: 'tech-gaming', name: 'Gaming & Interactive Media' },
      { id: 'tech-blockchain', name: 'Blockchain & Web3' },
      { id: 'tech-edtech', name: 'EdTech' },
      { id: 'tech-fintech', name: 'FinTech' },
    ],
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    subIndustries: [
      { id: 'hosp-clinical', name: 'Hospital & Clinical Services' },
      { id: 'pharma-rd', name: 'Pharmaceutical R&D' },
      { id: 'med-equip', name: 'Medical Equipment & Supplies' },
      { id: 'health-it', name: 'Healthcare IT' },
      { id: 'biotech', name: 'Biotechnology' },
      { id: 'home-health', name: 'Home Healthcare Services' },
      { id: 'dental', name: 'Dental Services' },
      { id: 'mental-health', name: 'Mental Health Services' },
      { id: 'diagnostic-lab', name: 'Diagnostic & Laboratory Services' },
      { id: 'rehab-therapy', name: 'Rehabilitation & Physical Therapy' },
      { id: 'health-insurance', name: 'Health Insurance' },
      { id: 'elderly-care', name: 'Elderly Care Services' },
    ],
  },
  {
    id: 'financial-services',
    name: 'Financial Services',
    subIndustries: [
      { id: 'fs-banking', name: 'Banking & Credit Unions' },
      { id: 'fs-investment-banking', name: 'Investment Banking' },
      { id: 'fs-wealth-mgmt', name: 'Wealth & Asset Management' },
      { id: 'fs-insurance', name: 'Insurance (Life, Health, Property)' },
      { id: 'fs-pe-vc', name: 'Private Equity & Venture Capital' },
      { id: 'fs-fintech', name: 'Financial Technology (FinTech)' },
      { id: 'fs-real-estate', name: 'Real Estate Investment' },
      { id: 'fs-capital-markets', name: 'Capital Markets & Trading' },
      { id: 'fs-mortgage', name: 'Mortgage & Lending' },
      { id: 'fs-payments', name: 'Payment Processing' },
      { id: 'fs-advisory', name: 'Financial Advisory Services' },
      { id: 'fs-microfinance', name: 'Microfinance' },
    ],
  },
  {
    id: 'retail-ecommerce',
    name: 'Retail & E-commerce',
    subIndustries: [
      { id: 'ret-ecom', name: 'Online Retail / E-commerce' },
      { id: 'ret-dept-stores', name: 'Department Stores' },
      { id: 'ret-specialty', name: 'Specialty Retail' },
      { id: 'ret-grocery', name: 'Grocery & Supermarkets' },
      { id: 'ret-fashion', name: 'Fashion & Apparel Retail' },
      { id: 'ret-electronics', name: 'Electronics & Appliances Retail' },
      { id: 'ret-home-improve', name: 'Home Improvement & Hardware' },
      { id: 'ret-pharmacy', name: 'Pharmacy & Drug Stores' },
      { id: 'ret-luxury', name: 'Luxury Goods Retail' },
      { id: 'ret-d2c', name: 'Direct-to-Consumer (D2C)' },
      { id: 'ret-wholesale', name: 'Wholesale & Distribution' },
      { id: 'ret-qcommerce', name: 'Quick Commerce' },
    ],
  },
  {
    id: 'energy-utilities',
    name: 'Energy & Utilities',
    subIndustries: [
      { id: 'en-oil-gas', name: 'Oil & Gas Exploration' },
      { id: 'en-renewable', name: 'Renewable Energy (Solar, Wind)' },
      { id: 'en-power-gen', name: 'Power Generation & Distribution' },
      { id: 'en-natural-gas', name: 'Natural Gas Distribution' },
      { id: 'en-nuclear', name: 'Nuclear Energy' },
      { id: 'en-water', name: 'Water & Wastewater Management' },
      { id: 'en-waste', name: 'Waste Management & Recycling' },
      { id: 'en-mining', name: 'Mining & Minerals' },
      { id: 'en-trading', name: 'Energy Trading & Marketing' },
      { id: 'en-grid', name: 'Grid Infrastructure' },
      { id: 'en-battery', name: 'Battery & Energy Storage' },
      { id: 'en-carbon', name: 'Carbon Capture & Environmental Services' },
    ],
  },
  {
    id: 'education',
    name: 'Education',
    subIndustries: [
      { id: 'edu-k12', name: 'K-12 Schools' },
      { id: 'edu-higher', name: 'Higher Education (Universities)' },
      { id: 'edu-vocational', name: 'Vocational & Technical Training' },
      { id: 'edu-online', name: 'Online Education / EdTech' },
      { id: 'edu-corporate', name: 'Corporate Training & Development' },
      { id: 'edu-language', name: 'Language Learning Centers' },
      { id: 'edu-early-childhood', name: 'Early Childhood Education' },
      { id: 'edu-test-prep', name: 'Test Preparation & Tutoring' },
      { id: 'edu-special', name: 'Special Education Services' },
      { id: 'edu-publishing', name: 'Educational Publishing' },
      { id: 'edu-executive', name: 'Executive Education' },
      { id: 'edu-study-abroad', name: 'Study Abroad & Exchange Programs' },
    ],
  },
  {
    id: 'hospitality-travel',
    name: 'Hospitality & Travel',
    subIndustries: [
      { id: 'hot-resorts', name: 'Hotels & Resorts' },
      { id: 'rest-food', name: 'Restaurants & Food Service' },
      { id: 'airlines', name: 'Airlines & Aviation' },
      { id: 'travel-agency', name: 'Travel Agencies & Tour Operators' },
      { id: 'cruise', name: 'Cruise Lines' },
      { id: 'events', name: 'Event Planning & Management' },
      { id: 'car-rental', name: 'Car Rental & Mobility Services' },
      { id: 'vacation-rentals', name: 'Lodging & Vacation Rentals' },
      { id: 'casino', name: 'Casino & Gaming' },
      { id: 'theme-parks', name: 'Theme Parks & Attractions' },
      { id: 'catering', name: 'Catering Services' },
      { id: 'travel-tech', name: 'Travel Technology (GDS, Booking)' },
    ],
  },
  {
    id: 'media-entertainment',
    name: 'Media & Entertainment',
    subIndustries: [
      { id: 'media-broadcast', name: 'Broadcasting (TV, Radio)' },
      { id: 'media-film', name: 'Film & Video Production' },
      { id: 'media-publishing', name: 'Publishing (Books, Magazines)' },
      { id: 'media-streaming', name: 'Digital Media & Streaming' },
      { id: 'media-music', name: 'Music Production & Distribution' },
      { id: 'media-advertising', name: 'Advertising & Marketing Media' },
      { id: 'media-social', name: 'Social Media Platforms' },
      { id: 'media-news', name: 'News & Journalism' },
      { id: 'media-gaming', name: 'Gaming & Esports' },
      { id: 'media-podcast', name: 'Podcast Production' },
      { id: 'media-live-events', name: 'Event & Live Entertainment' },
      { id: 'media-sports', name: 'Sports Management & Leagues' },
    ],
  },
]

export function getSectorById(id: string): Sector | undefined {
  return SECTORS.find(s => s.id === id)
}

export function getSubIndustriesBySector(sectorId: string): SubIndustry[] {
  const sector = getSectorById(sectorId)
  return sector?.subIndustries ?? []
}
