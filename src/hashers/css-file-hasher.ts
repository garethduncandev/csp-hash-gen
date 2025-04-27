import { FileHasher } from './file-hasher.js';
import { HashResult } from './hash-result.js';
import { SHAType } from '../sha-type.enum.js';
import * as cheerio from 'cheerio';
import * as fs from 'fs';

export class CssFileHasher {
  public constructor(public readonly fileHasher: FileHasher) {}
  public async hashFile(
    htmlFilePath: string,
    absoluteDirectory: string,
    sha: SHAType,
    addIntegrity: boolean,
    parsedHtmlContent: cheerio.CheerioAPI
  ): Promise<HashResult[]> {
    // Find all <link> tags with a href attribute
    const cssFiles: string[] = [];
    const hashes: HashResult[] = [];

    parsedHtmlContent('link[rel="stylesheet"]').each((_, element) => {
      const href = parsedHtmlContent(element).attr('href');
      if (href) {
        cssFiles.push(href);
      }
    });

    for (const cssFile of cssFiles) {
      // load css file content
      const cssFilePath = `${absoluteDirectory}/${cssFile}`;
      const cssContent = fs.readFileSync(cssFilePath, 'utf-8');
      // remove last line break
      const cssTrimmed = cssContent.trim();
      // save file
      fs.writeFileSync(cssFilePath, cssTrimmed, 'utf-8');

      const hashResult = await this.fileHasher.hashFile(
        //htmlFilePath,
        absoluteDirectory,
        cssFile,
        sha
      );
      if (hashResult) {
        hashes.push(hashResult);
        if (!addIntegrity) {
          continue;
        }

        // add integrity attribute to the link tag
        const linkTag = parsedHtmlContent(`link[href="${cssFile}"]`);

        // check if link tag already has integrity attribute
        linkTag.attr('integrity', hashResult.hash);

        // save the updated HTML content back to the file
        fs.writeFileSync(htmlFilePath, parsedHtmlContent.html(), 'utf-8');
      }
    }
    return hashes;
  }
}
