import { useMemo } from 'react';
import { CheckCircle2, Check, Bell } from 'lucide-react';
import { Class, DailyAttendance } from '../types';

interface NotificationsProps {
  classes: Class[];
  attendances: DailyAttendance[];
  onDateChange: (date: string) => void;
  onClose: () => void;
}

export default function Notifications({ classes, attendances, onDateChange, onClose }: NotificationsProps) {
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

  const missedDaysCount = notificationItems.filter(item => !item.isComplete).length;

  return (
    <div className="flex flex-col h-full bg-gray-50 flex-1">
      <header className="bg-[#1A73E8] text-white p-4 shadow-md z-10 sticky top-0 justify-between items-center flex">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          Alertes 
          {missedDaysCount > 0 && <span className="text-xs bg-red-500 font-bold px-2 py-0.5 rounded-full">{missedDaysCount}</span>}
        </h1>
      </header>
      
      <main className="flex-1 overflow-y-auto p-3 pb-24">
        {notificationItems.length === 0 ? (
           <div className="text-center p-8 text-gray-500 text-sm">
              Aucune notification pour aujourd'hui.
           </div>
        ) : (
          <div className="space-y-3">
            {notificationItems.map(item => (
              <button
                key={item.date}
                onClick={() => {
                  onDateChange(item.date);
                  onClose(); // This should be setActiveTab('home')
                }}
                className={`w-full text-left p-4 bg-white shadow-sm hover:bg-gray-50 active:bg-gray-100 rounded-xl flex flex-col gap-1.5 transition-colors border ${!item.isComplete ? 'border-red-100 bg-red-50/20' : 'border-gray-100'}`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold text-gray-900 text-base capitalize">{item.formattedDate}</span>
                  {item.isComplete ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <span className="text-xs uppercase font-bold text-red-600 tracking-wider bg-red-100 px-2 py-0.5 rounded-md">
                      {item.pendingCount} manquant(s)
                    </span>
                  )}
                </div>
                {item.isComplete ? (
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Appels effectués {item.lastCompletedAt ? `le ${new Date(item.lastCompletedAt).toLocaleDateString('fr-FR')} à ${new Date(item.lastCompletedAt).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}` : ''}
                  </div>
                ) : (
                  <div className="text-xs text-red-500/80 mt-1">
                    Veuillez compléter tous les appels pour cette journée. Appuyez ici pour y aller.
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
