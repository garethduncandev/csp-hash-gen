import * as path from 'path';
import * as fs from 'fs';
import { HashResult } from './hash-result.js';
import { SHAType } from './sha-type.js';
import type { CheerioAPI } from 'cheerio';
import { hashContent, isRemoteUrl } from './hash-utils.js';

export function hashLocalResources(
  resourceType: 'script' | 'style',
  parsedHtmlContent: CheerioAPI,
  sha: SHAType,
  htmlFilePath: string
): HashResult[] {
  const hashes: HashResult[] = [];

  // Generalize selector and attribute
  const selector =
    resourceType === 'style' ? 'link[rel="stylesheet"]' : 'script[src]';
  const attr = resourceType === 'style' ? 'href' : 'src';

  parsedHtmlContent(selector).each((_, element) => {
    const url = parsedHtmlContent(element).attr(attr);
    if (!url || isRemoteUrl(url)) {
      return;
    }
    // Use the directory of the HTML file, not the file path itself
    const htmlDir = path.dirname(htmlFilePath);
    const absoluteFilePath = path.join(htmlDir, url);
    const fileContent = fs.readFileSync(absoluteFilePath, 'utf-8');
    const resourceHash = hashContent(fileContent, sha);
    hashes.push({
      src: url,
      hash: resourceHash,
      resourceLocation: 'local',
      resourceType,
      domain: 'self',
    });
  });
  return hashes;
}
