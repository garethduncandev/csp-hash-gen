export interface UpgradeInsecureRequestsDirective {}

export function upgradeInsecureRequestsToCsp(
  _: UpgradeInsecureRequestsDirective
): string {
  return 'upgrade-insecure-requests;';
}
