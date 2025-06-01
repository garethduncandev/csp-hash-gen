import * as fs from 'fs';
import { SHAType } from './sha-type.js';
import { hashLocalResources } from './local-resource-hasher.js';
import { hashRemoteResources } from './remote-resource-hasher.js';
import { hashEmbeddedResources } from './embedded-resource-hasher.js';
import { HashResult } from './hash-result.js';
import { CheerioAPI } from 'cheerio';

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
