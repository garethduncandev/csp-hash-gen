import * as fs from 'fs';
import * as cheerio from 'cheerio';

export class MetaTagHelper {
  public addMetaTag(
    csp: string,
    htmlFilePath: string,
    parsedHtmlContent: cheerio.CheerioAPI
  ): void {
    const metaTag = `<meta http-equiv="Content-Security-Policy" content="${csp}">`;

    // if meta tag already exists, remove it
    parsedHtmlContent('meta[http-equiv="Content-Security-Policy"]').remove();

    parsedHtmlContent('head').prepend(metaTag);
    // Save the updated HTML content back to the file
    fs.writeFileSync(htmlFilePath, parsedHtmlContent.html(), 'utf-8');
  }
}
