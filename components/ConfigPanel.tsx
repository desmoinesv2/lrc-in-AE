
import React, { useState } from 'react';
import { Settings, RefreshCw, Wand2, Info, AlignLeft, AlignCenter } from 'lucide-react';
import { ScriptConfig } from '../types';
import { GoogleGenAI } from "@google/genai";

interface ConfigPanelProps {
  config: ScriptConfig;
  onChange: (cfg: ScriptConfig) => void;
  lrcContent: string;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onChange, lrcContent }) => {
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleChange = (key: keyof ScriptConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const handleAiSuggest = async () => {
    if (!process.env.API_KEY || !lrcContent.trim()) {
        if (!lrcContent.trim()) alert("请先输入歌词。");
        return;
    }

    setIsSuggesting(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `分析以下歌词并为音乐视频建议配色方案和字体样式。
        歌词: "${lrcContent.substring(0, 300)}...". 
        仅返回一个JSON对象: { "textColor": "#hex", "fontFamily": "FontName" }.
        字体请建议常用的系统字体或 Adobe 字体 (如 'Microsoft YaHei', 'SimHei')。
        颜色请建议高对比度、符合意境的颜色。`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const text = response.text;
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const suggestion = JSON.parse(jsonStr);

        if (suggestion.textColor) handleChange('textColor', suggestion.textColor);
        if (suggestion.fontFamily) handleChange('fontFamily', suggestion.fontFamily);
    } catch (e) {
        console.error("AI Suggestion failed", e);
        alert("无法生成建议，请检查网络或重试。");
    } finally {
        setIsSuggesting(false);
    }
  };

  return (
    <div className="bg-neutral-800 rounded-lg border border-neutral-700 shadow-xl overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-900 border-b border-neutral-700">
        <div className="flex items-center space-x-2 text-white font-medium">
          <Settings size={18} className="text-purple-400" />
          <span>合成参数设置</span>
        </div>
        {process.env.API_KEY && (
            <button 
                onClick={handleAiSuggest}
                disabled={isSuggesting}
                className="flex items-center space-x-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded transition disabled:opacity-50"
            >
                {isSuggesting ? <RefreshCw className="animate-spin" size={14}/> : <Wand2 size={14} />}
                <span>AI 建议</span>
            </button>
        )}
      </div>

      <div className="p-4 space-y-6 overflow-y-auto custom-scrollbar">
        {/* Composition */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">合成 (Composition)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-400 mb-1">宽度 (Width)</label>
              <input
                type="number"
                value={config.compWidth}
                onChange={(e) => handleChange('compWidth', parseInt(e.target.value))}
                className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1.5 text-sm text-white focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">高度 (Height)</label>
              <input
                type="number"
                value={config.compHeight}
                onChange={(e) => handleChange('compHeight', parseInt(e.target.value))}
                className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1.5 text-sm text-white focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">帧率 (FPS)</label>
              <input
                type="number"
                value={config.fps}
                onChange={(e) => handleChange('fps', parseInt(e.target.value))}
                className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1.5 text-sm text-white focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">时长 (秒)</label>
              <input
                type="number"
                value={config.duration}
                onChange={(e) => handleChange('duration', parseInt(e.target.value))}
                className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1.5 text-sm text-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">外观 (Appearance)</h3>
          
          <div>
            <label className="block text-xs text-neutral-400 mb-1">字体名称</label>
            <input
              type="text"
              value={config.fontFamily}
              onChange={(e) => handleChange('fontFamily', e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1.5 text-sm text-white focus:border-blue-500 outline-none"
              placeholder="例如: Microsoft YaHei, SimHei, Arial"
            />
            <div className="flex items-start mt-1.5 space-x-1.5 text-[10px] text-neutral-500 leading-tight">
                <Info size={12} className="flex-none mt-0.5" />
                <span>为防止AE报错，建议使用字体的 PostScript 名称。如果失败脚本会自动回退到默认字体。</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs text-neutral-400 mb-1">字号 (Size)</label>
                <input
                    type="number"
                    value={config.fontSize}
                    onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1.5 text-sm text-white focus:border-blue-500 outline-none"
                />
             </div>
             <div>
                <label className="block text-xs text-neutral-400 mb-1">激活颜色</label>
                <div className="flex space-x-2">
                    <input
                        type="color"
                        value={config.textColor}
                        onChange={(e) => handleChange('textColor', e.target.value)}
                        className="h-8 w-8 rounded bg-transparent cursor-pointer border-0 p-0"
                    />
                    <input 
                        type="text"
                        value={config.textColor}
                        onChange={(e) => handleChange('textColor', e.target.value)}
                        className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none uppercase"
                    />
                </div>
             </div>
             <div className="col-span-2">
                <label className="block text-xs text-neutral-400 mb-1">未激活颜色 (灰色)</label>
                <div className="flex space-x-2">
                    <input
                        type="color"
                        value={config.inactiveTextColor}
                        onChange={(e) => handleChange('inactiveTextColor', e.target.value)}
                        className="h-8 w-8 rounded bg-transparent cursor-pointer border-0 p-0"
                    />
                    <input 
                        type="text"
                        value={config.inactiveTextColor}
                        onChange={(e) => handleChange('inactiveTextColor', e.target.value)}
                        className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none uppercase"
                    />
                </div>
             </div>
          </div>
        </div>

        {/* Animation */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">动画 (Animation)</h3>

           <div>
             <label className="block text-xs text-neutral-400 mb-1">对齐方式</label>
             <div className="flex space-x-2">
                <button
                    onClick={() => handleChange('alignment', 'left')}
                    className={`flex-1 flex items-center justify-center space-x-2 py-1.5 rounded border transition-colors ${config.alignment === 'left' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:bg-neutral-800'}`}
                >
                    <AlignLeft size={14} />
                    <span className="text-xs">左对齐 (Apple)</span>
                </button>
                <button
                    onClick={() => handleChange('alignment', 'center')}
                    className={`flex-1 flex items-center justify-center space-x-2 py-1.5 rounded border transition-colors ${config.alignment === 'center' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:bg-neutral-800'}`}
                >
                    <AlignCenter size={14} />
                    <span className="text-xs">居中对齐</span>
                </button>
             </div>
           </div>
          
          <div>
            <label className="block text-xs text-neutral-400 mb-1 flex justify-between">
                <span>行间距 (Spacing)</span>
                <span className="text-neutral-500">{config.spacing}px</span>
            </label>
            <input
              type="range"
              min="50"
              max="300"
              value={config.spacing}
              onChange={(e) => handleChange('spacing', parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1 flex justify-between">
                <span>激活抬升 (Text Lift)</span>
                <span className="text-neutral-500">{config.textLift}px</span>
            </label>
            <input
              type="range"
              min="0"
              max="30"
              value={config.textLift}
              onChange={(e) => handleChange('textLift', parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1 flex justify-between">
                <span>粘滞滚动阻尼 (Viscosity)</span>
                <span className="text-neutral-500">{config.motionDamping}</span>
            </label>
            <input
              type="range"
              min="0.1"
              max="1.5"
              step="0.1"
              value={config.motionDamping}
              onChange={(e) => handleChange('motionDamping', parseFloat(e.target.value))}
              className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigPanel;
