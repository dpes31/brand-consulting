import { useState } from 'react';
import Markdown from 'react-markdown';
import { useAppContext } from '../context/AppContext';
import { RESEARCH_NODES } from '../lib/prompts';
import { runResearchNode } from '../lib/gemini';
import { compileReportToHTML } from '../lib/geminiCompiler';

export default function Dashboard() {
  const { 
    apiKey, setApiKey, 
    brandName, setBrandName, 
    isProcessing, setIsProcessing,
    currentStep, setCurrentStep,
    reportData, setReportData,
    compiledHtml, setCompiledHtml
  } = useAppContext();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);
  const [errorText, setErrorText] = useState('');
  
  // 수동 가이드 관련 상태
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [pressureError, setPressureError] = useState('');
  const [importHtmlInput, setImportHtmlInput] = useState('');

  const saveSettings = () => {
    setApiKey(tempKey);
    setIsSettingsOpen(false);
  };

  const handleStartEngine = async () => {
    if (!brandName.trim()) {
      setErrorText('분석할 브랜드명(Brand Intelligence Target)을 입력해주세요.');
      return;
    }
    setErrorText('');

    if (!apiKey) {
      // API Key가 없으면 수동 브리핑 모드(시니어 플래너 모드)로 전환
      setIsManualMode(true);
      setCurrentStep(1);
      setReportData('');
      return;
    }
    
    // API 연동 모드 실행
    setIsProcessing(true);
    setReportData('');
    setCompiledHtml('');
    setCurrentStep(1);
    let accumulatedReport = '';
    
    try {
      for (const node of RESEARCH_NODES) {
        setCurrentStep(node.step);
        const prompt = node.userPromptTemplate.replace('{BRAND_NAME}', brandName);
        const result = await runResearchNode(apiKey, node.systemPrompt, prompt);
        
        accumulatedReport += `\n\n## 0${node.step}. ${node.title}\n` + result;
        setReportData(accumulatedReport);
      }
      
      setCurrentStep(6);
      
      // 최종 HTML 컴파일 진행
      const finalHtml = await compileReportToHTML(accumulatedReport, apiKey);
      setCompiledHtml(finalHtml);
      setCurrentStep(7); // 완료 상태
    } catch (e: any) {
      console.error(e);
      setErrorText('분석 중 오류가 발생했습니다: ' + e.message);
      setCurrentStep(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualNextStep = () => {
    if (!manualInput.trim() || manualInput.length < 50) {
      setPressureError("So What? (그래서 무엇이 본질적으로 달라집니까? 단순 현상이 아니라 원인을 최소 50자 이상 깊이 있게 적어주십시오)");
      return;
    }
    
    setPressureError('');
    const currentNode = RESEARCH_NODES.find(n => n.step === currentStep);
    
    const newReportData = (reportData || '') + `\n\n## 0${currentStep}. ${currentNode?.title}\n` + manualInput;
    setReportData(newReportData);
    setManualInput('');
    setCurrentStep(currentStep + 1);
  };

  const handleCopyPrompt = () => {
    const currentNode = RESEARCH_NODES.find(n => n.step === currentStep);
    const text = currentNode?.userPromptTemplate.replace('{BRAND_NAME}', brandName) || '';
    navigator.clipboard.writeText(text);
    alert('프롬프트가 복사되었습니다. 외부 AI에서 실행 후 결과를 텍스트 박스에 붙여넣으세요.');
  };

  const handleExportPrompt = async () => {
    try {
      const response = await fetch('/template.html');
      const masterHtml = await response.text();
      const promptText = `[Role & Identity]
You are a "Master Strategic Compiler" and a "Strict HTML Molder".
Your task is to take raw, fragmented research data, elevate it using top-tier consulting logic (McKinsey & Ogilvy level), and inject it perfectly into the provided [Immutable Master HTML Code].

[Directives]
1. Read the Raw Data thoroughly. Fact-check it, fix logical leaps (So What?), and synthesize it.
2. Replace ALL {{PLACEHOLDERS}} in the HTML template with your high-density, professional Korean content.
3. Content Density Rule: Inside every box (<dl>), aim for at least 3 detail points (<dd>) per topic (<dt>). Do not leave boxes empty. Infer logical connections if data is scarce.
4. Tone & Manner: Use full, professional Korean sentences. Wrap critical phrases in governing-msg with <span class="highlight">...</span>.
5. NO [cite], [source], or markdown citations in the output HTML.
6. YOU MUST OUTPUT THE ENTIRE HTML from <!DOCTYPE html> to </html> IN A SINGLE RESPONSE. Do NOT truncate, do NOT split it into parts. It must be valid HTML.

[Immutable Master HTML Code]
${masterHtml}

[Raw Research Data]
${reportData}

================
Now, execute the compilation. Output the finalized HTML code enclosed in \`\`\`html ... \`\`\` formatting. 
Make sure ALL {{PLACEHOLDERS}} like {{BRAND_NAME}}, {{S01_TITLE}}, {{S13_MSG1}}, etc. are replaced with high-quality content derived from the raw data.
`;
      await navigator.clipboard.writeText(promptText);
      
      const blob = new Blob([promptText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stratos_compiler_prompt_${brandName || 'export'}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('마스터 프롬프트가 클립보드에 복사되었으며 파일로 다운로드되었습니다! 외부 AI에 붙여넣어 코드를 생성하세요.');
    } catch(e) {
      alert('프롬프트 생성 오류: ' + e);
    }
  };

  const renderManualBoard = () => {
    const currentNode = RESEARCH_NODES.find(n => n.step === currentStep);
    
    if (currentStep > 5) {
      return (
        <div className="glass p-8 rounded-xl flex flex-col items-center justify-center text-center animate-fade-in gap-5">
          <div className="flex flex-col items-center">
             <span className="material-symbols-outlined text-4xl text-[#2DD4BF] mb-2">task_alt</span>
             <h3 className="text-xl font-bold tracking-tight">브리핑 종료 및 포맷팅 (Phase 6)</h3>
             <p className="text-slate-400 text-sm mt-1">수집된 데이터를 바탕으로 04번 보고서 양식 결과물을 생성합니다.</p>
          </div>

          <div className="w-full flex gap-4 min-h-[220px]">
            {/* 왼쪽: 대안 A (내부 API 방식) */}
            {apiKey && (
              <div className="flex-1 bg-black/20 p-5 rounded-xl border border-white/5 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-[#ec5b13] mb-1 flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-sm">api</span> API 렌더링
                  </div>
                  <div className="text-[11px] text-slate-400 mb-4 h-8 leading-tight">등록된 API를 이용해 앱 자체적으로 처리합니다.</div>
                </div>
                <div className="flex-1 flex flex-col justify-end">
                  <button 
                    onClick={async () => {
                      setIsProcessing(true);
                      try {
                        const finalHtml = await compileReportToHTML(reportData || '', apiKey);
                        setCompiledHtml(finalHtml);
                        setCurrentStep(7);
                        const newWin = window.open('', '_blank');
                        if (newWin) {
                          newWin.document.write(finalHtml);
                          newWin.document.close();
                        }
                      } catch (e: any) {
                        setErrorText('컴파일 중 오류: ' + e.message);
                      } finally {
                        setIsProcessing(false);
                      }
                    }}
                    disabled={isProcessing}
                    className="w-full py-2 bg-[#ec5b13] text-white font-bold rounded-lg hover:brightness-110 text-sm shadow-lg flex justify-center items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                    {isProcessing ? '처리중...' : '내부 렌더러 가동'}
                  </button>
                </div>
              </div>
            )}

            {/* 오른쪽: 대안 B (프롬프트 추출 및 수동 렌더링) */}
            <div className={`flex-[1.5] bg-[#2DD4BF]/5 p-5 rounded-xl border-2 border-[#2DD4BF]/30 flex flex-col gap-3 relative shadow-2xl shadow-[#2DD4BF]/10 ${!apiKey ? 'w-full flex-none' : ''}`}>
               <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2DD4BF] text-[#120d0b] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                 Zero-API Recommended
               </div>
               
               <div className="w-full flex justify-between items-center border-b border-[#2DD4BF]/20 pb-2 mt-2">
                 <div>
                   <div className="font-bold text-[#2DD4BF] text-left">외부 AI 수동 렌더링</div>
                   <div className="text-[10px] text-slate-400 text-left">무료 제미나이 웹을 사용해 렌더링 비용을 없앱니다.</div>
                 </div>
                 <button onClick={handleExportPrompt} className="px-3 py-2 bg-[#2DD4BF]/20 text-[#2DD4BF] rounded-lg hover:bg-[#2DD4BF]/30 text-xs font-bold transition flex items-center gap-1 shadow">
                   <span className="material-symbols-outlined text-xs">content_copy</span> 프롬프트 추출
                 </button>
               </div>
               
               <div className="w-full flex-1 flex flex-col">
                 <textarea 
                   className="flex-1 w-full min-h-[80px] p-3 bg-black/40 border border-[#2DD4BF]/30 rounded-lg text-xs outline-none focus:border-[#2DD4BF] resize-none text-slate-300 placeholder:text-slate-600"
                   placeholder="외부 제미나이에서 만들어준 `<html ... </html>` 코드를 이곳에 복사해서 붙여넣으세요..."
                   value={importHtmlInput}
                   onChange={e => setImportHtmlInput(e.target.value)}
                 />
                 <button 
                   onClick={() => {
                     let html = importHtmlInput;
                     if (html.includes('\`\`\`html')) html = html.split('\`\`\`html')[1].split('\`\`\`')[0].trim();
                     else if (html.includes('<!DOCTYPE html>')) html = html.substring(html.indexOf('<!DOCTYPE html>'));
                     
                     setCompiledHtml(html);
                     setCurrentStep(7);
                     const newWin = window.open('', '_blank');
                     if (newWin) {
                       newWin.document.write(html);
                       newWin.document.close();
                     }
                   }}
                   disabled={!importHtmlInput.trim()}
                   className="w-full mt-2 py-2 bg-[#2DD4BF] text-[#120d0b] font-bold rounded-lg hover:brightness-110 text-sm disabled:opacity-50 transition shadow-lg flex items-center justify-center gap-2"
                 >
                   <span className="material-symbols-outlined text-sm">unarchive</span>
                   결과물 뷰어에 렌더링하기 (새 창 열기)
                 </button>
               </div>
            </div>
          </div>
          
          <button 
            onClick={() => { setIsManualMode(false); setCurrentStep(0); setCompiledHtml(''); setImportHtmlInput(''); }}
            className="text-slate-500 text-xs hover:text-white underline"
          >
            새 브랜드 분석하기 / 초기화
          </button>
        </div>
      );
    }

    return (
      <div className="glass p-8 rounded-xl flex flex-col gap-6 relative animate-fade-in shadow-2xl shadow-[#2DD4BF]/10 border border-[#2DD4BF]/30">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 bg-[#2DD4BF] rounded-full flex items-center justify-center text-[#120d0b] shadow-lg shadow-[#2DD4BF]/20">
            <span className="material-symbols-outlined text-xl">psychology</span>
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-[#2DD4BF]">Senior Planner's Briefing</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Step 0{currentStep} // {currentNode?.title}</p>
          </div>
        </div>

        <div className="bg-black/30 p-6 rounded-lg border-l-4 border-[#2DD4BF]">
          <p className="text-lg text-white font-medium italic leading-relaxed">
            "{currentNode?.manualGuide}"
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Insight (Required)</span>
            {/* 외부 툴 활용을 위한 복사 버튼도 슬쩍 추가 (사용자 편의) */}
            <button onClick={handleCopyPrompt} className="text-[10px] flex items-center gap-1 text-[#2DD4BF] hover:underline cursor-pointer">
               <span className="material-symbols-outlined text-[10px]">content_copy</span> 복사용 AI 프롬프트 가져오기
            </button>
          </div>
          <textarea 
            value={manualInput}
            onChange={(e) => {
              setManualInput(e.target.value);
              if (pressureError) setPressureError('');
            }}
            className="w-full h-48 p-4 bg-white/5 border border-slate-700 rounded-xl focus:ring-2 focus:ring-[#2DD4BF] outline-none transition-all placeholder:text-slate-600 resize-none text-sm leading-relaxed"
            placeholder={currentNode?.manualPlaceholder}
          />
          {pressureError && (
            <div className="flex items-start gap-2 mt-2 px-2 text-red-400 animate-pulse">
              <span className="material-symbols-outlined text-sm mt-0.5">warning</span>
              <p className="text-xs font-semibold">{pressureError}</p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-2">
          <button 
            onClick={() => { setIsManualMode(false); setCurrentStep(0); }}
            className="text-sm font-medium text-slate-500 hover:text-slate-300 transition-colors"
          >
            Cancel Briefing
          </button>
          <button 
            onClick={handleManualNextStep}
            className="px-8 py-3 bg-[#2DD4BF] text-[#120d0b] font-bold rounded-xl hover:brightness-110 transition-all shadow-lg flex items-center gap-2"
          >
            Submit & Continue
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen w-full bg-[#f8f6f6] dark:bg-[#120d0b] font-display text-slate-900 dark:text-slate-100 overflow-hidden relative">
      <aside className="w-[260px] border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-[#120d0b]/50">
        <div className="p-6 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
          <div className="h-8 w-8 bg-[#ec5b13] rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-xl">insights</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Brand Consulting</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Active Projects</p>
            <div className="space-y-1">
              <div className="flex items-center gap-3 px-3 py-2.5 bg-[#ec5b13]/10 text-[#ec5b13] rounded-xl cursor-pointer">
                <span className="material-symbols-outlined text-xl">biotech</span>
                <span className="text-sm font-medium">Auto API Intelligence</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button onClick={() => setIsSettingsOpen(true)} className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors">
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm font-medium">Gemini API 삽입</span>
          </button>
        </div>
      </aside>
      
      <main className="flex-1 flex flex-col overflow-hidden bg-[#f8f6f6] dark:bg-[#120d0b]">
        <header className="h-20 px-8 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 glass">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">Research Hub</h1>
            {apiKey ? (
              <span className="px-3 py-1 bg-[#2DD4BF]/10 text-[#2DD4BF] text-[10px] font-bold uppercase tracking-wider rounded-full">Secure Connected</span>
            ) : (
              <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-wider rounded-full">API Disconnected (Manual Fallback)</span>
            )}
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => {
                const iframe = document.querySelector('iframe');
                if (iframe && iframe.contentWindow) {
                  iframe.contentWindow.print();
                } else {
                  window.print();
                }
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#2DD4BF] text-[#120d0b] font-bold text-sm rounded-xl teal-glow hover:brightness-110 transition-all"
            >
              <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
              Export PDF
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 flex gap-8">
          <div className="flex-[1.5] flex flex-col gap-8">
            {!isManualMode ? (
              <>
                <section className="space-y-4">
                  <h3 className="text-xl font-bold tracking-tight">New Strategy Initiation</h3>
                  <div className="glass p-6 rounded-xl space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Brand Intelligence Target</label>
                      <div className="relative flex gap-2">
                        <div className="relative flex-1">
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                          <input 
                            className="w-full pl-12 pr-4 py-4 bg-white/5 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#ec5b13] focus:border-transparent outline-none transition-all placeholder:text-slate-500 text-lg font-medium" 
                            placeholder="Enter brand name for deep-dive analysis..." 
                            type="text"
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                            disabled={isProcessing}
                          />
                        </div>
                        <button 
                          onClick={handleStartEngine}
                          disabled={isProcessing}
                          className="px-8 py-4 bg-[#ec5b13] text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
                        >
                          {isProcessing ? 'Processing AI...' : 'Start Engine'}
                        </button>
                      </div>
                      {errorText && <p className="text-red-500 text-sm mt-2 px-1 font-medium">{errorText}</p>}
                      {!apiKey && (
                        <p className="text-amber-500/80 text-[11px] mt-2 px-1 font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">info</span>
                          API Key가 연결되지 않았습니다. Start Engine 클릭 시 시니어 플래너의 브리핑 보드(수동 모드)가 활성화됩니다.
                        </p>
                      )}
                    </div>
                  </div>
                </section>
                
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold tracking-tight">Research Pipeline</h3>
                    {isProcessing && (
                      <div className="flex items-center gap-2 text-[#2DD4BF] text-sm font-semibold">
                        <span className="h-2 w-2 rounded-full bg-[#2DD4BF] animate-pulse"></span>
                        Live Engine Processing
                      </div>
                    )}
                  </div>
                  <div className="relative flex justify-between">
                    <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -z-0"></div>
                    {RESEARCH_NODES.map((node) => {
                      const isPast = currentStep > node.step;
                      const isCurrent = currentStep === node.step;
                      
                      return (
                        <div key={node.step} className={`relative flex flex-col items-center gap-3 z-10 w-32 ${!isCurrent && !isPast ? 'opacity-40' : ''}`}>
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center 
                            ${isPast ? 'bg-[#ec5b13] text-white shadow-lg shadow-[#ec5b13]/20' : 
                              isCurrent ? 'bg-[#2DD4BF] text-[#120d0b] pulse-teal' : 
                              'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                            {isPast ? <span className="material-symbols-outlined text-lg">check</span> : <span className="text-sm font-bold">{node.step}</span>}
                          </div>
                          <p className={`text-[11px] font-bold text-center uppercase tracking-tighter ${isCurrent ? 'text-[#2DD4BF]' : 'text-slate-500'}`}>
                            {node.title}
                          </p>
                        </div>
                      );
                    })}

                    {/* 컴파일러 단계 시각화 */}
                    <div className={`relative flex flex-col items-center gap-3 z-10 w-32 ${currentStep < 6 ? 'opacity-40' : ''}`}>
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center 
                        ${currentStep > 6 ? 'bg-[#ec5b13] text-white shadow-lg shadow-[#ec5b13]/20' : 
                          currentStep === 6 ? 'bg-[#2DD4BF] text-[#120d0b] pulse-teal' : 
                          'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                        {currentStep > 6 ? <span className="material-symbols-outlined text-lg">check</span> : <span className="material-symbols-outlined text-lg">hardware</span>}
                      </div>
                      <p className={`text-[11px] font-bold text-center uppercase tracking-tighter ${currentStep === 6 ? 'text-[#2DD4BF]' : 'text-slate-500'}`}>
                        Format Compiler
                      </p>
                    </div>
                  </div>
                </section>
              </>
            ) : (
              // 수동 가이드 브리핑 렌더링
              <section className="h-full flex flex-col justify-center">
                {renderManualBoard()}
              </section>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold tracking-tight">Live Insights Preview</h3>
            </div>
            <div className="flex-1 w-full glass rounded-2xl overflow-hidden relative border border-white/10 shadow-2xl bg-[#0a0706]">
              {compiledHtml ? (
                <iframe 
                  srcDoc={compiledHtml} 
                  title="Consulting Report"
                  className="w-full h-full border-none bg-white"
                />
              ) : reportData ? (
                <div className="p-8 h-full overflow-y-auto prose prose-invert prose-sm xl:prose-base max-w-none text-slate-200 prose-h2:text-[#2DD4BF] prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-2">
                  <Markdown>{reportData}</Markdown>
                  {isProcessing && currentStep === 6 && (
                    <div className="mt-8 p-4 bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 rounded-lg flex items-center justify-center gap-3 text-[#2DD4BF] animate-pulse">
                      <span className="material-symbols-outlined animate-spin">sync</span>
                      <span className="font-bold tracking-widest text-sm">마스터 템플릿 컴파일 중 (04 문양식 포맷팅)... 최대 1~2분이 소요될 수 있습니다.</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50 p-8">
                  <span className="material-symbols-outlined text-6xl mb-4">document_scanner</span>
                  <h4 className="text-2xl font-bold">Awaiting Analytics</h4>
                  <p className="mt-2 text-sm text-center">
                    {isManualMode ? "시니어 플래너의 요청에 따라 보고서를 작성하세요." : "엔진을 가동하여 데이터를 수집하거나 직접 입력하세요."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white dark:bg-[#120d0b] border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-2xl w-[400px]">
            <h3 className="text-xl font-bold mb-4">Dashboard Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-500 mb-2">Gemini API Key</label>
                <input 
                  type="password" 
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-[#ec5b13]"
                  placeholder="AIzaSy... (Leave empty for Manual Fallback)"
                />
                <p className="text-xs text-slate-400 mt-2">API 키를 제거하시면 메인 대시보드에서 자동으로 시니어 플래너(수동 가이드) 모드로 작동합니다.</p>
              </div>
            </div>
            <div className="mt-8 flex gap-3 justify-end">
              <button onClick={() => setIsSettingsOpen(false)} className="px-4 py-2 rounded-lg font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
              <button onClick={saveSettings} className="px-6 py-2 rounded-lg font-medium bg-[#ec5b13] text-white hover:opacity-90">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
