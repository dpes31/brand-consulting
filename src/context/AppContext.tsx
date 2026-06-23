import { createContext, useContext, useState, type ReactNode } from 'react';
import {
  installCompetitorSelectionPolicy,
  syncCompetitorRegistryFromResearch,
} from '../lib/competitorSelection';

installCompetitorSelectionPolicy();

interface AppState {
  apiKey: string;
  setApiKey: (key: string) => void;
  brandName: string;
  setBrandName: (name: string) => void;
  // [선택 입력] 필수 검토 경쟁사 후보 (Step 2에서 위협도 기준으로 재평가)
  mustHaveCompetitors: string;
  setMustHaveCompetitors: (val: string) => void;
  // [선택 입력] 광고주 핵심 니즈 / 캠페인 방향 (Step 5 Strategy 프롬프트에 주입)
  clientNeeds: string;
  setClientNeeds: (val: string) => void;
  // [선택 입력] 첨부 참고자료 안내 메모 (Step 0/1 프롬프트에 첨부 지침으로 삽입)
  referenceNote: string;
  setReferenceNote: (val: string) => void;
  /** @deprecated referenceData는 하위호환용으로 유지 */
  referenceData: string;
  setReferenceData: (data: string) => void;
  // [API 모드] 첨부 파일 — Step 0/1에서 Gemini API에 함께 전달됨 (RFP 등)
  attachedFiles: File[];
  setAttachedFiles: (files: File[]) => void;
  isProcessing: boolean;
  setIsProcessing: (status: boolean) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  reportData: string | null;
  setReportData: (data: string | null) => void;
  compiledHtml: string | null;
  setCompiledHtml: (html: string | null) => void;
  phaseInputs: Record<number, string>;
  setPhaseInputs: (inputs: Record<number, string>) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [brandName, setBrandName] = useState('');
  const [mustHaveCompetitors, setMustHaveCompetitors] = useState('');
  const [clientNeeds, setClientNeeds] = useState('');
  const [referenceNote, setReferenceNote] = useState('');
  const [referenceData, setReferenceData] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [reportData, setReportData] = useState<string | null>(null);
  const [compiledHtml, setCompiledHtml] = useState<string | null>(null);
  const [phaseInputs, setPhaseInputsState] = useState<Record<number, string>>({});

  const handleSetApiKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setApiKey(key);
  };

  const handleSetPhaseInputs = (inputs: Record<number, string>) => {
    // Step 2 결과의 machine-readable Registry를 파싱해 Step 3~5 프롬프트에
    // 동일 경쟁사 명단을 잠급니다. 기존 프로젝트처럼 Registry가 없으면
    // 하위호환을 위해 기존 프롬프트 동작을 유지합니다.
    syncCompetitorRegistryFromResearch(inputs[2]);
    setPhaseInputsState(inputs);
  };

  return (
    <AppContext.Provider value={{
      apiKey, setApiKey: handleSetApiKey,
      brandName, setBrandName,
      mustHaveCompetitors, setMustHaveCompetitors,
      clientNeeds, setClientNeeds,
      referenceNote, setReferenceNote,
      referenceData, setReferenceData,
      attachedFiles, setAttachedFiles,
      isProcessing, setIsProcessing,
      currentStep, setCurrentStep,
      reportData, setReportData,
      compiledHtml, setCompiledHtml,
      phaseInputs, setPhaseInputs: handleSetPhaseInputs,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
