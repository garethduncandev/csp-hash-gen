import { FileHasher } from './file-hasher';
import { HashResult } from './hash-result';
import { SHAType } from '../sha-type.enum';
import * as cheerio from 'cheerio';

export class JsInlineHasher {
  public constructor(private readonly fileHasher: FileHasher) {}

  public hashInlineScripts(
    // htmlFilePath: string,
    sha: SHAType,
    parsedHtmlContent: cheerio.CheerioAPI
  ): HashResult[] {
    const inlineScripts: string[] = [];

    parsedHtmlContent('script').each((_, element) => {
      const scriptContent = parsedHtmlContent(element).html(); // Get the content inside the <script> tag
      if (scriptContent) {
        inlineScripts.push(scriptContent);
      }
    });

    const hashes: HashResult[] = [];
    for (const script of inlineScripts) {
      const hash = this.fileHasher.createHash(script, sha);
      hashes.push({
        // htmlFilePath: htmlFilePath,
        resourcePath: null,
        hash,
        external: false,
        inline: true,
        type: 'js',
        domain: null,
      });
    }
    return hashes;
  }
}
