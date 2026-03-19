import { createContext, useContext, useState, type ReactNode } from 'react';

interface AppState {
  apiKey: string;
  setApiKey: (key: string) => void;
  brandName: string;
  setBrandName: (name: string) => void;
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
