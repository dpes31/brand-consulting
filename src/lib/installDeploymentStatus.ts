type BuildMeta = {
  builtAt: string;
  commitSha: string;
  environment: 'Production' | 'Preview' | 'Local';
  branch: string;
  stage: string;
};

declare const __BUILD_META__: BuildMeta | undefined;

let installed = false;

function getBuildMeta(): BuildMeta {
  if (typeof __BUILD_META__ !== 'undefined' && __BUILD_META__) return __BUILD_META__;
  return {
    builtAt: new Date().toISOString(),
    commitSha: 'local',
    environment: 'Local',
    branch: 'local',
    stage: '로컬 개발',
  };
}

function formatKoreanTimestamp(isoValue: string): string {
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) return '시간 미확인';
  const parts = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}.${get('month')}.${get('day')} ${get('hour')}:${get('minute')}`;
}

function renderDeploymentStatus(): void {
  const heading = Array.from(document.querySelectorAll<HTMLHeadingElement>('header h1'))
    .find((element) => element.textContent?.trim() === 'Research Hub');
  const row = heading?.parentElement;
  if (!row) return;

  const meta = getBuildMeta();
  const shortSha = meta.commitSha === 'local' ? 'local' : meta.commitSha.slice(0, 7);
  const label = `Updated : ${formatKoreanTimestamp(meta.builtAt)} · ${meta.environment} · ${shortSha} · ${meta.stage}`;
  let badge = row.querySelector<HTMLElement>('[data-deployment-status="true"]');
  if (!badge) {
    badge = document.createElement('span');
    badge.dataset.deploymentStatus = 'true';
    badge.className = 'px-3 py-1 bg-white/5 text-slate-400 text-[10px] font-semibold tracking-tight rounded-full border border-white/10 whitespace-nowrap';
    row.appendChild(badge);
  }
  if (badge.textContent !== label) badge.textContent = label;
  badge.title = `Branch: ${meta.branch || 'unknown'} / Commit: ${meta.commitSha}`;
  document.documentElement.dataset.deploymentCommit = shortSha;
  document.documentElement.dataset.deploymentEnvironment = meta.environment;
}

export function installDeploymentStatus(): () => void {
  if (installed || typeof document === 'undefined') return () => undefined;
  installed = true;
  renderDeploymentStatus();
  const observer = new MutationObserver(renderDeploymentStatus);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('DOMContentLoaded', renderDeploymentStatus);
  window.setTimeout(renderDeploymentStatus, 300);
  return () => {
    observer.disconnect();
    window.removeEventListener('DOMContentLoaded', renderDeploymentStatus);
    installed = false;
  };
}
