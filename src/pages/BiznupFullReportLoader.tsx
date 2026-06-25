import { useEffect, useState } from 'react';

declare global {
  interface Window {
    __BIZNUP_FULL_CHUNKS?: string[];
  }
}

const PAYLOADS = [
  '/biznup-full-payload-01.js',
  '/biznup-full-payload-02.js',
  '/biznup-full-payload-03.js',
  '/biznup-full-payload-04.js',
  '/biznup-full-payload-05.js',
  '/biznup-full-payload-06.js',
  '/biznup-full-payload-07-fixed.js',
  '/biznup-full-payload-08.js',
  '/biznup-full-payload-09.js',
] as const;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`보고서 데이터 파일을 불러오지 못했습니다: ${src}`));
    document.head.appendChild(script);
  });
}

async function decodeReport(): Promise<string> {
  window.__BIZNUP_FULL_CHUNKS = [];

  for (const src of PAYLOADS) {
    await loadScript(src);
  }

  const encoded = window.__BIZNUP_FULL_CHUNKS.join('');
  if (!encoded) throw new Error('보고서 데이터가 비어 있습니다.');

  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  if (!('DecompressionStream' in window)) {
    throw new Error('현재 브라우저가 압축 보고서 표시를 지원하지 않습니다. 최신 Chrome 또는 Whale에서 열어 주세요.');
  }

  const decompressed = new Blob([bytes])
    .stream()
    .pipeThrough(new DecompressionStream('gzip'));

  return new Response(decompressed).text();
}

export default function BiznupFullReportLoader() {
  const [html, setHtml] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    decodeReport()
      .then((report) => {
        if (active) setHtml(report);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : '보고서를 불러오지 못했습니다.');
      });

    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#080d14', color: '#f4f8fb', fontFamily: 'Noto Sans KR, sans-serif' }}>
        <div style={{ maxWidth: 720, padding: 28, border: '1px solid rgba(255,255,255,.14)', borderRadius: 16, background: '#101925' }}>
          <h1 style={{ margin: 0, fontSize: 24 }}>FULL 보고서 로딩 실패</h1>
          <p style={{ margin: '14px 0 0', color: '#b8c7d3', lineHeight: 1.6 }}>{error}</p>
        </div>
      </main>
    );
  }

  if (!html) {
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#080d14', color: '#b8c7d3', fontFamily: 'Noto Sans KR, sans-serif' }}>
        <p>기존 전체 목차와 분석 내용을 복원한 FULL 보고서를 불러오는 중입니다.</p>
      </main>
    );
  }

  return (
    <iframe
      title="비즈넵 FULL Strategy Report"
      srcDoc={html}
      style={{ display: 'block', width: '100vw', height: '100vh', border: 0, background: '#080d14' }}
    />
  );
}
