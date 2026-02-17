
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import EditorPanel from './components/EditorPanel';
import PreviewPanel from './components/PreviewPanel';
import PromptPanel from './components/PromptPanel';
import LoginPage from './components/LoginPage';
import LandingPage from './components/LandingPage';
import DatabaseConfig from './components/DatabaseConfig';
import AdminDashboard from './components/AdminDashboard';
import { Project, DiagramType, DiagramVersion, User, AdminRole } from './types';
import { INITIAL_MERMAID, ICONS } from './constants';
import { orchestrateDiagramSynthesis } from './services/orchestrator';

// ==========================================
// 1. App State & Logic Container
// ==========================================
const AppContainer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // SRS 4.1 Initial State (Mock User for MVP)
  const [user, setUser] = useState<User | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'preview'>('split');
  const [activeView, setActiveView] = useState<'editor' | 'db-config'>('editor');

  // Custom Branding State
  const [customLogo, setCustomLogo] = useState<string | null>(`/img/ArchiLogo.svg?v=${Date.now()}`);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;

      try {
        // Fetch projects from backend
        // Note: You need to include the token in headers if we were using real JWT.
        // For now, based on my auth middleware, it expects 'Authorization: Bearer <ID>'
        const res = await fetch('/api/projects', {
          headers: {
            'Authorization': `Bearer ${user.id}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setProjects(data);
          if (data.length > 0) {
            setCurrentProject(data[0]);
          } else {
            // No projects? Create default one immediately (SRS 4.1)
            console.log("No projects found. Creating default...");
            try {
              const createRes = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${user.id}`
                },
                body: JSON.stringify({ name: 'Untitled Project', description: 'My first project' })
              });
              if (createRes.ok) {
                const newProject = await createRes.json();
                setProjects([newProject]);
                setCurrentProject(newProject);
              }
            } catch (createErr) {
              console.error("Failed to auto-create project", createErr);
              setCurrentProject(null);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load projects", err);
      }
    };

    fetchProjects();

    // Force branding update
    setCustomLogo(`/img/ArchiLogo.svg?v=${Date.now()}`);
  }, [user]);

  // --- Handlers ---

  const handleGenerate = async (prompt: string, type: DiagramType, persona: string, image?: string, fileContent?: string, pdfContent?: string) => {
    if (!currentProject || !user) {
      console.error("[App] Generate failed: Missing project or user");
      return;
    }
    console.log("[App] handleGenerate called for project:", currentProject.id);
    setIsGenerating(true);
    try {
      // COMPONENT [7]: Call Orchestrator
      const newCode = await orchestrateDiagramSynthesis(prompt, type, persona, image, fileContent, pdfContent);

      // Update Quotas per SRS 5.2 (Local Mock)
      const updatedUser = {
        ...user,
        quotas: {
          ...user.quotas,
          diagramsUsed: user.quotas.diagramsUsed + 1,
          uploadsUsed: (image || pdfContent) ? user.quotas.uploadsUsed + 1 : user.quotas.uploadsUsed
        }
      };
      setUser(updatedUser);

      const newVersion: DiagramVersion = {
        id: crypto.randomUUID(),
        code: currentProject.currentCode,
        timestamp: new Date().toISOString(),
        description: prompt ? `Edit: ${prompt.slice(0, 20)}...` : `Imported Data`
      };

      const updated: Project = {
        ...currentProject,
        currentCode: newCode,
        type,
        versions: [newVersion, ...currentProject.versions].slice(0, 20)
      };

      setCurrentProject(updated);
      setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateCode = (newCode: string) => {
    if (!currentProject) return;
    const updated = { ...currentProject, currentCode: newCode };
    setCurrentProject(updated);
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleRollback = (version: DiagramVersion) => {
    if (!currentProject) return;
    handleUpdateCode(version.code);
  };

  const handleLogin = (u: User) => {
    setUser(u);
    navigate('/workspace');
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const r = new FileReader();
      r.onloadend = () => setCustomLogo(r.result as string);
      r.readAsDataURL(file);
    }
  };

  const isGodMode = window.location.hostname.startsWith('admin.');

  // ==========================================
  // 2. Render Views based on Route
  // ==========================================

  if (isGodMode) {
    return (
      <Routes>
        <Route path="/" element={
          user?.role === 'admin' ? (
            <AdminDashboard onExit={() => {
              // Redirect to main domain if exiting
              const mainDomain = window.location.hostname.replace('admin.', '');
              window.location.href = `http://${mainDomain}:${window.location.port}/workspace`;
            }} />
          ) : (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-white">
              <h1 className="text-4xl font-black text-red-500 mb-4">RESTRICTED ACCESS</h1>
              <p className="text-slate-400 mb-8">This portal is for Super Admins only.</p>
              {user ? (
                <div className="flex gap-4">
                  <p className="text-sm text-slate-500">Logged in as: {user.email} ({user.role})</p>
                  <button onClick={handleLogout} className="text-red-400 hover:text-red-300 underline">Logout</button>
                </div>
              ) : (
                <LoginPage onLogin={handleLogin} customLogo={customLogo} />
              )}
            </div>
          )
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      {/* Defaults to Landing Page */}
      <Route path="/" element={
        <LandingPage
          onGetStarted={() => navigate('/login')}
          customLogo={customLogo}
        />
      } />

      {/* Login Page */}
      <Route path="/login" element={
        <LoginPage onLogin={handleLogin} customLogo={customLogo} />
      } />

      {/* Main Workspace (Protected) */}
      <Route path="/workspace" element={
        user ? (
          <div className="flex h-screen w-full overflow-hidden bg-[#020617] animate-in fade-in duration-700">
            <Sidebar
              projects={projects}
              currentProject={currentProject}
              user={user}
              activeView={activeView}
              onSelectProject={setCurrentProject}
              onNewProject={() => { }}
              onRollback={handleRollback}
              onLogout={handleLogout}
              onViewChange={setActiveView}
              customLogo={customLogo}
              onLogoUpload={handleLogoUpload}
              onEnterAdmin={() => {
                // Redirect to admin subdomain
                const port = window.location.port ? `:${window.location.port}` : '';
                window.location.href = `http://admin.${window.location.hostname}${port}`;
              }}
            />

            <main className="flex-1 flex flex-col min-w-0 bg-white">
              {activeView === 'editor' ? (
                <>
                  <header className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-white shrink-0">
                    <div className="flex items-center gap-4">
                      <h2 className="text-sm font-black text-slate-800 uppercase tracking-tighter">{currentProject?.name}</h2>
                      <div className="h-4 w-px bg-slate-200" />
                      <div className="flex bg-slate-100 p-0.5 rounded-lg">
                        <button onClick={() => setViewMode('split')} className={`px-3 py-1 text-[10px] font-black uppercase rounded-md transition-all ${viewMode === 'split' ? 'bg-white shadow-sm text-[#1A4594]' : 'text-slate-500'}`}>Split</button>
                        <button onClick={() => setViewMode('preview')} className={`px-3 py-1 text-[10px] font-black uppercase rounded-md transition-all ${viewMode === 'preview' ? 'bg-white shadow-sm text-[#1A4594]' : 'text-slate-500'}`}>Preview</button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors">
                        <ICONS.Export className="w-3.5 h-3.5" />
                        <span>Export</span>
                      </button>
                    </div>
                  </header>

                  <div className="flex-1 flex overflow-hidden bg-slate-50">
                    {viewMode === 'split' && (
                      <div className="w-1/3 min-w-[350px] shadow-2xl z-10 border-r border-slate-200">
                        <EditorPanel code={currentProject?.currentCode || ''} onChange={handleUpdateCode} />
                      </div>
                    )}
                    <div className="flex-1 overflow-hidden relative">
                      <PreviewPanel code={currentProject?.currentCode || ''} />
                    </div>
                  </div>
                  <PromptPanel
                    onGenerate={handleGenerate}
                    isGenerating={isGenerating}
                    quotas={user?.quotas || { diagramsUsed: 0, uploadsUsed: 0, revisionsUsed: 0, exportsUsed: 0 }}
                  />
                </>
              ) : (
                <DatabaseConfig />
              )}
            </main>
          </div>
        ) : (
          <Navigate to="/login" replace />
        )
      } />

      {/* Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContainer />
    </BrowserRouter>
  );
};

export default App;
