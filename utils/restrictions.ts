import { User, UserQuotas } from '../types';

export const MAX_NODES = 30;
export const MAX_LAYERS = 5;
export const MAX_FILE_SIZE_MB = 10;

export const checkQuota = (user: User, resource: keyof UserQuotas): boolean => {
  // Hardcoded limits for 'Pro Plan' as per PDF
  const LIMITS: Record<keyof UserQuotas, number> = {
    diagramsUsed: 20,
    uploadsUsed: 10,
    revisionsUsed: 40,
    exportsUsed: 30
  };
  return user.quotas[resource] < LIMITS[resource];
};

export const validateDiagramComplexity = (code: string): { valid: boolean; error?: string } => {
  // Rough client-side estimation. 
  // Node estimation: naive counting of potential node definitions
  // This is a "fail fast" check, not the final source of truth.
  const nodeCount = (code.match(/\[.*?\]|\(.*?\)|\{.*?\}|\>.*?\]/g) || []).length; 
  const layerCount = (code.match(/subgraph/g) || []).length;

  if (nodeCount > MAX_NODES) return { valid: false, error: `Exceeds max nodes (${MAX_NODES})` };
  if (layerCount > MAX_LAYERS) return { valid: false, error: `Exceeds max layers (${MAX_LAYERS})` };
  return { valid: true };
};
