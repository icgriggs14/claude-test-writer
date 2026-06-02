'use strict';

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs-extra');
const path = require('path');
const { detectFramework } = require('./detect-framework');

const FRAMEWORK_PROMPTS = {
  jest: 'Use Jest with describe/it/expect. Import with require().',
  vitest: 'Use Vitest with describe/it/expect. Import with import syntax.',
  mocha: 'Use Mocha with describe/it and assert from node:assert. Import with require().',
};

async function generateTests(sourceFile, options = {}) {
  const apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is required. Set it as an environment variable or pass --api-key.');
  }

  const source = await fs.readFile(sourceFile, 'utf8');
  const framework = options.framework || detectFramework(path.dirname(sourceFile));
  const frameworkHint = FRAMEWORK_PROMPTS[framework] || FRAMEWORK_PROMPTS.jest;

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `Generate comprehensive unit tests for the following JavaScript/TypeScript file.
${frameworkHint}
Cover: happy path, edge cases, error handling, and boundary conditions.
Output ONLY the test file content — no explanation, no markdown fences.

Source file: ${path.basename(sourceFile)}

\`\`\`
${source}
\`\`\``,
      },
    ],
  });

  return {
    tests: response.content[0].text,
    framework,
    sourceFile,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  };
}

function resolveOutputPath(sourceFile, options = {}) {
  const dir = options.output || path.dirname(sourceFile);
  const base = path.basename(sourceFile, path.extname(sourceFile));
  const ext = path.extname(sourceFile) || '.js';
  const suffix = options.spec ? '.spec' : '.test';
  return path.join(dir, `${base}${suffix}${ext}`);
}

module.exports = { generateTests, resolveOutputPath };
