import { createContext, useContext, useState, type ReactNode } from 'react';

interface AppState {
  apiKey: string;
  setApiKey: (key: string) => void;
  brandName: string;
  setBrandName: (name: string) => void;
  // [선택 입력] 필수 포함 경쟁사 (Step 2 Competitor 프롬프트에 주입)
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
  isProcessing: boolean;
  setIsProcessing: (status: boolean) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  reportData: string | null;
  setReportData: (data: string | null) => void;
  compiledHtml: string | null;
  setCompiledHtml: (html: string | null) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [brandName, setBrandName] = useState('');
  const [mustHaveCompetitors, setMustHaveCompetitors] = useState('');
  const [clientNeeds, setClientNeeds] = useState('');
  const [referenceNote, setReferenceNote] = useState('');
  const [referenceData, setReferenceData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [reportData, setReportData] = useState<string | null>(null);
  const [compiledHtml, setCompiledHtml] = useState<string | null>(null);

  const handleSetApiKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setApiKey(key);
  };

  return (
    <AppContext.Provider value={{
      apiKey, setApiKey: handleSetApiKey,
      brandName, setBrandName,
      mustHaveCompetitors, setMustHaveCompetitors,
      clientNeeds, setClientNeeds,
      referenceNote, setReferenceNote,
      referenceData, setReferenceData,
      isProcessing, setIsProcessing,
      currentStep, setCurrentStep,
      reportData, setReportData,
      compiledHtml, setCompiledHtml
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
