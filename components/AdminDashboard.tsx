
import React, { useState, useEffect } from 'react';
import { ICONS } from '../constants';
import { AuditLogEntry, AdminRole, FeatureFlag } from '../types';

interface AdminDashboardProps {
  onExit: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExit }) => {
  const [isAuthed, setIsAuthed] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState<'security' | 'audit' | 'features'>('security');
  const [isBreakGlass, setIsBreakGlass] = useState(false);
  const [revealedPii, setRevealedPii] = useState<Set<string>>(new Set());

  // Simulation of Component [3] & [4] Backend checks
  const handlePasskeyVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsAuthed(true);
      setIsVerifying(false);
    }, 1500);
  };

  const auditLogs: AuditLogEntry[] = [
    { id: '1', actorId: 'adm-0', actorName: 'Root', action: 'DIAGRAM_GEN_OVERRIDE', entityType: 'USER_QUOTA', entityId: 'u-44', timestamp: new Date().toISOString(), ip: '10.0.4.1', userAgent: 'Nexus/v1', beforeValue: '20/20', afterValue: '0/20' },
    { id: '2', actorId: 'adm-0', actorName: 'Root', action: 'PII_REVEAL', entityType: 'USER', entityId: 'u-44', timestamp: new Date(Date.now() - 60000).toISOString(), ip: '10.0.4.1', userAgent: 'Nexus/v1' }
  ];

  const featureFlags: FeatureFlag[] = [
    { id: 'f1', key: 'GLOBAL_AI_KILL_SWITCH', enabled: false, description: 'MANDATORY: Disable all AI orchestration (SRS 9.3)', approvalRequired: true },
    { id: 'f2', key: 'MAINTENANCE_MODE', enabled: false, description: 'Block all non-privileged traffic', approvalRequired: true }
  ];

  if (!isAuthed) {
    return (
      <div className="fixed inset-0 bg-[#050505] flex items-center justify-center p-6 z-[200]">
         <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-[48px] p-12 text-center">
            <div className="w-16 h-16 bg-amber-500/10 rounded-3xl flex items-center justify-center border border-amber-500/20 mx-auto mb-8">
              <ICONS.Magic className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Secure Admin Tunnel</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-10">VPN Verified • MFA Prompt Required</p>
            
            <button 
              onClick={handlePasskeyVerification}
              className="w-full py-5 bg-amber-500 text-black font-black uppercase tracking-[0.2em] rounded-2xl transition-all hover:scale-105 flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(245,158,11,0.2)]"
            >
              {isVerifying ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : 'Use WebAuthn Passkey'}
            </button>
            <p className="mt-8 text-[9px] text-slate-600 font-black uppercase tracking-widest">Connected via: 192.168.1.1 (Edge_Zone_Alpha)</p>
         </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] text-slate-400 font-sans selection:bg-amber-500/30">
      {isBreakGlass && (
        <div className="bg-red-600 text-white px-8 py-3 flex justify-between items-center animate-pulse">
          <span className="text-xs font-black uppercase tracking-widest">BREAK-GLASS PROTOCOL ACTIVE: ALL ACTIONS SENT TO SECURITY_WAR_ROOM</span>
          <div className="px-3 py-1 bg-white text-red-600 rounded font-black text-[10px]">TIME_REMAINING: 28:44</div>
        </div>
      )}

      <header className="h-20 border-b border-white/5 bg-black/40 flex items-center justify-between px-10">
        <div className="flex items-center gap-6">
          <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
            <ICONS.Magic className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white uppercase tracking-tighter">Nexus <span className="text-amber-500">Back Office</span></h1>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">System Authority: Root Level</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsBreakGlass(!isBreakGlass)} className="px-6 py-2 bg-red-600/10 border border-red-600/30 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-600/20 transition-all">
            {isBreakGlass ? 'Deactivate Panic' : 'Trigger Break-Glass'}
          </button>
          <button onClick={onExit} className="p-2 hover:bg-white/5 rounded-full transition-colors"><ICONS.Plus className="w-6 h-6 rotate-45" /></button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r border-white/5 bg-black/20 p-6 flex flex-col gap-2">
          {['security', 'audit', 'features'].map(t => (
            <button 
              key={t}
              onClick={() => setActiveTab(t as any)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'text-slate-500 hover:bg-white/5'}`}
            >
              {t}
            </button>
          ))}
        </aside>

        <main className="flex-1 overflow-y-auto p-12">
          {activeTab === 'security' && (
            <div className="space-y-12 animate-in fade-in duration-500">
               <div className="grid grid-cols-3 gap-8">
                  <div className="p-8 rounded-[32px] bg-white/5 border border-white/10">
                    <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Quota Rejections</h3>
                    <div className="text-4xl font-black text-white">124</div>
                    <div className="mt-4 flex items-center gap-2 text-[10px] text-amber-500 font-bold uppercase">
                       <div className="w-2 h-2 rounded-full bg-amber-500" /> +14% since reset
                    </div>
                  </div>
                  <div className="p-8 rounded-[32px] bg-white/5 border border-white/10">
                    <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Failed Auth Syncs</h3>
                    <div className="text-4xl font-black text-white">03</div>
                    <div className="mt-4 text-[10px] text-emerald-500 font-bold uppercase">Blocked via Edge Policy</div>
                  </div>
                  <div className="p-8 rounded-[32px] bg-white/5 border border-white/10">
                    <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Active Synthesis</h3>
                    <div className="text-4xl font-black text-white">08</div>
                    <div className="mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Current Load: 0.42</div>
                  </div>
               </div>

               <div className="p-10 rounded-[40px] bg-black/40 border border-white/5">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8">Elevated User Management</h3>
                  <div className="space-y-4">
                     {[
                       { id: 'u-44', name: 'Dev Architect', email: 'dev@corp.ai', usage: '90%' },
                       { id: 'u-92', name: 'Product Ops', email: 'ops@archiflow.ai', usage: '12%' }
                     ].map(u => (
                        <div key={u.id} className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center font-black text-amber-500 text-xs">{u.name[0]}</div>
                              <div>
                                 <p className="text-xs font-black text-white uppercase">{u.name}</p>
                                 <p className="text-[10px] font-mono text-slate-500">
                                   {revealedPii.has(u.id) ? u.email : u.email.replace(/(.{2}).+(@.+)/, "$1***$2")}
                                 </p>
                              </div>
                           </div>
                           <div className="flex items-center gap-6">
                              <div className="text-right">
                                 <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Quota Burn</p>
                                 <p className={`text-xs font-bold ${parseInt(u.usage) > 80 ? 'text-amber-500' : 'text-emerald-500'}`}>{u.usage}</p>
                              </div>
                              <button 
                                onClick={() => setRevealedPii(new Set(revealedPii).add(u.id))}
                                className="px-4 py-2 rounded-lg border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                              >
                                {revealedPii.has(u.id) ? 'Audit Reveal' : 'Reveal PII'}
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-4 animate-in slide-in-from-bottom-6 duration-500">
               {auditLogs.map(log => (
                 <div key={log.id} className="p-8 rounded-[32px] bg-white/5 border border-white/10 flex flex-col gap-6 group hover:border-amber-500/30 transition-all">
                   <div className="flex justify-between items-start">
                     <div className="flex items-center gap-4">
                        <div className="px-3 py-1 rounded bg-black border border-white/10 text-[9px] font-black text-white">{log.action}</div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{new Date(log.timestamp).toLocaleString()}</span>
                     </div>
                     <div className="text-[9px] font-mono text-slate-600">IP: {log.ip} • UA: {log.userAgent}</div>
                   </div>
                   <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex gap-12">
                         <div>
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Subject</p>
                            <p className="text-xs font-bold text-white uppercase">{log.entityType} ({log.entityId})</p>
                         </div>
                         {log.beforeValue && (
                           <div>
                              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">State Delta</p>
                              <div className="flex items-center gap-3 text-[10px] font-mono">
                                 <span className="text-rose-500 line-through">{log.beforeValue}</span>
                                 <span className="text-slate-500">→</span>
                                 <span className="text-emerald-500">{log.afterValue}</span>
                              </div>
                           </div>
                         )}
                      </div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Actor: {log.actorName}</span>
                   </div>
                 </div>
               ))}
            </div>
          )}

          {activeTab === 'features' && (
             <div className="grid grid-cols-2 gap-8 animate-in zoom-in duration-500">
                {featureFlags.map(flag => (
                  <div key={flag.id} className="p-10 rounded-[40px] bg-white/5 border border-white/10 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-sm font-black text-white uppercase tracking-widest">{flag.key}</h4>
                        <div className={`w-12 h-6 rounded-full p-1 transition-all ${flag.enabled ? 'bg-amber-500' : 'bg-slate-700'}`}>
                           <div className={`w-4 h-4 rounded-full bg-white transition-all ${flag.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium mb-10 italic">"{flag.description}"</p>
                    </div>
                    <div className="pt-8 border-t border-white/5 flex justify-between items-center">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                          {flag.approvalRequired ? 'Approval Gate Required' : 'Direct Access'}
                       </span>
                       <button className="px-4 py-2 rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-widest text-amber-500 border border-amber-500/20 hover:bg-amber-500/10 transition-all">Modify</button>
                    </div>
                  </div>
                ))}
             </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
