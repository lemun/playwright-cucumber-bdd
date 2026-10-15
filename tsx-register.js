// Lets Cucumber import the TypeScript support code and step definitions directly.
// Must be listed before any .ts file in the `import` option of cucumber.js.
import { register } from 'tsx/esm/api'

register()
