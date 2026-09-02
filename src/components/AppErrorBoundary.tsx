import { Component, type ErrorInfo, type ReactNode } from 'react'
import { describeAppError } from '../lib/appErrors'

type Props = { children: ReactNode }

type State = { error: Error | null }

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Parish app error:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    const details = describeAppError(this.state.error)

    return (
      <div
        className="min-h-screen flex items-center justify-center px-6 py-16 text-center"
        style={{ backgroundColor: '#FAF6F0' }}
      >
        <div className="max-w-md">
          <div
            className="text-[10px] tracking-[0.28em] uppercase mb-4"
            style={{ color: '#C8922A', fontFamily: "'DM Mono', monospace" }}
          >
            St. Theresa · Kalimoni
          </div>
          <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: "'Lora', serif", color: '#4A1019' }}>
            {details.title}
          </h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: '#6B6259' }}>
            {details.message}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-7 py-3 font-semibold text-sm min-h-[48px]"
            style={{ backgroundColor: '#6B1A2A', color: '#F0E8D8', fontFamily: "'Lora', serif" }}
          >
            Reload website
          </button>
        </div>
      </div>
    )
  }
}
