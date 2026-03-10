/**
 * Cookie names for ffood token per branch: ffood_token_gv, ffood_token_tp, ffood_expired_gv, ffood_expired_tp
 */
function getBranchKey(branch: string): string {
  if (branch === 'GO_VAP') return 'gv';
  if (branch === 'TAN_PHU') return 'tp';
  return branch.toLowerCase().replace(/_/g, '');
}

export function getFfoodTokenCookieName(branch: string): string {
  return `ffood_token_${getBranchKey(branch)}`;
}

export function getFfoodExpiredCookieName(branch: string): string {
  return `ffood_expired_${getBranchKey(branch)}`;
}
