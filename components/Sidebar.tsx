
import React, { useRef } from 'react';
import { ICONS } from '../constants';
import { Project, DiagramVersion, User, AdminRole } from '../types';

interface SidebarProps {
  projects: Project[];
  currentProject: Project | null;
  user: User | null;
  activeView: 'editor' | 'db-config';
  onSelectProject: (p: Project) => void;
  onNewProject: () => void;
  onRollback: (v: DiagramVersion) => void;
  onLogout: () => void;
  onViewChange: (view: 'editor' | 'db-config') => void;
  customLogo: string | null;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEnterAdmin?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  projects,
  currentProject,
  user,
  activeView,
  onSelectProject,
  onNewProject,
  onRollback,
  onLogout,
  onViewChange,
  customLogo,
  onLogoUpload,
  onEnterAdmin
}) => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const isSuperAdmin = user?.role === AdminRole.SUPER_ADMIN;

  return (
    <div className="w-72 h-full bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-white/5">
      <div className="p-6 border-b border-white/5">
        <div
          className="flex items-center gap-3 mb-10 cursor-pointer group hover:bg-white/5 p-2 rounded-2xl transition-all"
          onClick={() => logoInputRef.current?.click()}
          title="Click to replace ArchiFlow branding with your own logo"
        >
          <input type="file" ref={logoInputRef} onChange={onLogoUpload} accept="image/*" className="hidden" />
          {/* If custom logo exists, show it as the main branding */}
          <ICONS.LogoMark src={customLogo} className={`shrink-0 drop-shadow-2xl transition-transform group-hover:scale-105 ${customLogo ? 'w-full h-auto max-h-48 object-contain' : 'w-8 h-8'}`} />

          {/* Only show text if NO custom logo is present (default state backups) */}
          {!customLogo && (
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white tracking-tighter leading-tight truncate">
                ArchiFlow <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1A4594] to-[#00D9BC]">Ai</span>
              </h1>
              <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-black">Technical Studio</p>
            </div>
          )}
        </div>

        <button
          onClick={onNewProject}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#1A4594] to-[#00D9BC] hover:brightness-110 rounded-xl text-xs font-black transition-all text-white shadow-lg shadow-blue-500/20 active:scale-95 uppercase tracking-widest mb-3"
        >
          <ICONS.Plus className="w-4 h-4 stroke-[3px]" />
          <span>New Blueprint</span>
        </button>

        <div className="space-y-2">
          <button
            onClick={() => onViewChange(activeView === 'editor' ? 'db-config' : 'editor')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${activeView === 'db-config'
              ? 'bg-[#00D9BC]/10 border-[#00D9BC]/50 text-[#00D9BC]'
              : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-400'
              }`}
          >
            <ICONS.Architecture className="w-4 h-4" />
            <span>Database Architect</span>
          </button>

          {isSuperAdmin && (
            <button
              onClick={onEnterAdmin}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20"
            >
              <ICONS.Magic className="w-4 h-4" />
              <span>Nexus God Mode</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-hide">
        <div>
          <h2 className="px-3 mb-3 text-[10px] font-black uppercase tracking-[0.15em] text-slate-600">Active Library</h2>
          <div className="space-y-1">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onSelectProject(p);
                  onViewChange('editor');
                }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${currentProject?.id === p.id && activeView === 'editor'
                  ? 'bg-white/10 text-white border border-white/10 shadow-inner shadow-black/20'
                  : 'hover:bg-white/5 text-slate-500 hover:text-slate-300'
                  }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${currentProject?.id === p.id ? 'bg-[#00D9BC]' : 'bg-slate-700'}`} />
                <span className="truncate">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {currentProject && activeView === 'editor' && (
          <div>
            <h2 className="px-3 mb-3 text-[10px] font-black uppercase tracking-[0.15em] text-slate-600">Timeline Snapshots</h2>
            <div className="space-y-2">
              {currentProject.versions.map((v) => (
                <button
                  key={v.id}
                  onClick={() => onRollback(v)}
                  className="w-full text-left px-4 py-3 rounded-xl text-xs hover:bg-white/5 text-slate-500 transition-all flex flex-col gap-1 border border-white/5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-bold truncate max-w-[140px]">{v.description}</span>
                    <span className="text-[9px] font-black opacity-30">{new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <span className="text-[9px] opacity-20 font-mono">HASH: {v.id.slice(0, 8)}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto bg-black/30 backdrop-blur-sm border-t border-white/5">
        {user && (
          <div className="p-5 flex items-center gap-3">
            <div className="relative">
              <img src={user.avatar} className="w-9 h-9 rounded-full border-2 border-[#00D9BC]/30 p-0.5" alt={user.name} />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white truncate uppercase tracking-tight">{user.name}</p>
              <p className="text-[9px] text-slate-500 truncate font-medium">{user.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-600 hover:text-rose-400 transition-colors"
              title="Logout Session"
            >
              <ICONS.Logout className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="px-5 py-3 text-[9px] font-black text-slate-700 flex justify-between uppercase tracking-widest border-t border-white/5">
          <span>Engine v1.2</span>
          <span className={`${isSuperAdmin ? 'text-amber-500' : 'text-[#00D9BC]'}`}>
            {isSuperAdmin ? 'SUPER ADMIN' : 'PRO ACTIVE'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
