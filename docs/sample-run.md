# Sample run

A real local run of `npm test` against https://practicesoftwaretesting.com on 2026-10-15
(macOS, Node.js 22.22, Chromium from Playwright 1.64.1, `WORKERS=2`). Cucumber reported
25 scenarios and 147 steps passed in 34 seconds of wall time. The table below is the output of
`npm run report:summary`; "Scenario time" adds up the scenarios, which ran two at a time.

This run predates the `@shared-account` tag. `npm test` now leaves out the 3 sign-ins to shared
demo accounts and runs 22 scenarios; `npm run test:shared-account` runs those 3 on their own.

| Feature                           | Passed | Failed | Skipped | Scenario time |
| --------------------------------- | -----: | -----: | ------: | ------------: |
| Filtering and sorting the catalog |      7 |      0 |       0 |         16.9s |
| Searching the catalog             |      5 |      0 |       0 |          9.9s |
| Product details                   |      2 |      0 |       0 |          4.7s |
| Shopping cart                     |      5 |      0 |       0 |         21.1s |
| Signing in                        |      6 |      0 |       0 |         13.1s |
| **Total**                         | **25** |  **0** |   **0** |         65.8s |

The HTML report from the same run ([sample-report.png](sample-report.png)):

![Cucumber HTML report: 25 of 25 scenarios passed](sample-report.png)
