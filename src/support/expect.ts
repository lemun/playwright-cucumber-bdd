import { expect as playwrightExpect } from '@playwright/test'
import { config } from '../config.ts'

/** Playwright's web-first `expect`, with the project's timeout. Step definitions import it from here. */
export const expect = playwrightExpect.configure({ timeout: config.actionTimeout })
