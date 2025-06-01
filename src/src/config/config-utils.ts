import * as fs from 'fs';
import * as path from 'path';
import { Config } from './config.js';

export function getConfig(configPath: string): Config | null {
  // Check if the config file exists
  let config: Config = getDefaultConfig();
  console.log('config path', configPath);
  if (!fs.existsSync(configPath)) {
    return null;
  }

  console.log('.csprc file found');
  const configFile = fs.readFileSync(configPath, 'utf-8');
  try {
    config = JSON.parse(configFile) as Config;
    return config;
  } catch (error) {
    console.error('Error parsing config file:', error);
    throw new Error(
      'Invalid config file format. Please check the .csprc file.'
    );
  }
}

export function exportDefaultConfigFile(directory: string): Config {
  const emptyConfig = getDefaultConfig();
  fs.writeFileSync(
    path.resolve(directory, '.csprc'),
    JSON.stringify(emptyConfig, null, 2)
  );
  console.log('Created empty config file at .csprc');
  return emptyConfig;
}

export function getDefaultConfig(): Config {
  return {
    options: {
      sha: 'sha256',
      directory: './',
      addMetaTag: false,
      addIntegrityAttributes: false,
    },
    directives: {
      'default-src': ["'none'"],
      'script-src': ["'self'"],
      'style-src': ["'self'"],
      'img-src': ["'self'"],
      'font-src': ["'self'"],
    },
  };
}
