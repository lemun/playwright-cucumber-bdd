/**
 * Turns Cucumber's JSON report into a short Markdown summary (per-feature pass/fail counts and the
 * failing scenarios). Used for the GitHub Actions job summary and for docs/sample-run.md.
 *
 *   npm run report:summary                       # prints reports/cucumber-report.json as Markdown
 *   npm run report:summary -- <report.json> ...  # several reports, e.g. the first run and the rerun
 */
import { readFile } from 'node:fs/promises'

interface Step {
  keyword: string
  name?: string
  hidden?: boolean
  result: { status: string; duration?: number; error_message?: string }
}
interface Scenario {
  name: string
  type: string
  steps: Step[]
}
interface Feature {
  name: string
  uri: string
  elements?: Scenario[]
}

type Outcome = 'passed' | 'failed' | 'skipped'

function outcome(scenario: Scenario): Outcome {
  const statuses = scenario.steps.map((step) => step.result.status)
  if (statuses.some((status) => status !== 'passed' && status !== 'skipped')) return 'failed'
  if (statuses.every((status) => status === 'skipped')) return 'skipped'
  return 'passed'
}

function seconds(scenario: Scenario): number {
  return scenario.steps.reduce((sum, step) => sum + (step.result.duration ?? 0), 0) / 1e9
}

async function summarise(file: string): Promise<string> {
  const features = JSON.parse(await readFile(file, 'utf8')) as Feature[]
  const lines = [
    `### ${file}`,
    '',
    '| Feature | Passed | Failed | Skipped | Scenario time |',
    '| --- | ---: | ---: | ---: | ---: |',
  ]
  const failures: string[] = []
  const totals = { passed: 0, failed: 0, skipped: 0, time: 0 }

  for (const feature of features) {
    const scenarios = (feature.elements ?? []).filter((element) => element.type === 'scenario')
    const counts = { passed: 0, failed: 0, skipped: 0 }
    let time = 0
    for (const scenario of scenarios) {
      const result = outcome(scenario)
      counts[result] += 1
      time += seconds(scenario)
      if (result === 'failed') {
        const step = scenario.steps.find((s) => !['passed', 'skipped'].includes(s.result.status))
        const reason = step?.result.error_message?.split('\n')[0] ?? step?.result.status ?? 'unknown'
        failures.push(`- **${feature.name} / ${scenario.name}**: ${reason}`)
      }
    }
    totals.passed += counts.passed
    totals.failed += counts.failed
    totals.skipped += counts.skipped
    totals.time += time
    lines.push(
      `| ${feature.name} | ${counts.passed} | ${counts.failed} | ${counts.skipped} | ${time.toFixed(1)}s |`,
    )
  }
  lines.push(
    `| **Total** | **${totals.passed}** | **${totals.failed}** | **${totals.skipped}** | ${totals.time.toFixed(1)}s |`,
  )
  if (failures.length > 0) lines.push('', 'Failed scenarios:', '', ...failures)
  return lines.join('\n')
}

const files = process.argv.slice(2)
const sections = await Promise.all(
  (files.length > 0 ? files : ['reports/cucumber-report.json']).map(summarise),
)
console.log(sections.join('\n\n'))
