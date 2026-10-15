import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

/**
 * Playwright Locator/Page methods that interact with, script, capture or wait on the page.
 * Banned in step files on any member chain. Reads that only feed an assertion (textContent, count, ...)
 * are allowed, though steps normally assert through `expect(locator)`.
 */
const locatorActions = [
  'blur',
  'check',
  'clear',
  'click',
  'dblclick',
  'dispatchEvent',
  'dragTo',
  'evaluate',
  'evaluateAll',
  'evaluateHandle',
  'fill',
  'focus',
  'hover',
  'press',
  'pressSequentially',
  'screenshot',
  'scrollIntoViewIfNeeded',
  'selectOption',
  'selectText',
  'setChecked',
  'setInputFiles',
  'tap',
  'type',
  'uncheck',
  'waitFor',
]

/** Methods that build a selector or reach the raw page. Steps use what page objects expose instead. */
const locatorQueries = [
  'locator',
  'page',
  'frameLocator',
  'getByAltText',
  'getByLabel',
  'getByPlaceholder',
  'getByRole',
  'getByTestId',
  'getByText',
  'getByTitle',
]

export default defineConfig(
  { ignores: ['node_modules/', 'reports/', 'test/lint-fixtures/'] },
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    extends: [tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
    },
  },
  {
    // Step definitions describe behaviour; page objects own the UI. Keep Playwright out of the steps.
    // test/lint-fixtures/steps/ holds deliberate violations; `npm run lint:rules` proves each one is caught.
    files: ['src/steps/**/*.ts', 'test/lint-fixtures/steps/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@playwright/test',
              message: 'Steps use page objects (this.pages) and expect from support/expect.ts.',
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[object.type='ThisExpression'][property.name='page']",
          message: 'Steps must not drive the browser directly. Add a page-object method instead.',
        },
        {
          // Any member chain, e.g. this.pages.catalog.productNames.first().click()
          selector: `CallExpression[callee.type='MemberExpression'][callee.property.name=/^(${locatorActions.join('|')})$/]`,
          message:
            'Steps must not act on, script, capture or wait on locators. Put it in a page-object method.',
        },
        {
          selector: `CallExpression[callee.type='MemberExpression'][callee.property.name=/^(${locatorQueries.join('|')})$/]`,
          message:
            'Steps must not build selectors or reach the raw page. Expose a locator or method on the page object.',
        },
      ],
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: { globals: { process: 'readonly' } },
  },
  prettier,
)
