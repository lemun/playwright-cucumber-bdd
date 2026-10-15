/**
 * Run configuration, read once from environment variables.
 * Every value has a default, so `npm test` works with no setup.
 */

export type BrowserName = 'chromium' | 'firefox' | 'webkit'
export type TraceMode = 'off' | 'on' | 'retain-on-failure'

const browsers: readonly BrowserName[] = ['chromium', 'firefox', 'webkit']
const traceModes: readonly TraceMode[] = ['off', 'on', 'retain-on-failure']

function oneOf<T extends string>(name: string, allowed: readonly T[], fallback: T): T {
  const value = process.env[name]
  if (value === undefined || value === '') return fallback
  if ((allowed as readonly string[]).includes(value)) return value as T
  throw new Error(`${name}="${value}" is not one of: ${allowed.join(', ')}`)
}

function positiveInt(name: string, fallback: number): number {
  const value = process.env[name]
  if (value === undefined || value === '') return fallback
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name}="${value}" must be a positive integer`)
  }
  return parsed
}

export const config = {
  /** The Practice Software Testing "Toolshop", a demo shop built for test-automation practice. */
  baseUrl: (process.env.BASE_URL ?? 'https://practicesoftwaretesting.com').replace(/\/$/, ''),
  browser: oneOf('BROWSER', browsers, 'chromium'),
  headless: process.env.HEADLESS !== 'false',
  trace: oneOf('TRACE', traceModes, 'retain-on-failure'),
  /** Upper bound for a single Playwright action or web-first assertion (ms). */
  actionTimeout: positiveInt('ACTION_TIMEOUT', 15_000),
  /** Upper bound for a whole Cucumber step (ms). */
  stepTimeout: positiveInt('STEP_TIMEOUT', 60_000),
  artifactsDir: 'reports',
} as const
