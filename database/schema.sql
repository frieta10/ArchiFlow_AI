-- ArchiFlow AI Database Schema
-- Version: 1.0
-- Generated based on: ArchiFlow AI — Database Architecture (Documented)
-- Dialect: PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. Identity & Access
-- ==========================================

-- 1.1 Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    password_hash TEXT, -- Nullable if OAuth-only
    auth_provider TEXT, -- e.g., 'local', 'google', 'microsoft'
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.2 Workspaces
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    owner_user_id UUID REFERENCES users(id),
    plan_tier TEXT DEFAULT 'free' CHECK (plan_tier IN ('free', 'pro', 'enterprise')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.3 Workspace Members
CREATE TABLE workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('Owner', 'Admin', 'Editor', 'Viewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);

-- 1.4 API Keys
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    label TEXT,
    hashed_key TEXT NOT NULL,
    scopes JSONB, -- e.g., {"projects:read": true}
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 2. Project & Collaboration
-- ==========================================

-- 2.1 Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.2 Project Members (Optional Override)
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('Editor', 'Viewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- ==========================================
-- 3. Assets & Extraction
-- ==========================================

-- 3.1 Assets
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('image', 'pdf', 'doc', 'json', 'csv')),
    filename TEXT NOT NULL,
    mime_type TEXT,
    size_bytes BIGINT,
    storage_bucket TEXT NOT NULL,
    storage_key TEXT NOT NULL,
    checksum_sha256 TEXT,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.2 Asset Extractions
CREATE TABLE asset_extractions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    extraction_type TEXT CHECK (extraction_type IN ('ocr', 'text', 'table', 'metadata')),
    content_text TEXT, -- Stores raw extracted text (consider pointer if huge)
    status TEXT CHECK (status IN ('queued', 'running', 'success', 'failed')),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 4. Diagram Management
-- ==========================================

-- 4.1 Diagrams
CREATE TABLE diagrams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    diagram_type TEXT CHECK (diagram_type IN ('flowchart', 'system_arch', 'chart', 'sequence', 'other')),
    source_mode TEXT CHECK (source_mode IN ('prompt_only', 'from_upload', 'mixed')),
    current_version_id UUID, -- self-reference added later or handled via logic
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.2 Diagram Versions
CREATE TABLE diagram_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    diagram_id UUID REFERENCES diagrams(id) ON DELETE CASCADE,
    version_no INT NOT NULL,
    spec_format TEXT CHECK (spec_format IN ('mermaid', 'plantuml', 'd2', 'json')),
    spec_text TEXT NOT NULL,
    render_status TEXT CHECK (render_status IN ('queued', 'success', 'failed')),
    render_output_asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(diagram_id, version_no)
);

-- Add Foreign Key for current_version_id to diagrams (circular ref)
ALTER TABLE diagrams 
ADD CONSTRAINT fk_current_version 
FOREIGN KEY (current_version_id) REFERENCES diagram_versions(id) ON DELETE SET NULL;

-- 4.3 Diagram Inputs
CREATE TABLE diagram_inputs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    diagram_version_id UUID REFERENCES diagram_versions(id) ON DELETE CASCADE,
    input_type TEXT CHECK (input_type IN ('asset', 'prompt', 'context')),
    asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    prompt_text TEXT,
    order_no INT NOT NULL
);

-- ==========================================
-- 5. AI Orchestration (Multi-LLM)
-- ==========================================

-- 5.1 LLM Providers
CREATE TABLE llm_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- OpenAI, Microsoft Copilot, Google Gemini
    provider_type TEXT CHECK (provider_type IN ('openai', 'microsoft', 'google')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    default_provider BOOLEAN DEFAULT FALSE
);

-- 5.2 LLM Connections
CREATE TABLE llm_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES llm_providers(id) ON DELETE CASCADE,
    connection_name TEXT,
    auth_type TEXT CHECK (auth_type IN ('oauth', 'token')),
    token_encrypted TEXT, -- Encrypted API Key or Token
    secret_ref TEXT, -- Reference if using Vault
    token_expires_at TIMESTAMPTZ,
    status TEXT CHECK (status IN ('active', 'expired', 'revoked')),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5.3 AI Jobs
CREATE TABLE ai_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    job_type TEXT CHECK (job_type IN ('extract_asset', 'generate_diagram', 'refine_diagram', 'render_diagram', 'export')),
    status TEXT CHECK (status IN ('queued', 'running', 'success', 'failed', 'cancelled')),
    priority INT NOT NULL DEFAULT 5,
    requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    error_message TEXT,
    correlation_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5.4 AI Job Steps
CREATE TABLE ai_job_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES ai_jobs(id) ON DELETE CASCADE,
    step_no INT NOT NULL,
    step_type TEXT CHECK (step_type IN ('prompt_build', 'call_llm', 'parse', 'render')),
    status TEXT CHECK (status IN ('queued', 'running', 'success', 'failed')),
    provider_id UUID REFERENCES llm_providers(id) ON DELETE SET NULL,
    model_name TEXT,
    tokens_in INT,
    tokens_out INT,
    cost_estimate NUMERIC(12,6),
    input_snapshot JSONB,
    output_snapshot JSONB,
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ
);

-- 5.5 Prompt Templates
CREATE TABLE prompt_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE, -- Nullable for global templates
    name TEXT NOT NULL,
    purpose TEXT,
    template_text TEXT NOT NULL,
    variables_schema JSONB,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 6. Documents
-- ==========================================

-- 6.1 Documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    doc_type TEXT CHECK (doc_type IN ('srs', 'user_journey', 'blueprint', 'tech_spec', 'api_spec')),
    title TEXT NOT NULL,
    current_version_id UUID,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6.2 Document Versions
CREATE TABLE document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    version_no INT NOT NULL,
    content_format TEXT CHECK (content_format IN ('markdown', 'html', 'json')),
    content_text TEXT NOT NULL,
    generated_by_job_id UUID REFERENCES ai_jobs(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(document_id, version_no)
);

-- Foreign Key for document current version
ALTER TABLE documents
ADD CONSTRAINT fk_doc_current_version
FOREIGN KEY (current_version_id) REFERENCES document_versions(id) ON DELETE SET NULL;

-- ==========================================
-- 7. Governance & Audit
-- ==========================================

-- 7.1 Audit Events
CREATE TABLE audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type TEXT, -- e.g., 'LOGIN', 'CREATE_PROJECT', 'UPLOAD_ASSET'
    entity_type TEXT,
    entity_id UUID,
    event_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB
);

-- 7.2 Data Retention Policies
CREATE TABLE data_retention_policies (
    workspace_id UUID PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
    asset_retention_days INT,
    logs_retention_days INT,
    version_retention_days INT
);

-- ==========================================
-- 8. Indexing Strategy
-- ==========================================

CREATE INDEX idx_projects_workspace ON projects(workspace_id);
CREATE INDEX idx_assets_project_uploaded ON assets(project_id, uploaded_at DESC);
CREATE INDEX idx_diagrams_project_updated ON diagrams(project_id, updated_at DESC);
CREATE INDEX idx_diagram_versions_diagram_ver ON diagram_versions(diagram_id, version_no DESC);
CREATE INDEX idx_ai_jobs_project_status ON ai_jobs(project_id, status, created_at DESC);
CREATE INDEX idx_audit_events_workspace_time ON audit_events(workspace_id, event_time DESC);

-- ==========================================
-- 9. Seed Data (Optional - Basic Providers)
-- ==========================================

INSERT INTO llm_providers (name, provider_type, is_active, default_provider) VALUES
('OpenAI', 'openai', true, true),
('Microsoft Copilot', 'microsoft', true, false),
('Google Gemini', 'google', true, false);

-- End of Schema
