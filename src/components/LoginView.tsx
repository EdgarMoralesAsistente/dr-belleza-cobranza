import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { Usuario } from '../types';
import { StorageService } from '../services/storageService';

interface LoginViewProps {
  onLoginSuccess: (user: Usuario) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [emailOrUser, setEmailOrUser] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!emailOrUser.trim()) {
      setErrorMessage('Por favor ingresa tu correo electrónico o ID de usuario.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Por favor ingresa tu contraseña.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = StorageService.login(emailOrUser, password);
      setIsLoading(false);

      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setErrorMessage(result.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      }
    }, 250);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans antialiased text-slate-100">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/20 p-8 sm:p-10 text-slate-800 flex flex-col justify-between">
        
        <div>
          {/* BRANDING LOGO */}
          <div className="flex items-center space-x-3.5 mb-8 justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold shadow-lg shadow-teal-700/20">
              <Shield className="w-6 h-6 text-teal-100" />
            </div>
            <div className="text-left">
              <span className="font-serif italic font-bold text-2xl text-teal-800 tracking-tight block leading-none">
                Dr. Belleza
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1 block">
                Salud & Estética • Management System
              </span>
            </div>
          </div>

          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Inicio de Sesión
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Ingresa tus credenciales de acceso institucional para entrar al sistema.
            </p>
          </div>

          {/* MENSAJE DE ERROR */}
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-rose-800 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs font-semibold leading-relaxed">
                {errorMessage}
              </div>
            </div>
          )}

          {/* FORMULARIO DE LOGIN */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Correo Electrónico o Usuario *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="edgarmorales.asistente@gmail.com"
                  value={emailOrUser}
                  onChange={(e) => setEmailOrUser(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:bg-white transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Contraseña de Acceso *
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:bg-white transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-700/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Iniciando sesión...</span>
                ) : (
                  <>
                    <span>Entrar al Sistema</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* PIE DE PÁGINA */}
        <div className="mt-8 pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span>© 2026 Dr. Belleza Medical Group</span>
          <span className="font-mono text-[10px]">v2.6.0 RBAC</span>
        </div>

      </div>
    </div>
  );
};
