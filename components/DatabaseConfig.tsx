
import React, { useState } from 'react';
import { ICONS } from '../constants';

interface Table {
  name: string;
  description: string;
  columns: { name: string; type: string; notes?: string }[];
}

const DATABASE_SCHEMA: Table[] = [
  {
    name: "users",
    description: "Stores user profile and authentication details.",
    columns: [
      { name: "id", type: "uuid (PK)" },
      { name: "email", type: "text (UNIQUE)" },
      { name: "name", type: "text" },
      { name: "password_hash", type: "text" },
      { name: "auth_provider", type: "text" },
      { name: "status", type: "text" },
      { name: "created_at", type: "timestamptz" }
    ]
  },
  {
    name: "workspaces",
    description: "Top-level tenant container.",
    columns: [
      { name: "id", type: "uuid (PK)" },
      { name: "name", type: "text" },
      { name: "owner_user_id", type: "uuid (FK -> users)" },
      { name: "plan_tier", type: "text" },
      { name: "status", type: "text" },
      { name: "created_at", type: "timestamptz" }
    ]
  },
  {
    name: "ai_jobs",
    description: "Async processing for extraction, generation, rendering.",
    columns: [
      { name: "id", type: "uuid (PK)" },
      { name: "workspace_id", type: "uuid (FK)" },
      { name: "project_id", type: "uuid (FK)" },
      { name: "job_type", type: "text" },
      { name: "status", type: "text" },
      { name: "priority", type: "int" },
      { name: "metadata", type: "jsonb" }
    ]
  },
  {
    name: "diagram_versions",
    description: "Version history + render output.",
    columns: [
      { name: "id", type: "uuid (PK)" },
      { name: "diagram_id", type: "uuid (FK)" },
      { name: "version_no", type: "int" },
      { name: "spec_format", type: "text" },
      { name: "spec_text", type: "text" },
      { name: "render_status", type: "text" },
      { name: "render_output_asset_id", type: "uuid (FK)" }
    ]
  }
];

const DatabaseConfig: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'explorer' | 'sql'>('explorer');

  const generateSQL = () => {
    return `--- ArchiFlow AI Synthesis ---
-- Initialized: ${new Date().toLocaleDateString()}
-- Database: PostgreSQL + pgvector

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

${DATABASE_SCHEMA.map(table => `
-- Table: ${table.name}
CREATE TABLE ${table.name} (
  ${table.columns.map(c => `${c.name} ${c.type.split(' ')[0]} NOT NULL`).join(',\n  ')},
  deleted_at timestamptz
);`).join('\n')}

-- Primary Indexing Strategy
CREATE INDEX idx_projects_workspace ON projects(workspace_id);
CREATE INDEX idx_audit_events_time ON audit_events(event_time DESC);
`;
  };

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-300 font-mono">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20">
        <div className="flex items-center gap-4">
           <div className="p-2 bg-[#00D9BC]/10 rounded-lg">
             <ICONS.Architecture className="w-5 h-5 text-[#00D9BC]" />
           </div>
           <div>
             <h2 className="text-sm font-black text-white uppercase tracking-widest">Database Synthesis Portal</h2>
             <p className="text-[10px] text-slate-500 uppercase tracking-tighter">System Blueprint v1.0 • SRS Optimized</p>
           </div>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          <button 
            onClick={() => setActiveTab('explorer')}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'explorer' ? 'bg-[#00D9BC] text-black shadow-lg shadow-[#00D9BC]/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Explorer
          </button>
          <button 
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'sql' ? 'bg-[#1A4594] text-white shadow-lg shadow-[#1A4594]/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            SQL Script
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 bg-[radial-gradient(circle_at_center,rgba(0,217,188,0.02),transparent_50%)]">
        {activeTab === 'explorer' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {DATABASE_SCHEMA.map((table) => (
              <div key={table.name} className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#00D9BC]/30 transition-all hover:shadow-[0_0_30px_rgba(0,217,188,0.05)]">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-black text-[#00D9BC] uppercase tracking-wider">{table.name}</h3>
                  <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[8px] font-bold text-slate-500">RELATIONAL</div>
                </div>
                <p className="text-[10px] text-slate-400 mb-6 leading-relaxed italic opacity-60">"{table.description}"</p>
                <div className="space-y-2">
                  {table.columns.map((col) => (
                    <div key={col.name} className="flex justify-between text-[11px] font-mono p-2 rounded-lg bg-black/20 border border-white/5 group-hover:bg-black/40 transition-colors">
                      <span className="text-white/80 font-bold">{col.name}</span>
                      <span className="text-slate-500">{col.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto h-full flex flex-col">
            <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-6 overflow-auto">
              <pre className="text-xs leading-loose text-[#00D9BC] selection:bg-[#00D9BC]/20">
                {generateSQL()}
              </pre>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                className="px-8 py-3 bg-gradient-to-r from-[#1A4594] to-[#00D9BC] rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-500/10 hover:scale-105 active:scale-95 transition-all"
              >
                Copy Initialization Script
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseConfig;
