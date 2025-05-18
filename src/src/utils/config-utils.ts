import * as fs from 'fs';
import * as path from 'path';
import { Config } from '../config.js';

export class ConfigUtils {
  public createEmptyConfig(directory: string, full: 'empty' | 'full'): Config {
    const emptyConfig =
      full === 'full' ? this.getFullConfig() : this.getDefaultConfig();
    fs.writeFileSync(
      path.resolve(directory, '.csprc'),
      JSON.stringify(emptyConfig, null, 2)
    );
    console.log('Created empty config file at .csprc');

    return emptyConfig;
  }

  private getDefaultConfig(): Config {
    return {
      calculateHashes: true,
      directives: [
        { directive: 'script-src', values: [] },
        { directive: 'style-src', values: [] },
        { directive: 'img-src', values: [] },
        { directive: 'connect-src', values: [] },
        { directive: 'font-src', values: [] },
        { directive: 'media-src', values: [] },
        { directive: 'frame-src', values: [] },
        { directive: 'worker-src', values: [] },
        { directive: 'child-src', values: [] },
        { directive: 'sandbox', values: [] },
        { directive: 'upgrade-insecure-requests' },
        { directive: 'block-all-mixed-content' },
        { directive: 'require-trusted-types-for', values: 'script' },
        {
          directive: 'trusted-types',
          values: ['allow-duplicates', { policies: ['policy-1', 'policy-2'] }],
        },
        { directive: 'report-uri', values: 'https://example.com/csp-report' },
        { directive: 'report-to', values: ['csp-endpoint'] },
      ],
    };
  }

  private getFullConfig(): Config {
    return {
      calculateHashes: true,
      directives: [
        {
          directive: 'script-src',
          values: [`'self'`, `'unsafe-inline'`, `'unsafe-eval'`],
        },
        {
          directive: 'style-src',
          values: [`'self'`, `'unsafe-inline'`, 'https://example.com/'],
        },
        {
          directive: 'img-src',
          values: [`'self'`, 'data:', 'blob:', 'https://example.com/'],
        },
        {
          directive: 'connect-src',
          values: [`'self'`, 'ws:', 'wss:', 'https://example.com/'],
        },
        {
          directive: 'font-src',
          values: [`'self'`, 'data:', 'blob:', 'https://example.com/'],
        },
        {
          directive: 'media-src',
          values: [`'self'`, 'data:', 'blob:', 'https://example.com/'],
        },
        {
          directive: 'frame-src',
          values: [`'self'`, 'data:', 'blob:', 'https://example.com/'],
        },
        {
          directive: 'worker-src',
          values: [`'self'`, 'data:', 'blob:', 'https://example.com/'],
        },
        {
          directive: 'child-src',
          values: [`'self'`, 'data:', 'blob:', 'https://example.com/'],
        },
        { directive: 'sandbox', values: ['allow-forms', 'allow-scripts'] },
        { directive: 'upgrade-insecure-requests' },
        { directive: 'block-all-mixed-content' },
        { directive: 'require-trusted-types-for', values: 'script' },
        {
          directive: 'trusted-types',
          values: [
            'allow-duplicates',
            { policies: ['policy-1', 'policy-2', 'policy-3'] },
          ],
        },
        { directive: 'report-uri', values: 'https://example.com/csp-report' },
        { directive: 'report-to', values: ['csp-endpoint', 'backup-endpoint'] },
      ],
    };
  }
}
