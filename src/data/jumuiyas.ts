/** Official Small Christian Communities (Jumuiyas) — parish info sheet (19 + 11 + 10 = 40). */

export type JumuiyaZone = {
  id: string
  label: string
  communities: string[]
}

export const JUMUIYA_ZONES: JumuiyaZone[] = [
  {
    id: 'kalimoni',
    label: 'Kalimoni',
    communities: [
      'St. Andrew Kaggwa',
      'Maximilian Kolbe',
      'St. Charles Lwanga',
      'St. Ignatius of Loyola',
      'St. Joseph the Worker',
      'St. Jude',
      'Maria Mama Wa Yesu',
      'Our Lady of Fatima',
      'Our Lady of the Rosary',
      'St. Vincent De Paul',
      'Queen of All Saints',
      'Our Lady of Mercy',
      'St. Rita of Cascia',
      'St. John Paul II',
      'St. George',
      'St. Patrick',
      'St. Padre Pio',
      'St. Francis of Assisi',
      'St. John the Baptist',
    ],
  },
  {
    id: 'haa',
    label: 'HAA',
    communities: [
      'St. Bernadette Soubirous',
      'St. Martin De Porres',
      'Blessed Irene',
      'St. Augustine of Hippo',
      'St. Aquilina',
      'St. Alphonsa',
      'St. Albert the Great',
      'St. Teresa of Avila',
      'St. Lawrence',
      'St. Francis Xavier',
      'St. John of the Cross',
    ],
  },
  {
    id: 'st-dominic',
    label: 'St. Dominic',
    communities: [
      'St. Thomas More',
      'St. Thomas Aquinas',
      'Maria Consolata',
      'St. Agatha of Sicily',
      'St. Elizabeth of Hungary',
      'St. Monica',
      'St. Teresa of Calcutta',
      'St. Catherine of Siena',
      'Our Lady of Perpetual Help',
      'St. Faustina',
    ],
  },
]

export const ALL_JUMUIYAS = JUMUIYA_ZONES.flatMap(z => z.communities)

/** Always matches the named list (official sheet: 40). */
export const JUMUIYA_COUNT = ALL_JUMUIYAS.length
