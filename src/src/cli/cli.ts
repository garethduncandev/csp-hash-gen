#!/usr/bin/env node
import * as commander from 'commander';
import { main } from '../main.js';
import {
  exportDefaultConfigFile,
  getConfig,
  getDefaultConfig,
} from '../config/config-utils.js';
import { CliParameters } from './cli-paramaters.js';

const program = new commander.Command();

program
  .option('--create-empty-config', 'Create empty config file', false)
  .option('--sha <string>', 'SHA type - sha256, sha384 or sha512', 'sha256')
  .option('--directory <string>', 'Directory', './')
  .option('--config <string>', 'CLI config', './.csprc')
  .option('--add-meta-tag', 'Insert csp meta tag into head of html file', false)
  .option(
    '--add-integrity-attributes',
    'Update html script with integrity attributes',
    false
  )
  .action(async (cliParameters: CliParameters) => {
    // load config from path or fallback to default config
    let config = getConfig(cliParameters.config);
    if (!config) {
      console.log('loading default config');
      config = getDefaultConfig();
    }

    const createEmptyConfig = cliParameters.createEmptyConfig ?? false;

    if (createEmptyConfig) {
      exportDefaultConfigFile(cliParameters.directory);
      return;
    }

    // fallback to config if parameters are not provided via cli
    const directory = cliParameters.directory ?? config.options.directory;
    const sha = cliParameters.sha ?? config.options.sha;
    const addMetaTag = cliParameters.addMetaTag ?? config.options.addMetaTag;
    const addIntegrityAttributes =
      cliParameters.addIntegrityAttributes ??
      config.options.addIntegrityAttributes;

    await main(directory, sha, addMetaTag, addIntegrityAttributes, config);
  });

program.parse(process.argv);
