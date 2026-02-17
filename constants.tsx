
import React from 'react';

export const ICONS = {
  LogoMark: ({ src, className = "", ...props }: { src?: string | null; className?: string;[key: string]: any }) => (
    src ? (
      <img
        src={src}
        alt="Brand Logo"
        className={`${className} object-contain drop-shadow-[0_0_8px_rgba(0,217,188,0.3)]`}
        {...props}
      />
    ) : (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
        <defs>
          <linearGradient id="brandGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1A4594" />
            <stop offset="100%" stopColor="#00D9BC" />
          </linearGradient>
        </defs>
        <path
          d="M20 75 C 20 55, 35 30, 50 15 C 65 30, 75 50, 80 65"
          stroke="url(#brandGradient)" strokeWidth="6" strokeLinecap="round" fill="none"
        />
        <path
          d="M30 45 L70 45 C 85 45, 95 35, 85 25"
          stroke="#00D9BC" strokeWidth="6" strokeLinecap="round" fill="none"
        />
        <path
          d="M45 45 C 25 45, 10 55, 15 70"
          stroke="#1A4594" strokeWidth="6" strokeLinecap="round" fill="none"
        />
        <circle cx="50" cy="15" r="4" fill="#00D9BC" />
        <circle cx="30" cy="45" r="4" fill="#1A4594" />
        <circle cx="70" cy="45" r="4" fill="#00D9BC" />
        <circle cx="25" cy="65" r="4" fill="#1A4594" />
        <path d="M82 22 L90 25 L85 33" fill="#00D9BC" />
        <path d="M15 75 L22 82 L10 85" fill="#1A4594" />
        <path d="M12 40 L20 35 L20 45" fill="#1A4594" />
      </svg>
    )
  ),
  LogoFull: ({ src, className = "", imgClassName = "", theme = 'dark' }: { src?: string | null; className?: string; imgClassName?: string; theme?: 'light' | 'dark' }) => (
    <div className={`flex items-center gap-4 ${className}`}>
      <ICONS.LogoMark src={src} className={src ? (imgClassName || "h-[300px] w-auto object-contain") : "w-12 h-12 shrink-0"} />
      <div className="flex items-baseline font-sans">
        <span className={`text-3xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#2D3E50]'}`}>
          {src ? '' : 'ArchiFlow'}
        </span>
        {!src && (
          <div className="ml-1 relative flex items-baseline">
            <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#1A4594] to-[#00D9BC]">Ai</span>
            <div className="absolute right-[2px] bottom-[6px] w-[14px] h-[22px] pointer-events-none opacity-40">
              <div className="absolute top-1 left-0 w-2 h-[1px] bg-white/50"></div>
              <div className="absolute top-3 left-0 w-2 h-[1px] bg-white/50"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  ),
  Flowchart: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 8h10" /><path d="M7 12h10" /><path d="M7 16h10" /></svg>
  ),
  Architecture: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><path d="M10 6.5h4" /><path d="M10 17.5h4" /><path d="M6.5 10v4" /><path d="M17.5 10v4" /></svg>
  ),
  History: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></svg>
  ),
  Export: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
  ),
  Edit: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
  ),
  Magic: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 2 2 7 7 2-7 2-2 7-2-7-7-2 7-2 2-7Z" /><path d="m5 16 1.5 3L8 16l-1.5-3L5 16Z" /><path d="m19 16 1.5 3 1.5-3-1.5-3-1.5 3Z" /></svg>
  ),
  Plus: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
  ),
  Image: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
  ),
  FileText: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>
  ),
  FilePdf: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M9 15h3a1.5 1.5 0 0 0 0-3H9v3z" /><path d="M17 12v3a1.5 1.5 0 0 1-3 0v-3" /><path d="M14 12h3" /></svg>
  ),
  Logout: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
  ),
  Google: (props: any) => (
    <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
  ),
  Microsoft: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}><rect x="1" y="1" width="10" height="10" fill="#f25022" /><rect x="13" y="1" width="10" height="10" fill="#7fbb00" /><rect x="1" y="13" width="10" height="10" fill="#00a1f1" /><rect x="13" y="13" width="10" height="10" fill="#ffbb00" /></svg>
  ),
  Apple: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M17.05 20.28c-.98.95-2.05 1.78-3.32 1.72-1.23-.05-1.63-.8-3.08-.8-1.46 0-1.9.75-3.08.82-1.24.06-2.45-.96-3.41-1.9-1.97-1.93-3.4-5.46-1.38-9.04 1-1.78 2.83-2.9 4.81-2.93 1.5-.03 2.92 1 3.84 1 .91 0 2.65-1.25 4.45-1.07 1.8.18 3.16 1.1 3.91 2.38-3.45 2.05-2.9 6.4.63 7.82-.64 1.74-1.65 3.35-2.36 4zm-4.71-15.65c-.86 1.03-2.3 1.74-3.57 1.66-.16-1.26.43-2.68 1.33-3.73 1-1.16 2.5-1.89 3.61-1.83.15 1.34-.51 2.87-1.37 3.9z" /></svg>
  )
};

export const INITIAL_MERMAID = `graph TD
    A[Start] --> B{AI Design?}
    B -- Yes --> C[Generate Diagram]
    B -- No --> D[Manual Edit]
    C --> E[Export]
    D --> E`;
