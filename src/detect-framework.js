'use strict';

const fs = require('fs');
const path = require('path');

function detectFramework(startDir) {
  let dir = startDir;
  for (let i = 0; i < 5; i++) {
    const pkgPath = path.join(dir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        const all = Object.assign({}, pkg.dependencies, pkg.devDependencies);
        if (all.vitest) return 'vitest';
        if (all.jest || all['@jest/core']) return 'jest';
        if (all.mocha) return 'mocha';
      } catch {
        // ignore parse errors
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return 'jest'; // safe default
}

module.exports = { detectFramework };
