import { defineParameterType } from '@cucumber/cucumber'

export interface SortOrder {
  by: 'name' | 'price'
  direction: 'ascending' | 'descending'
}

const sortOrders: Record<string, SortOrder> = {
  'from A to Z': { by: 'name', direction: 'ascending' },
  'from Z to A': { by: 'name', direction: 'descending' },
  'from the lowest to the highest price': { by: 'price', direction: 'ascending' },
  'from the highest to the lowest price': { by: 'price', direction: 'descending' },
}

/**
 * `{sortOrder}` turns plain-English phrases into a typed value, so the Gherkin stays readable
 * and the step definition gets a structured argument instead of parsing text itself.
 */
defineParameterType({
  name: 'sortOrder',
  regexp: new RegExp(
    Object.keys(sortOrders)
      .map((phrase) => phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|'),
  ),
  transformer: (phrase: string): SortOrder => {
    const order = sortOrders[phrase]
    if (!order) throw new Error(`Unknown sort order "${phrase}"`)
    return order
  },
})
