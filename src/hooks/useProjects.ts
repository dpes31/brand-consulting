/**
 * useProjects — localStorage 기반 컨설팅 프로젝트 영구 저장 훅
 *
 * 저장 전략: 프로젝트별로 별도 키("stratos_project_<id>") 사용
 * 대용량 HTML을 단일 키에 모두 넣으면 localStorage 5MB 한도를 초과할 수 있으므로
 * 인덱스 키("stratos_projects_index")에는 메타데이터만 보관하고
 * HTML은 개별 키에 분리 저장합니다.
 */
import { useState, useEffect, useCallback } from 'react';

export interface SavedProject {
  id: string;          // UUID 역할의 타임스탬프 기반 고유 ID
  name: string;        // 브랜드명 (수정 가능)
  createdAt: string;   // ISO 형식 생성일시
  hasHtml: boolean;    // HTML 컴파일 완료 여부
}

const INDEX_KEY = 'stratos_projects_index';
const htmlKey = (id: string) => `stratos_project_html_${id}`;

// ─── 내부 유틸 ───────────────────────────────────────────────
function loadIndex(): SavedProject[] {
  try {
    return JSON.parse(localStorage.getItem(INDEX_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveIndex(list: SavedProject[]) {
  localStorage.setItem(INDEX_KEY, JSON.stringify(list));
}

// ─── 훅 ──────────────────────────────────────────────────────
export function useProjects() {
  const [projects, setProjects] = useState<SavedProject[]>(() => loadIndex());

  // 다른 탭에서 변경 시 동기화
  useEffect(() => {
    const handler = () => setProjects(loadIndex());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  /**
   * 프로젝트 저장 또는 업데이트.
   * 같은 brandName(정확히 동일)이면 기존 항목을 덮어씁니다.
   */
  const saveProject = useCallback((brandName: string, compiledHtml: string) => {
    const current = loadIndex();
    const existing = current.find(p => p.name === brandName);
    const id = existing?.id || Date.now().toString(36);

    // HTML 개별 저장 (대용량 대응)
    try {
      localStorage.setItem(htmlKey(id), compiledHtml);
    } catch (e) {
      console.warn('[useProjects] localStorage 용량 초과로 저장 실패:', e);
      return null;
    }

    const updated: SavedProject = {
      id,
      name: brandName,
      createdAt: existing?.createdAt || new Date().toISOString(),
      hasHtml: true,
    };

    const next = existing
      ? current.map(p => p.id === id ? updated : p)
      : [updated, ...current]; // 신규는 맨 위에

    saveIndex(next);
    setProjects(next);
    return id;
  }, []);

  /** 저장된 프로젝트의 compiledHtml 조회 */
  const loadProjectHtml = useCallback((id: string): string | null => {
    return localStorage.getItem(htmlKey(id));
  }, []);

  /** 프로젝트명 수정 */
  const renameProject = useCallback((id: string, newName: string) => {
    const next = loadIndex().map(p => p.id === id ? { ...p, name: newName } : p);
    saveIndex(next);
    setProjects(next);
  }, []);

  /** 프로젝트 삭제 (HTML 포함) */
  const deleteProject = useCallback((id: string) => {
    localStorage.removeItem(htmlKey(id));
    const next = loadIndex().filter(p => p.id !== id);
    saveIndex(next);
    setProjects(next);
  }, []);

  return { projects, saveProject, loadProjectHtml, renameProject, deleteProject };
}
