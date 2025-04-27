import { FileHasher } from './file-hasher.js';
import { HashResult } from './hash-result.js';
import { SHAType } from '../sha-type.enum.js';
import * as cheerio from 'cheerio';

export class CssInlineHasher {
  public constructor(private readonly fileHasher: FileHasher) {}

  public hashInlineStyles(
    // htmlFilePath: string,
    sha: SHAType,
    parsedHtmlContent: cheerio.CheerioAPI
  ): HashResult[] {
    const inlineCss: string[] = [];
    parsedHtmlContent('style').each((_, element) => {
      const cssContent = parsedHtmlContent(element).html(); // Get the content inside the <style> tag
      if (cssContent) {
        inlineCss.push(cssContent);
      }
    });

    const hashes: HashResult[] = [];
    for (const css of inlineCss) {
      const hash = this.fileHasher.createHash(css, sha);
      hashes.push({
        // htmlFilePath: htmlFilePath,
        resourcePath: null,
        hash,
        external: false,
        inline: true,
        type: 'css',
        domain: null,
      });
    }
    return hashes;
  }
}
