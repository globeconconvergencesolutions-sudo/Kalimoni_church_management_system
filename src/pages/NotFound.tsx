import { Link } from 'react-router'
import { useSEO } from '../hooks/useSEO'

export default function NotFound() {
  useSEO({
    title: 'Page Not Found',
    description: 'This page could not be found on the St. Theresa Parish, Kalimoni website.',
    path: '/404',
  })
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 text-center"
      style={{ backgroundColor: '#FAF6F0', paddingTop: 80 }}
    >
      <div>
        <div
          className="text-8xl font-bold mb-4 opacity-20"
          style={{ fontFamily: "'Lora', serif", color: '#6B1A2A' }}
        >
          404
        </div>
        <h1
          className="text-3xl font-bold mb-3"
          style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}
        >
          Page Not Found
        </h1>
        <p className="text-sm mb-8" style={{ color: '#6B6259' }}>
          The page you are looking for does not exist or has moved.
        </p>
        <Link
          to="/"
          className="px-7 py-3 font-semibold text-sm"
          style={{ backgroundColor: '#6B1A2A', color: '#F0E8D8' }}
        >
          Return to Home
        </Link>
      </div>
    </div>
  )
}
