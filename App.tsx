
import React, { useState, useMemo } from 'react';
import { Download, PlayCircle } from 'lucide-react';
import LrcEditor from './components/LrcEditor';
import ConfigPanel from './components/ConfigPanel';
import VisualPreview from './components/VisualPreview';
import { parseLrc } from './utils/lrcParser';
import { generateAeScript } from './utils/aeScriptTemplate';
import { ScriptConfig, DEFAULT_LRC } from './types';

const INITIAL_CONFIG: ScriptConfig = {
  compName: 'Lyric_Comp',
  compWidth: 1920, // Square 1920
  compHeight: 1920, // Square 1920
  fps: 30,
  duration: 300,
  fontSize: 90, // Adjusted for 1920 width
  fontFamily: 'Microsoft YaHei', // Default to a safe Chinese font
  textColor: '#ffffff', // Active color
  inactiveTextColor: '#888888', // Inactive color (Grey)
  activeScale: 1.1, 
  inactiveOpacity: 60,
  blurAmount: 20, // Increased blur for better depth
  spacing: 180, // Adjusted for larger resolution
  motionDamping: 0.8, // Slightly more damping for sticky feel
  alignment: 'left',
  textLift: 10, // Reduced lift for subtlety
};

const App: React.FC = () => {
  const [lrcContent, setLrcContent] = useState(DEFAULT_LRC);
  const [config, setConfig] = useState<ScriptConfig>(INITIAL_CONFIG);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  const parsedLines = useMemo(() => parseLrc(lrcContent), [lrcContent]);
  const generatedScript = useMemo(() => generateAeScript(config), [config]);

  const handleDownload = () => {
    // Add BOM (\uFEFF) to ensure UTF-8 is correctly recognized by Windows/AE
    const blob = new Blob(["\uFEFF" + generatedScript], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'LyricalAE_Script.jsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-neutral-950 text-neutral-200">
      {/* Header */}
      <header className="h-16 flex-none border-b border-neutral-800 flex items-center justify-between px-6 bg-neutral-900/50 backdrop-blur">
        <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <PlayCircle className="text-white" size={20} />
            </div>
            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-blue-200">
                LyricalAE
            </h1>
            <span className="text-xs text-neutral-500 px-2 py-0.5 border border-neutral-800 rounded bg-neutral-900">
                Apple Music 风格 (方形版)
            </span>
        </div>
        <div className="flex items-center space-x-4">
             <button 
                onClick={handleDownload}
                className="flex items-center space-x-2 bg-white text-black hover:bg-neutral-200 px-4 py-2 rounded-md font-medium text-sm transition-colors"
             >
                <Download size={16} />
                <span>下载脚本 (.jsx)</span>
             </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        
        {/* Left Column: Input & Config */}
        <div className="w-1/3 flex flex-col gap-6 min-w-[350px]">
           <div className="flex-1 min-h-0">
               <LrcEditor value={lrcContent} onChange={setLrcContent} />
           </div>
           <div className="h-[450px] flex-none">
               <ConfigPanel config={config} onChange={setConfig} lrcContent={lrcContent} />
           </div>
        </div>

        {/* Right Column: Preview & Output */}
        <div className="flex-1 flex flex-col gap-4 min-w-[500px]">
            {/* Tabs */}
            <div className="flex space-x-1 bg-neutral-900 p-1 rounded-lg w-fit border border-neutral-800">
                <button 
                    onClick={() => setActiveTab('preview')}
                    className={`px-4 py-1.5 rounded text-sm font-medium transition ${activeTab === 'preview' ? 'bg-neutral-700 text-white shadow' : 'text-neutral-400 hover:text-white'}`}
                >
                    效果预览
                </button>
                <button 
                    onClick={() => setActiveTab('code')}
                    className={`px-4 py-1.5 rounded text-sm font-medium transition ${activeTab === 'code' ? 'bg-neutral-700 text-white shadow' : 'text-neutral-400 hover:text-white'}`}
                >
                    脚本代码
                </button>
            </div>

            <div className="flex-1 min-h-0 relative">
                {activeTab === 'preview' ? (
                    <VisualPreview lines={parsedLines} config={config} />
                ) : (
                    <div className="absolute inset-0 bg-neutral-900 rounded-lg border border-neutral-800 p-4 overflow-auto">
                        <pre className="text-xs font-mono text-blue-200 whitespace-pre-wrap leading-relaxed">
                            {generatedScript}
                        </pre>
                    </div>
                )}
            </div>
            
            <div className="h-10 text-xs text-neutral-500 flex items-center justify-center">
                预览功能：粘滞滚动 + 逐字填充 (Clip-Path 修复) + 上浮缓动
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;
