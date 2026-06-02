# claude-test-writer

AI-generated unit tests for JavaScript/TypeScript using Claude Haiku. Run `npx claude-test-writer src/foo.js` and get a complete test file in seconds.

## CLI

```bash
# Generate tests for a single file
npx claude-test-writer src/utils.js

# Generate tests for multiple files
npx claude-test-writer src/utils.js src/api.js

# Glob pattern
npx claude-test-writer "src/**/*.js"

# Specify framework
npx claude-test-writer src/utils.js --framework vitest

# Custom output directory
npx claude-test-writer src/utils.js --output tests/

# Use .spec.js suffix
npx claude-test-writer src/utils.js --spec

# Dry run (print to stdout)
npx claude-test-writer src/utils.js --dry-run
```

**Frameworks supported:** Jest (default), Vitest, Mocha — auto-detected from your `package.json`.

**Requirements:** `ANTHROPIC_API_KEY` environment variable.

## GitHub Action

Detect source files without test coverage on every PR and generate stubs automatically.

```yaml
name: AI Test Writer
on:
  pull_request:
    paths:
      - 'src/**/*.js'
      - 'src/**/*.ts'

jobs:
  generate-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: icgriggs14/claude-test-writer@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          source_glob: 'src/**/*.js'
          framework: jest
```

The Action writes generated test files to the repository and reports how many were created via `generated_count` and `generated_files` outputs.

## Part of the claude autonomous-rail suite

GitHub Actions (use in any repo today):
- [**claude-pr-review**](https://github.com/icgriggs14/claude-pr-review) — AI code review on every PR
- [**claude-changelog-action**](https://github.com/icgriggs14/claude-changelog-action) — auto-changelog & release notes from git history
- **claude-test-writer** — AI unit test generation (this repo)

npm CLI companions (coming soon to npm):
- `npx claude-pr-review` — run AI PR review from the command line
- `npx claude-commit` — AI-powered conventional commit messages

## Support

If claude-test-writer saves you time, consider [sponsoring on GitHub](https://github.com/sponsors/icgriggs14). Sponsorships keep this and the other autonomous-rail tools maintained and growing.

## License

MIT


## Other Claude AI Tools

These companion tools from the same author work great together:

- **[claude-pr-review](https://github.com/icgriggs14/claude-pr-review)** — AI-powered PR code review using Claude
- **[claude-changelog-action](https://github.com/icgriggs14/claude-changelog-action)** — Auto-generate changelogs from commits using Claude
- **[react-doctor-action](https://github.com/icgriggs14/react-doctor-action)** — CI health checks for React projects
- **[knip-action](https://github.com/icgriggs14/knip-action)** — CI enforcement for knip unused-exports detection
- **[secretlint-action](https://github.com/icgriggs14/secretlint-action)** — CI credential leak detection using secretlint

[Sponsor this work on GitHub Sponsors](https://github.com/sponsors/icgriggs14)
