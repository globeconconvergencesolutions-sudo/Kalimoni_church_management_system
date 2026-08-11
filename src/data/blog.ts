export interface BlogPost {
  slug: string
  title: string
  category: string
  author: string
  date: string
  readTime: string
  excerpt: string
  coverImg: string
  tags: string[]
  body: Section[]
}

export interface Section {
  type: 'paragraph' | 'heading' | 'quote' | 'image' | 'list'
  content?: string
  items?: string[]
  src?: string
  alt?: string
  caption?: string
}

export const POSTS: BlogPost[] = [
  {
    slug: 'grotto-marian-devotion-2024',
    title: 'The New Grotto: A Centre of Marian Devotion in Kalimoni',
    category: 'Parish News',
    author: 'Parish Communications',
    date: 'December 2024',
    readTime: '4 min read',
    excerpt:
      'In December 2024, a newly constructed Grotto was consecrated on the grounds of St. Theresa Parish — a landmark project driven entirely by the Catholic Men Association.',
    coverImg: 'photo-1633368516160-feaa83f981dd',
    tags: ['Marian Devotion', 'CMA', 'Parish Projects', 'Prayer'],
    body: [
      { type: 'paragraph', content: 'In December 2024, a beautiful new Grotto was consecrated on the grounds of St. Theresa Parish, Kalimoni — a project that stands as a testament to the faith and dedication of the Catholic Men Association (CMA). From the very first stone laid to the final consecration ceremony, every step of the project was conceived, funded, and completed by the men of the parish.' },
      { type: 'heading', content: 'A Vision Born in Prayer' },
      { type: 'paragraph', content: 'The idea for the Grotto emerged during one of the CMA\'s regular meetings, where members expressed a desire to create a dedicated space for Marian devotion and personal prayer within the parish grounds. The Blessed Virgin Mary holds a special place in the hearts of Kalimoni\'s faithful, and the Grotto was envisioned as a place where parishioners could come to pray the Rosary, seek intercession, and simply sit in quiet contemplation.' },
      { type: 'quote', content: '"We wanted to build something that would outlast us — a place where our children and grandchildren would come to pray." — CMA Member, Kalimoni Parish' },
      { type: 'heading', content: 'Community Effort, Lasting Legacy' },
      { type: 'paragraph', content: 'The construction was entirely community-funded and community-built. Members of the CMA contributed financially, donated materials, and gave their labour on weekends and evenings. The result is a carefully designed grotto featuring a statue of Our Lady set within a stone alcove, surrounded by flowering plants, kneelers, and soft lighting for evening prayer.' },
      { type: 'image', src: 'photo-1476873282730-9018f17bdf4e', alt: 'Candles at the Grotto', caption: 'Candles lit in honour of Our Lady at the newly consecrated Grotto.' },
      { type: 'heading', content: 'A Growing Place of Prayer' },
      { type: 'paragraph', content: 'Since its consecration, the Grotto has quickly become one of the most visited spots on the parish grounds. Parishioners come early in the morning before Mass, at lunchtime during weekdays, and in the evenings after work. Youth groups have begun gathering there for the Rosary on Saturday afternoons, and families bring their children to pray before Our Lady.' },
      { type: 'list', items: ['Daily Rosary groups gather at the Grotto each morning', 'Jumuiya leaders use the space for monthly reflections', 'Special Marian feast days are now celebrated here', 'First Holy Communion children receive their medals at the Grotto'] },
      { type: 'paragraph', content: 'The Grotto stands as a permanent reminder that great things are built not by the few but by the faithful many — united in purpose, guided by prayer.' },
    ],
  },
  {
    slug: 'divine-mercy-chapel-cwa-2025',
    title: 'Divine Mercy Chapel Consecrated — A Gift from the Women of Kalimoni',
    category: 'Parish News',
    author: 'Parish Communications',
    date: 'February 2025',
    readTime: '5 min read',
    excerpt:
      'On a radiant February morning in 2025, the parish gathered to consecrate the Divine Mercy Chapel — a project brought to life through the extraordinary devotion of the Catholic Women Association.',
    coverImg: 'photo-1625702929485-984787146d49',
    tags: ['CWA', 'Divine Mercy', 'Chapel', 'Women of Faith'],
    body: [
      { type: 'paragraph', content: 'On a radiant morning in February 2025, the faithful of St. Theresa Parish, Kalimoni, gathered in joyful celebration as the newly built Divine Mercy Chapel was consecrated. This sacred space — funded and built through the tireless effort of the Catholic Women Association (CWA) — now stands as one of the most significant spiritual landmarks in the parish\'s modern history.' },
      { type: 'heading', content: 'The Chaplet That Became a Chapel' },
      { type: 'paragraph', content: 'The Divine Mercy devotion has long had deep roots in Kalimoni. For years, the CWA has led the Chaplet of Divine Mercy every Friday afternoon, drawing scores of parishioners into a rhythm of mercy-seeking prayer. It was from this living devotion that the vision for a dedicated chapel emerged — a permanent home for the image of the Merciful Jesus and a quiet space for personal encounter with the compassion of God.' },
      { type: 'quote', content: '"Jesus, I trust in You." — The words inscribed beneath the Divine Mercy image, now at the heart of the chapel.' },
      { type: 'heading', content: 'Women Who Built More Than Walls' },
      { type: 'paragraph', content: 'The CWA raised every shilling needed for the chapel through organised fundraisers, harambees, individual contributions, and the quiet generosity of women from all 72 Jumuiyas. Some gave money. Others gave labour — cleaning, painting, and decorating the space with their own hands. A small group of women who are skilled seamstresses crafted the liturgical linens for the altar.' },
      { type: 'image', src: 'photo-1550541231-56ddb7f844ec', alt: 'Sacred light through chapel window', caption: 'Light streams through the chapel windows, a daily reminder of divine mercy and presence.' },
      { type: 'heading', content: 'A New Heartbeat in the Parish' },
      { type: 'paragraph', content: 'Since its consecration, the Divine Mercy Chapel has hosted daily prayer groups, healing Masses, and quiet personal prayer. It has become particularly beloved among the sick and those facing difficult circumstances — a place to bring burdens and find rest in the promise of mercy.' },
      { type: 'list', items: ['Weekly Chaplet of Divine Mercy every Friday at 3:00 PM', 'Monthly Healing Mass for the sick and suffering', 'Open daily for personal prayer from 6:00 AM – 8:00 PM', 'Annual Divine Mercy Sunday celebration each April'] },
    ],
  },
  {
    slug: 'good-friday-crucifix-youth-2025',
    title: 'Youth Raise the Cross: Good Friday 2025 at Kalimoni',
    category: 'Youth & Faith',
    author: 'Youth Serving Christ (YSC)',
    date: 'April 2025',
    readTime: '3 min read',
    excerpt:
      'This Good Friday, the Way of the Cross took on new meaning as it concluded at the foot of a beautiful new crucifix — erected entirely by the young people of the parish.',
    coverImg: 'photo-1516026672322-bc52d61a55d5',
    tags: ['Youth', 'Good Friday', 'YSC', 'YCA', 'Way of the Cross'],
    body: [
      { type: 'paragraph', content: 'Good Friday 2025 was unlike any the parish had seen before. As the annual Way of the Cross wound through the streets of Kalimoni, it culminated not at an empty patch of ground, but at the foot of a magnificent new crucifix — erected by the Youth Serving Christ (YSC) and Young Catholic Adults (YCA) as a gift of faith to their parish.' },
      { type: 'heading', content: 'A Project Born in Lent' },
      { type: 'paragraph', content: 'The idea emerged at the beginning of Lent 2025, when the youth of the parish gathered for their Ash Wednesday reflection. Inspired by a desire to leave a lasting mark of their faith on the parish, they decided to fundraise for and erect a crucifix that would serve as a permanent end-point for the Way of the Cross.' },
      { type: 'quote', content: '"We wanted to do something that would say: the youth of Kalimoni are here, and they carry the cross." — YSC Chairperson' },
      { type: 'heading', content: 'Six Weeks of Work' },
      { type: 'paragraph', content: 'For six weeks, the young people fundraised, sourced materials, and worked alongside a local artisan to design and build the crucifix. The cross is crafted from hardwood, carved with care, and stands approximately three metres tall. The corpus — the figure of Christ — was hand-carved and finished with a natural wood stain that glows warmly in the afternoon sun.' },
      { type: 'image', src: 'photo-1547471080-7cc2caa01a7e', alt: 'Golden hour at Kalimoni', caption: 'The parish grounds at golden hour — where the new crucifix now stands as a landmark of faith.' },
      { type: 'heading', content: 'The Moment It All Came Together' },
      { type: 'paragraph', content: 'As the crowd arrived at the crucifix on Good Friday, there was a long moment of silence. Hundreds of parishioners — young and old — stood before the cross under an open sky. The passion reading was proclaimed, prayers were offered, and the youth who had built it knelt in the front row.' },
      { type: 'paragraph', content: 'Parish Priest Fr. [Name] VC commended the youth for their initiative, calling the crucifix "a sign that the next generation is not abandoning the faith — they are carrying it forward, quite literally, on their shoulders."' },
    ],
  },
  {
    slug: 'jumuiyas-small-christian-communities',
    title: '72 Jumuiyas and Counting: The Power of Small Christian Communities',
    category: 'Community Life',
    author: 'Parish Communications',
    date: 'October 2022',
    readTime: '6 min read',
    excerpt:
      'From 15 in 2002 to 72 in 2022, the Jumuiyas of St. Theresa Parish tell the story of a church that lives not in pews alone, but in homes, neighbourhoods, and hearts.',
    coverImg: 'photo-1781263378197-9ea12f94b827',
    tags: ['Jumuiyas', 'SCC', 'Community', 'Parish Growth'],
    body: [
      { type: 'paragraph', content: 'In the Catholic tradition of East Africa, the parish does not end at the church door. It extends into every street, every compound, every home where a group of faithful gather around the word of God. These gatherings — known as Small Christian Communities (SCCs) or Jumuiyas in Swahili — are the lifeblood of St. Theresa Parish, Kalimoni.' },
      { type: 'heading', content: 'What Is a Jumuiya?' },
      { type: 'paragraph', content: 'A Jumuiya is a small group of Catholic families living in the same neighbourhood who come together regularly — usually weekly — to pray, read scripture, discuss their faith, and support one another in practical ways. They celebrate together, mourn together, and serve together. In Kalimoni, each Jumuiya has its own identity, its own feast day, and its own unique personality shaped by the people within it.' },
      { type: 'quote', content: '"The Jumuiya is where the Church becomes real. It is where faith becomes life." — Vincentian Father, Kalimoni Parish' },
      { type: 'heading', content: 'A Story of Growth' },
      { type: 'list', items: ['2002: 15 Jumuiyas — the year the Vincentians began organising them systematically', '2008: 25 Jumuiyas — growth driven by new residential areas around JKUAT', '2016: 30 Jumuiyas — steady expansion, two Jumuiyas becoming parishes', '2019: 48 Jumuiyas — rapid growth, new outstations established', '2022: 72 Jumuiyas — milestone year, the largest in the parish\'s history'] },
      { type: 'image', src: 'photo-1609234656388-0ff363383899', alt: 'Community gathering', caption: 'Jumuiya members gathering for their annual feast day celebration.' },
      { type: 'heading', content: 'More Than Numbers' },
      { type: 'paragraph', content: 'Behind each number is a story — of a family who moved to a new estate and started attending Mass, of a young couple who joined a Jumuiya and found their faith deepened, of an elderly woman whose Jumuiya members visit her every week and bring her Holy Communion. The Jumuiyas are the connective tissue of the parish: they ensure no one is anonymous, no one is forgotten, and no one faces life\'s hardships alone.' },
      { type: 'paragraph', content: 'As the parish looks to the future, the Jumuiyas remain its greatest strength — a living network of faith, woven into the fabric of everyday life in Kalimoni.' },
    ],
  },
  {
    slug: 'vincentian-25-years-kalimoni',
    title: '25 Years of Vincentian Mission in Kalimoni: A Reflection',
    category: 'History & Heritage',
    author: 'Parish Pastoral Team',
    date: 'January 2025',
    readTime: '7 min read',
    excerpt:
      'As the Vincentian Congregation marks 25 years of service at St. Theresa Parish, we reflect on the journey from that first handover in 2000 to the thriving community of today.',
    coverImg: 'photo-1609234656381-73e732808098',
    tags: ['Vincentians', 'Anniversary', 'History', 'Parish Mission'],
    body: [
      { type: 'paragraph', content: 'Twenty-five years ago, when Fr. James Edavazhira VC first stood at the altar of St. Theresa Parish, Kalimoni, the parish had 15 Jumuiyas and a modestly staffed dispensary. Today, it has 72 Jumuiyas, a Level 4 hospital, a comprehensive school, three daughter parishes, and a community built on a foundation of deep faith and generous service. The transformation is a testament to the Vincentian spirit: proclaiming the good news to the poor through word, sacrament, and action.' },
      { type: 'heading', content: 'The Arrival: 1999–2000' },
      { type: 'paragraph', content: 'The story begins in 1999, when the Vincentian Congregation came to Kalimoni to assist Fr. Gogan of the Holy Ghost Fathers. When Fr. Gogan fell ill and was unable to return, the Archbishop of Nairobi entrusted the parish fully to the Vincentians in 2000. Fr. James Edavazhira VC accepted the challenge with characteristic humility and missionary zeal.' },
      { type: 'quote', content: '"The Vincentian mission is not about replacing what came before — it is about building on foundations laid by those who walked before us." — Fr. James Edavazhira VC, First Vincentian Parish Priest, Kalimoni' },
      { type: 'heading', content: 'The Four Pillars in Practice' },
      { type: 'paragraph', content: 'The Vincentian ministry in Kalimoni has always rested on four pillars: Evangelisation, Celebration, Charity, and Leadership. Over 25 years, each pillar has been expressed in concrete, visible ways — from the retreats that have transformed individual lives, to the charitable works that have fed the hungry and sheltered the homeless, to the prudent financial stewardship that has made major parish projects possible.' },
      { type: 'image', src: 'photo-1628717341663-0007b0ee2597', alt: 'Community service', caption: 'Vincentian-inspired charitable service in the Kalimoni community.' },
      { type: 'heading', content: 'Looking to the Next 25 Years' },
      { type: 'paragraph', content: 'As the parish marks this milestone, there is no sense of complacency — only gratitude and renewed resolve. The Vincentians of Kalimoni continue to walk with their community, attentive to its needs, responsive to its joys, and anchored in the conviction that "service to God is service to humanity."' },
      { type: 'list', items: ['3 daughter parishes established since 2000', '72 Jumuiyas active and growing', '2 new outstations established in 2024', 'Kalimoni Mission Hospital serving thousands annually', 'Comprehensive school educating hundreds of children'] },
    ],
  },
  {
    slug: 'rosary-prayer-community',
    title: 'The Rosary as a Way of Life: How Marian Devotion Shapes Kalimoni',
    category: 'Faith & Spirituality',
    author: 'Pastoral Team',
    date: 'May 2025',
    readTime: '4 min read',
    excerpt:
      'Each morning before Mass, a group of faithful kneel at the Grotto and pray the Rosary. This quiet, daily act encapsulates something essential about the soul of St. Theresa Parish.',
    coverImg: 'photo-1637309830727-a6a12b3f43f8',
    tags: ['Rosary', 'Marian Devotion', 'Prayer', 'Spirituality'],
    body: [
      { type: 'paragraph', content: 'Before the sun has fully risen over Kalimoni, before the parish offices open and the school gates swing wide, a small group of the faithful are already kneeling at the Grotto. Their lips move in unison through the familiar mysteries of the Rosary — Joyful, Luminous, Sorrowful, and Glorious — their voices a quiet murmur beneath the African dawn.' },
      { type: 'paragraph', content: 'This scene, replicated in homes, Jumuiya gatherings, and hospital corridors across the parish, points to something essential about the spiritual identity of St. Theresa Parish, Kalimoni: a deep, embodied devotion to Our Lady that has shaped every generation of the faithful here.' },
      { type: 'heading', content: 'Marian Devotion Through the Ages' },
      { type: 'paragraph', content: 'From the earliest days of the parish\'s founding by the Holy Ghost Fathers in 1912, the Blessed Virgin Mary has occupied a central place in Kalimoni\'s Catholic life. The parish\'s patron — St. Theresa — is herself associated with deep Marian devotion, and her intercession has been invoked across more than a century of parish life.' },
      { type: 'quote', content: '"The Rosary is the Gospel on a string. Every bead is a moment with Jesus, seen through the eyes of His mother." — Parish Priest, St. Theresa Parish' },
      { type: 'image', src: 'photo-1606860512248-65d100981198', alt: 'Hands holding a rosary', caption: 'A parishioner holds their rosary after morning prayer at the Grotto.' },
      { type: 'heading', content: 'The October Challenge' },
      { type: 'paragraph', content: 'Every October — the month of the Rosary — the parish challenges every Jumuiya to pray the Rosary together at least once a week. By the end of October 2024, all 72 Jumuiyas had reported completing the challenge, some multiple times. The Grotto, consecrated just months later, was in many ways the fruit of that month of prayer.' },
      { type: 'list', items: ['Daily Rosary at the Grotto: 5:30 AM, Monday to Saturday', 'Family Rosary initiative: every Friday at 7:00 PM in Jumuiyas', 'October: All-parish Rosary challenge', 'Divine Mercy Chaplet: every Friday at 3:00 PM in the Divine Mercy Chapel'] },
      { type: 'paragraph', content: 'In an age of noise and distraction, the Rosary remains what it has always been in Kalimoni: a lifeline, a compass, and a conversation with the mother of God — unhurried, faithful, and alive.' },
    ],
  },
]

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find(p => p.slug === slug)
}
