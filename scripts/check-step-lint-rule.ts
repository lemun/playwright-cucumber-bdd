/**
 * Proves the step-file ESLint rules fire. Lints test/lint-fixtures/steps/ (excluded from `npm run lint`)
 * and compares the reports with the `expect-lint: <rule>, <rule>` markers in the fixture:
 * every marked line must get exactly those rules, and unmarked lines must be clean.
 */
import { readFile } from 'node:fs/promises'
import { ESLint } from 'eslint'

const fixture = 'test/lint-fixtures/steps/forbidden.steps.ts'
const marker = /\/\/ expect-lint: (.+)$/

const expected = new Map<number, string[]>()
for (const [index, line] of (await readFile(fixture, 'utf8')).split('\n').entries()) {
  const rules = marker.exec(line)?.[1]
  if (rules)
    expected.set(
      index + 1,
      rules
        .split(',')
        .map((rule) => rule.trim())
        .toSorted(),
    )
}

// ignore: false lints the fixture even though eslint.config.js ignores it for `npm run lint`.
const [result] = await new ESLint({ ignore: false }).lintFiles([fixture])
if (!result) throw new Error(`ESLint returned no result for ${fixture}`)

const actual = new Map<number, string[]>()
for (const message of result.messages) {
  const rules = actual.get(message.line) ?? []
  rules.push(message.ruleId ?? `fatal: ${message.message}`)
  actual.set(message.line, rules)
}

const problems: string[] = []
for (const line of new Set([...expected.keys(), ...actual.keys()])) {
  const want = (expected.get(line) ?? []).join(', ')
  const got = [...new Set(actual.get(line) ?? [])].toSorted().join(', ')
  if (want !== got) problems.push(`  line ${line}: expected [${want}], got [${got}]`)
}

if (problems.length > 0) {
  console.error(`Step lint rules do not behave as the fixture expects (${fixture}):\n${problems.join('\n')}`)
  process.exit(1)
}
console.log(
  `Step lint rules OK: ${expected.size} forbidden lines in ${fixture} reported, allowed code clean.`,
)
