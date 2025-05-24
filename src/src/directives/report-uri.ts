export interface ReportUriDirective {
  value: string;
}

export function reportUriToCsp(directive: ReportUriDirective): string {
  return `report-uri ${directive.value};`;
}
