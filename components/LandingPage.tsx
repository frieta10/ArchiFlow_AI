
import React, { useState, useEffect } from 'react';
import { ICONS } from '../constants';

interface LandingPageProps {
  onGetStarted: () => void;
  customLogo: string | null;
}

const ShowcaseFlow = () => {
  const [step, setStep] = useState(0);
  const steps = [
    { label: "LOGIC_INGESTION", text: "Analyzing legacy codebase and PDF documentation..." },
    { label: "NEURAL_CLUSTERING", text: "Identifying service dependencies and data flow..." },
    { label: "TOPOLOGY_SYNTHESIS", text: "Generating high-fidelity Mermaid blueprint..." },
    { label: "OPTIMIZATION_PASS", text: "Refining layout and applying technical constraints..." },
    { label: "SYSTEM_NOMINAL", text: "Synthesis complete. Blueprint ready for export." }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => (s + 1) % steps.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [steps.length]);

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="w-full h-full relative bg-[#020617] flex items-center justify-center overflow-hidden font-mono">
      {/* Background Tech Layer */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_80%)]" />

      {/* Visual Artifacts */}
      <div className="absolute inset-0 pointer-events-none z-30 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-3xl aspect-video bg-black/60 backdrop-blur-xl border border-white/10 rounded-[32px] p-10 flex flex-col shadow-[0_0_120px_rgba(0,217,188,0.1)]">

        {/* Progress Header */}
        <div className="mb-10">
          <div className="flex justify-between items-end mb-3">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-[#00D9BC] tracking-[0.3em] uppercase">{steps[step].label}</span>
              <span className="text-[9px] text-slate-500 font-bold">SIMULATION_PROTOCOL_V4.2</span>
            </div>
            <div className="text-right">
              <span className="text-[14px] font-black text-white">{Math.round(progress)}%</span>
            </div>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#1A4594] to-[#00D9BC] transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Dynamic Canvas */}
        <div className="flex-1 flex flex-col justify-center relative">

          {/* Step 0: Ingestion */}
          {step === 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-[#00D9BC] rounded-full animate-ping" />
                <span className="text-[#00D9BC] text-xs font-bold tracking-widest">INGESTING_FILES...</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 font-mono text-sm leading-relaxed text-slate-300">
                <div className="text-white/40 mb-2">// Scanning src/core/network.ts</div>
                <div className="animate-pulse">Loading system_docs_2024.pdf...</div>
                <div className="text-[#00D9BC] mt-4 opacity-70 italic">{steps[0].text}</div>
              </div>
            </div>
          )}

          {/* Step 1: Neural Clustering */}
          {step === 1 && (
            <div className="flex flex-col items-center gap-8 animate-in zoom-in duration-700">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 border-[6px] border-[#1A4594]/10 rounded-full" />
                <div className="absolute inset-0 border-[6px] border-t-[#00D9BC] rounded-full animate-spin" />
                <div className="absolute inset-4 border border-[#00D9BC]/30 rounded-full animate-pulse flex items-center justify-center">
                  <ICONS.LogoMark className="w-10 h-10 opacity-80" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-white text-sm font-black tracking-[0.4em] uppercase">{steps[1].text}</div>
                <div className="text-[10px] text-slate-500 font-mono">NEURAL_PASS: 84% ACCURACY</div>
              </div>
            </div>
          )}

          {/* Step 2: Topology Synthesis */}
          {step === 2 && (
            <div className="relative w-full h-full flex items-center justify-center animate-in fade-in duration-1000">
              <svg viewBox="0 0 400 200" className="w-full h-full drop-shadow-[0_0_30px_rgba(0,217,188,0.2)]">
                {/* Node A */}
                <rect x="160" y="10" width="80" height="30" rx="4" className="stroke-[#00D9BC] fill-black/40 stroke-2" />
                <text x="200" y="30" textAnchor="middle" fill="#00D9BC" className="text-[10px] font-bold">GATEWAY</text>

                {/* Links */}
                <path d="M200 40 V80 M200 80 H100 V110 M200 80 H300 V110" className="stroke-[#00D9BC] stroke-2 fill-none animate-draw" strokeDasharray="200" strokeDashoffset="200" />

                {/* Node B & C */}
                <rect x="50" y="110" width="100" height="40" rx="4" className="stroke-white/20 fill-black/20 stroke-2" />
                <rect x="250" y="110" width="100" height="40" rx="4" className="stroke-white/20 fill-black/20 stroke-2" />

                <text x="100" y="135" textAnchor="middle" fill="white" className="text-[9px] opacity-40">IDENTITY_V2</text>
                <text x="300" y="135" textAnchor="middle" fill="white" className="text-[9px] opacity-40">STORAGE_POOL</text>
              </svg>
            </div>
          )}

          {/* Step 3: Optimization */}
          {step === 3 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 animate-in fade-in zoom-in duration-300">
              <div className="w-full max-w-md h-32 border-2 border-[#00D9BC]/20 rounded-2xl overflow-hidden relative bg-slate-900/50">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00D9BC]/20 to-transparent w-full h-full animate-scan" />
                <div className="p-4 space-y-2 opacity-40 font-mono text-[8px] text-white">
                  <div>RESTRUCTURING_NODES... [OK]</div>
                  <div>APPLYING_THEME: INDUSTRIAL_GLASS... [OK]</div>
                  <div>CALCULATING_OPTIMAL_PATH_COST... [OK]</div>
                  <div className="text-[#00D9BC]">VALIDATING_MERMAID_SYNTAX... [SUCCESS]</div>
                </div>
              </div>
              <div className="text-white text-xs font-black tracking-widest uppercase animate-pulse">{steps[3].text}</div>
            </div>
          )}

          {/* Step 4: System Nominal */}
          {step === 4 && (
            <div className="flex flex-col items-center justify-center h-full animate-in zoom-in duration-500">
              <div className="w-20 h-20 rounded-full bg-[#00D9BC] flex items-center justify-center shadow-[0_0_40px_rgba(0,217,188,0.4)] mb-6">
                <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-white mb-2 tracking-tight">MISSION COMPLETE</h3>
              <p className="text-slate-400 text-sm font-medium mb-8">{steps[4].text}</p>
              <button className="px-6 py-2 border border-[#00D9BC]/40 text-[#00D9BC] text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-[#00D9BC]/10 transition-colors">
                REPLAY_SIMULATION
              </button>
            </div>
          )}
        </div>

        {/* Telemetry Log Footer */}
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-wrap gap-x-8 gap-y-2 text-[8px] text-slate-600 font-bold overflow-hidden uppercase tracking-tighter">
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            ENC: RSA_4096_NEURAL
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            LOAD: {Math.random().toFixed(2)}
          </div>
          <div className="flex items-center gap-2 text-[#00D9BC]">
            <span className="w-1.5 h-1.5 bg-[#00D9BC] rounded-full animate-pulse" />
            CORE_SYNC_ACTIVE
          </div>
          <div className="flex items-center gap-2">
            VER: SYNTHESIS_V1.2
          </div>
        </div>
      </div>

      <style>{`
        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-draw { animation: draw 2s forwards ease-in-out; }
        .animate-scan { animation: scan 2s infinite linear; }
      `}</style>
    </div>
  );
};

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, customLogo }) => {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-[#00D9BC]/30 selection:text-white overflow-x-hidden">
      {/* Background Tech Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(26,69,148,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00D9BC] rounded-full blur-[120px] opacity-10 animate-pulse" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-[1920px] mx-auto w-full">
        {/* Logo Container - Removed as per request */}
        <div className="shrink-0" />

        {/* Navigation Items - Top Aligned & Styled */}
        <div className="hidden md:flex items-center gap-12">
          <div className="flex gap-8 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            {['Docs', 'Enterprise', 'Changelog'].map((item) => (
              <a
                key={item}
                href="#"
                className="relative group overflow-hidden py-2"
              >
                <span className="relative z-10 group-hover:text-white transition-colors duration-300">{item}</span>
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#00D9BC] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </a>
            ))}
          </div>

          <button
            onClick={onGetStarted}
            className="group relative px-8 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-full border border-white/10 transition-all duration-300 hover:border-[#00D9BC]/50 hover:shadow-[0_0_30px_rgba(0,217,188,0.3)] active:scale-95"
          >
            <span className="text-xs font-black text-white tracking-[0.2em] uppercase">Portal Login</span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00D9BC]/0 via-[#00D9BC]/10 to-[#00D9BC]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md"></div>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-12 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">

          {/* Main Logo - 400px */}
          <div className="flex justify-center -mb-20 relative z-10">
            <ICONS.LogoMark
              src={customLogo}
              className={`drop-shadow-[0_0_50px_rgba(0,217,188,0.2)] ${customLogo ? 'h-[400px] w-auto object-contain' : 'w-32 h-32'}`}
            />
          </div>

          <div className="inline-block px-4 py-1.5 mb-8 rounded-full bg-[#1A4594]/10 border border-[#1A4594]/20 relative z-20">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#00D9BC]">Next-Gen Architectural Synthesis</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-tight mb-8">
            Visualize Systems at the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1A4594] via-[#00D9BC] to-[#1A4594] bg-[size:200%] animate-gradient">Speed of Thought</span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium mb-12 leading-relaxed">
            ArchiFlow Ai leverages neural reasoning to transform technical documentation, codebases, and images into high-fidelity system blueprints instantly.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="group relative px-10 py-5 bg-gradient-to-r from-[#1A4594] to-[#00D9BC] rounded-2xl text-sm font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_-10px_rgba(26,69,148,0.4)]"
            >
              Initialize Workspace
              <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button
              onClick={() => setShowVideo(true)}
              className="group flex items-center gap-3 px-10 py-5 rounded-2xl border border-white/10 hover:bg-white/5 transition-all text-sm font-black uppercase tracking-[0.2em] active:scale-95"
            >
              <div className="w-6 h-6 rounded-full bg-[#00D9BC] flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[7px] border-l-slate-950 border-b-[4px] border-b-transparent ml-0.5" />
              </div>
              View Showcase
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-40">
          {[
            { title: 'Neural Analysis', desc: 'Auto-extract logic from raw codebases and complex PDF documentation.' },
            { title: 'Multi-Modal Sync', desc: 'Generate diagrams from hand-drawn sketches or architecture photos.' },
            { title: 'Version Control', desc: 'Iterative timeline snapshots with instant rollback capabilities.' }
          ].map((f, i) => (
            <div key={i} className="p-8 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/[0.08] transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1A4594] to-[#00D9BC] rounded-2xl mb-6 flex items-center justify-center font-black text-xl">
                0{i + 1}
              </div>
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Showcase Simulation Modal */}
      {showVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in zoom-in duration-300">
          <div
            className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl cursor-zoom-out"
            onClick={() => setShowVideo(false)}
          />
          <div className="relative w-full max-w-5xl aspect-video rounded-[40px] overflow-hidden border border-white/20 shadow-[0_0_120px_rgba(0,217,188,0.15)] bg-black group">

            <button
              onClick={() => setShowVideo(false)}
              className="absolute top-8 right-8 z-[110] w-12 h-12 rounded-full bg-white/10 hover:bg-[#00D9BC] hover:text-black transition-all flex items-center justify-center border border-white/10 group active:scale-90"
            >
              <ICONS.Plus className="w-6 h-6 rotate-45" />
            </button>

            {/* Native Showcase Component */}
            <ShowcaseFlow />

            {/* Simulated UI HUD */}
            <div className="absolute bottom-8 left-8 z-20 flex gap-4 opacity-50">
              <div className="px-3 py-1 rounded border border-white/20 text-[9px] font-mono">FR_RATE: 120.0</div>
              <div className="px-3 py-1 rounded border border-white/20 text-[9px] font-mono">ENC: NEURAL_V4</div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
            © 2025 ArchiFlow Ai • Neural Synthesis Laboratory
          </div>
          <div className="flex gap-6">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10" />
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10" />
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10" />
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 6s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
