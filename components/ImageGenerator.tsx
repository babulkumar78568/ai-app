import React, { useState } from 'react';
import { Icons } from './Icons';
import { generateImageResponse } from '../services/geminiService';

interface ImageGeneratorProps {
  apiKey: string;
  onBack: () => void;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ apiKey, onBack }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (!apiKey) {
      setError("Please add an API key first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const imgUrl = await generateImageResponse(apiKey, prompt);
      setGeneratedImage(imgUrl);
    } catch (err: any) {
      setError(err.message || "Failed to generate image");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#131314] text-[#E3E3E3]">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-[#444746]">
        <button onClick={onBack} className="p-2 hover:bg-[#2a2b2d] rounded-full mr-2">
          <Icons.Close size={24} />
        </button>
        <span className="text-lg font-medium">Create Image</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
        {!generatedImage && !isLoading && (
          <div className="mt-20 text-center text-gray-400">
             <div className="w-16 h-16 bg-[#2a2b2d] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icons.Image size={32} className="text-blue-400" />
             </div>
             <p>Describe what you want to see.</p>
          </div>
        )}

        {isLoading && (
          <div className="mt-20 flex flex-col items-center animate-pulse">
            <div className="w-64 h-64 bg-[#2a2b2d] rounded-xl mb-4"></div>
            <p className="text-blue-300">Creating your image...</p>
          </div>
        )}

        {error && (
          <div className="mt-10 p-4 bg-red-900/30 text-red-200 rounded-lg max-w-sm text-center border border-red-800">
            {error}
          </div>
        )}

        {generatedImage && (
          <div className="mt-4 w-full max-w-md">
            <img 
              src={generatedImage} 
              alt="Generated" 
              className="w-full h-auto rounded-xl shadow-lg border border-[#444746]" 
            />
            <a 
              href={generatedImage} 
              download={`gemini-gen-${Date.now()}.png`}
              className="block w-full text-center mt-4 py-3 bg-[#2a2b2d] rounded-full text-blue-300 font-medium"
            >
              Download Image
            </a>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#131314]">
        <div className="relative bg-[#1e1f20] rounded-[24px] border border-[#444746] flex flex-col">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A futuristic city with flying cars..."
            className="w-full bg-transparent text-white p-4 min-h-[60px] max-h-[150px] resize-none focus:outline-none"
            rows={2}
          />
          <div className="flex justify-end p-2">
             <button 
               onClick={handleGenerate}
               disabled={!prompt.trim() || isLoading}
               className={`p-3 rounded-full transition-colors ${
                 prompt.trim() && !isLoading ? 'bg-white text-black' : 'bg-[#444746] text-gray-500'
               }`}
             >
                {isLoading ? <Icons.Sparkles className="animate-spin" size={20} /> : <Icons.Send size={20} />}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;