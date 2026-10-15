import { Given, Then, When, type DataTable } from '@cucumber/cucumber'
import { expect } from '../support/expect.ts'
import type { SortOrder } from '../support/parameter-types.ts'
import type { ToolshopWorld } from '../support/world.ts'

Given('I am browsing the catalog', async function (this: ToolshopWorld) {
  await this.pages.catalog.open()
})

When('I search for {string}', async function (this: ToolshopWorld, keyword: string) {
  await this.pages.catalog.search(keyword)
})

When('I filter by the category {string}', async function (this: ToolshopWorld, category: string) {
  await this.pages.catalog.filterByCategory(category)
})

When('I filter by the brand {string}', async function (this: ToolshopWorld, brand: string) {
  await this.pages.catalog.filterByBrand(brand)
})

When('I sort the products by {string}', async function (this: ToolshopWorld, option: string) {
  await this.pages.catalog.sortBy(option)
})

When('I open the product {string}', async function (this: ToolshopWorld, name: string) {
  await this.pages.catalog.openProduct(name)
})

Then(
  'I see {int} products found for {string}',
  async function (this: ToolshopWorld, count: number, keyword: string) {
    await expect(this.pages.catalog.resultCount).toHaveText(`${count} products found for '${keyword}'`)
  },
)

Then('every product shown has {string} in its name', async function (this: ToolshopWorld, keyword: string) {
  const names = await this.pages.catalog.visibleProductNames()
  expect(names.length, 'number of products shown').toBeGreaterThan(0)
  const mismatches = names.filter((name) => !name.toLowerCase().includes(keyword.toLowerCase()))
  expect(mismatches, `products whose name lacks "${keyword}"`).toEqual([])
})

Then('the results include {string}', async function (this: ToolshopWorld, product: string) {
  expect(await this.pages.catalog.visibleProductNames()).toContain(product)
})

Then('the results include:', async function (this: ToolshopWorld, table: DataTable) {
  expect(await this.pages.catalog.visibleProductNames()).toEqual(expect.arrayContaining(productColumn(table)))
})

Then('the results do not include:', async function (this: ToolshopWorld, table: DataTable) {
  const names = await this.pages.catalog.visibleProductNames()
  const unexpected = productColumn(table).filter((product) => names.includes(product))
  expect(unexpected, 'products that should have been filtered out').toEqual([])
})

Then('the results are exactly:', async function (this: ToolshopWorld, table: DataTable) {
  const names = await this.pages.catalog.visibleProductNames()
  expect(names.toSorted()).toEqual(productColumn(table).toSorted())
})

Then('I am told that no products were found', async function (this: ToolshopWorld) {
  await expect(this.pages.catalog.noResults).toHaveText('There are no products found.')
})

Then('the products are sorted {sortOrder}', async function (this: ToolshopWorld, order: SortOrder) {
  const catalog = this.pages.catalog
  if (order.by === 'name') {
    const names = await catalog.visibleProductNames()
    expect(names.length, 'number of products shown').toBeGreaterThan(1)
    expect(names).toEqual(inOrder(names, (a, b) => byName.compare(a, b), order.direction))
  } else {
    const prices = await catalog.visibleProductPrices()
    expect(prices.length, 'number of products shown').toBeGreaterThan(1)
    expect(prices).toEqual(inOrder(prices, (a, b) => a - b, order.direction))
  }
})

Then('the first product shown is {string}', async function (this: ToolshopWorld, product: string) {
  await expect(this.pages.catalog.productNames.first()).toHaveText(product)
})

function productColumn(table: DataTable): string[] {
  return table.hashes().map((row) => {
    if (row.product === undefined) throw new Error('The table needs a "product" column')
    return row.product
  })
}

const byName = new Intl.Collator('en', { sensitivity: 'base' })

function inOrder<T>(
  values: readonly T[],
  compare: (a: T, b: T) => number,
  direction: SortOrder['direction'],
): T[] {
  const ascending = values.toSorted(compare)
  return direction === 'ascending' ? ascending : ascending.toReversed()
}
