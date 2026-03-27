import { useState } from 'react';
import { Search, MapPin, CheckCircle2, Circle, Calendar as CalendarIcon, FileBarChart } from 'lucide-react';
import { Class, DailyAttendance } from '../types';

interface DashboardProps {
  classes: Class[];
  attendances: DailyAttendance[];
  currentDate: string;
  onDateChange: (date: string) => void;
  onSelectClass: (id: string) => void;
  onOpenReport: () => void;
}

export default function Dashboard({ 
  classes, 
  attendances, 
  currentDate, 
  onDateChange, 
  onSelectClass,
  onOpenReport
}: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'todo' | 'done'>('all');

  const classesWithStatus = classes.map(c => {
    const attendance = attendances.find(a => a.classId === c.id && a.date === currentDate);
    return {
      ...c,
      isDone: attendance?.isDone || false,
      absentsCount: attendance?.absents.length || 0
    };
  });

  const filteredClasses = classesWithStatus.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' ? true : filter === 'todo' ? !c.isDone : c.isDone;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-50 shadow-xl overflow-hidden">
      {/* Header */}
      <header className="bg-[#1A73E8] text-white p-6 shadow-md z-10 sticky top-0">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold tracking-tight">Tournée d'Appel</h1>
          <button 
            onClick={onOpenReport}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <FileBarChart className="w-4 h-4" />
            Rapport
          </button>
        </div>
        
        {/* Date Selector */}
        <div className="flex items-center bg-white/10 rounded-xl p-1 mb-4">
          <CalendarIcon className="w-5 h-5 ml-3 mr-2 text-white/80" />
          <input 
            type="date" 
            value={currentDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="bg-transparent border-none text-white focus:ring-0 font-medium w-full py-2 cursor-pointer [color-scheme:dark]"
          />
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border-none rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-sm text-lg"
            placeholder="Rechercher une classe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 mt-4">
          <button 
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-white text-[#1A73E8]' : 'bg-white/20 text-white hover:bg-white/30'}`}
          >
            Toutes
          </button>
          <button 
            onClick={() => setFilter('todo')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${filter === 'todo' ? 'bg-white text-[#1A73E8]' : 'bg-white/20 text-white hover:bg-white/30'}`}
          >
            À faire
          </button>
          <button 
            onClick={() => setFilter('done')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${filter === 'done' ? 'bg-white text-[#1A73E8]' : 'bg-white/20 text-white hover:bg-white/30'}`}
          >
            Faites
          </button>
        </div>
      </header>

      {/* Class List */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredClasses.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Aucune classe trouvée.
          </div>
        ) : (
          filteredClasses.map(c => (
            <button
              key={c.id}
              onClick={() => onSelectClass(c.id)}
              className="w-full text-left bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between active:scale-[0.98] transition-transform"
              style={{ minHeight: '80px' }}
            >
              <div>
                <h2 className="text-xl font-bold text-gray-900">{c.name}</h2>
                <div className="flex items-center text-gray-500 mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{c.building}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {c.isDone && c.absentsCount > 0 && (
                  <span className="text-sm font-medium text-[#E53935] bg-red-50 px-2 py-1 rounded-md">
                    {c.absentsCount} absent{c.absentsCount > 1 ? 's' : ''}
                  </span>
                )}
                <div className="flex items-center justify-center w-12 h-12">
                  {c.isDone ? (
                    <CheckCircle2 className="w-8 h-8 text-[#43A047]" />
                  ) : (
                    <Circle className="w-8 h-8 text-gray-300" />
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </main>
    </div>
  );
}
