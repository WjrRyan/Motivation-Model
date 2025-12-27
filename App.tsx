import React, { useState, useCallback } from 'react';
import { generateMotivationModel } from './services/geminiService';
import { MotivationModelData } from './types';
import { DiagramView } from './components/DiagramView';
import { EditPanel } from './components/EditPanel';
import { 
  IconMagic, 
  IconEdit, 
  IconZoomIn, 
  IconZoomOut, 
  IconRefresh
} from './components/Icons';

const EXAMPLE_DATA: MotivationModelData = {
  topic: "Going for a Morning Run",
  doItems: [
    { id: '1', text: "Lace up shoes" },
    { id: '2', text: "Step outside door" },
    { id: '3', text: "Maintain steady pace" },
    { id: '4', text: "Hydrate afterwards" }
  ],
  beItems: [
    { id: '5', text: "A disciplined athlete" },
    { id: '6', text: "Someone who respects their body" },
    { id: '7', text: "A morning person" }
  ],
  feelItems: [
    { id: '8', text: "Energized & Awake" },
    { id: '9', text: "Proud of consistency" },
    { id: '10', text: "Mental clarity" }
  ]
};

export default function App() {
  const [data, setData] = useState<MotivationModelData>(EXAMPLE_DATA);
  const [topicInput, setTopicInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [scale, setScale] = useState(0.8);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await generateMotivationModel(topicInput);
      setData(result);
    } catch (err) {
      setError("Failed to generate model. Please check your API key or try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setScale(prev => {
      const newScale = direction === 'in' ? prev + 0.1 : prev - 0.1;
      return Math.min(Math.max(newScale, 0.4), 1.5);
    });
  };

  return (
    <div className="w-full h-screen bg-dark-bg text-white flex flex-col overflow-hidden relative font-sans">
      
      {/* Header / Input Area */}
      <header className="absolute top-0 left-0 right-0 z-10 p-6 flex items-start justify-between pointer-events-none">
        <div className="pointer-events-auto max-w-lg w-full">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                Motivation Model
            </h1>
            <p className="text-slate-400 text-sm mb-4">
                Deconstruct your goals into Action, Identity, and Emotion.
            </p>
            
            <form onSubmit={handleGenerate} className="flex gap-2 shadow-lg">
                <div className="relative flex-1">
                    <input 
                        type="text" 
                        placeholder="E.g., Learning Spanish, Quitting Sugar..." 
                        value={topicInput}
                        onChange={(e) => setTopicInput(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-white placeholder-slate-500"
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={isLoading || !topicInput}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                >
                    {isLoading ? (
                        <IconRefresh className="animate-spin" size={18} />
                    ) : (
                        <IconMagic size={18} />
                    )}
                    <span className="hidden sm:inline">Analyze</span>
                </button>
            </form>
            
            {error && (
                <div className="mt-2 text-red-400 text-xs bg-red-400/10 p-2 rounded">
                    {error}
                </div>
            )}
        </div>

        {/* Top Right Controls */}
        <div className="pointer-events-auto flex flex-col gap-2">
           <button 
              onClick={() => setIsEditOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-full shadow-lg border border-slate-700 transition-all group"
              title="Edit Model"
           >
              <IconEdit size={20} className="group-hover:scale-110 transition-transform"/>
           </button>
           <div className="flex flex-col bg-slate-800 rounded-full shadow-lg border border-slate-700 overflow-hidden">
               <button onClick={() => handleZoom('in')} className="p-3 hover:bg-slate-700 text-slate-300 hover:text-white border-b border-slate-700">
                  <IconZoomIn size={20} />
               </button>
               <button onClick={() => handleZoom('out')} className="p-3 hover:bg-slate-700 text-slate-300 hover:text-white">
                  <IconZoomOut size={20} />
               </button>
           </div>
        </div>
      </header>

      {/* Main Diagram Canvas */}
      <main className="flex-1 w-full h-full relative cursor-move bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800/20 via-slate-900/50 to-slate-950">
        <DiagramView data={data} scale={scale} />
        
        {/* Legend / Info Footer */}
        <div className="absolute bottom-6 left-6 pointer-events-none opacity-50 text-xs text-slate-500 space-y-1">
             <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-do-primary"></span>
                 <span>DO: Concrete Actions</span>
             </div>
             <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-be-primary"></span>
                 <span>BE: Identity & Values</span>
             </div>
             <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-feel-primary"></span>
                 <span>FEEL: Emotional Rewards</span>
             </div>
        </div>
      </main>

      {/* Editor Panel */}
      <EditPanel 
        data={data} 
        onChange={setData} 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
      />
    </div>
  );
}