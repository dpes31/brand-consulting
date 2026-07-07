const COUNT = 40;

export function normalizeApprovedFullReportHtml(source: string): string {
  const pages = source.match(/class=["'][^"']*full-slide\b/g) || [];
  if (pages.length !== COUNT) throw new Error(`Expected ${COUNT} pages, received ${pages.length}`);
  return source;
}
