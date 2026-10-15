# Playwright + Cucumber BDD

Behaviour-driven end-to-end tests in strict TypeScript: Gherkin features a non-engineer can read,
backed by [Cucumber.js](https://github.com/cucumber/cucumber-js) and
[Playwright](https://playwright.dev). The tests run against the
[Practice Software Testing Toolshop](https://practicesoftwaretesting.com), a demo web shop built for
learning and practising test automation, with publicly documented demo accounts.

```gherkin
Scenario: Combining a category and a brand narrows the results further
  Given I am browsing the catalog
  When I filter by the category "Pliers"
  And I filter by the brand "MightyCraft Hardware"
  Then the results are exactly:
    | product           |
    | Bolt Cutters      |
    | Long Nose Pliers  |
    | Slip Joint Pliers |
```

What it shows:

- **Readable features**: five features, 25 scenarios, covering search, filters, sorting, product
  details, the cart and sign-in. Scenario outlines, data tables, a background per feature and a
  custom parameter type (`{sortOrder}`).
- **A typed World** that works like Playwright Test fixtures: one browser per worker, and a fresh
  browser context, page and set of page objects for every scenario.
- **Page objects** that own every locator and action. Step definitions only call page objects and
  assert. ESLint fails the build if a step imports Playwright, uses the raw page, calls a locator
  action such as `click()`, `fill()`, `evaluate()` or `screenshot()`, or builds a selector, and a
  lint fixture proves each case is caught.
- **No sleeps**: actions wait for the app's own state (the result grid reports `search_completed`,
  `filter_completed`, `sorting_completed`) or for a visible outcome such as the cart badge.
- **Debuggable failures**: a full-page screenshot and the page URL are attached to the HTML report,
  and a Playwright trace is kept for every failed scenario.
- **Parallel runs, tags and reruns**: three workers by default, `@smoke` / `@regression` tags, and a
  rerun profile that replays only the scenarios that failed.
- **Reports**: Cucumber HTML, JSON and JUnit XML, plus a Markdown summary for CI.
- **Tooling**: `tsc` in strict mode, typescript-eslint (strict, type-checked), Prettier, and
  GitHub Actions: offline checks on every push, the live suite only when started by hand.

## Quick start

Requires Node.js 22 or newer.

```bash
npm ci
npx playwright install chromium
npm test                               # every scenario except @shared-account, 3 workers
open reports/cucumber-report.html      # macOS; use xdg-open on Linux
```

## Commands

| Command                                     | What it does                                                                 |
| ------------------------------------------- | ---------------------------------------------------------------------------- |
| `npm test`                                  | Runs every scenario except `@shared-account` in parallel, writes the reports |
| `npm run test:smoke`                        | Runs only scenarios tagged `@smoke` (still without `@shared-account`)        |
| `npm run test:shared-account`               | Runs the demo-account sign-ins, one at a time (see below)                    |
| `npm test -- --tags "@cart and not @smoke"` | Any [tag expression](https://cucumber.io/docs/cucumber/api/#tag-expressions) |
| `npm run test:headed`                       | One worker with a visible browser, for watching a run                        |
| `npm run test:rerun`                        | Re-runs only the scenarios listed in `reports/@rerun.txt` by the last run    |
| `npm run test:dry`                          | Checks that every Gherkin step has exactly one step definition, no browser   |
| `npm run report:summary`                    | Prints the last JSON report as a Markdown table                              |
| `npm run lint:rules`                        | Proves the step-file lint rules fire, using `test/lint-fixtures/`            |
| `npm run check`                             | Typecheck, lint, lint-rule proof, format check and dry run (what CI runs)    |
| `npm run format`                            | Formats the code with Prettier                                               |

## Architecture

```
features/*.feature          what the shop should do, in plain English (Gherkin)
        |
src/steps/*.steps.ts        glue: maps each sentence to page-object calls and assertions
        |
src/pages/*.page.ts         page objects: locators and user actions, no assertions
        |
Playwright                  browser automation
```

Around that core:

| File                             | Role                                                                                |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| `src/support/world.ts`           | `ToolshopWorld`: per-scenario browser context, page and page objects (`this.pages`) |
| `src/support/hooks.ts`           | Launches one browser per worker; on failure attaches a screenshot and saves a trace |
| `src/support/parameter-types.ts` | `{sortOrder}`: turns "from the lowest to the highest price" into a typed value      |
| `src/support/expect.ts`          | Playwright's web-first `expect`, with the project timeout                           |
| `src/pages/index.ts`             | `createPages()`: the list of page objects a scenario can use                        |
| `src/data/demo-users.ts`         | The Toolshop's published demo customers                                             |
| `src/config.ts`                  | Settings from environment variables, validated, with defaults                       |
| `cucumber.js`                    | Profiles: `default`, `sharedAccount`, `rerun`, `dry`                                |
| `scripts/report-summary.ts`      | JSON report to Markdown, used for the CI job summary                                |

### Rules the code follows

1. **Steps describe, page objects act.** A step never builds a selector or calls Playwright. Steps
   import `expect` from `support/expect.ts`. In `src/steps/`, ESLint rejects `@playwright/test`
   imports, `this.page`, and on any member chain: locator actions (`click`, `fill`, `press`,
   `check`, `selectOption`, `hover`, `type` and the rest), page scripting and capture
   (`evaluate`, `evaluateAll`, `evaluateHandle`, `screenshot`), explicit waits (`waitFor`),
   selector builders (`locator`, `getByRole`, ...) and `.page()`. Steps may still pass a page
   object's locator to `expect`.
   `test/lint-fixtures/steps/forbidden.steps.ts` holds one violation per case, and
   `npm run lint:rules` fails if any of them is not reported.
2. **Page objects don't judge.** They return locators and data (`visibleProductNames()`,
   `cart.lines()`); the step decides what is correct, so one page object serves many scenarios.
3. **Every scenario starts clean.** A new browser context per scenario means no shared cookies,
   storage or cart, which is what makes parallel runs safe.
4. **Locators follow the app's test hooks.** The Toolshop marks elements with `data-test`, so
   `getByTestId()` is pointed at that attribute. Roles and labels are used where they exist.
5. **Be a good citizen on a shared demo.** Failed sign-ins use addresses with no account, because
   three wrong passwords would lock a demo customer for everyone using the site. Scenarios that
   sign in to a shared demo account are tagged `@shared-account` and only run on purpose.

### Adding a scenario

1. Write the scenario in `features/`. Run `npm run test:dry`: Cucumber prints a snippet for every
   step it cannot match.
2. Paste the snippets into the matching `src/steps/*.steps.ts` file and implement them with page
   objects from `this.pages`.
3. If the page object lacks a locator or action, add it to `src/pages/`. A new page object goes in
   `createPages()` in `src/pages/index.ts`.

## Reports and debugging

After `npm test`, the `reports/` folder contains:

| Path                      | Contents                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------ |
| `cucumber-report.html`    | Interactive report with screenshots attached to failures                                   |
| `cucumber-report.json`    | Cucumber JSON, for other tools and `report:summary`                                        |
| `cucumber-report.xml`     | JUnit XML, for CI test dashboards                                                          |
| `@rerun.txt`              | The failed scenarios, read by `npm run test:rerun`                                         |
| `screenshots/`, `traces/` | Failure artifacts. Open a trace with `npx playwright show-trace reports/traces/<name>.zip` |

A summary of a real run is in [docs/sample-run.md](docs/sample-run.md), and
[docs/sample-report.png](docs/sample-report.png) shows the HTML report.

## Configuration

All settings are optional environment variables.

| Variable         | Default                               | Meaning                            |
| ---------------- | ------------------------------------- | ---------------------------------- |
| `BASE_URL`       | `https://practicesoftwaretesting.com` | Site under test                    |
| `BROWSER`        | `chromium`                            | `chromium`, `firefox` or `webkit`  |
| `HEADLESS`       | `true`                                | `false` shows the browser          |
| `WORKERS`        | `3`                                   | Parallel workers for `npm test`    |
| `TRACE`          | `retain-on-failure`                   | `off`, `on` or `retain-on-failure` |
| `ACTION_TIMEOUT` | `15000`                               | Max ms for one action or assertion |
| `STEP_TIMEOUT`   | `60000`                               | Max ms for one step                |

Firefox and WebKit need `npx playwright install firefox webkit` first.

## Shared demo accounts

The sign-in scenarios that use the Toolshop's published demo customers are tagged
`@shared-account`. Those accounts are shared with everyone who practises on the site, so the
default run (`npm test`, `npm run test:smoke`) leaves them out. Run them deliberately, and the
`sharedAccount` profile runs them one at a time:

```bash
npm run test:shared-account
```

## Continuous integration

- **`.github/workflows/ci.yml`** runs on every push to `main` and every pull request: typecheck,
  lint, the lint-rule proof, format check and a Gherkin dry run. No browser and no traffic to the
  demo site.
- **`.github/workflows/live-e2e.yml`** runs the live suite, then one rerun of failed scenarios,
  and uploads `reports/`. It has no push, pull request or schedule trigger: it targets a shared
  public demo, so it only runs when started by hand, from the Actions tab or with
  `gh workflow run live-e2e.yml -f suite=default` (or `-f suite=shared-account`). Only one live
  run is allowed at a time.
- Cloudflare in front of the Toolshop currently answers GitHub-hosted runners with a "Verify you
  are human" challenge (HTTP 403, `cf-mitigated: challenge`), so every scenario stops on the
  challenge page there. The workflow checks for this first and stops with a clear error. To run
  the live suite in Actions, pass a self-hosted runner label as the `runner` input; otherwise run
  it locally.

## Limits worth knowing

- The suite tests a live public demo, so a slow or changed site can fail a run.
- The expected product names, prices and totals in the features (for example "Claw Hammer" at
  $11.48) come from the Toolshop's seeded catalog as of October 2026. The demo is shared and
  updated by its maintainers, so they may drift; when they do, update the data tables.
- Demo accounts are shared with everyone who practises on the site, and other visitors sometimes
  lock one with wrong passwords. If a sign-in scenario fails with "Account locked", switch it to
  another demo user in `src/data/demo-users.ts`.
- Sorting is checked on the first page of results (nine products), which is what a shopper sees.
- The project is not affiliated with Testsmith, the makers of the Toolshop.

## History

This project was rebuilt in 2026 from an earlier private Cucumber + Playwright project of mine. The
framework was rewritten for current Cucumber and Playwright and pointed at a site made for test
automation. Its public history starts at the rebuild.

## License

[MIT](LICENSE)
