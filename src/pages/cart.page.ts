import type { Locator, Page } from '@playwright/test'
import { BasePage } from './base.page.ts'
import { exactText } from './text.ts'

export interface CartLine {
  product: string
  quantity: number
  lineTotal: string
}

/** The first checkout step, which lists the cart. */
export class CartPage extends BasePage {
  protected readonly path = '/checkout'

  readonly total: Locator
  readonly emptyMessage: Locator

  private readonly rows: Locator

  constructor(page: Page) {
    super(page)
    this.total = page.getByTestId('cart-total')
    this.emptyMessage = page.getByText('The cart is empty. Nothing to display.')
    this.rows = page.locator('tbody tr').filter({ has: page.getByTestId('product-title') })
  }

  protected async waitUntilReady(): Promise<void> {
    await this.rows.first().or(this.emptyMessage).waitFor()
  }

  async lines(): Promise<CartLine[]> {
    await this.waitUntilReady()
    const lines: CartLine[] = []
    for (const row of await this.rows.all()) {
      lines.push({
        product: (await row.getByTestId('product-title').innerText()).trim(),
        quantity: Number(await row.getByTestId('product-quantity').inputValue()),
        lineTotal: (await row.getByTestId('line-price').innerText()).trim(),
      })
    }
    return lines
  }

  /** Types a new quantity and waits for the shop to confirm the update. */
  async changeQuantity(product: string, quantity: number): Promise<void> {
    const input = this.row(product).getByTestId('product-quantity')
    await input.fill(String(quantity))
    await input.press('Tab') // the shop saves the quantity on the input's change event
    await this.toast('Product quantity updated.').waitFor()
  }

  async remove(product: string): Promise<void> {
    const row = this.row(product)
    // The remove button has no label or test id in the Toolshop markup; it is the row's danger button.
    await row.locator('a.btn-danger').click()
    await row.waitFor({ state: 'detached' })
  }

  private row(product: string): Locator {
    return this.rows.filter({
      has: this.page.getByTestId('product-title').filter({ hasText: exactText(product) }),
    })
  }
}
