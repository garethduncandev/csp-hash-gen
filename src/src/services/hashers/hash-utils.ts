import * as fs from 'fs';
import * as cheerio from 'cheerio';
import { SHAType } from '../../types/sha-type.js';
import { ExternalResourceHasher } from './external-resource-hasher.js';
import { EmbeddedResourceHasher } from './embedded-resource-hasher.js';
import { HashResult } from './hash-result.js';

export async function getHtmlFileHashes(
  absoluteDir: string,
  htmlFilePath: string,
  sha: SHAType,
  resourceType: 'script' | 'style'
): Promise<HashResult[]> {
  const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
  const parsedHtmlContent = cheerio.load(htmlContent);

  const externalResourceHasher = new ExternalResourceHasher();
  const externalResourceHashes =
    await externalResourceHasher.hashHtmlExternalResources(
      htmlFilePath,
      absoluteDir,
      sha,
      resourceType
    );

  const embeddedResourceHasher = new EmbeddedResourceHasher();
  const embeddedResourceHashes =
    await embeddedResourceHasher.hashEmbeddedResources(sha, parsedHtmlContent);

  return [...externalResourceHashes, ...embeddedResourceHashes];
}
