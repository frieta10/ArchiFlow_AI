
import React from 'react';

interface EditorPanelProps {
  code: string;
  onChange: (newCode: string) => void;
}

const EditorPanel: React.FC<EditorPanelProps> = ({ code, onChange }) => {
  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-slate-300">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/20">
        <span className="text-xs font-semibold tracking-wider uppercase opacity-60">Mermaid Code Editor</span>
      </div>
      <textarea
        className="flex-1 w-full p-4 font-mono text-sm bg-transparent outline-none resize-none spellcheck-false"
        value={code}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
      />
    </div>
  );
};

export default EditorPanel;
