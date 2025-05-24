export interface BaseDirective {
  self?: boolean;
  data?: boolean;
  blob?: boolean;
  none?: boolean;
  customValues?: string[];
  domains?: string[]; // List of allowed domains for the directive
}
