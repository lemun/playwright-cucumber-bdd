import { Given, Then, When, type DataTable } from '@cucumber/cucumber'
import type { CartLine } from '../pages/cart.page.ts'
import { expect } from '../support/expect.ts'
import type { ToolshopWorld } from '../support/world.ts'

When('I add {int} of this product to my cart', async function (this: ToolshopWorld, quantity: number) {
  await this.pages.product.addToCart(quantity)
})

When('I try to add {int} of this product to my cart', async function (this: ToolshopWorld, quantity: number) {
  await this.pages.product.tryToAddToCart(quantity)
})

Given('I have added these products to my cart:', async function (this: ToolshopWorld, table: DataTable) {
  for (const { product, quantity } of table.hashes()) {
    if (product === undefined || quantity === undefined) {
      throw new Error('The table needs "product" and "quantity" columns')
    }
    await this.pages.catalog.findAndOpenProduct(product)
    await this.pages.product.addToCart(Number(quantity))
  }
})

When('I open my cart', async function (this: ToolshopWorld) {
  await this.pages.cart.open()
})

When(
  'I change the quantity of {string} to {int}',
  async function (this: ToolshopWorld, product: string, quantity: number) {
    await this.pages.cart.changeQuantity(product, quantity)
  },
)

When('I remove {string} from my cart', async function (this: ToolshopWorld, product: string) {
  await this.pages.cart.remove(product)
})

Then('I am told {string}', async function (this: ToolshopWorld, message: string) {
  await expect(this.pages.catalog.toast(message)).toBeVisible()
})

Then('the cart icon shows {int} items', async function (this: ToolshopWorld, count: number) {
  await expect(this.pages.header.cartQuantity).toHaveText(String(count))
})

Then('my cart contains:', async function (this: ToolshopWorld, table: DataTable) {
  const expected: CartLine[] = table.hashes().map((row) => ({
    product: row.product ?? '',
    quantity: Number(row.quantity),
    lineTotal: row['line total'] ?? '',
  }))
  // Totals are recalculated after the shop confirms a change, so poll until they settle.
  await expect.poll(() => this.pages.cart.lines()).toEqual(expected)
})

Then('the cart total is {string}', async function (this: ToolshopWorld, total: string) {
  await expect(this.pages.cart.total).toHaveText(total)
})

Then('my cart is still empty', async function (this: ToolshopWorld) {
  await expect(this.pages.header.cartQuantity).toBeHidden()
})

Then('I am told my cart is empty', async function (this: ToolshopWorld) {
  await expect(this.pages.cart.emptyMessage).toBeVisible()
})
