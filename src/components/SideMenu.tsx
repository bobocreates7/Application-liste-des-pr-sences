import { useEffect, useRef } from 'react';
import { X, Moon, Sun, Mail, Info, LogOut } from 'lucide-react';
import { UserRole } from './PortalSelect';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  role?: UserRole | null;
  onLogout: () => void;
  onAppLogout?: () => void;
}

export default function SideMenu({
  isOpen,
  onClose,
  isDarkMode,
  toggleDarkMode,
  role,
  onLogout,
  onAppLogout
}: SideMenuProps) {

  const menuRef = useRef<HTMLDivElement>(null);

  const startX = useRef(0);
  const currentX = useRef(0);
  const dragging = useRef(false);

  const WIDTH = 320;

  // sync open/close state
  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;

    if (isOpen) {
      el.style.transform = 'translateX(0px)';
    } else {
      el.style.transform = `translateX(${WIDTH}px)`;
    }
  }, [isOpen]);

  // TOUCH START
  const onTouchStart = (e: React.TouchEvent) => {
    dragging.current = true;
    startX.current = e.touches[0].clientX;
  };

  // TOUCH MOVE (WHATSAPP STYLE REAL TIME)
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current) return;

    const el = menuRef.current;
    if (!el) return;

    const delta = e.touches[0].clientX - startX.current;

    let x = delta;

    if (x < 0) x = 0;
    if (x > WIDTH) x = WIDTH;

    currentX.current = x;

    el.style.transform = `translateX(${x}px)`;
    el.style.transition = 'none'; // IMPORTANT: no lag
  };

  // TOUCH END
  const onTouchEnd = () => {
    const el = menuRef.current;
    if (!el) return;

    dragging.current = false;

    const x = currentX.current;

    // threshold close/open
    if (x > WIDTH * 0.4) {
      el.style.transition = 'transform 180ms ease-out';
      el.style.transform = `translateX(${WIDTH}px)`;
      onClose();
    } else {
      el.style.transition = 'transform 180ms ease-out';
      el.style.transform = 'translateX(0px)';
    }
  };

  return (
    <>
      {/* overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50"
        />
      )}

      {/* MENU */}
      <div
        ref={menuRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-[#F8F9FA] dark:bg-gray-900 shadow-2xl z-50 flex flex-col will-change-transform"
        style={{
          transform: `translateX(${isOpen ? 0 : WIDTH}px)`
        }}
      >

        {/* HEADER */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <h2 className="font-bold text-gray-900 dark:text-white text-lg">Menu</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT (UNCHANGED UI EXACT COPY) */}
        <div className="flex-1 p-4 flex flex-col gap-6 overflow-y-auto">

          {/* SESSION */}
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 px-1">
              Session
            </p>

            <div className="bg-white dark:bg-gray-800/80 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-700/50">

              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <LogOut className="w-5 h-5" />
                  <span className="font-semibold text-[15px]">
                    Changer de profil ({role === 'prefet' ? 'Préfet' : 'Professeur'})
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  onAppLogout?.();
                  onClose();
                }}
                className="w-full flex items-center justify-between p-4 text-red-500 dark:text-red-400"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 opacity-80" />
                  <span className="font-semibold text-[15px]">
                    Déconnexion de l'application
                  </span>
                </div>
              </button>

            </div>
          </div>

          {/* PREFS */}
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 px-1">
              Préférences
            </p>

            <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/50">

              <button
                onClick={toggleDarkMode}
                className="w-full flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  <span className="font-semibold text-gray-900 dark:text-white text-[15px]">
                    Mode {isDarkMode ? 'Sombre' : 'Clair'}
                  </span>
                </div>

                <div className={`w-12 h-7 rounded-full p-1 flex items-center transition-colors ${
                  isDarkMode ? 'bg-[#1A73E8]' : 'bg-gray-300 dark:bg-gray-600'
                }`}>
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    isDarkMode ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </button>

            </div>
          </div>

          {/* ABOUT */}
          <div className="flex flex-col gap-3 mt-6 pb-2">

            <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 px-1">
              À propos
            </p>

            <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-4">

              <div className="flex items-center gap-2 text-[#1A73E8] mb-3">
                <Info className="w-[18px] h-[18px]" />
                <span className="font-bold">Informations</span>
              </div>

              <p className="text-[13px] text-gray-500 dark:text-gray-400">
                Développé par :
              </p>

              <p className="text-[15px] font-bold text-gray-900 dark:text-white mt-0.5">
                Aimé-Bonus Mucowintore
              </p>

              <p className="text-[13px] text-gray-400 mt-4">
                Version 1.0.0
              </p>

            </div>

            <a
              href="mailto:bobographiks@gmail.com"
              className="w-full flex items-center gap-4 p-4 bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/50"
            >
              <div className="w-10 h-10 rounded-[12px] bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>

              <div className="flex flex-col">
                <span className="font-bold">Nous contacter</span>
                <span className="text-[13px] text-gray-500">
                  bobographiks@gmail.com
                </span>
              </div>
            </a>

          </div>

        </div>

        {/* FOOTER */}
        <div className="p-4 text-center text-[10px] text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-800">
          CESCOM LP © 2026
        </div>

      </div>
    </>
  );
}