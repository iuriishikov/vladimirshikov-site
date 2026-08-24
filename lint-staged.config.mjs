/**
 * Fast, staged-files-only gate. The heavy, whole-project checks (typecheck,
 * unit tests, knip) run on push and in CI — a commit must stay cheap.
 *
 * @type {import('lint-staged').Configuration}
 */
export default {
  '*.{ts,tsx,mts,cts}': ['eslint --fix --max-warnings=0', 'prettier --write'],
  '*.{js,mjs,cjs}': ['eslint --fix --max-warnings=0', 'prettier --write'],
  '*.{json,jsonc,json5,md,mdx,yml,yaml,css}': ['prettier --write'],
  // A type error in one file is usually a type error in several: check the
  // whole project, but only when TypeScript files actually changed.
  '*.{ts,tsx}': () => 'tsc --noEmit',
  // Never let a secret reach a commit. CI runs gitleaks over full history as a
  // second, independent net.
  '*': (files) =>
    `secretlint --secretlintignore .gitignore ${files.map((f) => `"${f}"`).join(' ')}`,
}
