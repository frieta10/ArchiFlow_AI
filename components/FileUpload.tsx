import React, { useState } from 'react';
import { MAX_FILE_SIZE_MB } from '../utils/restrictions';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            setError(`File size exceeds ${MAX_FILE_SIZE_MB}MB`);
            return;
        }
        setError(null);
        onFileSelect(file);
    };

    return (
        <div className="p-4 border border-dashed border-gray-600 rounded-lg bg-[#1e1e1e]">
            <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">Upload Document (PDF, TXT, MD)</p>
                <input
                    type="file"
                    onChange={handleChange}
                    disabled={disabled}
                    accept=".pdf,.txt,.md,.png,.jpg"
                    className="block w-full text-sm text-slate-400
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-600 file:text-white
            hover:file:bg-blue-700
            cursor-pointer"
                />
            </div>
            {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
        </div>
    );
};
