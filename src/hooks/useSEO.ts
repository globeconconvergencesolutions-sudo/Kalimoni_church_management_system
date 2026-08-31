import { useEffect } from 'react'

const SITE_NAME = 'St. Theresa Parish, Kalimoni'
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1759178124741-8d3a8aaab778?w=1200&h=630&fit=crop&auto=format'
const BASE_URL = 'https://sttheresakalimoni.org'

interface SEOProps {
  title: string
  description: string
  image?: string
  path?: string
}

function setMetaTag(selector: string, attr: string, key: string, value: string) {
  let el = document.querySelector(selector) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

export function useSEO({ title, description, image = DEFAULT_IMAGE, path = '' }: SEOProps) {
  useEffect(() => {
    const fullTitle = title === SITE_NAME ? SITE_NAME : `${title} | ${SITE_NAME}`
    const url = `${BASE_URL}${path}`

    document.title = fullTitle

    setMetaTag('meta[name="description"]', 'name', 'description', description)
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', fullTitle)
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description)
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', image)
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', url)
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle)
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description)
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', image)

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', url)
  }, [title, description, image, path])
}
