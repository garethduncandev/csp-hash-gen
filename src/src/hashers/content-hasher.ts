import * as crypto from 'crypto';
import { SHAType } from '../sha-type.enum.js';

export class ContentHasher {
  protected hashContent(content: string, shaType: SHAType): string {
    const hash = crypto.createHash(shaType);
    hash.update(content);
    return `${shaType.toString()}-${hash.digest('base64')}`;
  }
}
