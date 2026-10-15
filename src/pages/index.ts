import type { Page } from '@playwright/test'
import { AccountPage } from './account.page.ts'
import { CartPage } from './cart.page.ts'
import { CatalogPage } from './catalog.page.ts'
import { Header } from './components/header.component.ts'
import { ProductPage } from './product.page.ts'
import { SignInPage } from './sign-in.page.ts'

/** Every page object, bound to one scenario's browser page. Add new pages here. */
export function createPages(page: Page) {
  return {
    header: new Header(page),
    catalog: new CatalogPage(page),
    product: new ProductPage(page),
    cart: new CartPage(page),
    signIn: new SignInPage(page),
    account: new AccountPage(page),
  } as const
}

export type Pages = ReturnType<typeof createPages>
