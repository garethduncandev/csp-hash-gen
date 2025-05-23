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
      directives: {
        'default-src': {
          self: false,
          none: false,
        },
        'script-src': {
          strict_dynamic: false,
          'unsafe-inline': false,
          'unsafe-eval': false,
          self: 'auto',
          autoHash: true,
          customValues: [],
        },
        'style-src': {
          'unsafe-inline': false,
          'unsafe-eval': false,
          self: 'auto',
          data: false,
          blob: false,
          autoHash: true,
          customValues: [],
        },
        'img-src': {
          self: false,
          data: false,
          blob: false,
          none: false,
          customValues: [],
        },
        'connect-src': {
          self: false,
          ws: false,
          wss: false,
          none: false,
          customValues: [],
        },
        'font-src': {
          self: false,
          data: false,
          blob: false,
          none: false,
          customValues: [],
        },
        'media-src': {
          self: false,
          data: false,
          blob: false,
          none: false,
          customValues: [],
        },
        'frame-src': {
          self: false,
          data: false,
          blob: false,
          none: false,
          customValues: [],
        },
        'worker-src': {
          self: false,
          data: false,
          blob: false,
          none: false,
          customValues: [],
        },
        'child-src': {
          self: false,
          'unsafe-inline': false,
          'unsafe-eval': false,
          data: false,
          blob: false,
          none: false,
          customValues: [],
        },
        sandbox: {
          'allow-forms': false,
          'allow-modals': false,
          'allow-popups': false,
          'allow-same-origin': false,
          'allow-scripts': false,
          'allow-downloads': false,
          'allow-top-navigation': false,
          'allow-top-navigation-by-user-activation': false,
          'allow-presentation': false,
          additionalValues: [],
        },
        'upgrade-insecure-requests': false,
        'block-all-mixed-content': false,
        'require-trusted-types-for': { values: 'script' },
        'trusted-types': {
          none: false,
          allow_duplicates: false,
          policies: [],
          additionalValues: [],
        },
        'report-uri': { value: '' },
        'report-to': { values: [] },
        customDirectives: {},
      },
    };
  }
}
