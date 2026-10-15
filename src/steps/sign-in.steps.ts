import { Given, Then, When } from '@cucumber/cucumber'
import { demoUser } from '../data/demo-users.ts'
import { expect } from '../support/expect.ts'
import type { ToolshopWorld } from '../support/world.ts'

Given('I am on the sign-in page', async function (this: ToolshopWorld) {
  await this.pages.signIn.open()
})

When('I sign in as the demo user {string}', async function (this: ToolshopWorld, alias: string) {
  const user = demoUser(alias)
  await this.pages.signIn.signIn(user.email, user.password)
})

When(
  'I sign in with the email {string} and the password {string}',
  async function (this: ToolshopWorld, email: string, password: string) {
    await this.pages.signIn.signIn(email, password)
  },
)

When('I sign out', async function (this: ToolshopWorld) {
  await this.pages.header.signOut()
})

Then('I am on my account page', async function (this: ToolshopWorld) {
  await expect(this.pages.account.title).toHaveText('My account')
  expect(this.pages.account.currentPath()).toBe('/account')
})

Then('I am signed in as {string}', async function (this: ToolshopWorld, fullName: string) {
  await expect(this.pages.header.userMenu).toHaveText(fullName)
})

Then('I am signed out', async function (this: ToolshopWorld) {
  await expect(this.pages.header.signInLink).toBeVisible()
  await expect(this.pages.header.userMenu).toBeHidden()
})

Then('I see the message {string}', async function (this: ToolshopWorld, message: string) {
  await expect(this.pages.signIn.messages).toContainText(message)
})

Then('I am still on the sign-in page', function (this: ToolshopWorld) {
  expect(this.pages.signIn.currentPath()).toBe('/auth/login')
})
