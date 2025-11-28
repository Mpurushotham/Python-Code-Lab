
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { COURSE_DATA, PRACTICE_CATEGORIES, PRACTICE_DATA, CONCEPTS_DATA } from './data';
import { CourseModule, PracticeCategory, PracticeExample } from './types';
import CodePlayground from './components/CodePlayground';
import ModuleCard from './components/ModuleCard';
import { 
  BookOpen, Code, Trophy, ChevronRight, AlertTriangle, 
  CheckCircle, Home, Github, Linkedin, Terminal, 
  Layout, Search, Filter, Play, Cpu, Layers, Book,
  Sparkles, Bot, MessageSquare, Loader2, Wrench
} from 'lucide-react';

const App: React.FC = () => {
  // --- STATE ---
  const [view, setView] = useState<'home' | 'course' | 'practice' | 'concepts' | 'ide'>('home');
  
  // Course State
  const [activeModuleId, setActiveModuleId] = useState<number>(1);
  const [courseTab, setCourseTab] = useState<'learn' | 'lab' | 'project'>('learn');
  const [completedModules, setCompletedModules] = useState<number[]>(() => {
    const saved = localStorage.getItem('pythonArchitect_progress');
    return saved ? JSON.parse(saved) : [];
  });

  // Practice State
  const [practiceSearch, setPracticeSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedExample, setSelectedExample] = useState<PracticeExample | null>(null);

  // Concepts State
  const [activeConceptId, setActiveConceptId] = useState<string>(CONCEPTS_DATA[0].id);

  // IDE / AI State
  const [ideCode, setIdeCode] = useState("# Welcome to the Python AI Playground\n# 1. Type your code\n# 2. Use 'AI Generate' to write code for you\n# 3. Use 'Explain' to understand complex logic\n\ndef hello():\n    return 'Hello, Python Architect!'\n\nprint(hello())");
  const ideCodeRef = useRef(ideCode);
  const [ideError, setIdeError] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiOutput, setAiOutput] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  // --- EFFECTS ---
  useEffect(() => {
    localStorage.setItem('pythonArchitect_progress', JSON.stringify(completedModules));
  }, [completedModules]);

  // --- HELPERS ---
  const activeModule = COURSE_DATA.find(m => m.id === activeModuleId) || COURSE_DATA[0];
  const activeConcept = CONCEPTS_DATA.find(c => c.id === activeConceptId) || CONCEPTS_DATA[0];
  
  const filteredExamples = PRACTICE_DATA.filter(ex => {
    const matchesSearch = ex.title.toLowerCase().includes(practiceSearch.toLowerCase()) || 
                          ex.description.toLowerCase().includes(practiceSearch.toLowerCase());
    const matchesCat = selectedCategory === 'all' || ex.categoryId === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const getConceptByLevel = (level: 'Basic' | 'Intermediate' | 'Advanced') => {
      return CONCEPTS_DATA.filter(c => c.level === level);
  };

  // --- ACTIONS ---
  const handleStartModule = (id: number) => {
    setActiveModuleId(id);
    setCourseTab('learn');
    setView('course');
    window.scrollTo(0, 0);
  };

  const handleNextModule = () => {
    if (!completedModules.includes(activeModuleId)) {
      setCompletedModules([...completedModules, activeModuleId]);
    }
    const nextId = activeModuleId + 1;
    if (COURSE_DATA.find(m => m.id === nextId)) {
        handleStartModule(nextId);
    } else {
        setView('home');
        alert("Certification Complete: You have finished the Advanced Architecture track.");
    }
  };

  const handleIdeCodeChange = (newCode: string) => {
    ideCodeRef.current = newCode;
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt) return;
    setIsAiGenerating(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Write Python code for the following task. Provide ONLY the raw python code without markdown backticks or explanations unless comments in the code. Task: ${aiPrompt}`,
        });
        const generatedText = response.text;
        if (generatedText) {
             const cleanCode = generatedText.replace(/^```python\n/, '').replace(/^```\n/, '').replace(/\n```$/, '');
             setIdeCode(cleanCode);
             ideCodeRef.current = cleanCode;
             setIdeError(null);
        }
    } catch (e) {
        console.error(e);
        alert("AI Generation failed. Check API configuration.");
    } finally {
        setIsAiGenerating(false);
    }
  };

  const handleAiExplain = async () => {
    setIsAiGenerating(true);
    setShowAiModal(true);
    setAiOutput("Analyzing code...");
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Explain the following Python code in simple terms for a developer:\n\n${ideCodeRef.current}`,
        });
        setAiOutput(response.text || "No response.");
    } catch (e) {
         setAiOutput("Error generating explanation.");
    } finally {
        setIsAiGenerating(false);
    }
  };

  const handleAiFix = async () => {
    if (!ideError) return;
    setIsAiGenerating(true);
    setShowAiModal(true);
    setAiOutput("Analyzing error and generating fix...");

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `
I have the following Python code that produced an error.
CODE:
${ideCodeRef.current}

ERROR:
${ideError}

Please fix the code.
1. Explain what caused the error.
2. Provide the corrected code.

Return the response in this exact format:
---EXPLANATION---
(Explanation here)
---CODE---
(Only the fixed python code here, no markdown backticks)
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        const text = response.text || "";
        const parts = text.split("---CODE---");
        
        if (parts.length > 1) {
            const explanation = parts[0].replace("---EXPLANATION---", "").trim();
            const code = parts[1].trim().replace(/^```python\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '');
            
            setIdeCode(code);
            ideCodeRef.current = code;
            setIdeError(null);
            setAiOutput(`### ✅ Auto-Fix Applied\n\n${explanation}`);
        } else {
             setAiOutput("Could not automatically apply fix. Here is the AI response:\n\n" + text);
        }

    } catch (e) {
        setAiOutput("Error connecting to AI service.");
    } finally {
        setIsAiGenerating(false);
    }
  };

  // --- RENDERERS ---

  const renderNav = () => (
    <nav className="bg-slate-950 text-slate-200 sticky top-0 z-50 shadow-lg border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          onClick={() => setView('home')} 
          className="flex items-center gap-2 font-bold text-xl cursor-pointer hover:text-white transition"
        >
          <Layers className="text-python-accent" />
          <span className="tracking-tight">Python <span className="text-python-accent">Architect</span></span>
        </div>
        
        <div className="flex gap-1 md:gap-4 overflow-x-auto">
          <button 
            onClick={() => setView('home')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition whitespace-nowrap ${view === 'home' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setView('concepts')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${view === 'concepts' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Book size={16} /> Concepts
          </button>
          <button 
            onClick={() => setView('course')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition whitespace-nowrap ${view === 'course' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Advanced Tracks
          </button>
          <button 
            onClick={() => setView('practice')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${view === 'practice' ? 'bg-python-blue text-white shadow-lg shadow-python-blue/20' : 'text-slate-400 hover:text-white'}`}
          >
            <Terminal size={16} />
            Code Lab
          </button>
          <button 
            onClick={() => setView('ide')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${view === 'ide' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-slate-400 hover:text-white'}`}
          >
            <Bot size={16} />
            VSCode Playground
          </button>
        </div>
      </div>
    </nav>
  );

  const renderHome = () => (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="inline-block px-4 py-1 rounded-full bg-python-dark border border-slate-700 text-python-accent text-xs font-bold uppercase tracking-widest mb-6">
            For Experienced Engineers
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
          Architect <span className="text-transparent bg-clip-text bg-gradient-to-r from-python-accent to-python-blue">Scalable Systems</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Deep dive into Python internals, metaprogramming, concurrency, and architectural design patterns. 
          Stop writing scripts; start engineering solutions.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={() => handleStartModule(1)}
            className="bg-python-blue text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg hover:bg-sky-600 transition transform hover:-translate-y-1"
          >
            Start Advanced Track
          </button>
          <button 
            onClick={() => setView('concepts')}
             className="bg-slate-800 text-slate-200 border border-slate-700 px-8 py-4 rounded-lg font-bold text-lg hover:bg-slate-700 transition transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            <Book size={20} /> View Concepts
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700/50 text-center hover:border-python-accent/50 transition">
            <Cpu size={32} className="mx-auto text-python-yellow mb-4" />
            <div className="text-4xl font-bold text-white mb-2">500+</div>
            <div className="text-slate-400 font-medium">Complex Scenarios</div>
        </div>
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700/50 text-center hover:border-python-accent/50 transition">
            <Layers size={32} className="mx-auto text-python-accent mb-4" />
            <div className="text-4xl font-bold text-white mb-2">{completedModules.length} / 8</div>
            <div className="text-slate-400 font-medium">Architectural Modules</div>
        </div>
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700/50 text-center hover:border-python-accent/50 transition">
            <Terminal size={32} className="mx-auto text-green-500 mb-4" />
            <div className="text-4xl font-bold text-white mb-2">Pyodide</div>
            <div className="text-slate-400 font-medium">WASM Runtime</div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Professional Curriculum</h2>
          <span className="text-sm text-slate-500">Estimated Time: 40 Hours</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {COURSE_DATA.map((module) => (
          <ModuleCard 
            key={module.id} 
            module={module}
            isCompleted={completedModules.includes(module.id)}
            isLocked={false}
            onClick={() => handleStartModule(module.id)}
          />
        ))}
      </div>
    </div>
  );

  const renderConcepts = () => (
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">
          {/* Sidebar */}
          <div className="w-full lg:w-72 bg-slate-950 border-r border-slate-800 flex-shrink-0 lg:h-[calc(100vh-64px)] overflow-y-auto">
              <div className="p-6">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <Book className="text-python-yellow" /> Python Guide
                  </h2>
                  
                  {['Basic', 'Intermediate', 'Advanced'].map(level => {
                      const topics = getConceptByLevel(level as any);
                      return (
                          <div key={level} className="mb-8">
                              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2 border-b border-slate-800 pb-1">{level}</h3>
                              <div className="space-y-1">
                                  {topics.map(topic => (
                                      <button
                                          key={topic.id}
                                          onClick={() => { setActiveConceptId(topic.id); window.scrollTo(0,0); }}
                                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition
                                              ${topic.id === activeConceptId 
                                                  ? 'bg-slate-800 text-white font-medium border-l-2 border-python-accent' 
                                                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}
                                          `}
                                      >
                                          {topic.title}
                                      </button>
                                  ))}
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-slate-900 min-h-full p-8 md:p-12 overflow-y-auto">
              <div className="max-w-4xl mx-auto">
                  <div className="mb-8 border-b border-slate-800 pb-8">
                      <div className="flex items-center gap-3 mb-2">
                           <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700`}>
                               {activeConcept.level}
                           </span>
                      </div>
                      <h1 className="text-4xl font-bold text-white mb-4">{activeConcept.title}</h1>
                      <p className="text-xl text-slate-300 leading-relaxed font-light">{activeConcept.description}</p>
                  </div>

                  <div className="space-y-12">
                      {activeConcept.sections.map((section, idx) => (
                          <section key={idx} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{animationDelay: `${idx * 100}ms`}}>
                              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-mono text-python-blue border border-slate-700">
                                      {idx + 1}
                                  </div>
                                  {section.title}
                              </h3>
                              <div className="prose prose-invert max-w-none mb-6">
                                  <p className="text-slate-300 text-lg leading-relaxed">{section.content}</p>
                              </div>
                              <div className="rounded-xl overflow-hidden shadow-2xl border border-slate-700">
                                  <CodePlayground initialCode={section.code} />
                              </div>
                          </section>
                      ))}
                  </div>
              </div>
          </div>
      </div>
  );

  const renderIde = () => (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-900">
        {/* AI Toolbar */}
        <div className="bg-slate-950 border-b border-slate-800 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
                <Bot className="text-python-blue" />
                <span>AI Playground</span>
            </div>
            
            <div className="flex-1 w-full md:w-auto flex gap-2">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Sparkles size={16} className="text-python-yellow" />
                    </div>
                    <input 
                        type="text" 
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Describe code to generate (e.g. 'Binary Search Tree implementation')..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-python-blue outline-none placeholder-slate-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
                    />
                </div>
                <button 
                    onClick={handleAiGenerate}
                    disabled={isAiGenerating || !aiPrompt.trim()}
                    className="bg-python-blue hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2"
                >
                    {isAiGenerating ? <Loader2 className="animate-spin" size={16}/> : <Sparkles size={16}/>}
                    Generate
                </button>
            </div>

            <div className="flex items-center gap-2">
                <button 
                    onClick={handleAiFix}
                    disabled={isAiGenerating || !ideError}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 whitespace-nowrap border ${
                        ideError 
                        ? 'bg-red-900/30 text-red-200 border-red-800 hover:bg-red-900/50' 
                        : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                    }`}
                >
                    {isAiGenerating && ideError ? <Loader2 className="animate-spin" size={16}/> : <Wrench size={16} />}
                    Auto Fix
                </button>
                <button 
                    onClick={handleAiExplain}
                    disabled={isAiGenerating}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 whitespace-nowrap"
                >
                    <MessageSquare size={16} />
                    Explain Code
                </button>
            </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 p-0 overflow-hidden relative">
             <CodePlayground 
                initialCode={ideCode} 
                onChange={handleIdeCodeChange}
                onError={setIdeError}
             />
        </div>

        {/* AI Explanation Modal */}
        {showAiModal && (
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 w-full max-w-2xl max-h-[80vh] rounded-xl shadow-2xl border border-slate-700 flex flex-col animate-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950 rounded-t-xl">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <Bot className="text-python-blue" /> AI Assistant
                        </h3>
                        <button onClick={() => setShowAiModal(false)} className="text-slate-400 hover:text-white">
                            ✕
                        </button>
                    </div>
                    <div className="p-6 overflow-y-auto text-slate-300 leading-relaxed text-sm whitespace-pre-wrap font-mono">
                        {isAiGenerating && !aiOutput ? (
                            <div className="flex items-center gap-2 text-python-accent">
                                <Loader2 className="animate-spin" /> Processing request...
                            </div>
                        ) : (
                            aiOutput
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
  );

  const renderCourse = () => (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">
        {/* Course Sidebar */}
        <div className="w-full lg:w-80 bg-slate-950 border-r border-slate-800 flex-shrink-0 lg:h-[calc(100vh-64px)] overflow-y-auto">
            <div className="p-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">Syllabus</h3>
                <div className="space-y-2">
                    {COURSE_DATA.map(m => (
                        <button
                            key={m.id}
                            onClick={() => handleStartModule(m.id)}
                            className={`w-full text-left px-4 py-4 rounded-lg text-sm flex items-center justify-between transition group
                                ${m.id === activeModuleId 
                                    ? 'bg-slate-800 text-white border-l-2 border-python-accent' 
                                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}
                            `}
                        >
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase opacity-50 mb-1">Module {m.id}</span>
                                <span className="font-medium truncate pr-2">{m.title}</span>
                            </div>
                            {completedModules.includes(m.id) && <CheckCircle size={16} className="text-green-500 flex-shrink-0" />}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Course Content */}
        <div className="flex-1 bg-slate-900 min-h-full flex flex-col">
            <header className="border-b border-slate-800 px-8 py-6 sticky top-0 bg-slate-900/95 backdrop-blur z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <span className="text-xs font-bold text-python-accent uppercase tracking-wider">Current Module</span>
                        <h1 className="text-2xl font-bold text-white mt-1">{activeModule.title}</h1>
                    </div>
                    <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                        {(['learn', 'lab', 'project'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setCourseTab(tab)}
                                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                                    courseTab === tab 
                                    ? 'bg-slate-600 text-white shadow-sm' 
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6 md:p-12 max-w-6xl mx-auto w-full">
                {courseTab === 'learn' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="prose prose-invert max-w-none">
                            <p className="text-xl text-slate-300 leading-relaxed font-light">{activeModule.description}</p>
                        </div>
                        {activeModule.topics.map((topic, idx) => (
                            <section key={idx} className="bg-slate-800/50 rounded-xl p-8 border border-slate-700">
                                <h3 className="text-xl font-bold text-white flex items-center gap-3 mb-6">
                                    <BookOpen size={24} className="text-python-blue" />
                                    {topic.title}
                                </h3>
                                <p className="text-slate-300 leading-relaxed mb-6">{topic.content}</p>
                                {topic.codeExamples?.map((snippet, sIdx) => (
                                    <div key={sIdx} className="mb-6">
                                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <Code size={12} /> {snippet.description}
                                        </div>
                                        <pre className="bg-slate-950 text-slate-200 p-6 rounded-lg overflow-x-auto text-sm font-mono shadow-inner border border-slate-900">
                                            {snippet.code}
                                        </pre>
                                    </div>
                                ))}
                                {topic.pitfalls && (
                                    <div className="bg-amber-900/20 border border-amber-900/50 rounded-lg p-6 mt-6">
                                        <h4 className="font-bold text-amber-500 flex items-center gap-2 mb-3 text-sm uppercase tracking-wide">
                                            <AlertTriangle size={16} /> Anti-Patterns
                                        </h4>
                                        <ul className="list-disc list-inside text-sm text-amber-200/80 space-y-2">
                                            {topic.pitfalls.map((p, pIdx) => <li key={pIdx}>{p}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </section>
                        ))}
                        <div className="flex justify-end pt-8 border-t border-slate-800">
                            <button onClick={() => { setCourseTab('lab'); window.scrollTo(0,0); }} className="btn-primary flex items-center gap-2 bg-python-blue text-white px-8 py-3 rounded-lg font-bold hover:bg-sky-600 transition">
                                Access Lab <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {courseTab === 'lab' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Code className="text-python-accent" /> Engineering Challenge</h3>
                            <p className="text-slate-300 mb-6 text-lg">{activeModule.lab.instruction}</p>
                            <div className="bg-indigo-900/30 text-indigo-200 p-4 rounded-lg text-sm mb-8 border border-indigo-500/30 flex gap-2 items-start">
                                <span className="font-bold uppercase text-xs mt-0.5">Hint:</span> 
                                {activeModule.lab.hint}
                            </div>
                            <CodePlayground initialCode={activeModule.lab.initialCode} />
                            <details className="mt-6">
                                <summary className="cursor-pointer text-sm font-medium text-slate-500 hover:text-python-blue transition">View Reference Implementation</summary>
                                <pre className="mt-4 bg-slate-950 p-4 rounded border border-slate-800 text-xs overflow-auto font-mono text-slate-400">{activeModule.lab.solution}</pre>
                            </details>
                        </div>
                        <div className="flex justify-end">
                             <button onClick={() => { setCourseTab('project'); window.scrollTo(0,0); }} className="flex items-center gap-2 bg-purple-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-purple-700 transition">
                                Proceed to Architecture Project <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {courseTab === 'project' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-xl shadow-xl border border-slate-700 text-white">
                            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3"><Trophy className="text-python-yellow" /> System Design Mini-Project</h3>
                            <p className="text-slate-300 text-lg mb-8">{activeModule.miniProject.instruction}</p>
                            <div className="bg-white/5 p-4 rounded-lg backdrop-blur-sm text-sm border border-white/10 mb-8">
                                <strong className="text-python-accent block mb-1 uppercase text-xs tracking-wider">Architecture Note</strong> {activeModule.miniProject.hint}
                            </div>
                            <div className="text-slate-900 rounded-lg overflow-hidden border border-slate-600">
                                <CodePlayground initialCode={activeModule.miniProject.initialCode} />
                            </div>
                            <div className="mt-8 flex justify-between items-center">
                                <details className="text-slate-500">
                                    <summary className="cursor-pointer hover:text-slate-300 transition">Reference Solution</summary>
                                    <pre className="mt-4 bg-black p-4 rounded border border-slate-800 text-xs font-mono overflow-auto max-w-2xl text-slate-400">{activeModule.miniProject.solution}</pre>
                                </details>
                                <button onClick={handleNextModule} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition transform hover:scale-105">
                                    {activeModuleId === 8 ? 'Finalize Certification' : 'Complete Module'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    </div>
  );

  const renderPractice = () => (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-900">
      {/* Practice Header */}
      <div className="bg-slate-950 border-b border-slate-800 px-8 py-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
           <h1 className="text-2xl font-bold text-white flex items-center gap-2">
             <Terminal className="text-python-blue" /> Code Laboratory
           </h1>
           <p className="text-sm text-slate-400 mt-1">Access over 500 autogenerated advanced scenarios (Concurrency, Metaclasses, Patterns).</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
           <div className="relative flex-1 md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
             <input 
               type="text" 
               placeholder="Search patterns..." 
               value={practiceSearch}
               onChange={(e) => setPracticeSearch(e.target.value)}
               className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-python-blue placeholder-slate-600"
             />
           </div>
           <div className="relative">
             <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
             <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-9 pr-8 py-2.5 bg-slate-900 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-python-blue appearance-none cursor-pointer"
             >
                <option value="all">All Topics</option>
                {PRACTICE_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.title}</option>
                ))}
             </select>
           </div>
        </div>
      </div>

      {/* Practice Content */}
      <div className="flex-1 overflow-hidden flex bg-slate-900">
         {/* List */}
         <div className="flex-1 overflow-y-auto p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
               {filteredExamples.slice(0, 100).map((ex) => (
                 <div 
                    key={ex.id}
                    onClick={() => setSelectedExample(ex)}
                    className="bg-slate-800 p-5 rounded-lg border border-slate-700 hover:border-python-blue hover:shadow-lg hover:shadow-python-blue/10 cursor-pointer transition group"
                 >
                    <div className="flex justify-between items-start mb-3">
                       <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded font-bold ${
                         ex.difficulty === 'Beginner' ? 'bg-emerald-900/30 text-emerald-400' :
                         ex.difficulty === 'Intermediate' ? 'bg-sky-900/30 text-sky-400' :
                         'bg-rose-900/30 text-rose-400'
                       }`}>
                         {ex.difficulty}
                       </span>
                       <Play size={16} className="text-python-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h4 className="font-bold text-slate-200 mb-2 line-clamp-1">{ex.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{ex.description}</p>
                 </div>
               ))}
               {filteredExamples.length === 0 && (
                 <div className="col-span-full text-center py-20 text-slate-600">
                    <Terminal size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No matching patterns found in the matrix.</p>
                 </div>
               )}
            </div>
         </div>
      </div>

      {/* Practice Modal / Overlay */}
      {selectedExample && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-slate-900 w-full max-w-5xl h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-700 animate-in zoom-in-95 duration-200">
              <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                 <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Code size={20} className="text-python-blue" />
                        {selectedExample.title}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">{selectedExample.description}</p>
                 </div>
                 <button onClick={() => setSelectedExample(null)} className="text-slate-500 hover:text-white transition">
                    <span className="text-2xl">&times;</span>
                 </button>
              </div>
              <div className="flex-1 p-0 overflow-hidden relative">
                 <div className="h-full">
                   <CodePlayground initialCode={selectedExample.code} />
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen font-sans text-slate-200 bg-slate-900">
        {renderNav()}

        <div className="flex-grow">
            {view === 'home' && renderHome()}
            {view === 'concepts' && renderConcepts()}
            {view === 'course' && renderCourse()}
            {view === 'practice' && renderPractice()}
            {view === 'ide' && renderIde()}
        </div>

        {view === 'home' && (
            <footer className="bg-slate-950 text-slate-500 py-16 text-center border-t border-slate-900">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex justify-center items-center gap-2 mb-6">
                        <Layers size={32} className="text-python-blue" />
                    </div>
                    <p className="mb-6 max-w-md mx-auto">Advanced educational material designed for senior engineers and software architects.</p>
                    <div className="w-16 h-px bg-slate-800 mx-auto my-8"></div>
                    <p className="text-sm">Purushotham Muktha built with love to share knowledge globally.</p>
                    <div className="flex justify-center gap-6 mt-8 opacity-40 hover:opacity-100 transition duration-500">
                        <Github size={24} className="hover:text-white transition cursor-pointer" />
                        <Linkedin size={24} className="hover:text-white transition cursor-pointer" />
                    </div>
                </div>
            </footer>
        )}
    </div>
  );
};

export default App;
