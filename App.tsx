import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './components/Icons';
import ApiKeyModal from './components/ApiKeyModal';
import ImageGenerator from './components/ImageGenerator';
import { AppSettings, ChatMessage, ViewMode, ModelId } from './types';
import { DEFAULT_SETTINGS, MODEL_OPTIONS, SUGGESTIONS } from './constants';
import { generateTextResponse } from './services/geminiService';

function App() {
  // --- State ---
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.CHAT);
  
  // UI States
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Effects ---

  // Load from LocalStorage
  useEffect(() => {
    const storedName = localStorage.getItem('savedApiKeyName');
    const storedKey = localStorage.getItem('savedApiKeyValue');
    const storedModel = localStorage.getItem('selectedModel');
    
    // Determine initial model name
    let modelName = 'Balanced';
    if (storedModel) {
      const found = MODEL_OPTIONS.find(m => m.id === storedModel);
      if (found) modelName = found.label;
    }

    if (storedKey) {
      setSettings(prev => ({
        ...prev,
        apiKeyName: storedName || '',
        apiKeyValue: storedKey,
        selectedModel: (storedModel as ModelId) || ModelId.BALANCED,
        selectedModelName: modelName
      }));
    }
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  // --- Handlers ---

  const saveApiKey = (name: string, key: string) => {
    localStorage.setItem('savedApiKeyName', name);
    localStorage.setItem('savedApiKeyValue', key);
    setSettings(prev => ({ ...prev, apiKeyName: name, apiKeyValue: key }));
  };

  const selectModel = (model: { id: string, label: string }) => {
    localStorage.setItem('selectedModel', model.id);
    setSettings(prev => ({ 
      ...prev, 
      selectedModel: model.id as ModelId, 
      selectedModelName: model.label 
    }));
    setIsModelDropdownOpen(false);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    if (!settings.apiKeyValue) {
      setChatHistory(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: 'Please add an API key first by tapping the 3 dots menu in the top right.',
        timestamp: Date.now()
      }]);
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setChatHistory(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await generateTextResponse(
        settings.apiKeyValue, 
        settings.selectedModel, 
        userMsg.text
      );

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setChatHistory(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Error generating response. Please check your API key or connection.",
        timestamp: Date.now()
      };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (action: string) => {
    if (action === 'create_image') {
      setViewMode(ViewMode.IMAGE_GEN);
    } else {
      // Basic preset prompts for other actions
      const prompts: {[key:string]: string} = {
        'write_draft': 'Write a professional email about...',
        'code_snippet': 'Write a Python script to...',
        'explain_concept': 'Explain quantum computing like I am 5...'
      };
      setInput(prompts[action] || '');
    }
  };

  // --- Render Helpers ---

  if (viewMode === ViewMode.IMAGE_GEN) {
    return (
      <ImageGenerator 
        apiKey={settings.apiKeyValue} 
        onBack={() => setViewMode(ViewMode.CHAT)} 
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#131314] text-[#E3E3E3] font-sans overflow-hidden">
      
      {/* --- Top Bar --- */}
      <header className="flex items-center justify-between px-4 py-3 bg-[#131314] z-10">
        <button className="p-2 hover:bg-[#2a2b2d] rounded-full">
          <Icons.Menu className="text-gray-300" size={24} />
        </button>
        
        <div className="text-xl font-medium text-gray-200">Gemini</div>
        
        <div className="flex items-center gap-2">
          {/* User Status / Name Indicator if Key exists */}
          {settings.apiKeyName && (
             <span className="hidden sm:block text-xs text-blue-300 bg-blue-900/30 px-2 py-1 rounded-md border border-blue-800">
               {settings.apiKeyName}
             </span>
          )}

          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-[#2a2b2d] rounded-full"
            >
              <Icons.MoreVertical className="text-gray-300" size={24} />
            </button>
            
            {/* 3 Dot Menu Dropdown */}
            {isMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 top-12 w-48 bg-[#2a2b2d] rounded-lg shadow-xl border border-[#444746] py-1 z-20">
                  <button 
                    onClick={() => {
                      setIsKeyModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-[#38393a] text-sm text-gray-200"
                  >
                    Add API Key
                  </button>
                  <button 
                    onClick={() => {
                       setChatHistory([]);
                       setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-[#38393a] text-sm text-gray-200"
                  >
                    Clear Chat
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-orange-400 flex items-center justify-center text-white font-bold text-sm">
            B
          </div>
        </div>
      </header>

      {/* --- Main Content Area --- */}
      <main className="flex-1 overflow-y-auto relative flex flex-col">
        
        {/* Welcome Screen (Only if no history) */}
        {chatHistory.length === 0 && (
          <div className="flex-1 flex flex-col justify-center px-6 pb-20">
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-2">
                <span className="gradient-text font-semibold">Hello, Babulp</span>
              </h1>
              <p className="text-2xl text-[#444746] font-medium">How can I help you today?</p>
            </div>

            {/* Chips */}
            <div className="flex flex-nowrap overflow-x-auto gap-3 pb-4 no-scrollbar">
              {SUGGESTIONS.map((item) => (
                <button 
                  key={item.label}
                  onClick={() => handleSuggestionClick(item.action)}
                  className="flex-shrink-0 flex flex-col justify-between p-4 w-40 h-40 bg-[#1e1f20] rounded-2xl hover:bg-[#2a2b2d] transition-colors text-left border border-transparent hover:border-[#444746]"
                >
                  <span className="text-gray-200 font-medium">{item.label}</span>
                  <div className="self-end bg-[#131314] p-2 rounded-full">
                     {item.icon === 'image' && <Icons.Image size={20} />}
                     {item.icon === 'pen' && <Icons.Pen size={20} />}
                     {item.icon === 'code' && <Icons.Code size={20} />}
                     {item.icon === 'graduation-cap' && <Icons.Learn size={20} />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat History */}
        {chatHistory.length > 0 && (
           <div className="flex-1 px-4 py-6 space-y-6 max-w-3xl mx-auto w-full">
             {chatHistory.map((msg) => (
               <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                 <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1
                   ${msg.role === 'user' 
                     ? 'bg-gradient-to-tr from-purple-500 to-orange-400 text-white text-xs font-bold' 
                     : 'bg-transparent'
                   }`}
                 >
                   {msg.role === 'user' ? 'B' : <Icons.Sparkles className="text-blue-400" size={20} />}
                 </div>
                 
                 <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                   {msg.role === 'user' && (
                     <div className="bg-[#2a2b2d] px-4 py-2.5 rounded-[20px] rounded-tr-sm text-gray-100">
                       {msg.text}
                     </div>
                   )}
                   {msg.role === 'model' && (
                     <div className="text-gray-200 leading-relaxed whitespace-pre-wrap pt-1">
                       {msg.text}
                     </div>
                   )}
                 </div>
               </div>
             ))}
             
             {isLoading && (
                <div className="flex gap-4">
                   <div className="w-8 h-8 flex items-center justify-center">
                     <Icons.Sparkles className="text-blue-400 animate-spin" size={20} />
                   </div>
                   <div className="text-gray-400 mt-1">Thinking...</div>
                </div>
             )}
             <div ref={messagesEndRef} />
           </div>
        )}
      </main>

      {/* --- Bottom Input Bar --- */}
      <footer className="bg-[#131314] p-4 w-full max-w-4xl mx-auto">
        <div className="bg-[#1e1f20] rounded-[28px] flex flex-col border border-transparent focus-within:border-gray-500 transition-colors">
           <div className="flex items-center px-2 py-2">
              <button className="p-2 text-gray-400 hover:text-white hover:bg-[#2a2b2d] rounded-full">
                <Icons.Plus size={20} />
              </button>
              
              <input 
                type="text" 
                placeholder="Ask Gemini" 
                className="flex-1 bg-transparent text-white px-2 py-3 focus:outline-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />

              {/* Model Selector (Thinking Dropdown) */}
              <div className="relative">
                 <button 
                   onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                   className="flex items-center gap-1 bg-[#131314] hover:bg-[#2a2b2d] text-gray-300 text-xs font-medium px-3 py-1.5 rounded-full border border-[#444746] mr-2"
                 >
                   <Icons.Sparkles size={12} className={settings.selectedModel === ModelId.ADVANCED ? "text-yellow-400" : "text-blue-400"} />
                   <span>{settings.selectedModelName}</span>
                   <Icons.ChevronDown size={12} />
                 </button>

                 {isModelDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setIsModelDropdownOpen(false)} />
                      <div className="absolute bottom-10 right-0 w-48 bg-[#2a2b2d] rounded-xl shadow-2xl border border-[#444746] py-1 z-40 overflow-hidden">
                        {MODEL_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => selectModel(opt)}
                            className="w-full text-left px-4 py-3 hover:bg-[#38393a] text-sm text-gray-200 flex justify-between items-center"
                          >
                            <span>{opt.name}</span>
                            {settings.selectedModel === opt.id && <Icons.Check size={14} className="text-blue-400" />}
                          </button>
                        ))}
                      </div>
                    </>
                 )}
              </div>

              {input.trim() ? (
                <button 
                  onClick={handleSendMessage}
                  className="p-2 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
                >
                  <Icons.Send size={18} />
                </button>
              ) : (
                <button className="p-2 text-gray-400 hover:text-white hover:bg-[#2a2b2d] rounded-full">
                  <Icons.Mic size={20} />
                </button>
              )}
           </div>
        </div>
        <div className="text-center mt-2">
            <p className="text-[10px] text-[#444746]">
                Gemini may display inaccurate info, including about people, so double-check its responses.
            </p>
        </div>
      </footer>

      {/* --- Modals --- */}
      <ApiKeyModal 
        isOpen={isKeyModalOpen} 
        onClose={() => setIsKeyModalOpen(false)} 
        currentSettings={settings}
        onSave={saveApiKey}
      />
    </div>
  );
}

export default App;