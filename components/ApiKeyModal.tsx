import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { AppSettings } from '../types';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: AppSettings;
  onSave: (name: string, key: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, currentSettings, onSave }) => {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(currentSettings.apiKeyName);
      setKey(currentSettings.apiKeyValue);
    }
  }, [isOpen, currentSettings]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(name, key);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1e1f20] w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-[#444746]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Add API Key</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <Icons.Close size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Key Name (e.g. Personal)</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#2a2b2d] text-white border border-[#444746] rounded-lg p-3 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="My Gemini Key"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">API Key Value</label>
            <input 
              type="password" 
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full bg-[#2a2b2d] text-white border border-[#444746] rounded-lg p-3 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="AIzaSy..."
            />
            <p className="text-xs text-gray-500 mt-2">
              Keys are stored locally on your device.
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-full text-blue-300 font-medium hover:bg-[#2a2b2d] transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={!key}
            className="flex-1 py-3 rounded-full bg-[#d3e3fd] text-[#041e49] font-medium hover:bg-[#c2d7fc] disabled:opacity-50 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;