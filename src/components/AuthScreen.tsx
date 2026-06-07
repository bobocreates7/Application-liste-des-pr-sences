import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

interface AuthScreenProps {
  onLogin: () => void;
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!navigator.onLine) {
      toast.error('Connexion Internet requise', {
        description: 'Vous êtes hors ligne. Veuillez vérifier votre connexion et réessayer.'
      });
      return;
    }

    setIsLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Connexion réussie');
      onLogin();
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Erreur de connexion', { description: 'Impossible de vous connecter avec Google.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 dark:bg-gray-900">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-800 text-center"
      >
        <div className="w-20 h-20 bg-[#1A73E8]/10 dark:bg-[#3B82F6]/20 text-[#1A73E8] dark:text-[#3B82F6] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-[#1A73E8]/20 dark:border-[#3B82F6]/30">
          <LogIn className="w-10 h-10 transform translate-x-[-2px]" />
        </div>
        
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">CES2026</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Veuillez vous connecter pour accéder à l'application.
        </p>

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full bg-[#1A73E8] hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-sm disabled:opacity-70"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <svg className="w-5 h-5 bg-white rounded-full p-1 border-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Se connecter avec Google
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
