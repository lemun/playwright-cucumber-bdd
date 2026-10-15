// Lint fixture, never run by Cucumber. It is linted with the same rules as src/steps/ by
// `npm run lint:rules`, which fails unless every line marked `expect-lint: <rules>` is reported
// with exactly those rules and every unmarked line is clean.
import { When } from '@cucumber/cucumber'
import { expect as playwrightExpect } from '@playwright/test' // expect-lint: no-restricted-imports
import { expect } from '../../../src/support/expect.ts'
import type { ToolshopWorld } from '../../../src/support/world.ts'

// Allowed: page-object methods, exposed locators and assertions.
When('a step that follows the rules', async function (this: ToolshopWorld) {
  await this.pages.catalog.search('hammer')
  await expect(this.pages.catalog.productNames.first()).toBeVisible()
  playwrightExpect(this.pages.catalog.currentPath()).toBe('/')
})

// Forbidden: driving the browser from a step, through any member chain.
When('a step that drives the browser itself', async function (this: ToolshopWorld) {
  await this.page.reload() // expect-lint: no-restricted-syntax
  await this.pages.catalog.productNames.first().click() // expect-lint: no-restricted-syntax
  await this.pages.catalog.productNames.nth(1).hover() // expect-lint: no-restricted-syntax
  await this.pages.catalog.resultCount.fill('drill') // expect-lint: no-restricted-syntax
  await this.pages.catalog.resultCount.press('Enter') // expect-lint: no-restricted-syntax
  await this.pages.catalog.noResults.check() // expect-lint: no-restricted-syntax
  await this.pages.catalog.noResults.selectOption('name,asc') // expect-lint: no-restricted-syntax
  await this.pages.signIn.messages.type('x') // expect-lint: no-restricted-syntax, @typescript-eslint/no-deprecated
  await this.pages.header.userMenu.dblclick() // expect-lint: no-restricted-syntax
  await this.pages.header.userMenu.dispatchEvent('click') // expect-lint: no-restricted-syntax
  await this.pages.header.userMenu.dragTo(this.pages.catalog.noResults) // expect-lint: no-restricted-syntax
  await this.pages.header.userMenu.tap() // expect-lint: no-restricted-syntax
  await this.pages.header.userMenu.focus() // expect-lint: no-restricted-syntax
  await this.pages.header.userMenu.blur() // expect-lint: no-restricted-syntax
  await this.pages.header.userMenu.scrollIntoViewIfNeeded() // expect-lint: no-restricted-syntax
  await this.pages.header.userMenu.setInputFiles('order.csv') // expect-lint: no-restricted-syntax
  await this.pages.header.userMenu.waitFor({ state: 'visible' }) // expect-lint: no-restricted-syntax
})

// Forbidden: scripting or capturing the page from a step.
When('a step that scripts or captures the page', async function (this: ToolshopWorld) {
  await this.pages.catalog.productNames.first().screenshot() // expect-lint: no-restricted-syntax
  await this.pages.catalog.resultCount.evaluate((el) => el.textContent) // expect-lint: no-restricted-syntax
  await this.pages.catalog.productNames.evaluateAll((els) => els.length) // expect-lint: no-restricted-syntax
  await this.pages.catalog.resultCount.evaluateHandle((el) => el) // expect-lint: no-restricted-syntax
  await this.pages.catalog.resultCount.page().goto('/') // expect-lint: no-restricted-syntax
})

// Forbidden: building selectors in a step.
When('a step that builds its own selectors', async function (this: ToolshopWorld) {
  await expect(this.pages.catalog.toast('x').getByRole('button')).toBeVisible() // expect-lint: no-restricted-syntax
  await expect(this.pages.catalog.noResults.locator('span')).toBeHidden() // expect-lint: no-restricted-syntax
})
