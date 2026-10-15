import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { After, AfterAll, Before, BeforeAll, setDefaultTimeout, Status } from '@cucumber/cucumber'
import { chromium, firefox, selectors, webkit, type Browser } from '@playwright/test'
import { config } from '../config.ts'
import type { ToolshopWorld } from './world.ts'

setDefaultTimeout(config.stepTimeout)

const browserTypes = { chromium, firefox, webkit } as const

// One browser per worker; with `parallel: 3` that is three browsers, each serving many scenarios.
let browser: Browser | undefined

BeforeAll(async function () {
  // The Toolshop marks its elements with `data-test`, so `getByTestId()` should look there.
  selectors.setTestIdAttribute('data-test')
  browser = await browserTypes[config.browser].launch({ headless: config.headless })
})

Before(async function (this: ToolshopWorld, { pickle }) {
  if (!browser) throw new Error('Browser was not launched')
  await this.openSession(browser, pickle.name)
})

After(async function (this: ToolshopWorld, { pickle, result }) {
  const failed = result?.status === Status.FAILED
  const artifactName = `${slug(pickle.name)}-${pickle.id.slice(0, 8)}`

  if (failed) {
    const screenshot = await this.page.screenshot({ fullPage: true })
    const screenshotPath = path.join(config.artifactsDir, 'screenshots', `${artifactName}.png`)
    await mkdir(path.dirname(screenshotPath), { recursive: true })
    await writeFile(screenshotPath, screenshot)
    this.attach(screenshot, { mediaType: 'image/png', fileName: `${artifactName}.png` })
    this.attach(`Failed on ${this.page.url()}`, 'text/plain')
  }

  const tracePath = await this.closeSession({
    keepTrace: failed || config.trace === 'on',
    artifactName,
  })
  if (tracePath)
    this.attach(`Trace saved. Open it with: npx playwright show-trace ${tracePath}`, 'text/plain')
})

AfterAll(async function () {
  await browser?.close()
})

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}
