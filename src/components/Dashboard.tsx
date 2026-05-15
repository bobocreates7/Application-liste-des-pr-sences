import { useState, useMemo, useRef, useLayoutEffect } from 'react';
import { Search, MapPin, CheckCircle2, Circle, Calendar as CalendarIcon, FileBarChart, Users, Bell, X, Check, Home } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Class, DailyAttendance } from '../types';

let dashboardScrollPos = 0;
// We removed initialSearchTerm and initialFilter as they are now in App.tsx

interface DashboardProps {
  classes: Class[];
  attendances: DailyAttendance[];
  currentDate: string;
  onDateChange: (date: string) => void;
  onSelectClass: (id: string) => void;
  onOpenReport: () => void;
  onOpenDataManagement: () => void;
  filter: 'all' | 'todo' | 'done';
  setFilter: (f: 'all' | 'todo' | 'done') => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
}

export default function Dashboard({ 
  classes, 
  attendances, 
  currentDate, 
  onDateChange, 
  onSelectClass,
  onOpenReport,
  onOpenDataManagement,
  filter,
  setFilter,
  searchTerm,
  setSearchTerm
}: DashboardProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  const classesWithStatus = classes.map(c => {
    const attendance = attendances.find(a => a.classId === c.id && a.date === currentDate);
    return {
      ...c,
      isDone: attendance?.isDone || false,
      absentsCount: attendance?.absents.length || 0
    };
  });

  const recentWorkingDays = useMemo(() => {
    const dates = [];
    let d = new Date();
    // Only check today
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, []);

  const notificationItems = useMemo(() => {
    return recentWorkingDays.map(date => {
      const dayAttendances = classes.map(c => attendances.find(a => a.classId === c.id && a.date === date));
      const pendingCount = classes.length - dayAttendances.filter(a => a?.isDone).length;
      
      const completedAttendances = dayAttendances.filter(a => a?.isDone && a.completedAt);
      let lastCompletedAt = null;
      if (completedAttendances.length > 0) {
        lastCompletedAt = completedAttendances.reduce((latest, current) => {
            if (!latest) return current?.completedAt;
            if (!current?.completedAt) return latest;
            return new Date(current.completedAt).getTime() > new Date(latest).getTime() ? current.completedAt : latest;
        }, null as string | undefined | null);
      }

      const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });

      return {
        date,
        formattedDate,
        pendingCount,
        isComplete: pendingCount === 0,
        lastCompletedAt
      };
    });
  }, [recentWorkingDays, classes, attendances]);

  const mainRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = dashboardScrollPos;
    }
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    dashboardScrollPos = e.currentTarget.scrollTop;
  };

  const missedDaysCount = notificationItems.filter(item => !item.isComplete).length;

  const filteredClasses = classesWithStatus.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' ? true : filter === 'todo' ? !c.isDone : c.isDone;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-50 shadow-xl overflow-hidden relative">
      {/* Notifications Modal */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-start pt-20 px-4" 
            onClick={() => setShowNotifications(false)}
          >
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[70vh]"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#1A73E8]" />
                  Suivi des appels
                  {missedDaysCount > 0 && <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">{missedDaysCount} jour(s)</span>}
                </h3>
                <button onClick={() => setShowNotifications(false)} className="p-1 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-y-auto p-2 divide-y divide-gray-50">
                {notificationItems.map(item => (
                  <button
                    key={item.date}
                    onClick={() => {
                      onDateChange(item.date);
                      setShowNotifications(false);
                    }}
                    className={`w-full text-left p-3 hover:bg-gray-50 active:bg-gray-100 rounded-xl flex flex-col gap-1.5 transition-colors ${!item.isComplete ? 'bg-red-50/30' : ''}`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-bold text-gray-900 text-sm capitalize">{item.formattedDate}</span>
                      {item.isComplete ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <span className="text-[10px] uppercase font-bold text-red-600 tracking-wider bg-red-100 px-2 py-0.5 rounded-md">
                          {item.pendingCount} manquant(s)
                        </span>
                      )}
                    </div>
                    {item.isComplete ? (
                      <div className="text-[10px] text-gray-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        Appels effectués {item.lastCompletedAt ? `le ${new Date(item.lastCompletedAt).toLocaleDateString('fr-FR')} à ${new Date(item.lastCompletedAt).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}` : ''}
                      </div>
                    ) : (
                      <div className="text-[10px] text-red-500/80">
                        Veuillez compléter tous les appels pour cette journée.
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-[#1A73E8] text-white p-4 shadow-md z-10 sticky top-0">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-xl font-bold tracking-tight">liste de présence</h1>
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
      <main ref={mainRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-3 space-y-2.5 pb-6">
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

      {/* Bottom Navigation Navbar */}
      <nav className="bg-white border-t border-gray-200 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] w-full">
        <div className="flex justify-around items-center h-[60px] max-w-md mx-auto">
          <button className="flex flex-col items-center justify-center w-full h-full text-[#1A73E8]">
            <Home className="w-[22px] h-[22px] mb-1" />
            <span className="text-[10px] font-medium">Accueil</span>
          </button>
          
          <button onClick={onOpenDataManagement} className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-[#1A73E8] transition-colors">
            <Users className="w-[22px] h-[22px] mb-1" />
            <span className="text-[10px] font-medium">Élèves</span>
          </button>

          <button onClick={onOpenReport} className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-[#1A73E8] transition-colors">
            <FileBarChart className="w-[22px] h-[22px] mb-1" />
            <span className="text-[10px] font-medium">Rapports</span>
          </button>

          <button onClick={() => setShowNotifications(true)} className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-[#1A73E8] transition-colors relative">
            <div className="relative">
              <Bell className="w-[22px] h-[22px] mb-1" />
              {missedDaysCount > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {missedDaysCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">Alertes</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
