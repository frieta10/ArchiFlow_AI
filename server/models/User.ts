export interface UserQuotas {
    diagramsUsed: number;
    uploadsUsed: number;
    revisionsUsed: number;
    exportsUsed: number;
}

export interface User {
    id: string;
    email: string;
    role: 'user' | 'admin';
    subscriptionStatus: 'active' | 'inactive';
    quotas: UserQuotas;
}
