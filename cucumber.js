// Cucumber profiles. Run with `npx cucumber-js --profile <name>`; `default` is used when none is given.
// TypeScript is compiled on the fly by tsx, registered first in `import` (see tsx-register.js).

const workers = Number(process.env.WORKERS ?? 3)

/** @type {import('@cucumber/cucumber').IConfiguration} */
const shared = {
  import: ['./tsx-register.js', 'src/support/**/*.ts', 'src/steps/**/*.ts'],
  formatOptions: { snippetInterface: 'async-await' },
}

const fullReports = [
  'progress',
  'html:reports/cucumber-report.html',
  'json:reports/cucumber-report.json',
  'junit:reports/cucumber-report.xml',
  'rerun:reports/@rerun.txt',
]

/**
 * Default run: every scenario except @shared-account, in parallel, with HTML/JSON/JUnit reports and a
 * list of failures for `rerun`. A `--tags` expression on the command line is combined with this one.
 */
export default {
  ...shared,
  paths: ['features/**/*.feature'],
  tags: 'not @shared-account',
  parallel: workers,
  format: fullReports,
}

/**
 * Scenarios that sign in to the Toolshop's shared demo accounts. Run on purpose only, and serially
 * (no `parallel`), so this suite never hits one shared account from two sessions at once.
 */
export const sharedAccount = {
  ...shared,
  paths: ['features/**/*.feature'],
  tags: '@shared-account',
  format: fullReports,
}

/** Re-runs only the scenarios listed in reports/@rerun.txt by the previous run (no-op if it is empty). */
export const rerun = {
  ...shared,
  paths: ['reports/@rerun.txt'],
  parallel: 1,
  format: ['progress', 'html:reports/rerun/cucumber-report.html', 'json:reports/rerun/cucumber-report.json'],
}

/** Parses every feature and matches every step without opening a browser. */
export const dry = {
  ...shared,
  paths: ['features/**/*.feature'],
  dryRun: true,
  strict: true,
  format: ['summary'],
}
