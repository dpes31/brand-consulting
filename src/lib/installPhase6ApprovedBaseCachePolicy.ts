const OBSOLETE_PHASE6_BASE_PREFIXES = [
  'brand-consulting:phase6-semantic-html-v5:',
  'brand-consulting:phase6-semantic-html-v6:',
] as const;

/**
 * Phase 6 approved-base HTML is derived application output, not user research.
 * Remove prior-session captures on every app boot so a redeployed Renderer cannot
 * reuse obsolete DOM that still contains ordinal fields such as identity.content1.
 */
export function installPhase6ApprovedBaseCachePolicy(): void {
  if (typeof window === 'undefined') return;
  try {
    const keys = Array.from({ length: sessionStorage.length }, (_, index) => sessionStorage.key(index))
      .filter((key): key is string => Boolean(key));
    keys.forEach((key) => {
      if (OBSOLETE_PHASE6_BASE_PREFIXES.some((prefix) => key.startsWith(prefix))) {
        sessionStorage.removeItem(key);
      }
    });
  } catch {
    // Phase 6 can still capture the approved base in memory when storage is unavailable.
  }
}
