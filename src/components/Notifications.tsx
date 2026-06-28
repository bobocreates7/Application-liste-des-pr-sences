import { useMemo, useState, useEffect } from 'react';
import { CheckCircle2, Check, Bell, Trash2 } from 'lucide-react';
import { Class, DailyAttendance } from '../types';
import { getLocalYMD } from '../App';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationsProps {
  classes: Class[];
  attendances: DailyAttendance[];
  onDateChange: (date: string) => void;
  onClose: () => void;
}

export default function Notifications({ classes, attendances, onDateChange, onClose }: NotificationsProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>(() => {
    const saved = localStorage.getItem('app_dismissed_alerts');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('app_dismissed_alerts', JSON.stringify(dismissedAlerts));
  }, [dismissedAlerts]);

  const recentWorkingDays = useMemo(() => {
    const dates = [];
    
    let startDateStr = getLocalYMD();
    
    if (attendances.length > 0) {
      const earliestAttendance = attendances.reduce((min, cur) => new Date(cur.date) < new Date(min) ? cur.date : min, attendances[0].date);
      if (new Date(earliestAttendance) < new Date(startDateStr)) {
        startDateStr = earliestAttendance;
      }
    }
    
    const today = new Date();
    // Exclude today if it's before 10 AM, only display past days + today if >= 10AM
    // Exception: If they explicitly marked something today before 10 AM, we still want to evaluate today,
    // but typically the alert doesn't appear. Just showing the day is fine in the list.
    // Let's just include today regardless in the list so they can see their progress.
    today.setHours(23, 59, 59, 999);

    let d = new Date(startDateStr);
    d.setHours(0,0,0,0);
    
    // limit to reasonable loop count to prevent infinite loop just in case
    let failsafe = 0;
    while (d <= today && failsafe < 365) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        dates.push(getLocalYMD(d));
      }
      d.setDate(d.getDate() + 1);
      failsafe++;
    }
    
    // Reverse to show newest first
    return dates.reverse();
  }, [attendances]);

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
    }).filter(item => !dismissedAlerts.includes(item.date));
  }, [recentWorkingDays, classes, attendances, dismissedAlerts]);

  const missedDaysCount = notificationItems.filter(item => {
    if (item.isComplete) return false;
    const today = new Date();
    const todayStr = getLocalYMD(today);
    if (item.date === todayStr && today.getHours() < 10) {
      return false; // don't count today as missed if it's before 10 AM
    }
    return true;
  }).length;

  const handleDismiss = (date: string) => {
    setDismissedAlerts(prev => [...prev, date]);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 flex-1">
      <header className="bg-[#1A73E8] text-white p-4 shadow-md z-10 sticky top-0 justify-between items-center flex">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          Alertes 
          {missedDaysCount > 0 && <span className="text-xs bg-red-500 font-bold px-2 py-0.5 rounded-full">{missedDaysCount}</span>}
        </h1>
      </header>
      
      <main className="flex-1 overflow-y-auto p-3 pb-3">
        {notificationItems.length === 0 ? (
           <div className="text-center p-8 text-gray-500 dark:text-gray-400 text-sm">
              Aucune notification pour aujourd'hui.
           </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
            {notificationItems.map(item => (
              <motion.div
                key={item.date}
                layout
                initial={{ opacity: 0, height: 0, scale: 0.9 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.9, padding: 0, margin: 0 }}
                transition={{ duration: 0.2 }}
                className="relative rounded-xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-red-500 flex items-center justify-end px-6">
                   <Trash2 className="text-white w-6 h-6" />
                </div>
                <motion.button
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={{ left: 0.5, right: 0 }}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipe = offset.x;
                    if (swipe < -100) {
                      handleDismiss(item.date);
                    }
                  }}
                  onClick={() => {
                    onDateChange(item.date);
                    onClose(); // This should be setActiveTab('home')
                  }}
                  className={`relative w-full text-left p-4 bg-white dark:bg-gray-800 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 rounded-xl flex flex-col gap-1.5 transition-colors border ${!item.isComplete ? 'border-red-100 dark:border-red-900/30 bg-red-50/20 dark:bg-red-900/10' : 'border-gray-100 dark:border-gray-700'}`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-bold text-gray-900 dark:text-white text-base capitalize">{item.formattedDate}</span>
                    {item.isComplete ? (
                      <Check className="w-5 h-5 text-green-500 dark:text-green-400" />
                    ) : (
                      <span className="text-xs uppercase font-bold text-red-600 dark:text-red-400 tracking-wider bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-md">
                        {item.pendingCount} manquant(s)
                      </span>
                    )}
                  </div>
                  {item.isComplete ? (
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400" />
                      Appels effectués {item.lastCompletedAt ? `le ${new Date(item.lastCompletedAt).toLocaleDateString('fr-FR')} à ${new Date(item.lastCompletedAt).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}` : ''}
                    </div>
                  ) : (
                    <div className="text-xs text-red-500/80 dark:text-red-400/80 mt-1">
                      Veuillez compléter tous les appels pour cette journée. Appuyez ici pour y aller.
                    </div>
                  )}
                </motion.button>
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
