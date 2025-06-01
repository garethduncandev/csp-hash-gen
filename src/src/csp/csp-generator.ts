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
