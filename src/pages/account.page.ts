import type { Locator, Page } from '@playwright/test'
import { BasePage } from './base.page.ts'

export class AccountPage extends BasePage {
  protected readonly path = '/account'

  readonly title: Locator

  constructor(page: Page) {
    super(page)
    this.title = page.getByTestId('page-title')
  }

  protected async waitUntilReady(): Promise<void> {
    await this.title.waitFor()
  }
}
