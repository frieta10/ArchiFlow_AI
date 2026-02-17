
import React, { useState, useRef } from 'react';
import { ICONS } from '../constants';
import { DiagramType, UserQuotas } from '../types';
import { PersonaSelector, Persona } from './PersonaSelector';
import { MAX_FILE_SIZE_MB } from '../utils/restrictions';

interface PromptPanelProps {
  onGenerate: (prompt: string, type: DiagramType, persona: Persona, image?: string, fileContent?: string, pdfContent?: string) => void;
  isGenerating: boolean;
  quotas: UserQuotas;
}

const PromptPanel: React.FC<PromptPanelProps> = ({ onGenerate, isGenerating, quotas }) => {
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState<DiagramType>(DiagramType.FLOWCHART);
  const [persona, setPersona] = useState<Persona>('Developer');
  const [selectedImage, setSelectedImage] = useState<string | undefined>();
  const [textFile, setTextFile] = useState<{ name: string; content: string } | null>(null);
  const [pdfFile, setPdfFile] = useState<{ name: string; content: string } | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // SRS 4.1 Quota Limits
  const LIMITS = { diagrams: 20, uploads: 10, revisions: 40 };
  const isOverLimit = quotas.diagramsUsed >= LIMITS.diagrams;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[PromptPanel] Submitting generate request:", { prompt, type, persona, hasImage: !!selectedImage, hasText: !!textFile, hasPdf: !!pdfFile });
    if (isOverLimit || (!prompt && !selectedImage && !textFile && !pdfFile)) {
      console.warn("[PromptPanel] Submission blocked: Over limit or empty input");
      return;
    }
    onGenerate(prompt, type, persona, selectedImage, textFile?.content, pdfFile?.content);
    setPrompt('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= MAX_FILE_SIZE_MB * 1024 * 1024) { // SRS 3.1 10MB Limit
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    } else if (file) {
      alert(`FILE_REJECTED: Max size ${MAX_FILE_SIZE_MB}MB (SRS 3.1)`);
    }
  };

  const handleTextFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        alert(`FILE_REJECTED: Max size ${MAX_FILE_SIZE_MB}MB (SRS 3.1)`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => setTextFile({ name: file.name, content: event.target?.result as string });
      reader.readAsText(file);
    }
  };

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        alert(`FILE_REJECTED: Max size ${MAX_FILE_SIZE_MB}MB (SRS 3.1)`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => setPdfFile({ name: file.name, content: event.target?.result as string });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6 bg-white border-t border-slate-200 shadow-[0_-12px_24px_-12px_rgba(0,0,0,0.05)]">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Quota Monitoring HUD (SRS 3.2) */}
        <div className="flex items-center gap-6 px-1 justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Synthesis Quota:</span>
              <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full transition-all ${isOverLimit ? 'bg-rose-500' : 'bg-[#00D9BC]'}`} style={{ width: `${(quotas.diagramsUsed / LIMITS.diagrams) * 100}%` }} />
              </div>
              <span className={`text-[10px] font-bold ${isOverLimit ? 'text-rose-500' : 'text-slate-600'}`}>{quotas.diagramsUsed}/{LIMITS.diagrams}</span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Neural Uploads:</span>
              <span className="text-[10px] font-bold text-slate-600">{quotas.uploadsUsed}/{LIMITS.uploads}</span>
            </div>
          </div>

          <PersonaSelector value={persona} onChange={setPersona} disabled={isOverLimit} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {Object.values(DiagramType).map((t) => (
              <button
                key={t}
                type="button"
                disabled={isOverLimit}
                onClick={() => setType(t)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === t
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  } ${isOverLimit && 'opacity-50 cursor-not-allowed'}`}
              >
                {t.replace(/([A-Z])/g, ' $1')}
              </button>
            ))}
          </div>

          <div className={`relative flex items-end gap-3 p-3 bg-slate-50 border-2 rounded-2xl transition-all ${isOverLimit ? 'border-rose-100 bg-rose-50/20' : 'border-slate-100 focus-within:border-[#1A4594]/20 focus-within:ring-4 focus-within:ring-[#1A4594]/5'}`}>
            <div className="flex items-center gap-1.5 pb-1">
              <button
                type="button"
                disabled={isOverLimit}
                onClick={() => imageInputRef.current?.click()}
                className={`p-2.5 transition-all rounded-xl ${selectedImage ? 'text-[#1A4594] bg-blue-50' : 'text-slate-400 hover:text-slate-600'}`}
                title="Upload Image"
              >
                <ICONS.Image className="w-5 h-5" />
              </button>
              <button
                type="button"
                disabled={isOverLimit}
                onClick={() => pdfInputRef.current?.click()}
                className={`p-2.5 transition-all rounded-xl ${pdfFile ? 'text-rose-600 bg-rose-50' : 'text-slate-400 hover:text-slate-600'}`}
                title="Upload PDF"
              >
                <ICONS.FilePdf className="w-5 h-5" />
              </button>
            </div>

            <input type="file" ref={imageInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
            <input type="file" ref={textInputRef} onChange={handleTextFileChange} accept=".txt,.md,.js" className="hidden" />
            <input type="file" ref={pdfInputRef} onChange={handlePdfFileChange} accept="application/pdf" className="hidden" />

            <textarea
              value={prompt}
              disabled={isOverLimit}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={isOverLimit ? "MANDATORY_HALT: Quota Exhausted" : `Ask the ${persona} Agent to design your system...`}
              className="flex-1 min-h-[48px] max-h-32 bg-transparent border-none outline-none resize-none py-2 text-sm font-medium text-slate-800 placeholder-slate-400 disabled:placeholder-rose-300"
              rows={1}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
            />

            <button
              type="submit"
              disabled={isGenerating || isOverLimit || (!prompt && !selectedImage && !pdfFile)}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-[0.15em] ${isGenerating || isOverLimit
                ? 'bg-slate-200 text-slate-400'
                : 'bg-gradient-to-r from-[#1A4594] to-[#00D9BC] text-white shadow-xl shadow-blue-500/20 active:scale-95'
                }`}
            >
              {isGenerating ? <div className="w-4 h-4 border-2 border-t-slate-500 rounded-full animate-spin" /> : <span>Sync</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromptPanel;

