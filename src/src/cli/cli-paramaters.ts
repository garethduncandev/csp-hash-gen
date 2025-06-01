import { SHAType } from '../hashers/sha-type.js';

export interface CliParameters {
  createEmptyConfig: boolean;
  sha: SHAType;
  directory: string;
  config: string;
  addMetaTag: boolean;
  addIntegrityAttributes: boolean;
}
