export interface ParishEvent {
  id: string
  date: string
  month: string
  title: string
  category: string
  time: string
  desc: string
  color: string
  icon: string
}

export const PARISH_EVENTS: ParishEvent[] = [
  { id: 'assumption-2026', date: 'Aug 15, 2026', month: 'Aug 2026', title: 'Assumption of Mary', category: 'Holy Day of Obligation', time: '7:30 AM · 9:30 AM', desc: 'Solemnity of the Assumption of the Blessed Virgin Mary. Holy Day of Obligation — all Catholics are called to participate in Mass.', color: '#6B1A2A', icon: '✦' },
  { id: 'cwa-sep-2026', date: 'Sep 5, 2026', month: 'Sep 2026', title: 'CWA Monthly Meeting', category: 'Ministry', time: '9:00 AM – 12:00 PM', desc: 'Monthly gathering of the Catholic Women Association. All CWA members are invited. Agenda includes charity reports and Marian devotions.', color: '#4A3A10', icon: '♡' },
  { id: 'holy-cross-2026', date: 'Sep 14, 2026', month: 'Sep 2026', title: 'Triumph of the Holy Cross', category: 'Feast Day', time: '7:00 AM · 6:00 PM', desc: 'Feast of the Exaltation of the Holy Cross. Special Mass and evening prayer service with cross veneration.', color: '#6B1A2A', icon: '✝' },
  { id: 'patronal-2026', date: 'Oct 1, 2026', month: 'Oct 2026', title: 'Parish Feast Day — St. Theresa', category: 'Patronal Feast', time: '7:30 AM · 9:30 AM · 6:00 PM', desc: "Solemnity of St. Theresa of Lisieux — the parish's patronal feast. Solemn Mass, procession, cultural celebrations, and parish dinner.", color: '#6B1A2A', icon: '★' },
  { id: 'rosary-2026', date: 'Oct 7, 2026', month: 'Oct 2026', title: 'Our Lady of the Rosary', category: 'Marian Feast', time: '7:30 AM · Procession 5:00 PM', desc: 'Special Rosary procession and Mass in honour of Our Lady of the Rosary. The CWA and Marian groups lead the procession.', color: '#4A3A10', icon: '◎' },
  { id: 'mission-sunday-2026', date: 'Oct 17, 2026', month: 'Oct 2026', title: 'World Mission Sunday', category: 'PMC / Mission', time: '9:30 AM', desc: 'Annual World Mission Sunday — the Pontifical Missionary Childhood (PMC) leads a special collection for the missions. Children invited to participate.', color: '#3A1A2A', icon: '◈' },
  { id: 'all-saints-2026', date: 'Nov 1, 2026', month: 'Nov 2026', title: 'All Saints Day', category: 'Holy Day of Obligation', time: '7:30 AM · 9:30 AM', desc: "Solemnity of All Saints. Holy Day of Obligation. We honour all the saints — known and unknown — who now enjoy God's presence.", color: '#2A1A4A', icon: '✦' },
  { id: 'all-souls-2026', date: 'Nov 2, 2026', month: 'Nov 2026', title: 'All Souls Day', category: 'Commemoration', time: '7:30 AM · 6:00 PM', desc: 'Commemoration of All the Faithful Departed. Mass for the faithful departed. Jumuiyas are invited to the special commemorative evening liturgy.', color: '#1A3A4A', icon: '✝' },
  { id: 'christ-the-king-2026', date: 'Nov 22, 2026', month: 'Nov 2026', title: 'Christ the King', category: 'Solemnity', time: '7:30 AM · 9:30 AM · Procession', desc: 'Solemnity of Our Lord Jesus Christ, King of the Universe — the final Sunday of the liturgical year. Grand procession and parish celebrations.', color: '#4A1019', icon: '❧' },
  { id: 'immaculate-2026', date: 'Dec 8, 2026', month: 'Dec 2026', title: 'Immaculate Conception', category: 'Holy Day of Obligation', time: '7:30 AM · 9:30 AM · Grotto 12:00 PM', desc: 'Solemnity of the Immaculate Conception — Holy Day of Obligation. Special Grotto devotions at noon, led by the CWA.', color: '#3A1A2A', icon: '♦' },
  { id: 'ysc-concert-2026', date: 'Dec 13, 2026', month: 'Dec 2026', title: 'YSC Christmas Concert', category: 'Youth / Music', time: '4:00 PM', desc: 'The Youths Serving Christ present the annual Christmas Music Concert. Free entry — all parishioners and guests warmly welcomed.', color: '#2A1A4A', icon: '♬' },
  { id: 'christmas-2026', date: 'Dec 25, 2026', month: 'Dec 2026', title: 'Christmas Day', category: 'Solemnity', time: 'Midnight · 7:30 AM · 9:30 AM', desc: 'The Nativity of Our Lord Jesus Christ. Midnight Mass (Christmas Vigil), followed by morning Masses. Come celebrate the birth of our Saviour.', color: '#4A1019', icon: '★' },
]
