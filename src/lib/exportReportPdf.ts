const SLIDE_WIDTH_PX = 1280;
const SLIDE_HEIGHT_PX = 720;
const PDF_WIDTH_PT = 960;
const PDF_HEIGHT_PT = 540;
const RASTER_SCALE = 2;

type PdfProgress = (current: number, total: number) => void;

const INLINE_STYLE_PROPERTIES = [
  'display', 'position', 'box-sizing', 'top', 'right', 'bottom', 'left', 'z-index',
  'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
  'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'overflow', 'overflow-x', 'overflow-y',
  'background', 'background-color', 'background-image', 'background-size',
  'background-position', 'background-repeat',
  'border-top', 'border-right', 'border-bottom', 'border-left', 'border-radius',
  'box-shadow', 'opacity', 'visibility',
  'color', 'font-family', 'font-size', 'font-style', 'font-weight', 'font-stretch',
  'line-height', 'letter-spacing', 'text-align', 'text-decoration', 'text-transform',
  'white-space', 'word-break', 'overflow-wrap', 'text-overflow',
  'vertical-align', 'list-style',
  'flex', 'flex-basis', 'flex-direction', 'flex-flow', 'flex-grow', 'flex-shrink',
  'flex-wrap', 'align-content', 'align-items', 'align-self',
  'justify-content', 'justify-items', 'justify-self', 'gap', 'row-gap', 'column-gap',
  'grid', 'grid-area', 'grid-auto-columns', 'grid-auto-flow', 'grid-auto-rows',
  'grid-column', 'grid-column-end', 'grid-column-start', 'grid-row',
  'grid-row-end', 'grid-row-start', 'grid-template', 'grid-template-areas',
  'grid-template-columns', 'grid-template-rows',
  'transform', 'transform-origin', 'filter', 'clip-path',
] as const;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function sanitizeFilename(value: string): string {
  const cleaned = value
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || 'Brand Consulting';
}

function isElementNode(value: Node): value is HTMLElement {
  return value.nodeType === Node.ELEMENT_NODE && 'style' in value;
}

function safeStyleValue(property: string, value: string): string {
  if (property === 'background-image' && /url\(["']?https?:/i.test(value)) return 'none';
  return value;
}

function copyComputedStyles(source: Element, target: Element, windowRef: Window): void {
  if (!isElementNode(source) || !isElementNode(target)) return;

  const computed = windowRef.getComputedStyle(source);
  INLINE_STYLE_PROPERTIES.forEach((property) => {
    const value = safeStyleValue(property, computed.getPropertyValue(property));
    if (value) target.style.setProperty(property, value);
  });

  if (source.classList.contains('slide')) {
    target.style.setProperty('width', `${SLIDE_WIDTH_PX}px`, 'important');
    target.style.setProperty('height', `${SLIDE_HEIGHT_PX}px`, 'important');
    target.style.setProperty('min-width', `${SLIDE_WIDTH_PX}px`, 'important');
    target.style.setProperty('min-height', `${SLIDE_HEIGHT_PX}px`, 'important');
    target.style.setProperty('transform', 'none', 'important');
    target.style.setProperty('position', 'relative', 'important');
    target.style.setProperty('overflow', 'hidden', 'important');
  }

  const sourceChildren = Array.from(source.children);
  const targetChildren = Array.from(target.children);
  sourceChildren.forEach((child, index) => {
    const clonedChild = targetChildren[index];
    if (clonedChild) copyComputedStyles(child, clonedChild, windowRef);
  });
}

function collectLocalCss(documentRef: Document): string {
  const css: string[] = [];

  documentRef.querySelectorAll('style').forEach((style) => {
    if (style.textContent) css.push(style.textContent);
  });

  Array.from(documentRef.styleSheets).forEach((sheet) => {
    try {
      if (sheet.href) {
        const sheetUrl = new URL(sheet.href, documentRef.baseURI);
        if (sheetUrl.protocol === 'http:' || sheetUrl.protocol === 'https:') return;
      }
      css.push(Array.from(sheet.cssRules ?? []).map((rule) => rule.cssText).join('\n'));
    } catch {
      // Cross-origin styles are intentionally skipped. Visible nodes receive
      // their computed layout styles before capture.
    }
  });

  return css.join('\n').replace(/<\/style/gi, '<\\/style');
}

function createSlideClone(slide: HTMLElement, windowRef: Window): HTMLElement {
  const clone = slide.cloneNode(true) as HTMLElement;
  clone.removeAttribute('data-layout-overflow');
  copyComputedStyles(slide, clone, windowRef);
  return clone;
}

async function svgToJpeg(
  slide: HTMLElement,
  documentRef: Document,
  windowRef: Window,
): Promise<Uint8Array> {
  const clone = createSlideClone(slide, windowRef);
  const css = collectLocalCss(documentRef);
  const serialized = new XMLSerializer().serializeToString(clone);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SLIDE_WIDTH_PX}" height="${SLIDE_HEIGHT_PX}" viewBox="0 0 ${SLIDE_WIDTH_PX} ${SLIDE_HEIGHT_PX}">
  <foreignObject x="0" y="0" width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml" style="width:${SLIDE_WIDTH_PX}px;height:${SLIDE_HEIGHT_PX}px;overflow:hidden;">
      <style>${escapeXml(css)}</style>
      ${serialized}
    </div>
  </foreignObject>
</svg>`;

  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    const image = new Image();
    image.decoding = 'sync';

    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error('슬라이드 이미지 변환 시간이 초과됐습니다.')), 15000);
      image.onload = () => {
        window.clearTimeout(timeout);
        resolve();
      };
      image.onerror = () => {
        window.clearTimeout(timeout);
        reject(new Error('슬라이드를 이미지로 변환하지 못했습니다.'));
      };
      image.src = svgUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = SLIDE_WIDTH_PX * RASTER_SCALE;
    canvas.height = SLIDE_HEIGHT_PX * RASTER_SCALE;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('PDF 렌더링용 Canvas를 생성하지 못했습니다.');

    const background = windowRef.getComputedStyle(slide).backgroundColor || '#ffffff';
    context.fillStyle = background === 'rgba(0, 0, 0, 0)' ? '#ffffff' : background;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const jpegBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('JPEG 변환에 실패했습니다.'))),
        'image/jpeg',
        0.96,
      );
    });

    return new Uint8Array(await jpegBlob.arrayBuffer());
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

function ascii(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function concatBytes(chunks: Uint8Array[]): Uint8Array {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  chunks.forEach((chunk) => {
    result.set(chunk, offset);
    offset += chunk.length;
  });
  return result;
}

function buildPdf(jpegs: Uint8Array[]): Uint8Array {
  const pageObjectIds = jpegs.map((_, index) => 3 + index * 3);
  const objectCount = 2 + jpegs.length * 3;
  const chunks: Uint8Array[] = [];
  const offsets = new Array<number>(objectCount + 1).fill(0);
  let byteOffset = 0;

  const push = (chunk: Uint8Array) => {
    chunks.push(chunk);
    byteOffset += chunk.length;
  };
  const pushText = (text: string) => push(ascii(text));
  const startObject = (id: number) => {
    offsets[id] = byteOffset;
    pushText(`${id} 0 obj\n`);
  };

  push(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a]));
  push(new Uint8Array([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]));

  startObject(1);
  pushText('<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  startObject(2);
  pushText(`<< /Type /Pages /Count ${jpegs.length} /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] >>\nendobj\n`);

  jpegs.forEach((jpeg, index) => {
    const pageId = 3 + index * 3;
    const contentId = pageId + 1;
    const imageId = pageId + 2;
    const imageName = `Im${index + 1}`;

    startObject(pageId);
    pushText(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_WIDTH_PT} ${PDF_HEIGHT_PT}] ` +
      `/Resources << /XObject << /${imageName} ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>\nendobj\n`,
    );

    const content = `q\n${PDF_WIDTH_PT} 0 0 ${PDF_HEIGHT_PT} 0 0 cm\n/${imageName} Do\nQ\n`;
    startObject(contentId);
    pushText(`<< /Length ${ascii(content).length} >>\nstream\n${content}endstream\nendobj\n`);

    startObject(imageId);
    pushText(
      `<< /Type /XObject /Subtype /Image /Width ${SLIDE_WIDTH_PX * RASTER_SCALE} ` +
      `/Height ${SLIDE_HEIGHT_PX * RASTER_SCALE} /ColorSpace /DeviceRGB ` +
      `/BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
    );
    push(jpeg);
    pushText('\nendstream\nendobj\n');
  });

  const xrefOffset = byteOffset;
  pushText(`xref\n0 ${objectCount + 1}\n`);
  pushText('0000000000 65535 f \n');
  for (let id = 1; id <= objectCount; id += 1) {
    pushText(`${String(offsets[id]).padStart(10, '0')} 00000 n \n`);
  }
  pushText(`trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

  return concatBytes(chunks);
}

function showProgressOverlay(total: number): { update: PdfProgress; close: () => void } {
  const overlay = document.createElement('div');
  overlay.style.cssText = [
    'position:fixed', 'inset:0', 'z-index:2147483647',
    'display:flex', 'align-items:center', 'justify-content:center',
    'background:rgba(4,7,10,.82)', 'backdrop-filter:blur(8px)',
    'font-family:Arial,sans-serif', 'color:#fff',
  ].join(';');

  const panel = document.createElement('div');
  panel.style.cssText = 'min-width:320px;padding:28px 32px;border:1px solid rgba(45,212,191,.45);border-radius:16px;background:#101716;text-align:center;box-shadow:0 20px 80px rgba(0,0,0,.5)';
  const title = document.createElement('div');
  title.textContent = '16:9 PDF 생성 중';
  title.style.cssText = 'font-weight:800;font-size:18px;margin-bottom:10px';
  const status = document.createElement('div');
  status.textContent = `0 / ${total}`;
  status.style.cssText = 'font-size:13px;color:#5eead4';
  panel.append(title, status);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  return {
    update: (current, count) => {
      status.textContent = `${current} / ${count} 페이지 렌더링`;
    },
    close: () => overlay.remove(),
  };
}

export async function exportReportPdf(
  iframe: HTMLIFrameElement,
  filename?: string,
): Promise<void> {
  const documentRef = iframe.contentDocument;
  const windowRef = iframe.contentWindow;
  if (!documentRef || !windowRef) throw new Error('보고서 iframe에 접근할 수 없습니다.');

  const preflight = (windowRef as Window & { __REPORT_PREFLIGHT__?: () => { ok: boolean; issues: string[] } }).__REPORT_PREFLIGHT__?.();
  if (preflight && !preflight.ok) {
    throw new Error(`PDF 사전검사 실패\n${preflight.issues.join('\n')}`);
  }

  if (documentRef.fonts?.ready) await documentRef.fonts.ready;

  const slides = Array.from(documentRef.querySelectorAll<HTMLElement>('.slide-wrapper > .slide'));
  if (slides.length === 0) throw new Error('출력할 슬라이드를 찾지 못했습니다.');

  const progress = showProgressOverlay(slides.length);
  const jpegs: Uint8Array[] = [];

  try {
    for (let index = 0; index < slides.length; index += 1) {
      progress.update(index + 1, slides.length);
      jpegs.push(await svgToJpeg(slides[index], documentRef, windowRef));
      await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
    }

    const pdfBytes = buildPdf(jpegs);
    const arrayBuffer = pdfBytes.buffer.slice(
      pdfBytes.byteOffset,
      pdfBytes.byteOffset + pdfBytes.byteLength,
    ) as ArrayBuffer;
    const pdfBlob = new Blob([arrayBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(pdfBlob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${sanitizeFilename(filename || documentRef.title)}.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 30000);
  } finally {
    progress.close();
  }
}
