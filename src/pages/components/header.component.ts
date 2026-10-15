import type { Locator, Page } from '@playwright/test'

/** The navigation bar shared by every page: cart badge, sign-in link and the signed-in user menu. */
export class Header {
  readonly cartQuantity: Locator
  readonly signInLink: Locator
  readonly userMenu: Locator
  private readonly signOutLink: Locator

  constructor(page: Page) {
    this.cartQuantity = page.getByTestId('cart-quantity')
    this.signInLink = page.getByTestId('nav-sign-in')
    this.userMenu = page.getByTestId('nav-menu')
    this.signOutLink = page.getByTestId('nav-sign-out')
  }

  /** Number of items in the cart badge; the badge is hidden while the cart is empty. */
  async cartItemCount(): Promise<number> {
    if (!(await this.cartQuantity.isVisible())) return 0
    return Number((await this.cartQuantity.innerText()).trim())
  }

  async signOut(): Promise<void> {
    await this.userMenu.click()
    await this.signOutLink.click()
  }
}
