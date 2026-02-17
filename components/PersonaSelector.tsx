import React from 'react';

export type Persona = 'Business' | 'Developer' | 'Security' | 'Trainer';

interface PersonaSelectorProps {
    value: Persona;
    onChange: (p: Persona) => void;
    disabled?: boolean;
}

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({ value, onChange, disabled }) => {
    const personas: Persona[] = ['Business', 'Developer', 'Security', 'Trainer'];

    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Target Persona</label>
            <div className="flex gap-2">
                {personas.map((p) => (
                    <button
                        key={p}
                        onClick={() => onChange(p)}
                        disabled={disabled}
                        className={`px-3 py-1 text-sm rounded transition-colors ${value === p
                                ? 'bg-blue-600 text-white'
                                : 'bg-[#2d2d2d] text-gray-400 hover:bg-[#3d3d3d]'
                            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {p}
                    </button>
                ))}
            </div>
        </div>
    );
};
