/**
 * Derive tenant slug from Origin or Referer when x-tenant-id header is missing.
 * Pattern: hr-{tenantSlug}.{baseDomain} e.g. hr-gateway-go-vap.loot.vn -> gateway-go-vap
 */
export function getTenantSlugFromRequest(req: { headers: Record<string, string | string[] | undefined> }): string | null {
  const origin = req.headers['origin'];
  const referer = req.headers['referer'];
  const url = (Array.isArray(origin) ? origin[0] : origin) || (Array.isArray(referer) ? referer[0] : referer);
  if (!url || typeof url !== 'string') return null;

  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch {
    return null;
  }

  const baseDomain = (process.env.BASE_DOMAIN || 'loot.vn').replace(/^\./, '');
  const suffix = '.' + baseDomain;
  if (!hostname.endsWith(suffix)) return null;
  const subdomain = hostname.slice(0, -suffix.length);
  if (!subdomain.startsWith('hr-')) return null;
  return subdomain.slice(3) || null; // "hr-".length === 3
}
