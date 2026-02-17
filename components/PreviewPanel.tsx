
import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface PreviewPanelProps {
  code: string;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ code }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',
      securityLevel: 'loose',
      fontFamily: 'Inter',
      suppressErrorRendering: true,
    });
  }, []);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current) return;

      if (!code || !code.trim()) {
        containerRef.current.innerHTML = '';
        setError(null);
        return;
      }

      setError(null);
      containerRef.current.innerHTML = '';

      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

      try {
        const { svg } = await mermaid.render(id, code);
        containerRef.current.innerHTML = svg;
      } catch (err: any) {
        console.error("Mermaid Render Error:", err);
        setError("Invalid Mermaid syntax. Please check the editor for errors.");
      }
    };

    const timeout = setTimeout(renderDiagram, 300);
    return () => clearTimeout(timeout);
  }, [code]);

  return (
    <div className="relative flex flex-col h-full bg-white border-l border-slate-200">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50/50">
        <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">Visual Preview</span>
      </div>

      <div className="flex-1 p-8 overflow-auto flex items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
        <div
          ref={containerRef}
          className="max-w-full transform transition-transform duration-300 origin-center"
        />

        {error && (
          <div className="absolute inset-x-0 top-12 p-4 mx-4 mt-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-md">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewPanel;
