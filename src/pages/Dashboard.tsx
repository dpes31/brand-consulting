import { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import { useAppContext } from '../context/AppContext';
import { RESEARCH_NODES } from '../lib/prompts';
import { runResearchNode } from '../lib/gemini';
import { compileReportToHTML } from '../lib/geminiCompiler';
import { useProjects } from '../hooks/useProjects';

/**
 * 단계별로 선택 입력값을 프롬프트에 주입하는 헬퍼 함수.
 * - step 0(Fact Book) & 1(Market): 첨부 파일 참고 지침 삽입
 * - step 2(Competitor): 필수 경쟁사 목록 삽입
 * - step 5(Strategy): 광고주 핵심 니즈 삽입
 */
function buildPromptWithContext(
  basePrompt: string,
  step: number,
  opts: { mustHaveCompetitors: string; clientNeeds: string; referenceNote: string }
): string {
  let prompt = basePrompt;

  // 참고자료 첨부 지침: 조사 첫 두 단계에 삽입
  if ((step === 0 || step === 1) && opts.referenceNote.trim()) {
    prompt += `

[첨부 참고자료 활용 지침]
아래 메모를 참고하십시오. 만약 외부 AI 도구에서 이 프롬프트를 실행하면서 첨부한 파일(PDF, 문서 등)이 있다면,
해당 파일의 내용을 우선적으로 학습하고 조사에 반드시 반영하십시오.
참고자료 메모: ${opts.referenceNote.trim()}`;
  }

  // 필수 경쟁사: Step 2 Competitor 프롬프트에만 주입
  if (step === 2 && opts.mustHaveCompetitors.trim()) {
    prompt += `

[필수 포함 경쟁사 — 광고주 지정 (Zero Skip Rule)]
아래 경쟁사는 광고주가 반드시 분석에 포함할 것을 요청한 업체입니다. 누락 없이 Direct 또는 Indirect 섹션에 포함하십시오:
${opts.mustHaveCompetitors.trim()}`;
  }

  // 광고주 핵심 니즈: Step 5 Strategy 프롬프트에만 주입
  if (step === 5 && opts.clientNeeds.trim()) {
    prompt += `

[광고주 핵심 니즈 / 캠페인 필수 방향]
아래 사항은 광고주가 이번 캠페인에서 반드시 반영을 요청한 핵심 니즈 및 방향성입니다.
전략 제안 시 최우선 Constraint로 적용하고, 제안 방향이 이 니즈에 부합하는지 검증하십시오:
${opts.clientNeeds.trim()}`;
  }

  return prompt;
}

export default function Dashboard() {
  const { 
    apiKey, setApiKey, 
    brandName, setBrandName,
    mustHaveCompetitors, setMustHaveCompetitors,
    clientNeeds, setClientNeeds,
    referenceNote, setReferenceNote,
    isProcessing, setIsProcessing,
    currentStep, setCurrentStep,
    reportData, setReportData,
    compiledHtml, setCompiledHtml
  } = useAppContext();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);
  const [errorText, setErrorText] = useState('');
  const [isContextOpen, setIsContextOpen] = useState(false); // 전략 세팅 패널 토글
  
  // 수동 가이드 관련 상태
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [pressureError, setPressureError] = useState('');
  const [importHtmlInput, setImportHtmlInput] = useState('');
  const [showFullscreenViewer, setShowFullscreenViewer] = useState(false);

  // 프로젝트 저장 훅
  const { projects, saveProject, loadProjectHtml, renameProject, deleteProject } = useProjects();
  // 프로젝트명 인라인 편집 중인 항목 ID
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // buildPromptWithContext에 전달할 옵션 객체
  const contextOpts = { mustHaveCompetitors, clientNeeds, referenceNote };

  // compiledHtml이 완성되면 자동 저장
  useEffect(() => {
    if (compiledHtml && brandName.trim()) {
      saveProject(brandName.trim(), compiledHtml);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compiledHtml]);

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
      // API Key가 없으면 수동 브리핑 모드로 전환
      setIsManualMode(true);
      setCurrentStep(0);
      setReportData('');
      // 조사 시작 시 전략 세팅 패널 자동 접기
      setIsContextOpen(false);
      return;
    }
    
    // API 연동 모드 실행 — 조사 시작 시 전략 세팅 자동 접기
    setIsContextOpen(false);
    setIsProcessing(true);
    setReportData('');
    setCompiledHtml('');
    setCurrentStep(0);
    let accumulatedReport = '';
    
    try {
      for (const node of RESEARCH_NODES) {
        setCurrentStep(node.step);
        // 기본 프롬프트에 단계별 선택 입력값을 외과적으로 주입
        const basePrompt = node.userPromptTemplate.replace('{BRAND_NAME}', brandName);
        const prompt = buildPromptWithContext(basePrompt, node.step, contextOpts);
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
    if (!currentNode) return;
    // 선택 입력값(경쟁사, 니즈, 참고자료)을 해당 단계에 맞게 주입한 프롬프트 복사
    const basePrompt = currentNode.userPromptTemplate.replace('{BRAND_NAME}', brandName);
    const text = buildPromptWithContext(basePrompt, currentNode.step, contextOpts);
    navigator.clipboard.writeText(text);

    const hasContext = [
      currentNode.step <= 1 && referenceNote.trim(),
      currentNode.step === 2 && mustHaveCompetitors.trim(),
      currentNode.step === 5 && clientNeeds.trim(),
    ].some(Boolean);
    alert(
      hasContext
        ? '✅ 프롬프트가 복사되었습니다. (전략 세팅값 자동 반영됨)\n외부 AI에서 실행 후 결과를 텍스트 박스에 붙여넣으세요.'
        : '프롬프트가 복사되었습니다. 외부 AI에서 실행 후 결과를 텍스트 박스에 붙여넣으세요.'
    );
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
Make sure ALL {{PLACEHOLDERS}} are replaced with high-quality content.
This includes BOTH the original slides ({{S01_TITLE}}, {{S13_MSG1}}, etc.) AND the new Brand Fact Book slides ({{SF01_TITLE}}, {{SF02_TITLE}}, {{SF03_TITLE}}, etc.).
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
                        setShowFullscreenViewer(true);
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
                     setShowFullscreenViewer(true);
                   }}
                   disabled={!importHtmlInput.trim()}
                   className="w-full mt-2 py-2 bg-[#2DD4BF] text-[#120d0b] font-bold rounded-lg hover:brightness-110 text-sm disabled:opacity-50 transition shadow-lg flex items-center justify-center gap-2"
                 >
                   <span className="material-symbols-outlined text-sm">unarchive</span>
                   결과물 뷰어에 렌더링하기
                 </button>
               </div>
            </div>
          </div>
          
          <button 
            onClick={() => {
              setIsManualMode(false);
              setCurrentStep(0);
              setCompiledHtml('');
              setImportHtmlInput('');
              // 선택 입력값은 초기화하지 않음 — 같은 광고주 연속 작업 시 재사용 편의
            }}
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
    <div className="flex h-screen w-full bg-[#120d0b] font-display text-slate-100 overflow-hidden relative">
      <aside className="w-[260px] border-r border-slate-800 flex flex-col bg-[#1a1412]/80">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="h-8 w-8 bg-[#ec5b13] rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-xl">insights</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Brand Consulting</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* 섹션 헤더 */}
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2 pt-2">Saved Projects</p>

          {projects.length === 0 ? (
            <div className="px-3 py-6 text-center text-slate-600 text-xs">
              <span className="material-symbols-outlined text-2xl block mb-2 opacity-40">folder_open</span>
              저장된 프로젝트가 없습니다.<br/>조사 완료 시 자동 저장됩니다.
            </div>
          ) : (
            <div className="space-y-1">
              {projects.map(proj => (
                <div
                  key={proj.id}
                  className="group flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                >
                  {editingId === proj.id ? (
                    /* 인라인 이름 편집 모드 */
                    <input
                      autoFocus
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      onBlur={() => {
                        if (editingName.trim()) renameProject(proj.id, editingName.trim());
                        setEditingId(null);
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          if (editingName.trim()) renameProject(proj.id, editingName.trim());
                          setEditingId(null);
                        }
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="flex-1 bg-transparent border-b border-[#2DD4BF] text-sm outline-none text-white"
                    />
                  ) : (
                    <>
                      {/* 프로젝트 열기 */}
                      <button
                        className="flex-1 flex items-center gap-2 text-left min-w-0"
                        onClick={() => {
                          const html = loadProjectHtml(proj.id);
                          if (html) {
                            setCompiledHtml(html);
                            setShowFullscreenViewer(true);
                          }
                        }}
                      >
                        <span className="material-symbols-outlined text-base text-[#ec5b13] shrink-0">description</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate text-slate-200">{proj.name}</p>
                          <p className="text-[10px] text-slate-600 truncate">
                            {new Date(proj.createdAt).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                      </button>
                      {/* 편집/삭제 버튼 — 호버 시만 표시 */}
                      <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                        <button
                          title="이름 수정"
                          onClick={() => { setEditingId(proj.id); setEditingName(proj.name); }}
                          className="p-1 rounded hover:text-[#2DD4BF] text-slate-500 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">edit</span>
                        </button>
                        <button
                          title="삭제"
                          onClick={() => {
                            if (confirm(`"${proj.name}" 프로젝트를 삭제하시겠습니까?`)) deleteProject(proj.id);
                          }}
                          className="p-1 rounded hover:text-red-400 text-slate-500 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button onClick={() => setIsSettingsOpen(true)} className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors">
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm font-medium">Gemini API 삽입</span>
          </button>
        </div>
      </aside>
      
      <main className="flex-1 flex flex-col overflow-hidden bg-[#120d0b]">
        <header className="h-16 px-8 flex items-center justify-between border-b border-slate-800 bg-[#1a1412]/60 backdrop-blur-sm">
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
                if (showFullscreenViewer) {
                  const overlay = document.getElementById('fullscreen-viewer-iframe') as HTMLIFrameElement;
                  if (overlay?.contentWindow) { overlay.contentWindow.print(); return; }
                }
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

        <div className="flex-1 overflow-y-auto p-6 flex gap-5">
          <div className="flex-[1.5] flex flex-col gap-6">
            {!isManualMode ? (
              <>
                <section className="space-y-4">
                  <h3 className="text-xl font-bold tracking-tight">New Strategy Initiation</h3>
                  <div className="glass p-6 rounded-xl space-y-4">
                    {/* ── 브랜드명 입력 ── */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Brand Intelligence Target</label>
                      <div className="relative flex gap-2">
                        <div className="relative flex-1">
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                          <input 
                            className="w-full pl-12 pr-4 py-3 bg-white/5 dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#ec5b13] focus:border-transparent outline-none transition-all placeholder:text-slate-500 text-base font-medium" 
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
                          className="px-8 py-3 bg-[#ec5b13] text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
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

                    {/* ── 전략 세팅 (선택적 구조화 입력) ── */}
                    <div className="border-t border-white/10 pt-4">
                      <button
                        onClick={() => setIsContextOpen(v => !v)}
                        className="w-full flex items-center justify-between text-left group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-[#2DD4BF]">tune</span>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-[#2DD4BF] transition-colors">
                            전략 세팅 <span className="text-slate-600 font-normal normal-case tracking-normal">(선택 — 입력 시 해당 단계 프롬프트에 자동 반영)</span>
                          </span>
                        </div>
                        <span className="material-symbols-outlined text-slate-500 text-sm transition-transform duration-200" style={{ transform: isContextOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                          expand_more
                        </span>
                      </button>

                      {isContextOpen && (
                        <div className="mt-4 space-y-4 animate-fade-in">

                          {/* 필수 포함 경쟁사 → Step 2 Competitor */}
                          <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                              <span className="h-4 w-4 bg-red-500/20 text-red-400 rounded text-[9px] flex items-center justify-center font-black">2</span>
                              필수 포함 경쟁사
                              <span className="text-slate-600 font-normal normal-case">— Competitor 단계에 주입</span>
                            </label>
                            <input
                              type="text"
                              value={mustHaveCompetitors}
                              onChange={e => setMustHaveCompetitors(e.target.value)}
                              className="w-full px-3 py-2.5 bg-white/5 border border-slate-700 rounded-lg text-sm outline-none focus:border-red-400/50 placeholder:text-slate-600 transition-colors"
                              placeholder="예: 삼성카드, 현대카드, 토스뱅크 (쉼표로 구분)"
                            />
                          </div>

                          {/* 광고주 핵심 니즈 → Step 5 Strategy */}
                          <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                              <span className="h-4 w-4 bg-purple-500/20 text-purple-400 rounded text-[9px] flex items-center justify-center font-black">5</span>
                              광고주 핵심 니즈 / 캠페인 방향
                              <span className="text-slate-600 font-normal normal-case">— Strategy 단계에 주입</span>
                            </label>
                            <textarea
                              value={clientNeeds}
                              onChange={e => setClientNeeds(e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2.5 bg-white/5 border border-slate-700 rounded-lg text-sm outline-none focus:border-purple-400/50 placeholder:text-slate-600 resize-none transition-colors"
                              placeholder="예: TV CF 중심 매스 캠페인, MZ 타겟 집중, 글로벌 확장 대비 브랜딩 강화"
                            />
                          </div>

                          {/* 참고자료 첨부 안내 → Step 0 & 1 */}
                          <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                              <span className="h-4 w-4 bg-[#2DD4BF]/20 text-[#2DD4BF] rounded text-[9px] flex items-center justify-center font-black">0</span>
                              첨부 참고자료 안내
                              <span className="text-slate-600 font-normal normal-case">— Fact Book·Market 단계에 파일 첨부 지침 삽입</span>
                            </label>
                            <textarea
                              value={referenceNote}
                              onChange={e => setReferenceNote(e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2.5 bg-white/5 border border-[#2DD4BF]/30 rounded-lg text-sm outline-none focus:border-[#2DD4BF]/60 placeholder:text-slate-600 resize-none transition-colors"
                              placeholder="예: RFP 문서를 함께 첨부합니다. 해당 파일의 광고주 요구사항을 조사 시 우선 반영해 주세요."
                            />
                            <p className="text-[10px] text-slate-600 px-1">
                              💡 외부 AI(제미나이 웹)에서 프롬프트 복사 후, 파일을 직접 첨부하면 위 메모가 참고 지침으로 포함됩니다.
                            </p>
                          </div>

                        </div>
                      )}
                    </div>

                  </div>
                </section>
                
                <section className="space-y-4">
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
                        <div key={node.step} className={`relative flex flex-col items-center gap-3 z-10 w-26 ${!isCurrent && !isPast ? 'opacity-40' : ''}`}>
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
                    <div className={`relative flex flex-col items-center gap-3 z-10 w-26 ${currentStep < 6 ? 'opacity-40' : ''}`}>
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
              <section className="h-full flex flex-col gap-6">

                {/* ── Research Pipeline — 브리핑 헤더 상단 ── */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Research Pipeline</span>
                    {isProcessing && (
                      <div className="flex items-center gap-2 text-[#2DD4BF] text-xs font-semibold">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#2DD4BF] animate-pulse"></span>
                        Live Engine Processing
                      </div>
                    )}
                  </div>
                  <div className="relative flex justify-between">
                    <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-800 -z-0"></div>
                    {RESEARCH_NODES.map((node) => {
                      const isPast = currentStep > node.step;
                      const isCurrent = currentStep === node.step;
                      return (
                        <div key={node.step} className={`relative flex flex-col items-center gap-2 z-10 w-20 ${!isCurrent && !isPast ? 'opacity-30' : ''}`}>
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold
                            ${isPast ? 'bg-[#ec5b13] text-white' :
                              isCurrent ? 'bg-[#2DD4BF] text-[#120d0b] pulse-teal' :
                              'bg-slate-800 text-slate-500'}`}>
                            {isPast ? <span className="material-symbols-outlined text-sm">check</span> : <span>{node.step}</span>}
                          </div>
                          <p className={`text-[9px] font-bold text-center uppercase tracking-tighter leading-tight ${isCurrent ? 'text-[#2DD4BF]' : 'text-slate-600'}`}>
                            {node.title}
                          </p>
                        </div>
                      );
                    })}
                    {/* 컴파일러 단계 */}
                    <div className={`relative flex flex-col items-center gap-2 z-10 w-20 ${currentStep < 6 ? 'opacity-30' : ''}`}>
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center
                        ${currentStep > 6 ? 'bg-[#ec5b13] text-white' :
                          currentStep === 6 ? 'bg-[#2DD4BF] text-[#120d0b] pulse-teal' :
                          'bg-slate-800 text-slate-500'}`}>
                        {currentStep > 6
                          ? <span className="material-symbols-outlined text-sm">check</span>
                          : <span className="material-symbols-outlined text-sm">hardware</span>}
                      </div>
                      <p className={`text-[9px] font-bold text-center uppercase tracking-tighter leading-tight ${currentStep === 6 ? 'text-[#2DD4BF]' : 'text-slate-600'}`}>
                        Compiler
                      </p>
                    </div>
                  </div>
                </div>

                {/* ── 브리핑 본문 ── */}
                {renderManualBoard()}
              </section>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-4">
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

      {/* 풀스크린 렌더링 뷰어 오버레이 */}
      {showFullscreenViewer && compiledHtml && (
        <div className="fixed inset-0 z-[100] bg-[#120d0b] flex flex-col animate-fade-in">
          {/* 오버레이 헤더 */}
          <div className="h-14 px-6 flex items-center justify-between bg-[#1a1412] border-b border-slate-800 shrink-0">
            <button
              onClick={() => {
                setShowFullscreenViewer(false);
                setCurrentStep(6);
              }}
              className="flex items-center gap-2 text-slate-300 hover:text-[#2DD4BF] transition-colors font-medium text-sm"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Phase 6으로 돌아가기
            </button>
            <div className="flex items-center gap-3">
              <span className="text-[#2DD4BF] text-xs font-bold uppercase tracking-widest">Report Viewer</span>
              <button
                onClick={() => {
                  const iframe = document.getElementById('fullscreen-viewer-iframe') as HTMLIFrameElement;
                  if (iframe?.contentWindow) iframe.contentWindow.print();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#2DD4BF] text-[#120d0b] font-bold text-xs rounded-lg hover:brightness-110 transition-all"
              >
                <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                Export PDF
              </button>
              <button
                onClick={() => setShowFullscreenViewer(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
          </div>
          {/* 오버레이 본문: 보고서 iframe */}
          <div className="flex-1 overflow-hidden">
            <iframe
              id="fullscreen-viewer-iframe"
              srcDoc={compiledHtml}
              title="Consulting Report Fullscreen"
              className="w-full h-full border-none bg-white"
              onLoad={(e) => {
                // PDF 출력 시 파일명에 브랜드명이 포함되도록 iframe 내부 title 설정
                const iframe = e.target as HTMLIFrameElement;
                if (iframe.contentDocument) {
                  const year = new Date().getFullYear();
                  iframe.contentDocument.title = `${year} ${brandName || 'Brand'} Strategic Consulting`;
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
