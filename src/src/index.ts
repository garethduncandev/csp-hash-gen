#!/usr/bin/env node

import * as commander from 'commander';
import { main } from './main.js';

const program = new commander.Command();

program
  .option('--create-empty-config', 'Create empty config file', false)
  .option('--sha <string>', 'SHA type - sha256, sha384 or sha512', 'sha256')
  .option('--directory <string>', 'Directory', './')
  .option('--config <string>', 'CLI config', './.csprc')
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
    await main(
      options.createEmptyConfig,
      options.directory,
      options.sha,
      options.insertMetaTag,
      options.insertIntegrityAttributes,
      options.config
    );
  });

program.parse(process.argv);
