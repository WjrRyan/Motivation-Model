import React from 'react';
import { MotivationModelData, MotivationItem, CategoryType } from '../types';
import { IconDo, IconBe, IconFeel } from './Icons';

interface EditPanelProps {
  data: MotivationModelData;
  onChange: (newData: MotivationModelData) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const EditPanel: React.FC<EditPanelProps> = ({ data, onChange, isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleItemChange = (category: 'doItems' | 'beItems' | 'feelItems', id: string, newValue: string) => {
    const newItems = data[category].map(item => 
      item.id === id ? { ...item, text: newValue } : item
    );
    onChange({ ...data, [category]: newItems });
  };

  const renderSection = (title: string, items: MotivationItem[], categoryKey: 'doItems' | 'beItems' | 'feelItems', Icon: React.FC<any>, colorClass: string) => (
    <div className="mb-8">
      <div className={`flex items-center gap-2 mb-3 border-b border-gray-700 pb-2 ${colorClass}`}>
        <Icon size={18} />
        <h3 className="font-bold text-sm tracking-wider uppercase">{title}</h3>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <input
            key={item.id}
            type="text"
            value={item.text}
            onChange={(e) => handleItemChange(categoryKey, item.id, e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-slate-900 border-l border-slate-700 shadow-2xl p-6 overflow-y-auto z-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Edit Model</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
      </div>

      <div className="mb-6">
        <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Activity / Goal</label>
        <input
          type="text"
          value={data.topic}
          onChange={(e) => onChange({ ...data, topic: e.target.value })}
          className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {renderSection("Do (Action)", data.doItems, 'doItems', IconDo, 'text-do-primary')}
      {renderSection("Be (Identity)", data.beItems, 'beItems', IconBe, 'text-be-primary')}
      {renderSection("Feel (Emotion)", data.feelItems, 'feelItems', IconFeel, 'text-feel-primary')}
    </div>
  );
};