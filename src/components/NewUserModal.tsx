import React, { useState } from 'react';
import { X, Shield } from 'lucide-react';
import { Usuario, RolUsuario } from '../types';
import { StorageService } from '../services/storageService';

interface NewUserModalProps {
  onClose: () => void;
  onSave: (usuario: Usuario) => void;
}

export const NewUserModal: React.FC<NewUserModalProps> = ({ onClose, onSave }) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('clave123');
  const availableRoles = StorageService.getUserRoles();
  const [rol, setRol] = useState<RolUsuario>(availableRoles[0] || 'Asistente');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim() || !password.trim()) return;

    const count = Math.floor(100 + Math.random() * 900);
    const newUser: Usuario = {
      usuarioId: `USR-${count}`,
      nombre: nombre.trim(),
      email: email.trim(),
      passwordHash: password.trim(),
      rol,
      estatus: 'Activo',
      fechaCreacion: new Date().toISOString().split('T')[0]
    };

    onSave(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* HEADER */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif italic font-bold text-base text-white">Nuevo Usuario del Sistema</h3>
              <p className="text-[11px] text-slate-400">Google Sheets Base de Datos</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Nombre Completo *</label>
            <input
              type="text"
              required
              placeholder="Ej: Lcda. Carmen Fernández"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-semibold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Correo Electrónico de Acceso *</label>
            <input
              type="email"
              required
              placeholder="carmen@drbelleza.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-semibold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Contraseña Provisional *</label>
            <input
              type="text"
              required
              placeholder="Ej: clave123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-semibold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Rol de Acceso (RBAC) *</label>
            <select
              value={rol}
              onChange={(e: any) => setRol(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-semibold text-slate-900"
            >
              {availableRoles.map(roleOption => (
                <option key={roleOption} value={roleOption}>
                  {roleOption}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-2xs transition-all cursor-pointer"
            >
              Crear Usuario
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
