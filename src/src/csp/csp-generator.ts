import fs from 'fs';
import { HashResult } from '../hashers/hash-result.js';
import { getHtmlFileHashes } from '../hashers/hash-utils.js';
import { SHAType } from '../hashers/sha-type.js';
import { Csp } from './csp.js';

export async function generateCsp(
  directives: { [key: string]: string[] },
  htmlFilePath: string,
  sha: SHAType
): Promise<{ hashes: HashResult[]; csp: Csp }> {
  const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
  const cheerio = await import('cheerio');
  const parsedHtmlContent = cheerio.load(htmlContent);

  const scriptHashesArr = await getHtmlFileHashes(
    parsedHtmlContent,
    htmlFilePath,
    sha,
    'script'
  );
  const styleHashesArr = await getHtmlFileHashes(
    parsedHtmlContent,
    htmlFilePath,
    sha,
    'style'
  );

  // Start with directives found in config
  const csp: Csp = { ...directives };

  // Add hashes to the CSP
  if (scriptHashesArr.length > 0) {
    // Only inline/embedded hashes are added to the csp
    const hashes = scriptHashesArr.filter(
      (x) =>
        x.resourceLocation === 'embedded' || x.resourceLocation === 'inline'
    );

    const domains = scriptHashesArr.filter(
      (x) => x.resourceLocation === 'remote'
    );
    const self = scriptHashesArr.some((x) => x.resourceLocation === 'local');

    csp['script-src'] = [
      ...(csp['script-src'] || []),
      ...(self ? [`'self'`] : []),
      ...domains.map((h) => (h.domain ? h.domain : '')),
      ...hashes.map((h) => `'${h.hash}'`),
    ];
  }

  if (styleHashesArr.length > 0) {
    const hashes = styleHashesArr.filter(
      (x) =>
        x.resourceLocation === 'embedded' || x.resourceLocation === 'inline'
    );

    const domains = styleHashesArr.filter(
      (x) => x.resourceLocation === 'remote'
    );

    const self = styleHashesArr.some((x) => x.resourceLocation === 'local');

    csp['style-src'] = [
      ...(csp['style-src'] || []),
      ...(self ? [`'self'`] : []),
      ...domains.map((h) => (h.domain ? h.domain : '')),
      ...hashes.map((h) => `'${h.hash}'`),
    ];
  }

  return {
    hashes: [...scriptHashesArr, ...styleHashesArr],
    csp,
  };
}

export function stringifyCsp(csp: Csp): string {
  if (!csp) return '';
  const cspStrings: string[] = [];
  for (const [directive, values] of Object.entries(csp)) {
    if (Array.isArray(values) && values.length > 0) {
      cspStrings.push(`${directive} ${values.join(' ')};`);
    }
  }
  return cspStrings.join(' ').trim();
}
