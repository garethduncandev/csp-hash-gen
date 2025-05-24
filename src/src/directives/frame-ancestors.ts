export interface FrameAncestorsDirective {
  values: string[];
  self?: boolean;
  none?: boolean;
}

export function frameAncestorsToCsp(
  directive: FrameAncestorsDirective
): string {
  const values = [...directive.values];
  if (directive.self) values.unshift("'self'");
  if (directive.none) values.unshift("'none'");
  return `frame-ancestors ${values.join(' ')};`;
}
