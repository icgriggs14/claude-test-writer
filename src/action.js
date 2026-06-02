'use strict';

const core = require('@actions/core');
const { glob } = require('glob');
const path = require('path');
const fs = require('fs-extra');
const { generateTests, resolveOutputPath } = require('./generator');

async function run() {
  const apiKey = core.getInput('anthropic_api_key', { required: true });
  const sourceGlob = core.getInput('source_glob') || 'src/**/*.js';
  const framework = core.getInput('framework') || undefined;
  const outputDir = core.getInput('output_dir') || undefined;

  core.info(`Scanning for source files: ${sourceGlob}`);
  const files = await glob(sourceGlob, { nodir: true });

  if (!files.length) {
    core.warning(`No files matched pattern: ${sourceGlob}`);
    return;
  }

  const generated = [];
  for (const file of files) {
    const absFile = path.resolve(file);
    core.info(`Generating tests for ${file}...`);
    try {
      const result = await generateTests(absFile, { framework, output: outputDir, apiKey });
      const outPath = resolveOutputPath(absFile, { output: outputDir });
      await fs.ensureDir(path.dirname(outPath));
      await fs.writeFile(outPath, result.tests, 'utf8');
      generated.push({ source: file, output: outPath, framework: result.framework });
      core.info(`  → ${outPath} (${result.framework})`);
    } catch (err) {
      core.error(`Failed for ${file}: ${err.message}`);
    }
  }

  core.setOutput('generated_count', String(generated.length));
  core.setOutput('generated_files', generated.map(g => g.output).join(','));
  core.info(`Done. Generated ${generated.length} test file(s).`);
}

run().catch(err => {
  core.setFailed(err.message);
});
