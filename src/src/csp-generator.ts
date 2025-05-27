import path from 'path';
import { Csp } from './csp.js';
import { getHtmlFileHashes } from './utils/hash-utils.js';
import { SHAType } from './sha-type.enum.js';
import { Config } from './config.js';

export class CspGenerator {
  public constructor(public readonly config: Config) {}

  public async generateCsp(htmlFilePath: string, sha: SHAType): Promise<Csp> {
    const absoluteDir = path.resolve(path.dirname(htmlFilePath));
    const scriptHashesArr = await getHtmlFileHashes(
      absoluteDir,
      htmlFilePath,
      sha,
      'script'
    );
    const styleHashesArr = await getHtmlFileHashes(
      absoluteDir,
      htmlFilePath,
      sha,
      'style'
    );
    // Start with a shallow copy of the config directives
    const csp: Csp = { ...this.config.directives };
    // Add script/style hashes if present
    if (scriptHashesArr.length > 0) {
      csp['script-src'] = [
        ...(csp['script-src'] || []),
        ...scriptHashesArr.map((h) => `'${h.hash}'`),
      ];
    }
    if (styleHashesArr.length > 0) {
      csp['style-src'] = [
        ...(csp['style-src'] || []),
        ...styleHashesArr.map((h) => `'${h.hash}'`),
      ];
    }
    return csp;
  }
}
