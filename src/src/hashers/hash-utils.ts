import { CheerioAPI } from 'cheerio';
import * as crypto from 'crypto';
import { hashEmbeddedResources } from './embedded-resource-hasher.js';
import { HashResult } from './hash-result.js';
import { hashLocalResources } from './local-resource-hasher.js';
import { hashRemoteResources } from './remote-resource-hasher.js';
import { SHAType } from './sha-type.js';

export function hashContent(content: string, shaType: SHAType): string {
  const hash = crypto.createHash(shaType);
  hash.update(content);
  return `${shaType.toString()}-${hash.digest('base64')}`;
}

export async function getHtmlFileHashes(
  parsedHtmlContent: CheerioAPI,
  htmlFilePath: string,
  sha: SHAType,
  resourceType: 'script' | 'style'
): Promise<HashResult[]> {
  // Read HTML content once

  // Hash local external resources
  const localExternalHashes = hashLocalResources(
    resourceType,
    parsedHtmlContent,
    sha,
    htmlFilePath
  );

  // Hash remote external resources
  const remoteExternalHashes = await hashRemoteResources(
    resourceType,
    parsedHtmlContent,
    sha
  );

  // Hash embedded resources
  const embeddedResourceHashes = hashEmbeddedResources(
    resourceType,
    parsedHtmlContent,
    sha
  );

  return [
    ...localExternalHashes,
    ...remoteExternalHashes,
    ...embeddedResourceHashes,
  ];
}

export function isRemoteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url) || url.startsWith('//');
}
