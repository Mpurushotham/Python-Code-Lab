
import React, { useState, useEffect, useRef } from 'react';
import { pythonService } from '../services/pythonService';
import { Play, RotateCcw, Terminal, Loader2, Copy, AlertCircle, Maximize2, Minimize2 } from 'lucide-react';

interface CodePlaygroundProps {
  initialCode: string;
  onSuccess?: () => void;
  expectedOutputRegex?: RegExp | string;
  onChange?: (newCode: string) => void;
  onError?: (error: string | null) => void;
}

interface ParsedError {
  type: string;
  line: number | null;
  message: string;
  fullTraceback: string;
}

const CodePlayground: React.FC<CodePlaygroundProps> = ({ initialCode, onSuccess, expectedOutputRegex, onChange, onError }) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [parsedError, setParsedError] = useState<ParsedError | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const initialized = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCode(initialCode);
    setOutput([]);
    setParsedError(null);
  }, [initialCode]);

  useEffect(() => {
    if (!initialized.current) {
        initialized.current = true;
        pythonService.init().then(() => setIsReady(true));
    }
  }, []);

  useEffect(() => {
    pythonService.setOutputCallback((text) => {
      setOutput((prev) => [...prev, text]);
    });
  }, []);

  // Sync scrolling between textarea and line numbers
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const parseError = (errString: string): ParsedError => {
    // 1. Extract Line Number
    // Matches: File "<exec>", line 5   OR   File "<string>", line 3
    const lineMatch = errString.match(/File ".*?", line (\d+)/);
    const line = lineMatch ? parseInt(lineMatch[1], 10) : null;

    // 2. Extract Error Type and Message
    // Typically the last line of the traceback, e.g., "NameError: name 'x' is not defined"
    const lines = errString.trim().split('\n');
    let lastLine = lines[lines.length - 1];
    
    // Sometimes the last line is empty or just context, search backwards for the Exception
    let type = "Error";
    let message = lastLine;

    // Regex for common Python exception patterns at start of line
    const typeMatch = lastLine.match(/^([a-zA-Z]+Error|Exception|Warning): (.*)/);
    
    if (typeMatch) {
      type = typeMatch[1];
      message = typeMatch[2];
    } else {
       // Fallback: Try to find a line that looks like an error type
       for(let i=lines.length-1; i>=0; i--) {
           const match = lines[i].match(/^([a-zA-Z]+Error|Exception):/);
           if(match) {
               type = match[1];
               message = lines[i].substring(match[0].length).trim();
               break;
           }
       }
    }

    return {
      type,
      line,
      message,
      fullTraceback: errString
    };
  };

  const handleRun = async () => {
    setIsRunning(true);
    setParsedError(null);
    if (onError) onError(null); // Clear previous error
    setOutput([]);
    
    try {
      await pythonService.runPython(code);
      if (expectedOutputRegex && onSuccess) {
          setTimeout(() => { onSuccess(); }, 100);
      }
    } catch (err: any) {
      const errStr = String(err);
      setParsedError(parseError(errStr));
      if (onError) onError(errStr); // Report error to parent
    } finally {
      setIsRunning(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCode(val);
    if (onChange) onChange(val);
    // Clear error on edit
    if (parsedError) {
        setParsedError(null);
        if (onError) onError(null);
    }
  };

  // Generate line numbers
  const lines = code.split('\n');
  const lineNumbers = Array.from({ length: Math.max(lines.length, 1) }, (_, i) => i + 1);

  const containerClasses = isFullScreen 
    ? "fixed inset-0 z-50 bg-white flex flex-col" 
    : "flex flex-col h-full min-h-[500px] border border-slate-200 rounded-lg overflow-hidden shadow-lg bg-white relative";

  return (
    <div className={containerClasses}>
      {/* Toolbar */}
      <div className="bg-slate-100 p-2 flex items-center justify-between border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-600 flex items-center gap-1">
                <Terminal size={16} /> Python Playground
            </span>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded transition"
                title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
            >
                {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button 
                onClick={copyToClipboard}
                className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded transition"
                title="Copy Code"
            >
                <Copy size={16} />
            </button>
            <button 
                onClick={() => { 
                    setCode(initialCode); 
                    setOutput([]); 
                    setParsedError(null); 
                    if (onChange) onChange(initialCode);
                    if (onError) onError(null); 
                }}
                className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded transition"
                title="Reset Code"
            >
                <RotateCcw size={16} />
            </button>
            <button 
                onClick={handleRun}
                disabled={!isReady || isRunning}
                className={`flex items-center gap-2 px-4 py-1.5 rounded font-medium text-sm transition ${
                    !isReady || isRunning 
                    ? 'bg-slate-300 text-slate-500 cursor-wait' 
                    : 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                }`}
            >
                {isRunning ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}
                Run
            </button>
        </div>
      </div>

      {/* Editor & Console Split */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Input Area with Line Numbers */}
        <div className="flex-1 relative bg-slate-900 border-b md:border-b-0 md:border-r border-slate-700 flex font-mono text-sm leading-6">
            {/* Line Numbers */}
            <div 
                ref={lineNumbersRef}
                className="w-12 bg-slate-950 text-slate-600 text-right pr-3 pt-4 select-none overflow-hidden border-r border-slate-800"
            >
                {lineNumbers.map(n => (
                    <div key={n} className={`${parsedError?.line === n ? 'text-red-500 font-bold bg-red-900/20' : ''}`}>
                        {n}
                    </div>
                ))}
            </div>

            {/* Code Textarea */}
            <div className="flex-1 relative h-full">
                 <textarea
                    ref={textareaRef}
                    onScroll={handleScroll}
                    value={code}
                    onChange={handleChange}
                    className="w-full h-full bg-slate-900 text-slate-100 p-4 pl-4 resize-none focus:outline-none whitespace-pre"
                    spellCheck={false}
                    autoCapitalize="off"
                    autoComplete="off"
                />
                {!isReady && (
                    <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center text-white gap-3 z-10 pointer-events-none">
                        <Loader2 className="animate-spin" /> Initializing Python...
                    </div>
                )}
            </div>
        </div>

        {/* Output Area */}
        <div className="flex-1 bg-slate-950 text-slate-200 font-mono text-sm p-4 overflow-auto min-h-[200px] md:min-h-0 border-l border-slate-800">
            <div className="uppercase text-xs text-slate-500 mb-2 font-bold tracking-wider select-none border-b border-slate-800 pb-2">Console Output</div>
            
            {/* Standard Output */}
            {output.map((line, i) => (
                <div key={i} className="whitespace-pre-wrap mb-1 text-green-400">{line}</div>
            ))}

            {/* Error Display */}
            {parsedError && (
                <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="bg-red-950/40 border-l-4 border-red-500 rounded-r p-4">
                        <div className="flex items-center gap-2 text-red-400 font-bold mb-2">
                            <AlertCircle size={18} />
                            <span>{parsedError.type}</span>
                            {parsedError.line && (
                                <span className="text-xs bg-red-900/60 text-red-200 px-2 py-0.5 rounded border border-red-800">
                                    Line {parsedError.line}
                                </span>
                            )}
                        </div>
                        <div className="text-red-200/90 pl-6 mb-3 break-words">
                            {parsedError.message}
                        </div>
                        
                        <details className="group">
                            <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-300 transition flex items-center gap-1 select-none">
                                <span className="group-open:hidden">▶ Show Traceback</span>
                                <span className="hidden group-open:inline">▼ Hide Traceback</span>
                            </summary>
                            <pre className="mt-2 text-[10px] text-red-400/50 overflow-x-auto whitespace-pre p-2 bg-black/20 rounded">
                                {parsedError.fullTraceback}
                            </pre>
                        </details>
                    </div>
                </div>
            )}

            {output.length === 0 && !parsedError && (
                <div className="text-slate-700 italic select-none mt-10 text-center">
                    <Terminal size={32} className="mx-auto mb-2 opacity-50" />
                    Ready to execute
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default CodePlayground;
