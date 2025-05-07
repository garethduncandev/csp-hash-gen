import * as cheerio from 'cheerio';
import { SHAType } from '../sha-type.enum.js';
import { ContentHasher } from './content-hasher.js';
import { HashResult } from './hash-result.js';

export class EmbeddedResourceHasher extends ContentHasher {
  public hashEmbeddedResources(
    sha: SHAType,
    parsedHtmlContent: cheerio.CheerioAPI
  ): HashResult[] {
    const embeddedResources: { content: string; type: 'style' | 'script' }[] =
      [];

    parsedHtmlContent('script').each((_, element) => {
      const scriptContent = parsedHtmlContent(element).html(); // Get the content inside the <script> tag
      if (scriptContent) {
        embeddedResources.push({ content: scriptContent, type: 'script' });
      }
    });

    parsedHtmlContent('style').each((_, element) => {
      const cssContent = parsedHtmlContent(element).html(); // Get the content inside the <style> tag
      if (cssContent) {
        embeddedResources.push({ content: cssContent, type: 'style' });
      }
    });

    const hashes: HashResult[] = [];
    for (const resource of embeddedResources) {
      const hash = this.hashContent(resource.content, sha);
      hashes.push({
        resourcePath: null,
        hash,
        resourceLocation: 'embedded',
        resourceType: resource.type,
        domain: null,
      });
    }
    return hashes;
  }
}
