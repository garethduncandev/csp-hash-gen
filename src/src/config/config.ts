import { SHAType } from './../hashers/sha-type.js';

export interface Config {
  options: {
    directory: string;
    sha: SHAType;
    addMetaTag: boolean;
    addIntegrityAttributes: boolean;
  };
  directives: {
    [key: string]: string[];
  };
}
