import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { setWorldConstructor, World } from '@cucumber/cucumber'
import type { Browser, BrowserContext, Page } from '@playwright/test'
import { config } from '../config.ts'
import { createPages, type Pages } from '../pages/index.ts'

interface Session {
  context: BrowserContext
  page: Page
  pages: Pages
}

/**
 * Per-scenario state, in the spirit of Playwright Test fixtures: the browser is shared per worker
 * (see hooks.ts), while every scenario gets a fresh, isolated context, page and set of page objects.
 * Step definitions only ever see `this.pages`.
 */
export class ToolshopWorld extends World {
  private session: Session | undefined

  get pages(): Pages {
    return this.current().pages
  }

  /** The raw Playwright page, for hooks only. Steps go through page objects (enforced by ESLint). */
  get page(): Page {
    return this.current().page
  }

  async openSession(browser: Browser, scenarioName: string): Promise<void> {
    const context = await browser.newContext({
      baseURL: config.baseUrl,
      viewport: { width: 1280, height: 900 },
      locale: 'en-US',
    })
    context.setDefaultTimeout(config.actionTimeout)
    context.setDefaultNavigationTimeout(config.actionTimeout * 2)
    if (config.trace !== 'off') {
      await context.tracing.start({ title: scenarioName, screenshots: true, snapshots: true, sources: true })
    }
    const page = await context.newPage()
    this.session = { context, page, pages: createPages(page) }
  }

  /** Closes the scenario's context, saving its trace when asked to. Returns the trace path, if saved. */
  async closeSession(options: { keepTrace: boolean; artifactName: string }): Promise<string | undefined> {
    const session = this.session
    if (!session) return undefined
    this.session = undefined
    let tracePath: string | undefined
    if (config.trace !== 'off') {
      if (options.keepTrace) {
        tracePath = path.join(config.artifactsDir, 'traces', `${options.artifactName}.zip`)
        await mkdir(path.dirname(tracePath), { recursive: true })
        await session.context.tracing.stop({ path: tracePath })
      } else {
        await session.context.tracing.stop()
      }
    }
    await session.context.close()
    return tracePath
  }

  private current(): Session {
    if (!this.session) throw new Error('No browser session: the Before hook has not run for this scenario')
    return this.session
  }
}

setWorldConstructor(ToolshopWorld)
