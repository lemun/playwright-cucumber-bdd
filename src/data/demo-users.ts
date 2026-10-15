/**
 * Demo customers that ship with the Toolshop. Their credentials are published in the
 * project's README (github.com/testsmith-io/practice-software-testing), so they are not secrets.
 *
 * Do not use them for failed-login scenarios: the Toolshop locks a customer account after
 * three wrong passwords, which would break the shared demo for everyone. (Other visitors do
 * lock them now and then: `customer2` was locked when this suite was last updated.)
 */
export interface DemoUser {
  readonly email: string
  readonly password: string
  readonly fullName: string
}

export const demoUsers = {
  customer: {
    email: 'customer@practicesoftwaretesting.com',
    password: 'welcome01',
    fullName: 'Jane Doe',
  },
  customer3: {
    email: 'customer3@practicesoftwaretesting.com',
    password: 'pass123',
    fullName: 'Bob Smith',
  },
} as const satisfies Record<string, DemoUser>

export type DemoUserAlias = keyof typeof demoUsers

export function demoUser(alias: string): DemoUser {
  if (!(alias in demoUsers)) {
    throw new Error(`Unknown demo user "${alias}". Known: ${Object.keys(demoUsers).join(', ')}`)
  }
  return demoUsers[alias as DemoUserAlias]
}
