import { Request, Response, NextFunction } from 'express';
import { User, UserQuotas } from '../models/User';
import { query } from '../config/database';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        // Expecting "Bearer <USER_UUID>" for now, or just "<USER_UUID>"
        // In a real app, this would be a JWT validation.
        const userId = authHeader?.replace('Bearer ', '').trim();

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized: Missing token' });
        }

        // 1. Fetch User
        const userResult = await query('SELECT * FROM users WHERE id = $1', [userId]);

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Unauthorized: User not found' });
        }

        const dbUser = userResult.rows[0];

        // 2. Calculate Quotas (Real-time count)
        const [diagramsCount, assetsCount, exportsCount] = await Promise.all([
            query('SELECT COUNT(*) FROM diagrams WHERE created_by = $1', [userId]),
            query('SELECT COUNT(*) FROM assets WHERE uploaded_by = $1', [userId]),
            query("SELECT COUNT(*) FROM ai_jobs WHERE requested_by = $1 AND job_type = 'export' AND status = 'success'", [userId])
        ]);

        const quotas: UserQuotas = {
            diagramsUsed: parseInt(diagramsCount.rows[0].count),
            uploadsUsed: parseInt(assetsCount.rows[0].count),
            revisionsUsed: 0, // Revision tracking not yet in DB or handled via diagram_versions count ?? 
            exportsUsed: parseInt(exportsCount.rows[0].count)
        };

        // 3. Construct User Object
        const user: User = {
            id: dbUser.id,
            email: dbUser.email,
            role: 'user', // Default, need to fetch from workspace_members if needed
            subscriptionStatus: dbUser.status === 'active' ? 'active' : 'inactive',
            quotas: quotas
        };

        (req as any).user = user;
        next();
    } catch (error) {
        console.error('[Auth] Error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
};

