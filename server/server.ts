import './config/env';
import { ENV } from './config/env';
import express from 'express';
import cors from 'cors';
import { authenticate } from './middleware/auth';
import { checkQuota } from './middleware/quota';
// TODO: Import routes

const app = express();
app.use(cors());

// Global Middleware - Logger FIRST
app.use((req, res, next) => {
    const correlationId = req.headers['x-correlation-id'] || 'no-correlation-id';
    console.log(`[${new Date().toISOString()}] [${correlationId}] ${req.method} ${req.url}`);
    next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Body Parser Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
        console.error('[Server] Bad JSON:', err.message);
        return res.status(400).send({ status: 400, message: err.message });
    }
    if (err.type === 'entity.too.large') {
        console.error('[Server] Payload too large:', err.message);
        return res.status(413).send({ status: 413, message: 'Payload too large' });
    }
    next();
});

// Routes
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query } from './config/database';

// ... (existing code)

// Routes

// REGISTER
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // const { query } = await import('./config/database');

        // Check if user exists
        const userCheck = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUserId = uuidv4();
        const role = 'user'; // Default role

        // Insert new user
        // Using upsert on duplicate key if needed, but we checked above.
        // Assuming database schema has password_hash and name columns based on previous check.
        await query(
            `INSERT INTO users (id, email, password_hash, name, role, status, created_at)
             VALUES ($1, $2, $3, $4, $5, 'active', NOW())`,
            [newUserId, email, hashedPassword, name || 'New User', role]
        );

        // Return user object (autologin)
        const user = {
            id: newUserId,
            email,
            name: name || 'New User',
            role,
            subscriptionStatus: 'active',
            quotas: {
                diagramsUsed: 0,
                uploadsUsed: 0,
                revisionsUsed: 0,
                exportsUsed: 0
            }
        };

        res.status(201).json({ user, token: newUserId });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// LOGIN
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // const { query } = await import('./config/database'); // Removed dynamic import
        // const userResult = await query('SELECT * FROM users WHERE email = $1', [email]);
        const userResult = await query('SELECT * FROM users WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const dbUser = userResult.rows[0];

        // Verify Password
        if (!dbUser.password_hash) {
            // If user has no password set (old users), maybe allow them or force reset?
            // For now, fail secure.
            return res.status(401).json({ error: 'Invalid credentials (no password set)' });
        }

        const isMatch = await bcrypt.compare(password, dbUser.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Calculate Quotas for login response
        const [diagramsCount, assetsCount, exportsCount] = await Promise.all([
            query('SELECT COUNT(*) FROM diagrams WHERE created_by = $1', [dbUser.id]),
            query('SELECT COUNT(*) FROM assets WHERE uploaded_by = $1', [dbUser.id]),
            query("SELECT COUNT(*) FROM ai_jobs WHERE requested_by = $1 AND job_type = 'export' AND status = 'success'", [dbUser.id])
        ]);

        const user = {
            id: dbUser.id,
            email: dbUser.email,
            role: dbUser.role || 'user', // Default to user if null
            subscriptionStatus: dbUser.status === 'active' ? 'active' : 'inactive',
            quotas: {
                diagramsUsed: parseInt(diagramsCount.rows[0].count),
                uploadsUsed: parseInt(assetsCount.rows[0].count),
                revisionsUsed: 0,
                exportsUsed: parseInt(exportsCount.rows[0].count)
            }
        };

        res.json({ user, token: dbUser.id }); // Using ID as token for now
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Health Check (Public)
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        config: {
            mockAI: ENV.MOCK_AI,
            model: ENV.GEMINI_MODEL,
            hasKey: !!ENV.API_KEY
        }
    });
});

// Auth Guard
app.use(authenticate);

// Protected Routes
app.get('/api/projects', async (req, res) => {
    try {
        const user = (req as any).user;

        let workspaceId = null;
        // Helper to ensure workspace exists
        // Check if user has any workspace
        const workspaceRes = await query(
            `SELECT workspace_id FROM workspace_members WHERE user_id = $1 LIMIT 1`,
            [user.id]
        );

        if (workspaceRes.rows.length > 0) {
            workspaceId = workspaceRes.rows[0].workspace_id;
        } else {
            // Auto-create default workspace
            workspaceId = uuidv4();
            await query(
                `INSERT INTO workspaces (id, name, owner_user_id, status) VALUES ($1, $2, $3, 'active')`,
                [workspaceId, 'My Workspace', user.id]
            );
            await query(
                `INSERT INTO workspace_members (id, workspace_id, user_id, role) VALUES ($1, $2, $3, 'Owner')`,
                [uuidv4(), workspaceId, user.id]
            );
        }

        // Updated query to include workspace_id logic for filtering
        const result = await query(
            `SELECT * FROM projects 
             WHERE created_by = $1 
                OR workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = $1)
             ORDER BY updated_at DESC`,
            [user.id]
        );

        // Map DB fields to Frontend Project interface if needed
        // DB: id, name, description, status, created_at
        // Frontend Project: id, name, description, currentCode, type, versions
        // We might need to fetch the latest diagram version for 'currentCode'

        // For now, return basic list. Frontend might need adaptation or we do a join.
        // Let's assume user wants to see the projects.
        // Retrieving latest diagram code for each project:
        const projects = await Promise.all(result.rows.map(async (p: any) => {
            // Fetch latest diagram version
            const diagRes = await query('SELECT * FROM diagrams WHERE project_id = $1 LIMIT 1', [p.id]);
            let currentCode = '';
            let type = 'architecture';
            let versions: any[] = [];

            if (diagRes.rows.length > 0) {
                const diag = diagRes.rows[0];
                type = diag.diagram_type;
                if (diag.current_version_id) {
                    const verRes = await query('SELECT * FROM diagram_versions WHERE id = $1', [diag.current_version_id]);
                    if (verRes.rows.length > 0) {
                        currentCode = verRes.rows[0].spec_text;
                    }
                }
            }

            return {
                id: p.id,
                name: p.name,
                description: p.description,
                currentCode: currentCode || `graph TD\n  A[${p.name}] --> B[New Item]`,
                type: type,
                createdAt: p.created_at,
                versions: []
            };
        }));

        res.json(projects);
    } catch (error) {
        console.error('Fetch projects error:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// CREATE PROJECT
app.post('/api/projects', async (req, res) => {
    try {
        const user = (req as any).user;
        const { name, description, type } = req.body;
        const newProjectId = uuidv4();

        // Inferring table structure from GET query: 
        // projects(id, name, description, created_by, workspace_id, updated_at, status, created_at)
        // We'll insert a dummy workspace_id if needed, or null if allowed.
        // Based on GET query: "workspace_id IN (...) OR created_by = $2" implies workspace_id might be relevant but created_by owns it.

        // ---------------------------------------------------------
        // WORKSPACE LOGIC
        // ---------------------------------------------------------
        let workspaceId = null;
        const workspaceRes = await query(
            `SELECT workspace_id FROM workspace_members WHERE user_id = $1 LIMIT 1`,
            [user.id]
        );

        if (workspaceRes.rows.length > 0) {
            workspaceId = workspaceRes.rows[0].workspace_id;
        } else {
            console.log(`[Project] Creating default workspace for user ${user.id}`);
            workspaceId = uuidv4();
            await query(
                `INSERT INTO workspaces (id, name, owner_user_id, status) VALUES ($1, $2, $3, 'active')`,
                [workspaceId, 'My Workspace', user.id]
            );
            await query(
                `INSERT INTO workspace_members (id, workspace_id, user_id, role) VALUES ($1, $2, $3, 'Owner')`,
                [uuidv4(), workspaceId, user.id]
            );
        }

        await query(
            `INSERT INTO projects (id, workspace_id, name, description, created_by, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
            [newProjectId, workspaceId, name || 'Untitled Project', description || '', user.id]
        );

        // Let's create a default diagram for this project.
        const newDiagramId = uuidv4();
        await query(
            `INSERT INTO diagrams (id, project_id, diagram_type, created_by, created_at, updated_at)
             VALUES ($1, $2, $3, $4, NOW(), NOW())`,
            [newDiagramId, newProjectId, type || 'architecture', user.id]
        );

        res.status(201).json({
            id: newProjectId,
            name: name || 'Untitled Project',
            description: description || '',
            currentCode: '',
            type: type || 'architecture',
            createdAt: new Date().toISOString(),
            versions: []
        });

    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

app.post('/api/generate', checkQuota('diagrams'), async (req, res) => {
    try {
        console.log("[Server] /api/generate received request");
        const { prompt, type, persona, image, fileContent, pdfContent } = req.body;
        console.log("[Server] Payload details:", {
            hasPrompt: !!prompt,
            hasImage: !!image,
            hasPdf: !!pdfContent,
            pdfLength: pdfContent?.length
        });

        if (!prompt && !image && !pdfContent) {
            return res.status(400).json({ error: 'Missing input' });
        }

        // Import dynamically to avoid top-level await issues or massive imports
        const { orchestrateDiagramSynthesis } = await import('./services/aiOrchestrator');

        const code = await orchestrateDiagramSynthesis(
            prompt,
            type,
            persona || 'Developer',
            image,
            fileContent,
            pdfContent
        );

        res.json({
            jobId: 'job-' + Date.now(),
            status: 'completed', // In real async system, this would be 'queued'
            code: code
        });
    } catch (error: any) {
        console.error("Generation failed:", error);
        res.status(500).json({ error: error.message });
    }
});


const PORT = parseInt(process.env.PORT || '3001'); // separate from Vite port
app.listen(PORT, async () => {
    console.log(`ArchiFlow AI Backend running on port ${PORT}`);
    await import('./config/database').then(m => m.connectDB());
    console.log(`- Cost Gatekeeper: ACTIVE`);
    console.log(`- Quota Enforcement: ACTIVE`);
});
