import React from 'react';
import { LogIn } from 'lucide-react';
import { motion } from 'motion/react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { toast } from 'sonner';

export default function AuthScreen() {
  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Connexion réussie');
    } catch (error: any) {
      console.error(error);
      toast.error('Erreur de connexion', { description: error.message || String(error) });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 dark:bg-gray-900">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-800 text-center"
      >
        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 text-[#1A73E8] dark:text-blue-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100 dark:border-blue-900/50">
          <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">My App</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Veuillez vous connecter avec votre compte Google pour accéder à l'application et sécuriser vos données.
        </p>

        <button
          onClick={handleLogin}
          className="w-full bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" fillRule="evenodd" d="M23.64 12.2045C23.64 11.3662 23.5654 10.5694 23.4294 9.8093L12 9.8093V14.3312H18.5292C18.2483 15.7915 17.41 17.0396 16.1422 17.8884V20.8228H20.0652C22.3615 18.708 23.64 15.6888 23.64 12.2045V12.2045C23.64 12.2045 23.64 12.2045 23.64 12.2045Z" clipRule="evenodd"/>
            <path fill="currentColor" fillRule="evenodd" d="M12 24C15.2721 24 18.0205 22.9189 20.0652 20.8228L16.1422 17.8884C15.0347 18.6302 13.6301 19.0718 12 19.0718C8.84714 19.0718 6.17646 16.9427 5.21558 14.073L1.17383 17.2023C3.16782 21.1611 7.23431 24 12 24V24Z" clipRule="evenodd"/>
            <path fill="currentColor" fillRule="evenodd" d="M5.21558 14.073C4.97028 13.3312 4.83427 12.5344 4.83427 11.7164C4.83427 10.8984 4.97028 10.1016 5.21558 9.35985L1.17383 6.23055C0.355816 7.86315 0 9.73565 0 11.7164C0 13.6972 0.355816 15.5697 1.17383 17.2023L5.21558 14.073V14.073V14.073Z" clipRule="evenodd"/>
            <path fill="currentColor" fillRule="evenodd" d="M12 4.36095C13.7821 4.36095 15.3857 4.97655 16.6433 6.17295L20.1557 2.66055C18.0091 0.66655 15.2607 0 12 0C7.23431 0 3.16782 2.8389 1.17383 6.7977L5.21558 9.927C6.17646 7.0573 8.84714 4.36095 12 4.36095V4.36095Z" clipRule="evenodd"/>
          </svg>
          Continuer avec Google
        </button>
      </motion.div>
    </div>
  );
}
