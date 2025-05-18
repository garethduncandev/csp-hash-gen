import * as fs from 'fs';
import * as cheerio from 'cheerio';
import { SHAType } from '../sha-type.enum.js';
import { ExternalResourceHasher } from '../hashers/external-resource-hasher.js';
import { EmbeddedResourceHasher } from '../hashers/embedded-resource-hasher.js';
import { HashResult } from '../hashers/hash-result.js';

export async function getHtmlFileHashes(
  absoluteDir: string,
  htmlFilePath: string,
  sha: SHAType,
  addIntegrityAttributes: boolean
): Promise<HashResult[]> {
  const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
  const parsedHtmlContent = cheerio.load(htmlContent);

  const externalResourceHasher = new ExternalResourceHasher();
  const externalResourceHashes =
    await externalResourceHasher.hashHtmlExternalResources(
      htmlFilePath,
      absoluteDir,
      sha,
      addIntegrityAttributes,
      parsedHtmlContent
    );

  const embeddedResourceHasher = new EmbeddedResourceHasher();
  const embeddedResourceHashes =
    await embeddedResourceHasher.hashEmbeddedResources(sha, parsedHtmlContent);

  return [...externalResourceHashes, ...embeddedResourceHashes];
}
