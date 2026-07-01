import { createContext, useContext, useState, type ReactNode } from 'react';
import {
  installCompetitorSelectionPolicy,
  syncCompetitorRegistryFromResearch,
} from '../lib/competitorSelection';

installCompetitorSelectionPolicy();

const PHASE_INPUTS_SESSION_KEY = 'brand-consulting:phase-inputs';

function readSessionPhaseInputs(): Record<number, string> {
  try {
    const raw = sessionStorage.getItem(PHASE_INPUTS_SESSION_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed)
        .filter(([, value]) => typeof value === 'string')
        .map(([key, value]) => [Number(key), String(value)]),
    );
  } catch {
    return {};
  }
}

function writeSessionPhaseInputs(inputs: Record<number, string>): void {
  try {
    sessionStorage.setItem(PHASE_INPUTS_SESSION_KEY, JSON.stringify(inputs));
  } catch {
    // Session storage may be unavailable. React state remains the source of truth.
  }
}

interface AppState {
  apiKey: string;
  setApiKey: (key: string) => void;
  brandName: string;
  setBrandName: (name: string) => void;
  mustHaveCompetitors: string;
  setMustHaveCompetitors: (val: string) => void;
  clientNeeds: string;
  setClientNeeds: (val: string) => void;
  referenceNote: string;
  setReferenceNote: (val: string) => void;
  /** @deprecated referenceData는 하위호환용으로 유지 */
  referenceData: string;
  setReferenceData: (data: string) => void;
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
  const initialPhaseInputs = readSessionPhaseInputs();
  syncCompetitorRegistryFromResearch(initialPhaseInputs[2]);

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
  const [phaseInputs, setPhaseInputsState] = useState<Record<number, string>>(initialPhaseInputs);

  const handleSetApiKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setApiKey(key);
  };

  const handleSetPhaseInputs = (inputs: Record<number, string>) => {
    syncCompetitorRegistryFromResearch(inputs[2]);
    writeSessionPhaseInputs(inputs);
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
