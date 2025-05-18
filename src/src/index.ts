#!/usr/bin/env node

import * as commander from 'commander';
import { main } from './main.js';

const program = new commander.Command();

program
  .option('-d, --directory <string> ', 'Directory', './')
  .option('--sha', 'SHA type - sha256, sha384 or sha512', 'sha256')
  .option('--strict-dynamic', 'Enable strict dynamic', false)
  .option(
    '--insert-meta-tag',
    'Insert csp meta tag into head of html file',
    false
  )
  .option(
    '--insert-integrity-attributes',
    'Update html script with integrity attributes',
    false
  )
  .action(async (options) => {
    await main({
      ...options,
    });
  });

program.parse(process.argv);
