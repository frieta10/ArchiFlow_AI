import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';

const LIMITS = {
    diagrams: 20,
    uploads: 10,
    revisions: 40,
    exports: 30
};

export const checkQuota = (resource: 'diagrams' | 'uploads' | 'revisions' | 'exports') => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user as User;
        console.log(`[Quota] Checking ${resource} for user ${user?.id || 'unknown'}`);

        if (!user) {
            console.error('[Quota] User not found in request');
            return res.status(401).json({ error: 'User context missing' });
        }

        // Map resource to quota key
        const quotaKeyMap: Record<string, keyof typeof user.quotas> = {
            diagrams: 'diagramsUsed',
            uploads: 'uploadsUsed',
            revisions: 'revisionsUsed',
            exports: 'exportsUsed'
        };

        const quotaKey = quotaKeyMap[resource];
        const used = user.quotas[quotaKey] || 0;
        const limit = LIMITS[resource]; // @ts-ignore

        if (used >= limit) {
            console.warn(`[QUOTA REJECTION] User ${user.id} exceeded ${resource} limit (${used}/${limit})`);
            return res.status(429).json({
                error: `Quota exceeded for ${resource}. Limit: ${limit}, Used: ${used}`,
                code: 'QUOTA_EXCEEDED'
            });
        }

        next();
    };
};
