import type { Locator, Page } from '@playwright/test'
import { BasePage } from './base.page.ts'
import { exactText } from './text.ts'

/**
 * The Toolshop's catalog. The result grid carries a `data-test` attribute that tracks its
 * loading state (`search_completed`, `filter_completed`, `sorting_completed`), so every
 * action waits for that state instead of sleeping.
 */
export class CatalogPage extends BasePage {
  protected readonly path = '/'

  readonly productNames: Locator
  readonly productPrices: Locator
  readonly resultCount: Locator
  readonly noResults: Locator

  private readonly searchInput: Locator
  private readonly searchButton: Locator
  private readonly sortSelect: Locator
  private readonly filters: Locator

  constructor(page: Page) {
    super(page)
    this.productNames = page.getByTestId('product-name')
    this.productPrices = page.getByTestId('product-price')
    this.resultCount = page.getByTestId('search-result-count')
    this.noResults = page.getByTestId('no-results')
    this.searchInput = page.getByTestId('search-query')
    this.searchButton = page.getByTestId('search-submit')
    this.sortSelect = page.getByTestId('sort')
    this.filters = page.locator('#filters')
  }

  protected async waitUntilReady(): Promise<void> {
    await this.productNames.first().waitFor()
  }

  async search(keyword: string): Promise<void> {
    await this.searchInput.fill(keyword)
    await this.searchButton.click()
    await this.resultsSettled('search_completed')
  }

  async filterByCategory(category: string): Promise<void> {
    await this.filters.getByRole('checkbox', { name: category, exact: true }).check()
    await this.resultsSettled('filter_completed')
  }

  async filterByBrand(brand: string): Promise<void> {
    await this.filters.getByRole('checkbox', { name: brand, exact: true }).check()
    await this.resultsSettled('filter_completed')
  }

  /** Picks a sort option by its visible label, e.g. "Price (Low - High)". */
  async sortBy(label: string): Promise<void> {
    await this.sortSelect.selectOption({ label })
    await this.resultsSettled('sorting_completed')
  }

  async openProduct(name: string): Promise<void> {
    await this.productNames.filter({ hasText: exactText(name) }).click()
  }

  /** The shopper's usual route to a product: catalog, search by name, open the matching card. */
  async findAndOpenProduct(name: string): Promise<void> {
    await this.open()
    await this.search(name)
    await this.openProduct(name)
  }

  /** Names of the products on the current results page, in display order. */
  async visibleProductNames(): Promise<string[]> {
    return (await this.productNames.allInnerTexts()).map((name) => name.trim())
  }

  /** Prices of the products on the current results page, in display order. */
  async visibleProductPrices(): Promise<number[]> {
    return (await this.productPrices.allInnerTexts()).map(parsePrice)
  }

  private async resultsSettled(state: string): Promise<void> {
    await this.page.getByTestId(state).waitFor()
  }
}

export function parsePrice(text: string): number {
  const value = Number(text.replace(/[^0-9.]/g, ''))
  if (Number.isNaN(value)) throw new Error(`Not a price: "${text}"`)
  return value
}
