/** Matches an element whose whole text is `text`, ignoring surrounding whitespace. */
export function exactText(text: string): RegExp {
  return new RegExp(`^\\s*${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`)
}
