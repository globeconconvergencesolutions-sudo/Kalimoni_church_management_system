export type MediaSlotDef = {
  key: string
  page: string
  section: string
  label: string
  hint: string
  aspect: string
  cloudinaryPath: string
  fallback: string
  defaultCaption?: string
  defaultSubtitle?: string
  sortOrder: number
  mediaType: 'image' | 'video'
  viewPath: string
  viewHash?: string
}

export const GALLERY_CATEGORIES = [
  'Church Life',
  'Sacraments',
  'Celebrations',
  'Community Outreach',
  'Youth Activities',
] as const

export const GALLERY_FOLDER_SLUGS: Record<string, string> = {
  'Church Life': 'church-life',
  Sacraments: 'sacraments',
  Celebrations: 'celebrations',
  'Community Outreach': 'community-outreach',
  'Youth Activities': 'youth-activities',
}

const parishLifeDefaults: Array<{ caption: string; sub: string; fallback: string }> = [
  { caption: 'Parish Community at Sunday Eucharist', sub: 'Joyful worship at the heart of Kalimoni', fallback: 'photo-1622598453695-4fbaf151aadc' },
  { caption: 'A Faith Community United in Prayer', sub: 'Every Sunday, hundreds gather in praise', fallback: 'photo-1720186576697-24c1496a07e1' },
  { caption: 'Serving God, Serving Humanity', sub: 'The Vincentian spirit lived out daily', fallback: 'photo-1563902341721-029085ad9347' },
  { caption: 'St. Theresa Parish, Kalimoni', sub: 'A sacred home since 1912', fallback: 'photo-1759178124741-8d3a8aaab778' },
  { caption: 'Light at the End of Every Day', sub: 'Hope, faith, and community guide our way', fallback: 'photo-1494548162494-384bba4ab999' },
]

const ministryDefaults: Array<{ id: string; label: string; fallback: string }> = [
  { id: 'cwa', label: 'Catholic Women Association', fallback: 'photo-1609234656388-0ff363383899' },
  { id: 'cma', label: 'Catholic Men Association', fallback: 'photo-1622598453695-4fbaf151aadc' },
  { id: 'yca', label: 'Young Catholic Adults', fallback: 'photo-1781263378223-1e09658a7567' },
  { id: 'ysc', label: 'Youths Serving Christ', fallback: 'photo-1547496613-4e19af6736dc' },
  { id: 'pmc', label: 'Pontifical Missionary Childhood', fallback: 'photo-1632932693914-89b90ae3d16d' },
]

const sistersTiles: Array<{ key: string; label: string; fallback: string; sort: number }> = [
  { key: 'sisters.ministry.health', label: 'Health Ministry', fallback: 'photo-1517120026326-d87759a7b63b', sort: 1 },
  { key: 'sisters.ministry.education', label: 'Education Ministry', fallback: 'photo-1555251255-e9a095d6eb9d', sort: 2 },
  { key: 'sisters.ministry.pastoral', label: 'Pastoral Ministry', fallback: 'photo-1632932693914-89b90ae3d16d', sort: 3 },
  { key: 'sisters.ministry.charity', label: 'Charitable Works', fallback: 'photo-1599659593072-10de2e109486', sort: 4 },
]

function slot(def: Omit<MediaSlotDef, 'sortOrder'> & { sortOrder?: number }): MediaSlotDef {
  return { sortOrder: 0, ...def }
}

const homeParishLife: MediaSlotDef[] = parishLifeDefaults.map((p, i) =>
  slot({
    key: `home.parish-life.${String(i + 1).padStart(2, '0')}`,
    page: 'home',
    section: 'parish-life',
    label: `Parish Life — Slide ${i + 1}`,
    hint: 'Large carousel on the homepage',
    aspect: '16:9',
    cloudinaryPath: `pages/home/parish-life/slide-${String(i + 1).padStart(2, '0')}`,
    fallback: p.fallback,
    defaultCaption: p.caption,
    defaultSubtitle: p.sub,
    sortOrder: i + 1,
    mediaType: 'image',
    viewPath: '/',
    viewHash: 'parish-life',
  }),
)

const ministrySlots: MediaSlotDef[] = ministryDefaults.map((m, i) =>
  slot({
    key: `ministries.${m.id}`,
    page: 'ministries',
    section: 'ministry-cards',
    label: m.label,
    hint: 'Homepage ministries slider and Ministries page',
    aspect: '16:9',
    cloudinaryPath: `pages/ministries/${m.id}`,
    fallback: m.fallback,
    sortOrder: i + 1,
    mediaType: 'image',
    viewPath: '/ministries',
  }),
)

export const MEDIA_SLOT_DEFS: MediaSlotDef[] = [
  slot({
    key: 'home.hero.background',
    page: 'home',
    section: 'hero',
    label: 'Welcome hero texture',
    hint: 'Soft background behind the main homepage title',
    aspect: '16:9',
    cloudinaryPath: 'pages/home/hero-background',
    fallback: 'photo-1476873282730-9018f17bdf4e',
    sortOrder: 1,
    mediaType: 'image',
    viewPath: '/',
  }),
  ...homeParishLife,
  ...ministrySlots,
  slot({
    key: 'home.mission-banner',
    page: 'home',
    section: 'mission',
    label: 'Vincentian mission banner',
    hint: 'Wide banner behind the parish motto on the homepage',
    aspect: '21:9',
    cloudinaryPath: 'pages/home/mission-banner',
    fallback: 'photo-1609234656388-0ff363383899',
    sortOrder: 20,
    mediaType: 'image',
    viewPath: '/',
    viewHash: 'mission',
  }),
  slot({
    key: 'about.identity',
    page: 'about',
    section: 'identity',
    label: 'Who we are — church interior',
    hint: 'Large image beside the parish identity text',
    aspect: '4:3',
    cloudinaryPath: 'pages/about/identity',
    fallback: 'photo-1438032005730-c779502df39b',
    sortOrder: 1,
    mediaType: 'image',
    viewPath: '/about',
  }),
  slot({
    key: 'vincentians.hero',
    page: 'vincentians',
    section: 'hero',
    label: 'Vincentian Fathers hero',
    hint: 'Background of the Vincentians page header',
    aspect: '16:9',
    cloudinaryPath: 'pages/vincentians/hero',
    fallback: 'photo-1609234656381-73e732808098',
    sortOrder: 1,
    mediaType: 'image',
    viewPath: '/vincentians',
  }),
  slot({
    key: 'vincentians.quote',
    page: 'vincentians',
    section: 'quote',
    label: 'Vincentian quote section',
    hint: 'Background for the charity quote band',
    aspect: '16:9',
    cloudinaryPath: 'pages/vincentians/quote',
    fallback: 'photo-1476873282730-9018f17bdf4e',
    sortOrder: 2,
    mediaType: 'image',
    viewPath: '/vincentians',
  }),
  slot({
    key: 'sisters.hero',
    page: 'sisters',
    section: 'hero',
    label: 'HHCJ Sisters hero',
    hint: 'Top banner on the Sisters page',
    aspect: '16:9',
    cloudinaryPath: 'pages/sisters/hero',
    fallback: 'photo-1517120026326-d87759a7b63b',
    sortOrder: 1,
    mediaType: 'image',
    viewPath: '/sisters',
  }),
  ...sistersTiles.map(t =>
    slot({
      key: t.key,
      page: 'sisters',
      section: 'ministry-tiles',
      label: t.label,
      hint: 'Ministry tile on the Sisters page',
      aspect: '16:9',
      cloudinaryPath: `pages/sisters/${t.key.split('.').pop()}`,
      fallback: t.fallback,
      sortOrder: t.sort,
      mediaType: 'image',
      viewPath: '/sisters',
    }),
  ),
  slot({
    key: 'history.hero',
    page: 'history',
    section: 'hero',
    label: 'Parish history hero',
    hint: 'Opening image on the History page',
    aspect: '4:3',
    cloudinaryPath: 'pages/history/hero',
    fallback: 'photo-1547471080-7cc2caa01a7e',
    sortOrder: 1,
    mediaType: 'image',
    viewPath: '/history',
  }),
  slot({
    key: 'community.hero',
    page: 'community',
    section: 'hero',
    label: 'Community hero',
    hint: 'Top banner on the Community page',
    aspect: '16:9',
    cloudinaryPath: 'pages/community/hero',
    fallback: 'photo-1780847614316-c9e933e9a9e0',
    sortOrder: 1,
    mediaType: 'image',
    viewPath: '/community',
  }),
  slot({
    key: 'community.gallery-a',
    page: 'community',
    section: 'gallery',
    label: 'Community gallery — large',
    hint: 'Featured community photo',
    aspect: '4:3',
    cloudinaryPath: 'pages/community/gallery-a',
    fallback: 'photo-1781263378223-1e09658a7567',
    sortOrder: 2,
    mediaType: 'image',
    viewPath: '/community',
  }),
  slot({
    key: 'community.gallery-b',
    page: 'community',
    section: 'gallery',
    label: 'Community gallery — accent',
    hint: 'Secondary community photo',
    aspect: '16:9',
    cloudinaryPath: 'pages/community/gallery-b',
    fallback: 'photo-1779357807569-18d3df9df645',
    sortOrder: 3,
    mediaType: 'image',
    viewPath: '/community',
  }),
]

export const MEDIA_PAGES: { id: string; label: string }[] = [
  { id: 'home', label: 'Homepage' },
  { id: 'about', label: 'About' },
  { id: 'ministries', label: 'Ministries' },
  { id: 'vincentians', label: 'Vincentian Fathers' },
  { id: 'sisters', label: 'HHCJ Sisters' },
  { id: 'history', label: 'History' },
  { id: 'community', label: 'Community' },
]

export function getSlotDef(key: string): MediaSlotDef | undefined {
  return MEDIA_SLOT_DEFS.find(s => s.key === key)
}

export function slotsForPage(pageId: string): MediaSlotDef[] {
  return MEDIA_SLOT_DEFS.filter(s => s.page === pageId).sort((a, b) => a.sortOrder - b.sortOrder)
}

export function cloudinaryPublicId(root: string, relativePath: string): string {
  const base = root.replace(/^\/+|\/+$/g, '')
  const path = relativePath.replace(/^\/+|\/+$/g, '')
  return `${base}/${path}`
}
