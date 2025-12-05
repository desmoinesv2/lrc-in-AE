import React from 'react';
import { FileText, Upload } from 'lucide-react';

interface LrcEditorProps {
  value: string;
  onChange: (val: string) => void;
}

const LrcEditor: React.FC<LrcEditorProps> = ({ value, onChange }) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          onChange(ev.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-800 rounded-lg overflow-hidden border border-neutral-700 shadow-xl">
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-900 border-b border-neutral-700">
        <div className="flex items-center space-x-2 text-white font-medium">
          <FileText size={18} className="text-blue-400" />
          <span>歌词编辑器 (LRC)</span>
        </div>
        <div className="relative">
          <input
            type="file"
            accept=".lrc,.txt"
            onChange={handleFileUpload}
            className="hidden"
            id="lrc-upload"
          />
          <label
            htmlFor="lrc-upload"
            className="flex items-center space-x-1 cursor-pointer text-xs bg-neutral-700 hover:bg-neutral-600 text-white px-3 py-1.5 rounded transition"
          >
            <Upload size={14} />
            <span>导入文件</span>
          </label>
        </div>
      </div>
      <textarea
        className="flex-1 w-full bg-neutral-800 text-neutral-300 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        placeholder="在此粘贴 LRC 歌词内容或上传 .lrc 文件..."
      />
    </div>
  );
};

export default LrcEditor;