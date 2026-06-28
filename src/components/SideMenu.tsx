import { motion, AnimatePresence } from 'motion/react';
import { X, Moon, Sun, Mail, Info, LogOut, Calendar } from 'lucide-react';
import { UserRole } from './PortalSelect';
import { Select } from './Select';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  role?: UserRole | null;
  userEmail?: string | null;
  schoolYear?: string;
  availableSchoolYears?: string[];
  onSchoolYearChange?: (year: string) => void;
  onLogout: () => void;
  onAppLogout?: () => void;
}

export default function SideMenu({ isOpen, onClose, isDarkMode, toggleDarkMode, role, userEmail, schoolYear, availableSchoolYears = [], onSchoolYearChange, onLogout, onAppLogout }: SideMenuProps) {
  // Optionnel: ajout du geste swipe à droite pour fermer plus tard,
  // mais la consigne demande un swipe gauche pour ouvrir (ce qui doit être géré au niveau app),
  // et on peut glisser à droite pour fermer le menu.
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, type: 'spring', damping: 25, stiffness: 200 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0, right: 1 }}
            onDragEnd={(e, { offset, velocity }) => {
              if (offset.x > 100 || velocity.x > 500) {
                onClose();
              }
            }}
            className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-[#F8F9FA] dark:bg-gray-900 shadow-2xl z-50 flex flex-col"
          >
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <h2 className="font-bold text-gray-900 dark:text-white text-lg">Menu</h2>
              <button 
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-4 flex flex-col gap-6 overflow-y-auto">
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 px-1">Session</p>
                
                <div className="bg-white dark:bg-gray-800/80 rounded-2xl p-4 mb-1 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-700/50 flex flex-col gap-2">
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 mb-1">
                    <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <span className="text-[14px] font-semibold">Année Scolaire</span>
                  </div>
                  <Select
                    value={schoolYear || ""}
                    onChange={(val) => onSchoolYearChange?.(val)}
                    options={availableSchoolYears.map((year, index) => ({
                      value: year,
                      label: index === 0 ? `${year} (En cours)` : year
                    }))}
                    className="w-full relative z-50"
                  />
                </div>

                {userEmail && (
                  <div className="bg-white dark:bg-gray-800/80 rounded-2xl p-4 mb-1 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-700/50 flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <span className="text-[14px] text-gray-700 dark:text-gray-300 font-medium truncate">{userEmail}</span>
                  </div>
                )}

                <div className="bg-white dark:bg-gray-800/80 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-700/50">
                  <button 
                    onClick={() => {
                        onLogout();
                        onClose();
                    }}
                    className="w-full flex items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-t-2xl border-b border-gray-100 dark:border-gray-700/50"
                  >
                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                      <LogOut className="w-5 h-5" />
                      <span className="font-semibold text-[15px]">Changer de profil ({role === 'prefet' ? 'Préfet' : 'Professeur'})</span>
                    </div>
                  </button>
                  <button 
                    onClick={() => {
                        if (onAppLogout) onAppLogout();
                        onClose();
                    }}
                    className="w-full flex items-center justify-between p-4 transition-colors text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-b-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <LogOut className="w-5 h-5 opacity-80" />
                      <span className="font-semibold text-[15px]">Déconnexion de l'application</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 px-1">Préférences</p>
                
                <div className="bg-white dark:bg-gray-800/80 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-700/50">
                  <button 
                    onClick={toggleDarkMode}
                    className="w-full flex items-center justify-between p-4 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isDarkMode ? <Moon className="w-5 h-5 text-gray-700 dark:text-gray-200" /> : <Sun className="w-5 h-5 text-gray-700 dark:text-gray-200" />}
                      <span className="font-semibold text-gray-900 dark:text-white text-[15px]">Mode {isDarkMode ? 'Sombre' : 'Clair'}</span>
                    </div>
                    <div className={`w-12 h-7 rounded-full p-1 transition-colors flex items-center ${isDarkMode ? 'bg-[#1A73E8]' : 'bg-gray-300 dark:bg-gray-600'}`}>
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-6 pb-2">
                <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 px-1">À propos</p>
                
                <div className="bg-white dark:bg-gray-800/80 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-700/50 p-4 flex flex-col items-start text-left">
                  <div className="flex items-center gap-2 text-[#1A73E8] dark:text-[#3B82F6] mb-3">
                    <Info className="w-[18px] h-[18px]" />
                    <span className="font-bold text-base tracking-tight">Informations</span>
                  </div>
                  <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium">Développé par :</p>
                  <p className="text-[15px] font-bold text-gray-900 dark:text-white mt-0.5">Aimé-Bonus Mucowintore</p>
                  <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-4">Version 1.0.0</p>
                </div>

                <a 
                  href="mailto:bobographiks@gmail.com"
                  className="w-full flex items-center gap-4 p-4 bg-white dark:bg-gray-800/80 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-700/50 transition-colors active:bg-gray-50 dark:active:bg-gray-700"
                >
                  <div className="w-10 h-10 rounded-[12px] bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center border border-gray-100 dark:border-gray-600 shrink-0">
                    <Mail className="w-5 h-5 text-gray-500 dark:text-gray-300" />
                  </div>
                  <div className="flex flex-col text-left justify-center pb-0.5">
                    <span className="font-bold text-gray-900 dark:text-white text-[15px]">Nous contacter</span>
                    <span className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">bobographiks@gmail.com</span>
                  </div>
                </a>
              </div>
            </div>
            
            <div className="p-4 flex justify-center pb-8 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400 dark:text-gray-500 font-medium">
              CESCOM LP © 2026
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
