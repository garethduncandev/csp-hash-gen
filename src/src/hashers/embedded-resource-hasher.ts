import * as cheerio from 'cheerio';
import { SHAType } from './sha-type.js';
import { hashContent } from './hash-content.js';
import { HashResult } from './hash-result.js';

type embeddedResource = { content: string; resourceType: 'style' | 'script' };

export function hashEmbeddedResources(
  resourceType: 'script' | 'style',
  parsedHtmlContent: cheerio.CheerioAPI,
  sha: SHAType
): HashResult[] {
  const embeddedResources = extractResources(parsedHtmlContent, resourceType);

  const hashes: HashResult[] = [];
  for (const resource of embeddedResources) {
    const hash = hashContent(resource.content, sha);
    hashes.push({
      src: null,
      hash,
      resourceLocation: 'embedded',
      resourceType: resource.resourceType,
      domain: null,
    });
  }
  return hashes;
}

function extractResources(
  parsedHtmlContent: cheerio.CheerioAPI,
  resourceType: 'script' | 'style'
): embeddedResource[] {
  const resources: embeddedResource[] = [];

  parsedHtmlContent(resourceType).each((_, element) => {
    const content = parsedHtmlContent(element).html(); // Get the content inside the <script> tag
    if (content) {
      resources.push({ content, resourceType });
    }
  });

  return resources;
}
