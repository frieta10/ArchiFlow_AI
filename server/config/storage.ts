export const STORAGE_CONFIG = {
    BUCKET_NAME: process.env.STORAGE_BUCKET || 'archiflow-assets',
    REGION: 'us-central1'
};

export const uploadFile = async (buffer: Buffer, filename: string) => {
    console.log(`[Storage] Uploading ${filename} to ${STORAGE_CONFIG.BUCKET_NAME}`);
    return `gs://${STORAGE_CONFIG.BUCKET_NAME}/${filename}`;
};
