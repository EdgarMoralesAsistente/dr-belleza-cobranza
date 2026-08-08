import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  Camera,
  Upload,
  Eye,
  EyeOff,
  Shield,
  CheckCircle2,
  AlertCircle,
  KeyRound
} from 'lucide-react';
import { Usuario } from '../types';
import { StorageService } from '../services/storageService';

interface UserProfileModalProps {
  currentUser: Usuario;
  onClose: () => void;
  onSave: (updatedUser: Usuario) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  currentUser,
  onClose,
  onSave
}) => {
  const [nombre, setNombre] = useState(currentUser.nombre);
  const [email, setEmail] = useState(currentUser.email);
  const [fotoUrl, setFotoUrl] = useState(currentUser.fotoUrl || '');
  const [password, setPassword] = useState(currentUser.passwordHash || '');
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('La imagen es demasiado grande. Elige una foto menor a 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFotoUrl(reader.result as string);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!nombre.trim()) {
      setErrorMessage('El nombre completo es requerido.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('El correo electrónico es requerido.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('La contraseña no puede estar vacía.');
      return;
    }

    const updatedUser: Usuario = {
      ...currentUser,
      nombre: nombre.trim(),
      email: email.trim(),
      fotoUrl: fotoUrl.trim(),
      passwordHash: password.trim()
    };

    StorageService.saveUsuario(updatedUser);
    setSuccessMessage('¡Perfil actualizado con éxito!');

    setTimeout(() => {
      onSave(updatedUser);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden flex flex-col">
        
        {/* HEADER MODAL */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-teal-600/30 text-teal-300 rounded-xl border border-teal-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Editar Mi Perfil</h3>
              <p className="text-[10px] text-slate-400">Actualiza tus datos de acceso e imagen de cuenta</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENIDO Y FORMULARIO */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* MENSAJES DE ESTADO */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-teal-50 border border-teal-200 text-teal-900 rounded-xl text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* FOTO DE PERFIL / AVATAR */}
          <div className="flex flex-col items-center justify-center space-y-2 pb-2">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full bg-teal-100 border-2 border-teal-600/30 text-teal-900 font-bold text-2xl flex items-center justify-center overflow-hidden shadow-md">
                {fotoUrl ? (
                  <img src={fotoUrl} alt={nombre} className="w-full h-full object-cover" />
                ) : (
                  <span>{nombre.substring(0, 2).toUpperCase()}</span>
                )}
              </div>

              <label className="absolute bottom-0 right-0 p-1.5 bg-teal-600 text-white rounded-full shadow-md hover:bg-teal-700 cursor-pointer transition-transform active:scale-95" title="Cambiar Foto">
                <Camera className="w-3.5 h-3.5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="w-full">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                URL de Foto de Perfil (Opcional)
              </label>
              <input
                type="url"
                placeholder="https://ejemplo.com/mi-foto.jpg"
                value={fotoUrl}
                onChange={(e) => setFotoUrl(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>

          {/* FICHA RESUMEN ROL Y ID */}
          <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">ID Usuario</span>
              <span className="font-mono font-bold text-slate-800">{currentUser.usuarioId}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Rol Asignado</span>
              <span className="inline-block px-2 py-0.5 bg-teal-100 text-teal-900 font-bold text-[10px] rounded-md border border-teal-200">
                {currentUser.rol}
              </span>
            </div>
          </div>

          {/* NOMBRE COMPLETO */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Nombre Completo *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>

          {/* CORREO ELECTRÓNICO */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Correo Electrónico *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>

          {/* CONTRASEÑA */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Cambiar Contraseña *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
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

          {/* BOTONES ACCIÓN */}
          <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
            >
              Guardar Cambios
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
