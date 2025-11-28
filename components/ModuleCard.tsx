import React from 'react';
import { CourseModule } from '../types';
import { CheckCircle, Lock, PlayCircle } from 'lucide-react';

interface Props {
  module: CourseModule;
  isLocked: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

const ModuleCard: React.FC<Props> = ({ module, isLocked, isCompleted, onClick }) => {
  return (
    <div 
        onClick={!isLocked ? onClick : undefined}
        className={`relative p-6 rounded-xl border transition-all duration-200 text-left w-full
        ${isLocked 
            ? 'bg-slate-50 border-slate-200 opacity-70 cursor-not-allowed' 
            : 'bg-white border-slate-200 hover:border-python-blue hover:shadow-md cursor-pointer group'}
        `}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Module {module.id}</span>
        {isCompleted ? (
            <CheckCircle className="text-green-500" size={20} />
        ) : isLocked ? (
            <Lock className="text-slate-400" size={20} />
        ) : (
            <PlayCircle className="text-python-blue opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
        )}
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{module.title}</h3>
      <p className="text-sm text-slate-600 line-clamp-2">{module.description}</p>
    </div>
  );
};

export default ModuleCard;