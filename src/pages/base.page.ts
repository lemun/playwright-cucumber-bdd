import type { Locator, Page } from '@playwright/test'
import { Header } from './components/header.component.ts'

/**
 * Common ground for page objects. A page object owns its locators and the actions a user can take;
 * it never asserts business outcomes. Step definitions decide what "correct" means.
 */
export abstract class BasePage {
  readonly header: Header

  /** Path relative to the configured base URL, used by `open()`; undefined if only reachable by navigation. */
  protected abstract readonly path: string | undefined

  constructor(protected readonly page: Page) {
    this.header = new Header(page)
  }

  async open(): Promise<void> {
    if (this.path === undefined) throw new Error(`${this.constructor.name} cannot be opened directly`)
    await this.page.goto(this.path)
    await this.waitUntilReady()
  }

  /** The URL path the browser is on right now, for "am I on the right page" checks. */
  currentPath(): string {
    return new URL(this.page.url()).pathname
  }

  /** A notification toast with the given text (the Toolshop confirms cart changes with toasts). */
  toast(text: string): Locator {
    return this.page.getByRole('alert').filter({ hasText: text })
  }

  /** Waits for the page's own content, not just the document, to be usable. */
  protected abstract waitUntilReady(): Promise<void>
}
