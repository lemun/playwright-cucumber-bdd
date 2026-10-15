import { Given, Then, type DataTable } from '@cucumber/cucumber'
import { expect } from '../support/expect.ts'
import type { ToolshopWorld } from '../support/world.ts'

Given('I am viewing the product {string}', async function (this: ToolshopWorld, name: string) {
  await this.pages.catalog.findAndOpenProduct(name)
})

Then('I see the product details:', async function (this: ToolshopWorld, table: DataTable) {
  await expect(this.pages.product.name).toBeVisible()
  expect(await this.pages.product.details()).toEqual(table.rowsHash())
})

Then('the product has a description', async function (this: ToolshopWorld) {
  await expect(this.pages.product.description).not.toBeEmpty()
})

Then('I am told the product is out of stock', async function (this: ToolshopWorld) {
  await expect(this.pages.product.outOfStock).toHaveText('Out of stock')
})

Then('I cannot add the product to my cart', async function (this: ToolshopWorld) {
  await expect(this.pages.product.addToCartButton).toBeDisabled()
})
