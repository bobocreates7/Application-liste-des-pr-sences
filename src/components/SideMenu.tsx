import { motion, AnimatePresence } from 'motion/react';
import { X, Moon, Sun, Mail, Info } from 'lucide-react';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function SideMenu({ isOpen, onClose, isDarkMode, toggleDarkMode }: SideMenuProps) {
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
            className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-bold text-gray-900 text-lg">Menu</h2>
              <button 
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Préférences</p>
                <button 
                  onClick={toggleDarkMode}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isDarkMode ? <Moon className="w-5 h-5 text-gray-700" /> : <Sun className="w-5 h-5 text-gray-700" />}
                    <span className="font-medium text-gray-900">Mode {isDarkMode ? 'Sombre' : 'Clair'}</span>
                  </div>
                  <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-[#1A73E8]' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </button>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">À propos</p>
                
                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/50 flex flex-col gap-1 items-start">
                  <div className="flex items-center gap-2 text-[#1A73E8] mb-1">
                    <Info className="w-4 h-4" />
                    <span className="font-bold text-sm">Informations</span>
                  </div>
                  <p className="text-sm text-gray-700 font-medium mt-1">Développé par :</p>
                  <p className="text-sm font-bold text-gray-900">Aimé-Bonus Mucowintore</p>
                  <p className="text-xs text-gray-500 mt-2">Version 1.0.0</p>
                </div>

                <a 
                  href="mailto:bobographiks@gmail.com?subject=Contact%20depuis%20l'application%20CESCOM"
                  className="w-full flex items-center gap-3 p-3 mt-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex flex-center items-center justify-center">
                    <Mail className="w-4 h-4 text-gray-700" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-medium text-gray-900 text-sm">Nous contacter</span>
                    <span className="text-xs text-gray-500">bobographiks@gmail.com</span>
                  </div>
                </a>
              </div>
            </div>
            
            <div className="p-4 flex justify-center pb-8 border-t border-gray-100 text-[10px] text-gray-400 font-medium">
              CESCOM LP © 2026
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
