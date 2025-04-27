import { HashResult } from './hash-result.js';
import { SHAType } from '../sha-type.enum.js';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export class FileHasher {
  public async hashFile(
    // htmlFilePath: string,
    absoluteDir: string,
    resourcePath: string,
    sha: SHAType
  ): Promise<HashResult | null> {
    const isExternal =
      resourcePath.startsWith('http') || resourcePath.startsWith('//');

    if (isExternal) {
      return await this.hashExternalFile(/* htmlFilePath, */ resourcePath, sha);
    }
    return this.hashInternalFile(
      /* htmlFilePath, */ absoluteDir,
      resourcePath,
      sha
    );
  }

  public createHash(content: string, shaType: SHAType): string {
    const hash = crypto.createHash(shaType);
    hash.update(content);
    return `${shaType.toString()}-${hash.digest('base64')}`;
  }

  private hashInternalFile(
    // htmlFilePath: string,
    absoluteDir: string,
    resourcePath: string,
    sha: SHAType
  ): HashResult | null {
    const absoluteFilePath = path.join(absoluteDir, resourcePath);
    const fileContent = fs.readFileSync(absoluteFilePath, 'utf-8');
    const resourceHash = this.createHash(fileContent, sha);
    const extension = path.extname(resourcePath).toLowerCase().replace('.', '');
    return {
      // htmlFilePath: htmlFilePath,
      resourcePath: absoluteFilePath,
      hash: resourceHash,
      external: false,
      inline: false,
      type: extension,
      domain: 'self',
    };
  }

  private async hashExternalFile(
    // htmlFilePath: string,
    url: string,
    sha: SHAType
  ): Promise<HashResult | null> {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(
        `Failed to fetch ${url} - unable to hash: ${response.statusText}`
      );
      return null;
    }
    const resourceContent = await response.text();
    const resourceHash = this.createHash(resourceContent, sha);
    const parsedUrl = new URL(url);
    const domain = `${parsedUrl.protocol}//${parsedUrl.hostname}` || null; // Fixed variable reference
    const extension = path
      .extname(parsedUrl.pathname)
      .toLowerCase()
      .replace('.', '');

    return {
      // htmlFilePath: htmlFilePath,
      resourcePath: url,
      hash: resourceHash,
      external: true,
      inline: false,
      type: extension,
      domain: domain,
    };
  }
}
