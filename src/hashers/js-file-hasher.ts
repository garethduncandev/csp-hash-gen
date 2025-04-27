import { FileHasher } from './file-hasher.js';
import { HashResult } from './hash-result.js';
import * as cheerio from 'cheerio';
import { SHAType } from '../sha-type.enum.js';
import * as fs from 'fs';

export class JsFileHasher {
  public constructor(public readonly fileHasher: FileHasher) {}
  public async hashFile(
    htmlFilePath: string,
    absoluteDirectory: string,
    sha: SHAType,
    addIntegrity: boolean,
    parsedHtmlContent: cheerio.CheerioAPI
  ): Promise<HashResult[]> {
    // Find all <script> tags with a src attribute
    const jsFiles: string[] = [];
    const hashes: HashResult[] = [];
    parsedHtmlContent('script[src]').each((_, element) => {
      const src = parsedHtmlContent(element).attr('src');
      if (src) {
        jsFiles.push(src);
      }
    });

    for (const jsFile of jsFiles) {

      // load js file content
      const jsFilePath = `${absoluteDirectory}/${jsFile}`;
      const jsContent = fs.readFileSync(jsFilePath, 'utf-8');
      // remove last line break
      const jsTrimmed = jsContent.trim();
      // save file
      fs.writeFileSync(jsFilePath, jsTrimmed, 'utf-8');

      const hashResult = await this.fileHasher.hashFile(
        //htmlFilePath,
        absoluteDirectory,
        jsFile,
        sha
      );
      if (hashResult) {
        hashes.push(hashResult);
        if (!addIntegrity) {
          continue;
        }

        // add integrity attribute to the script tag
        const scriptTag = parsedHtmlContent(`script[src="${jsFile}"]`);

        // check if script tag already has integrity attribute
        scriptTag.attr('integrity', hashResult.hash);

        // save the updated HTML content back to the file
        fs.writeFileSync(htmlFilePath, parsedHtmlContent.html(), 'utf-8');
      }
    }
    return hashes;
  }
}
