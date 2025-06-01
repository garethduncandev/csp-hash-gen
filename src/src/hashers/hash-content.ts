import * as crypto from 'crypto';
import { SHAType } from './sha-type.js';

export function hashContent(content: string, shaType: SHAType): string {
  const hash = crypto.createHash(shaType);
  hash.update(content);
  return `${shaType.toString()}-${hash.digest('base64')}`;
}
