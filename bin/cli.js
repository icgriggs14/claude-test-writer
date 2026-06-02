#!/usr/bin/env node
'use strict';

const { program } = require('commander');
const { glob } = require('glob');
const path = require('path');
const fs = require('fs-extra');
const { generateTests, resolveOutputPath } = require('../src/generator');

program
  .name('claude-test-writer')
  .description('AI-generated unit tests using Claude Haiku. Pass source files or globs.')
  .version('1.0.0')
  .argument('<files...>', 'Source file(s) or glob patterns')
  .option('-f, --framework <name>', 'Test framework: jest | vitest | mocha (auto-detected by default)')
  .option('-o, --output <dir>', 'Output directory for test files (default: same dir as source)')
  .option('--spec', 'Use .spec.js suffix instead of .test.js')
  .option('-k, --api-key <key>', 'Anthropic API key (defaults to ANTHROPIC_API_KEY env var)')
  .option('--dry-run', 'Print generated tests to stdout without writing files')
  .action(async (patterns, opts) => {
    const files = [];
    for (const pattern of patterns) {
      if (pattern.includes('*')) {
        const matches = await glob(pattern, { nodir: true });
        files.push(...matches);
      } else {
        files.push(pattern);
      }
    }

    if (!files.length) {
      console.error('No files matched.');
      process.exit(1);
    }

    let hasError = false;
    for (const file of files) {
      const absFile = path.resolve(file);
      if (!fs.existsSync(absFile)) {
        console.error(`File not found: ${file}`);
        hasError = true;
        continue;
      }

      process.stderr.write(`Generating tests for ${file}... `);
      try {
        const result = await generateTests(absFile, {
          framework: opts.framework,
          output: opts.output,
          spec: opts.spec,
          apiKey: opts.apiKey,
        });

        if (opts.dryRun) {
          process.stderr.write('done (dry-run)\n');
          console.log(`\n// === ${file} ===`);
          console.log(result.tests);
        } else {
          const outPath = resolveOutputPath(absFile, { output: opts.output, spec: opts.spec });
          await fs.ensureDir(path.dirname(outPath));
          await fs.writeFile(outPath, result.tests, 'utf8');
          process.stderr.write(`done → ${outPath}\n`);
        }
      } catch (err) {
        process.stderr.write(`FAILED\n`);
        console.error(`Error: ${err.message}`);
        hasError = true;
      }
    }

    process.exit(hasError ? 1 : 0);
  });

program.parse();
