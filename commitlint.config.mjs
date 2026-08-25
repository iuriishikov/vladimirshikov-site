/**
 * Conventional Commits — the single source of truth for:
 *   - the changelog and the released version (semantic-release),
 *   - the PR title check in CI,
 *   - the `pnpm commit` prompt (cz-git, configured under `prompt` below).
 *
 * @see https://www.conventionalcommits.org/en/v1.0.0/
 * @see docs/conventions.md
 * @type {import('cz-git').UserConfig}
 */
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // a user-visible capability          -> minor
        'fix', // a user-visible defect repaired      -> patch
        'perf', // faster/lighter, same behaviour     -> patch
        'refactor', // internal change, same behaviour
        'docs', // documentation only
        'test', // tests only
        'build', // build system, bundler, deps
        'ci', // pipelines and automation
        'chore', // housekeeping that fits nowhere else
        'style', // formatting only, no code change
        'revert', // reverts a previous commit
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        // FSD layers
        'app',
        'views',
        'widgets',
        'features',
        'entities',
        'shared',
        // cross-cutting concerns
        'i18n',
        'seo',
        'a11y',
        'ui',
        'config',
        'deps',
        'ci',
        'docker',
        'docs',
        // `.releaserc.json` promotes `docs(readme)` to a patch release, so the
        // scope has to be spellable here.
        'readme',
        'test',
        'e2e',
        'release',
        'security',
      ],
    ],
    'scope-empty': [1, 'never'],
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
    'body-max-line-length': [2, 'always', 120],
    'footer-leading-blank': [2, 'always'],
    'body-leading-blank': [2, 'always'],
  },
  prompt: {
    alias: { fd: 'docs: fix typos' },
    messages: {
      type: "Type of change (what the commit does to the user's world):",
      scope: 'Scope — FSD layer or cross-cutting concern:',
      subject: 'Short, imperative description ("add", not "added"):',
      body: 'Longer description. Use "|" for a line break:',
      breaking: 'Breaking changes (this bumps the major version):',
      footerPrefixesSelect: 'Issues this commit closes:',
      confirmCommit: 'Commit with the message above?',
    },
    useEmoji: false,
    allowCustomScopes: false,
    allowEmptyScopes: true,
    skipQuestions: ['footerPrefix'],
    defaultIssues: '',
  },
}

export default config
