/** Turn thrown values and API failures into parish-friendly copy. */

export type AppErrorKind = 'not_found' | 'network' | 'chunk' | 'config' | 'auth' | 'unknown'

export type AppErrorDetails = {
  kind: AppErrorKind
  title: string
  message: string
  hint?: string
  status?: number
}

const CHUNK_PATTERNS = [
  /failed to fetch dynamically imported module/i,
  /loading chunk \d+ failed/i,
  /importing a module script failed/i,
  /chunkloaderror/i,
]

export function isChunkLoadError(error: unknown): boolean {
  const text = errorToText(error)
  return CHUNK_PATTERNS.some(pattern => pattern.test(text))
}

export function errorToText(error: unknown): string {
  if (error instanceof Error) return `${error.name} ${error.message}`
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'statusText' in error) {
    return String((error as { statusText?: string }).statusText || '')
  }
  try {
    return JSON.stringify(error)
  } catch {
    return 'Unknown error'
  }
}

export function describeAppError(error: unknown, opts: { scope?: 'public' | 'office' } = {}): AppErrorDetails {
  const scope = opts.scope ?? 'public'
  const text = errorToText(error)

  if (isChunkLoadError(error) || CHUNK_PATTERNS.some(p => p.test(text))) {
    return {
      kind: 'chunk',
      title: 'A newer version is available',
      message: 'The parish website was updated while you had this page open.',
      hint: 'Refresh the page to load the latest version.',
    }
  }

  if (/failed to fetch|networkerror|load failed|network request failed/i.test(text)) {
    return {
      kind: 'network',
      title: 'Connection interrupted',
      message: 'We could not reach the parish servers. Check your internet connection and try again.',
    }
  }

  if (/supabase is not configured|missing env|invalid api key/i.test(text)) {
    return {
      kind: 'config',
      title: scope === 'office' ? 'Parish office unavailable' : 'Website temporarily unavailable',
      message:
        scope === 'office'
          ? 'The office cannot connect to the parish database. An administrator needs to check the site configuration.'
          : 'Part of the parish website is not configured correctly. Please try again later.',
    }
  }

  if (/sign in|session expired|unauthorized|not authenticated/i.test(text)) {
    return {
      kind: 'auth',
      title: 'Sign in required',
      message: 'Your session has ended. Sign in again to continue.',
      hint: scope === 'office' ? 'Go to the parish office login page.' : undefined,
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return {
      kind: 'unknown',
      title: scope === 'office' ? 'Something went wrong' : 'We hit a snag',
      message: error.message,
    }
  }

  return {
    kind: 'unknown',
    title: scope === 'office' ? 'Something went wrong' : 'We hit a snag',
    message: 'An unexpected error occurred. Please try again.',
  }
}

export function describeHttpStatus(status: number, scope: 'public' | 'office' = 'public'): AppErrorDetails {
  if (status === 404) {
    return {
      kind: 'not_found',
      status: 404,
      title: 'Page not found',
      message: 'The page you are looking for does not exist or may have moved.',
    }
  }
  if (status === 403) {
    return {
      kind: 'auth',
      status: 403,
      title: 'Access denied',
      message: scope === 'office' ? 'You do not have permission to view this page.' : 'You cannot open this page.',
    }
  }
  if (status >= 500) {
    return {
      kind: 'unknown',
      status,
      title: 'Server error',
      message: 'The parish servers returned an error. Please try again in a moment.',
    }
  }
  return {
    kind: 'unknown',
    status,
    title: 'Request failed',
    message: `Something went wrong (error ${status}).`,
  }
}
