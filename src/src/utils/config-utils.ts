import * as fs from 'fs';
import * as path from 'path';
import { Config } from '../config.js';

export class ConfigUtils {
  public createDefaultConfigFile(directory: string): Config {
    const emptyConfig = this.defaultConfig();
    fs.writeFileSync(
      path.resolve(directory, '.csprc'),
      JSON.stringify(emptyConfig, null, 2)
    );

    console.log('Created empty config file at .csprc');

    return emptyConfig;
  }

  public getDefaultConfig(): Config {
    return this.defaultConfig();
  }

  private defaultConfig(): Config {
    return {
      sha: 'sha256',
      directory: './',
      addMetaTag: false,
      addIntegrityAttributes: false,
      directives: {
        'default-src': ["'none'"],
        'script-src': ["'self'"],
        'style-src': ["'self'"],
        'img-src': ["'self'"],
        'connect-src': ["'self'"],
        'font-src': ["'self'"],
      },
    };
  }
}
