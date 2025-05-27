import { SHAType } from './types/sha-type.js';

export interface Settings {
  directory: string;
  sha: SHAType;
  addMetaTag: boolean;
  addIntegrityAttributes: boolean;
  directives: {
    [key: string]: string[];
  };
}
