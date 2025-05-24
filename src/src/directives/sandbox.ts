export interface SandboxDirective {
  'allow-forms'?: boolean;
  'allow-modals'?: boolean;
  'allow-popups'?: boolean;
  'allow-same-origin'?: boolean;
  'allow-scripts'?: boolean;
  'allow-downloads'?: boolean;
  'allow-top-navigation'?: boolean;
  'allow-top-navigation-by-user-activation'?: boolean;
  'allow-presentation'?: boolean;
  additionalValues?: string[];
}

export function sandboxToCsp(directive: SandboxDirective): string {
  const values: string[] = [];
  for (const key of Object.keys(directive)) {
    if (key.startsWith('allow-') && directive[key as keyof SandboxDirective]) {
      values.push(key);
    }
  }
  if (directive.additionalValues) values.push(...directive.additionalValues);
  return `sandbox${values.length ? ' ' + values.join(' ') : ''};`;
}
