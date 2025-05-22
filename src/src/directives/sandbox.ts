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
