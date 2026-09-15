/** Canonical parish location — used on Contact, footer, and map embeds. */
export const PARISH_LOCATION = {
  name: 'St. Theresa Catholic Church',
  shortName: 'St. Theresa Parish, Kalimoni',
  lines: ['P.O. BOX 141, Kalimoni 01001', 'Juja, Kiambu County, Kenya'],
  deanery: 'Ruiru Deanery',
  diocese: 'Catholic Archdiocese of Nairobi',
  phone: '+254 704 358594',
  phoneTel: '+254704358594',
  email: 'sttheresakalimoniparish@gmail.com',
  /** From Google Maps place: St. Theresa Catholic Church, Kalimoni */
  lat: -1.1164494,
  lng: 37.0202428,
  placeId: '0x182f478004ba089d:0x1e8ecd1d9f5d3e4c',
  mapsShortUrl: 'https://maps.app.goo.gl/YsuSCqxiaqpSj78L8',
} as const

export function parishGoogleMapsEmbedUrl(): string {
  const { lat, lng, name } = PARISH_LOCATION
  const q = encodeURIComponent(`${lat},${lng} (${name}, Kalimoni)`)
  // Keyless Google Maps embed pinned to the parish coordinates
  return `https://www.google.com/maps?q=${q}&z=17&hl=en&output=embed`
}

export function parishDirectionsUrl(): string {
  const { lat, lng } = PARISH_LOCATION
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`
}

export function parishOpenInMapsUrl(): string {
  return PARISH_LOCATION.mapsShortUrl
}

export function parishAppleMapsUrl(): string {
  const { lat, lng, name } = PARISH_LOCATION
  return `https://maps.apple.com/?ll=${lat},${lng}&q=${encodeURIComponent(name + ', Kalimoni')}`
}

export function formatCoordinates(): string {
  const { lat, lng } = PARISH_LOCATION
  const ns = lat < 0 ? 'S' : 'N'
  const ew = lng < 0 ? 'W' : 'E'
  return `${Math.abs(lat).toFixed(6)}° ${ns}, ${Math.abs(lng).toFixed(6)}° ${ew}`
}
