import React, { useState } from 'react';
import {
  UserCheck,
  PlusCircle,
  Shield,
  Edit2,
  X,
  Check,
  Trash2,
  Plus,
  Settings2,
  ChevronDown,
  ChevronUp,
  Lock,
  ShieldAlert
} from 'lucide-react';
import { Usuario, RolUsuario } from '../types';
import { StorageService } from '../services/storageService';

interface UsersViewProps {
  usuarios: Usuario[];
  currentUser: Usuario;
  onNewUser: () => void;
  onUpdateUser: (usuario: Usuario) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  usuarios,
  currentUser,
  onNewUser,
  onUpdateUser
}) => {
  // Verificación de acceso para Rol Administrador
  if (currentUser.rol !== 'Administrador') {
    return (
      <div className="p-8 max-w-2xl mx-auto my-12 text-center space-y-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Acceso Restringido - Gestión de Usuarios</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          El módulo de <strong>Gestión de Usuarios</strong> está reservado exclusivamente para personal con el rol de <strong className="text-slate-900">Administrador</strong>.
        </p>
        <div className="inline-flex items-center space-x-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-xs font-semibold">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
          <span>Tu rol actual es: <strong>{currentUser.rol}</strong></span>
        </div>
      </div>
    );
  }

  // Estados del módulo
  const [availableRoles, setAvailableRoles] = useState<string[]>(StorageService.getUserRoles());
  
  // Estado para Edición de Usuario
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRol, setEditRol] = useState<RolUsuario>('Asistente');
  const [editEstatus, setEditEstatus] = useState<'Activo' | 'Inactivo'>('Activo');

  // Estado para Gestión de Roles
  const [showRoleManager, setShowRoleManager] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [editingRoleIndex, setEditingRoleIndex] = useState<number | null>(null);
  const [editingRoleText, setEditingRoleText] = useState('');

  const handleStartEdit = (user: Usuario) => {
    setEditingUser(user);
    setEditNombre(user.nombre);
    setEditEmail(user.email);
    setEditPassword(user.passwordHash || '');
    setEditRol(user.rol);
    setEditEstatus(user.estatus);
    setShowRoleManager(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editNombre.trim() || !editEmail.trim() || !editPassword.trim()) return;

    const updated: Usuario = {
      ...editingUser,
      nombre: editNombre.trim(),
      email: editEmail.trim(),
      passwordHash: editPassword.trim(),
      rol: editRol,
      estatus: editEstatus
    };

    onUpdateUser(updated);
    setEditingUser(null);
  };

  // HANDLERS GESTIÓN DE ROLES
  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newRoleName.trim();
    if (!clean) return;

    if (availableRoles.some(r => r.toLowerCase() === clean.toLowerCase())) {
      alert(`El rol "${clean}" ya existe en el sistema.`);
      return;
    }

    const updated = [...availableRoles, clean];
    setAvailableRoles(updated);
    StorageService.saveUserRoles(updated);
    setNewRoleName('');
    setEditRol(clean);
  };

  const handleStartEditRole = (index: number, currentName: string) => {
    setEditingRoleIndex(index);
    setEditingRoleText(currentName);
  };

  const handleSaveEditRole = (index: number, oldName: string) => {
    const clean = editingRoleText.trim();
    if (!clean) return;

    if (clean !== oldName && availableRoles.some(r => r.toLowerCase() === clean.toLowerCase())) {
      alert(`Ya existe otro rol con el nombre "${clean}".`);
      return;
    }

    const updated = [...availableRoles];
    updated[index] = clean;
    setAvailableRoles(updated);
    StorageService.saveUserRoles(updated);

    // Actualizar rol en usuarios existentes si poseían el nombre anterior
    const updatedUsers = usuarios.map(u => {
      if (u.rol === oldName) {
        return { ...u, rol: clean };
      }
      return u;
    });
    updatedUsers.forEach(u => onUpdateUser(u));

    if (editRol === oldName) {
      setEditRol(clean);
    }
    setEditingRoleIndex(null);
  };

  const handleDeleteRole = (roleToDelete: string) => {
    if (roleToDelete === 'Administrador') {
      alert('El rol "Administrador" es fundamental para el sistema y no se puede eliminar.');
      return;
    }

    const assignedCount = usuarios.filter(u => u.rol === roleToDelete).length;
    if (assignedCount > 0) {
      alert(`No se puede eliminar el rol "${roleToDelete}" porque está asignado a ${assignedCount} usuario(s). Reasigna a los usuarios antes de borrar el rol.`);
      return;
    }

    const updated = availableRoles.filter(r => r !== roleToDelete);
    setAvailableRoles(updated);
    StorageService.saveUserRoles(updated);

    if (editRol === roleToDelete) {
      setEditRol(availableRoles[0] || 'Asistente');
    }
  };

  const getRoleColor = (rol: RolUsuario) => {
    switch (rol) {
      case 'Administrador': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Financiero': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Médico': return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Asistente': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-teal-100 text-teal-800 border-teal-200';
    }
  };

  const toggleUserStatus = (u: Usuario) => {
    const nuevoStatus = u.estatus === 'Activo' ? 'Inactivo' : 'Activo';
    onUpdateUser({ ...u, estatus: nuevoStatus });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif italic font-bold text-teal-700 tracking-tight">Gestión de Usuarios & Roles</h1>
          <p className="text-xs text-slate-500 mt-1">
            Control de accesos y perfiles personalizados del sistema.
          </p>
        </div>

        <button
          onClick={onNewUser}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg shadow-2xs flex items-center justify-center space-x-2 transition-all cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Nuevo Usuario</span>
        </button>
      </div>

      {/* TABLA DE USUARIOS */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-6">Usuario ID / Nombre</th>
                <th className="py-3.5 px-6">Correo Electrónico</th>
                <th className="py-3.5 px-6">Rol Asignado</th>
                <th className="py-3.5 px-6">Fecha Creación</th>
                <th className="py-3.5 px-6">Estado</th>
                <th className="py-3.5 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {usuarios.map((u) => (
                <tr key={u.usuarioId} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-6 font-semibold text-slate-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                        {u.nombre.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div>{u.nombre}</div>
                        <span className="text-[10px] text-slate-400 font-normal">{u.usuarioId}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 text-slate-600 font-medium">
                    {u.email}
                  </td>
                  <td className="py-3.5 px-6">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getRoleColor(u.rol)}`}>
                      {u.rol}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-slate-400">
                    {u.fechaCreacion}
                  </td>
                  <td className="py-3.5 px-6">
                    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      u.estatus === 'Activo' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.estatus === 'Activo' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span>{u.estatus}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleStartEdit(u)}
                        className="px-2.5 py-1 text-teal-700 hover:bg-teal-50 border border-teal-200 rounded-lg cursor-pointer transition-colors flex items-center space-x-1 font-semibold text-[11px]"
                        title="Editar datos del usuario y sus roles"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={() => toggleUserStatus(u)}
                        disabled={u.usuarioId === currentUser.usuarioId}
                        className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200"
                      >
                        {u.estatus === 'Activo' ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL EDITAR USUARIO & GESTIÓN DE ROLES */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
            
            {/* HEADER */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif italic font-bold text-base text-white">Editar Usuario del Sistema</h3>
                  <p className="text-[11px] text-teal-300 font-mono">ID: {editingUser.usuarioId}</p>
                </div>
              </div>

              <button
                onClick={() => setEditingUser(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* FORMULARIO PRINCIPAL */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Correo Electrónico de Acceso *</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Contraseña de Acceso *</label>
                <input
                  type="text"
                  required
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-semibold text-slate-900"
                />
              </div>

              {/* SECCIÓN ROL DE ACCESO CON GESTOR INTEGRADO */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Rol de Acceso (RBAC) *
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowRoleManager(!showRoleManager)}
                    className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 flex items-center space-x-1 cursor-pointer bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded-md transition-colors"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    <span>{showRoleManager ? 'Ocultar Gestor de Roles' : 'Gestionar Roles (Editar/Crear/Eliminar)'}</span>
                    {showRoleManager ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                <select
                  value={editRol}
                  onChange={(e) => setEditRol(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-semibold text-slate-900"
                >
                  {availableRoles.map(role => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>

                {/* PANEL EXPANDIBLE: CREAR / EDITAR / ELIMINAR ROLES */}
                {showRoleManager && (
                  <div className="mt-3 p-3.5 bg-slate-50 rounded-xl border border-teal-200/80 space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                        <Settings2 className="w-3.5 h-3.5 text-teal-600" />
                        <span>Gestor Personalizado de Roles</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Total Roles: {availableRoles.length}
                      </span>
                    </div>

                    {/* FORMULARIO AGREGAR NUEVO ROL */}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Nombre del Nuevo Rol (Ej: Supervisor)..."
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-hidden focus:border-teal-600"
                      />
                      <button
                        type="button"
                        onClick={handleAddRole}
                        className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-lg cursor-pointer flex items-center space-x-1 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Añadir Rol</span>
                      </button>
                    </div>

                    {/* LISTA DE ROLES EXISTENTES CON OPCIÓN DE EDITAR Y BORRAR */}
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {availableRoles.map((role, idx) => {
                        const isEditingThisRole = editingRoleIndex === idx;

                        if (isEditingThisRole) {
                          return (
                            <div key={idx} className="flex items-center space-x-1.5 bg-white p-1.5 border border-teal-400 rounded-lg">
                              <input
                                type="text"
                                value={editingRoleText}
                                onChange={(e) => setEditingRoleText(e.target.value)}
                                className="flex-1 px-2 py-0.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveEditRole(idx, role)}
                                className="p-1 bg-teal-600 text-white rounded hover:bg-teal-700 cursor-pointer"
                                title="Guardar cambios del rol"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingRoleIndex(null)}
                                className="p-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 cursor-pointer"
                                title="Cancelar"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        }

                        return (
                          <div key={role} className="flex items-center justify-between bg-white px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs">
                            <span className="font-semibold text-slate-800">{role}</span>
                            
                            <div className="flex items-center space-x-1">
                              <button
                                type="button"
                                onClick={() => handleStartEditRole(idx, role)}
                                className="p-1 text-teal-700 hover:bg-teal-50 rounded cursor-pointer transition-colors"
                                title="Renombrar rol"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {role !== 'Administrador' && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRole(role)}
                                  className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                                  title="Eliminar rol"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Estatus de la Cuenta *</label>
                <select
                  value={editEstatus}
                  onChange={(e: any) => setEditEstatus(e.target.value)}
                  disabled={editingUser.usuarioId === currentUser.usuarioId}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-semibold text-slate-900 disabled:opacity-50"
                >
                  <option value="Activo">● Activo (Acceso Permitido)</option>
                  <option value="Inactivo">○ Inactivo (Acceso Suspendido)</option>
                </select>
                {editingUser.usuarioId === currentUser.usuarioId && (
                  <p className="text-[10px] text-amber-600 mt-1 font-medium">No puedes desactivar tu propia cuenta activa.</p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-2xs transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
