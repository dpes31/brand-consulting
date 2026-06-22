const SLIDE_WIDTH_PX = 1280;
const SLIDE_HEIGHT_PX = 720;
const PDF_WIDTH_PT = 960;
const PDF_HEIGHT_PT = 540;
const RASTER_SCALE = 2;
const HTML2CANVAS_SRC = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';

type PdfProgress = (current: number, total: number) => void;

type Html2CanvasOptions = {
  allowTaint?: boolean;
  backgroundColor?: string | null;
  height?: number;
  imageTimeout?: number;
  logging?: boolean;
  onclone?: (clonedDocument: Document, element: HTMLElement) => void;
  removeContainer?: boolean;
  scale?: number;
  scrollX?: number;
  scrollY?: number;
  useCORS?: boolean;
  width?: number;
  windowHeight?: number;
  windowWidth?: number;
};

type Html2CanvasRenderer = (
  element: HTMLElement,
  options?: Html2CanvasOptions,
) => Promise<HTMLCanvasElement>;

type ReportWindow = Window & {
  html2canvas?: Html2CanvasRenderer;
  __HTML2CANVAS_LOADING__?: Promise<Html2CanvasRenderer>;
};

function sanitizeFilename(value: string): string {
  const cleaned = value
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || 'Brand Consulting';
}

function normalizeTransparentColor(value: string): string {
  return value === 'rgba(0, 0, 0, 0)' || value === 'transparent' ? '#ffffff' : value;
}

function loadHtml2Canvas(documentRef: Document, windowRef: ReportWindow): Promise<Html2CanvasRenderer> {
  if (windowRef.html2canvas) return Promise.resolve(windowRef.html2canvas);
  if (windowRef.__HTML2CANVAS_LOADING__) return windowRef.__HTML2CANVAS_LOADING__;

  windowRef.__HTML2CANVAS_LOADING__ = new Promise<Html2CanvasRenderer>((resolve, reject) => {
    const existing = documentRef.querySelector<HTMLScriptElement>('script[data-layout-html2canvas="true"]');
    const script = existing ?? documentRef.createElement('script');

    const timeout = window.setTimeout(() => {
      reject(new Error('PDF 렌더링 모듈 로딩 시간이 초과됐습니다. 네트워크 연결을 확인해 주세요.'));
    }, 20000);

    const finish = () => {
      window.clearTimeout(timeout);
      if (windowRef.html2canvas) resolve(windowRef.html2canvas);
      else reject(new Error('PDF 렌더링 모듈을 불러오지 못했습니다.'));
    };

    script.addEventListener('load', finish, { once: true });
    script.addEventListener('error', () => {
      window.clearTimeout(timeout);
      reject(new Error('PDF 렌더링 모듈 다운로드에 실패했습니다.'));
    }, { once: true });

    if (!existing) {
      script.src = HTML2CANVAS_SRC;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.dataset.layoutHtml2canvas = 'true';
      documentRef.head.appendChild(script);
    } else if (windowRef.html2canvas) {
      finish();
    }
  });

  return windowRef.__HTML2CANVAS_LOADING__;
}

function createExportStage(documentRef: Document, slide: HTMLElement): {
  wrapper: HTMLElement;
  slideClone: HTMLElement;
} {
  const wrapper = documentRef.createElement('div');
  wrapper.className = 'slide-wrapper pdf-export-stage';
  wrapper.style.setProperty('position', 'fixed', 'important');
  wrapper.style.setProperty('left', '-20000px', 'important');
  wrapper.style.setProperty('top', '0', 'important');
  wrapper.style.setProperty('width', `${SLIDE_WIDTH_PX}px`, 'important');
  wrapper.style.setProperty('height', `${SLIDE_HEIGHT_PX}px`, 'important');
  wrapper.style.setProperty('min-width', `${SLIDE_WIDTH_PX}px`, 'important');
  wrapper.style.setProperty('min-height', `${SLIDE_HEIGHT_PX}px`, 'important');
  wrapper.style.setProperty('margin', '0', 'important');
  wrapper.style.setProperty('overflow', 'hidden', 'important');
  wrapper.style.setProperty('transform', 'none', 'important');
  wrapper.style.setProperty('z-index', '-2147483647', 'important');
  wrapper.style.setProperty('pointer-events', 'none', 'important');

  const slideClone = slide.cloneNode(true) as HTMLElement;
  slideClone.removeAttribute('data-layout-overflow');
  slideClone.style.setProperty('position', 'relative', 'important');
  slideClone.style.setProperty('left', '0', 'important');
  slideClone.style.setProperty('top', '0', 'important');
  slideClone.style.setProperty('width', `${SLIDE_WIDTH_PX}px`, 'important');
  slideClone.style.setProperty('height', `${SLIDE_HEIGHT_PX}px`, 'important');
  slideClone.style.setProperty('min-width', `${SLIDE_WIDTH_PX}px`, 'important');
  slideClone.style.setProperty('min-height', `${SLIDE_HEIGHT_PX}px`, 'important');
  slideClone.style.setProperty('margin', '0', 'important');
  slideClone.style.setProperty('transform', 'none', 'important');
  slideClone.style.setProperty('overflow', 'hidden', 'important');

  // Cross-origin media must never taint the export canvas. html2canvas will use
  // CORS-enabled assets where available and omit unsafe assets otherwise.
  slideClone.querySelectorAll<HTMLImageElement>('img').forEach((image) => {
    image.crossOrigin = 'anonymous';
    image.referrerPolicy = 'no-referrer';
  });
  slideClone.querySelectorAll('video, iframe, canvas').forEach((element) => element.remove());

  wrapper.appendChild(slideClone);
  documentRef.body.appendChild(wrapper);
  return { wrapper, slideClone };
}

async function canvasToJpeg(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    try {
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error('JPEG 변환에 실패했습니다.'))),
        'image/jpeg',
        0.96,
      );
    } catch (error) {
      reject(error);
    }
  });
  return new Uint8Array(await blob.arrayBuffer());
}

async function slideToJpeg(
  slide: HTMLElement,
  documentRef: Document,
  windowRef: ReportWindow,
  renderer: Html2CanvasRenderer,
): Promise<Uint8Array> {
  const { wrapper, slideClone } = createExportStage(documentRef, slide);

  try {
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
    const computedBackground = windowRef.getComputedStyle(slide).backgroundColor || '#ffffff';

    const canvas = await renderer(slideClone, {
      allowTaint: false,
      backgroundColor: normalizeTransparentColor(computedBackground),
      height: SLIDE_HEIGHT_PX,
      imageTimeout: 10000,
      logging: false,
      removeContainer: true,
      scale: RASTER_SCALE,
      scrollX: 0,
      scrollY: 0,
      useCORS: true,
      width: SLIDE_WIDTH_PX,
      windowHeight: SLIDE_HEIGHT_PX,
      windowWidth: SLIDE_WIDTH_PX,
      onclone: (clonedDocument, clonedElement) => {
        clonedDocument.documentElement.style.width = `${SLIDE_WIDTH_PX}px`;
        clonedDocument.documentElement.style.height = `${SLIDE_HEIGHT_PX}px`;
        clonedDocument.body.style.width = `${SLIDE_WIDTH_PX}px`;
        clonedDocument.body.style.height = `${SLIDE_HEIGHT_PX}px`;
        clonedDocument.body.style.margin = '0';
        clonedDocument.body.style.overflow = 'hidden';
        clonedElement.style.setProperty('transform', 'none', 'important');
        clonedElement.style.setProperty('width', `${SLIDE_WIDTH_PX}px`, 'important');
        clonedElement.style.setProperty('height', `${SLIDE_HEIGHT_PX}px`, 'important');
        clonedElement.querySelectorAll<HTMLImageElement>('img').forEach((image) => {
          image.crossOrigin = 'anonymous';
          image.referrerPolicy = 'no-referrer';
        });
      },
    });

    return await canvasToJpeg(canvas);
  } finally {
    wrapper.remove();
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
  const windowRef = iframe.contentWindow as ReportWindow | null;
  if (!documentRef || !windowRef) throw new Error('보고서 iframe에 접근할 수 없습니다.');

  const preflight = (windowRef as Window & { __REPORT_PREFLIGHT__?: () => { ok: boolean; issues: string[] } }).__REPORT_PREFLIGHT__?.();
  if (preflight && !preflight.ok) {
    throw new Error(`PDF 사전검사 실패\n${preflight.issues.join('\n')}`);
  }

  if (documentRef.fonts?.ready) await documentRef.fonts.ready;

  const slides = Array.from(documentRef.querySelectorAll<HTMLElement>('.slide-wrapper > .slide'));
  if (slides.length === 0) throw new Error('출력할 슬라이드를 찾지 못했습니다.');

  const renderer = await loadHtml2Canvas(documentRef, windowRef);
  const progress = showProgressOverlay(slides.length);
  const jpegs: Uint8Array[] = [];

  try {
    for (let index = 0; index < slides.length; index += 1) {
      progress.update(index + 1, slides.length);
      jpegs.push(await slideToJpeg(slides[index], documentRef, windowRef, renderer));
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
