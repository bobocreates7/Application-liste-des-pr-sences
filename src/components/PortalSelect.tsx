import React, { useState } from 'react';
import { User, ShieldAlert, ArrowRight, Lock, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export type UserRole = 'prefet' | 'prof';

interface PortalSelectProps {
  onSelectRole: (role: UserRole) => void;
}

export default function PortalSelect({ onSelectRole }: PortalSelectProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleConfirm = () => {
    if (selectedRole === 'prof') {
      onSelectRole('prof');
    } else if (selectedRole === 'prefet') {
      if (password === 'CESCOMJEAN2026') {
        onSelectRole('prefet');
      } else {
        toast.error('Code de sécurité incorrect.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 dark:bg-gray-900">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-800"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#1A73E8]/10 dark:bg-blue-900/30 text-[#1A73E8] dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Bienvenue</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Veuillez choisir votre portail de connexion</p>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          <button
            onClick={() => setSelectedRole('prefet')}
            className={`flex items-center p-4 rounded-2xl border-2 transition-all ${selectedRole === 'prefet' ? 'border-[#1A73E8] bg-blue-50 dark:bg-blue-900/20' : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-600'}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${selectedRole === 'prefet' ? 'bg-[#1A73E8] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="ml-4 text-left">
              <span className={`block font-bold ${selectedRole === 'prefet' ? 'text-[#1A73E8] dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>Préfet</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Administrateur (modification)</span>
            </div>
          </button>

          <button
            onClick={() => { setSelectedRole('prof'); setPassword(''); }}
            className={`flex items-center p-4 rounded-2xl border-2 transition-all ${selectedRole === 'prof' ? 'border-[#1A73E8] bg-blue-50 dark:bg-blue-900/20' : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-600'}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${selectedRole === 'prof' ? 'bg-[#1A73E8] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
              <User className="w-5 h-5" />
            </div>
            <div className="ml-4 text-left">
              <span className={`block font-bold ${selectedRole === 'prof' ? 'text-[#1A73E8] dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>Professeur</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Consultation seule</span>
            </div>
          </button>
        </div>

        <AnimatePresence>
          {selectedRole === 'prefet' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Code de sécurité Préfet</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez le code"
                  className="block w-full pl-10 pr-12 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-transparent focus:border-[#1A73E8] dark:focus:border-[#3B82F6] font-mono transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleConfirm}
          disabled={!selectedRole || (selectedRole === 'prefet' && !password)}
          className="w-full bg-[#1A73E8] hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
        >
          {selectedRole === 'prof' ? 'Entrer en mode consultation' : 'Se connecter'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
}
