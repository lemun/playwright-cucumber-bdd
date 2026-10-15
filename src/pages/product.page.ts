import type { Locator, Page } from '@playwright/test'
import { BasePage } from './base.page.ts'

export interface ProductDetails {
  name: string
  price: string
  category: string
  brand: string
}

/** A single product: details, quantity picker and the add-to-cart button. */
export class ProductPage extends BasePage {
  /** Product URLs use generated ids, so this page is reached from the catalog. */
  protected readonly path = undefined

  readonly name: Locator
  readonly description: Locator
  readonly outOfStock: Locator
  readonly addToCartButton: Locator

  private readonly unitPrice: Locator
  private readonly category: Locator
  private readonly brand: Locator
  private readonly quantity: Locator

  constructor(page: Page) {
    super(page)
    this.name = page.getByTestId('product-name')
    this.description = page.getByTestId('product-description')
    this.outOfStock = page.getByTestId('out-of-stock')
    this.addToCartButton = page.getByTestId('add-to-cart')
    this.unitPrice = page.getByTestId('unit-price')
    this.category = page.getByLabel('category', { exact: true })
    this.brand = page.getByLabel('brand', { exact: true })
    this.quantity = page.getByTestId('quantity')
  }

  protected async waitUntilReady(): Promise<void> {
    await this.name.waitFor()
  }

  async details(): Promise<ProductDetails> {
    await this.waitUntilReady()
    const text = async (locator: Locator) => (await locator.innerText()).trim()
    return {
      name: await text(this.name),
      price: `$${await text(this.unitPrice)}`,
      category: await text(this.category),
      brand: await text(this.brand),
    }
  }

  /** Adds `quantity` items and waits for the shop to confirm, so the next step never races the cart. */
  async addToCart(quantity = 1): Promise<void> {
    await this.tryToAddToCart(quantity)
    await this.toast('Product added to shopping cart.').waitFor()
  }

  /** Clicks "Add to cart" without assuming it succeeds, for scenarios where the shop refuses. */
  async tryToAddToCart(quantity: number): Promise<void> {
    await this.waitUntilReady()
    await this.quantity.fill(String(quantity))
    await this.addToCartButton.click()
  }
}
