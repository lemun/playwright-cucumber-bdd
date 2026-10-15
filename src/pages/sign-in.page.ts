import type { Locator, Page } from '@playwright/test'
import { BasePage } from './base.page.ts'

export class SignInPage extends BasePage {
  protected readonly path = '/auth/login'

  /** Field validation messages and the server's sign-in error share one place on the form. */
  readonly messages: Locator

  private readonly email: Locator
  private readonly password: Locator
  private readonly submit: Locator

  constructor(page: Page) {
    super(page)
    this.email = page.getByTestId('email')
    this.password = page.getByTestId('password')
    this.submit = page.getByTestId('login-submit')
    this.messages = page
      .getByTestId('email-error')
      .or(page.getByTestId('password-error'))
      .or(page.getByTestId('login-error'))
  }

  protected async waitUntilReady(): Promise<void> {
    await this.submit.waitFor()
  }

  async signIn(email: string, password: string): Promise<void> {
    await this.email.fill(email)
    await this.password.fill(password)
    await this.submit.click()
  }
}
