import { useState } from 'react';
import { Search, MapPin, CheckCircle2, Circle, Calendar as CalendarIcon, FileBarChart, Users } from 'lucide-react';
import { Class, DailyAttendance } from '../types';

interface DashboardProps {
  classes: Class[];
  attendances: DailyAttendance[];
  currentDate: string;
  onDateChange: (date: string) => void;
  onSelectClass: (id: string) => void;
  onOpenReport: () => void;
  onOpenDataManagement: () => void;
}

export default function Dashboard({ 
  classes, 
  attendances, 
  currentDate, 
  onDateChange, 
  onSelectClass,
  onOpenReport,
  onOpenDataManagement
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
      <header className="bg-[#1A73E8] text-white p-4 shadow-md z-10 sticky top-0">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-xl font-bold tracking-tight">Tournée d'Appel</h1>
          <div className="flex gap-2">
            <button 
              onClick={onOpenDataManagement}
              className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-1.5 text-sm font-medium"
              title="Gérer les élèves"
            >
              <Users className="w-4 h-4" />
            </button>
            <button 
              onClick={onOpenReport}
              className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-1.5 text-sm font-medium"
            >
              <FileBarChart className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Date Selector */}
        <div className="flex items-center bg-white/10 rounded-xl p-0.5 mb-3">
          <CalendarIcon className="w-4 h-4 ml-3 mr-2 text-white/80" />
          <input 
            type="date" 
            value={currentDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="bg-transparent border-none text-white focus:ring-0 font-medium w-full py-1.5 text-sm cursor-pointer [color-scheme:dark]"
          />
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-2 border-none rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-sm text-sm"
            placeholder="Rechercher une classe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 mt-3">
          <button 
            onClick={() => setFilter('all')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${filter === 'all' ? 'bg-white text-[#1A73E8]' : 'bg-white/20 text-white hover:bg-white/30'}`}
          >
            Toutes
          </button>
          <button 
            onClick={() => setFilter('todo')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${filter === 'todo' ? 'bg-white text-[#1A73E8]' : 'bg-white/20 text-white hover:bg-white/30'}`}
          >
            À faire
          </button>
          <button 
            onClick={() => setFilter('done')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${filter === 'done' ? 'bg-white text-[#1A73E8]' : 'bg-white/20 text-white hover:bg-white/30'}`}
          >
            Faites
          </button>
        </div>
      </header>

      {/* Class List */}
      <main className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredClasses.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500">
            Aucune classe trouvée.
          </div>
        ) : (
          filteredClasses.map(c => (
            <button
              key={c.id}
              onClick={() => onSelectClass(c.id)}
              className="w-full text-left bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between active:scale-[0.98] transition-transform"
              style={{ minHeight: '64px' }}
            >
              <div>
                <h2 className="text-lg font-bold text-gray-900">{c.name}</h2>
                <div className="flex items-center text-gray-500 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 mr-1" />
                  <span className="text-xs">{c.building}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {c.isDone && c.absentsCount > 0 && (
                  <span className="text-xs font-medium text-[#E53935] bg-red-50 px-2 py-1 rounded-md">
                    {c.absentsCount} absent{c.absentsCount > 1 ? 's' : ''}
                  </span>
                )}
                <div className="flex items-center justify-center w-8 h-8">
                  {c.isDone ? (
                    <CheckCircle2 className="w-6 h-6 text-[#43A047]" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-300" />
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
