export interface ReportToDirective {
  values: string[];
}

export function reportToToCsp(directive: ReportToDirective): string {
  return `report-to ${directive.values.join(' ')};`;
}
