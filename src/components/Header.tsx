import React, { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  CheckCircle2,
  AlertTriangle,
  User,
  Shield,
  Clock,
  Sparkles,
  Database,
  ExternalLink,
  ChevronDown,
  Menu,
  X,
  FileText
} from 'lucide-react';
import { Usuario, ActividadCRM, RolUsuario } from '../types';
import { StorageService } from '../services/storageService';

interface HeaderProps {
  currentUser: Usuario;
  onUserChange: (user: Usuario) => void;
  onOpenGasConfig: () => void;
  onSelectPatientByQuery?: (query: string) => void;
  actividades: ActividadCRM[];
  onToggleMobileMenu?: () => void;
  onOpenPresentationModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onUserChange,
  onOpenGasConfig,
  onSelectPatientByQuery,
  actividades,
  onToggleMobileMenu,
  onOpenPresentationModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAlarmsDropdown, setShowAlarmsDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [usersList, setUsersList] = useState<Usuario[]>([]);

  useEffect(() => {
    setUsersList(StorageService.getUsuarios());
  }, []);

  // Alertas activas para hoy o vencidas
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingAlarms = actividades.filter(
    a => a.alarma && a.estado === 'Pendiente' && a.fechaProgramada <= todayStr
  );

  const gasUrl = StorageService.getGasUrl();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSelectPatientByQuery) {
      onSelectPatientByQuery(searchQuery.trim());
      setSearchQuery('');
    }
  };

  const getRoleBadgeColor = (rol: RolUsuario) => {
    switch (rol) {
      case 'Administrador': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Financiero': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Médico': return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Asistente': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* BOTÓN HAMBURGUESA MÓVIL + LOGO */}
          <div className="flex items-center space-x-2.5 shrink-0">
            {onToggleMobileMenu && (
              <button
                onClick={onToggleMobileMenu}
                className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                title="Abrir menú principal"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif italic font-bold text-teal-700 tracking-tight text-lg sm:text-xl">Dr. Belleza</span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest bg-teal-50 text-teal-700 border border-teal-100 px-1.5 sm:px-2 py-0.5 rounded-full">
                  Salud & Estética
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Gestión Médica & Financiamiento Quirúrgico</p>
            </div>
          </div>

          {/* BUSCADOR DESKTOPS */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center bg-slate-100 rounded-full px-4 py-1.5 focus-within:ring-2 focus-within:ring-teal-500/20">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Buscar paciente por nombre o cédula..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden ml-2 w-full font-medium"
              />
              {searchQuery && (
                <button
                  type="submit"
                  className="px-2.5 py-0.5 text-xs font-semibold text-teal-700 bg-teal-50 rounded-full hover:bg-teal-100 transition-colors"
                >
                  Buscar
                </button>
              )}
            </form>
          </div>

          {/* DERECHA: STATUS APPS SCRIPT, LUPA MÓVIL, ALERTAS Y USUARIOS */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            
            {/* BOTÓN LUPA MÓVIL */}
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Buscar paciente"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* BOTÓN INFORME EJECUTIVO PDF PARA DIRECCIÓN */}
            {onOpenPresentationModal && (
              <button
                onClick={onOpenPresentationModal}
                className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100 font-semibold text-xs transition-all cursor-pointer shadow-2xs"
                title="Ver e Imprimir Informe Ejecutivo en PDF para la Dirección"
              >
                <FileText className="w-3.5 h-3.5 text-teal-600" />
                <span className="hidden xl:inline">Informe PDF</span>
              </button>
            )}

            {/* GOOGLE SHEETS SYNC STATUS PILL */}
            <button
              onClick={onOpenGasConfig}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                gasUrl
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              }`}
              title="Configuración e Integración con Google Sheets"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {gasUrl ? 'Google Sheets Conectado' : 'Conectar Sheets'}
              </span>
              <span className={`w-2 h-2 rounded-full ${gasUrl ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            </button>

            {/* NOTIFICACIONES Y ALARMAS CRM */}
            <div className="relative">
              <button
                onClick={() => setShowAlarmsDropdown(!showAlarmsDropdown)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Alarmas y Notificaciones CRM"
              >
                <Bell className="w-5 h-5" />
                {pendingAlarms.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-xs">
                    {pendingAlarms.length}
                  </span>
                )}
              </button>

              {/* DROPDOWN DE ALARMAS */}
              {showAlarmsDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className="font-semibold text-sm text-slate-800">Alarmas CRM y Cobros</span>
                    </div>
                    <span className="text-xs bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded-full">
                      {pendingAlarms.length} pendientes
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {pendingAlarms.length === 0 ? (
                      <div className="py-8 text-center text-slate-500 text-xs flex flex-col items-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2 stroke-[1.5]" />
                        <span>No hay alarmas pendientes para hoy.</span>
                      </div>
                    ) : (
                      pendingAlarms.map((a) => (
                        <div key={a.actividadId} className="p-3 hover:bg-slate-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <span className="text-xs font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                              {a.tipoActividad}
                            </span>
                            <span className="text-[11px] text-rose-600 font-medium flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {a.fechaProgramada} {a.hora}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">{a.descripcion}</p>
                          <div className="text-[11px] text-teal-700 font-medium mt-1">
                            Paciente ID: {a.pacienteId}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* USUARIO ACTIVO Y RBAC SELECTOR */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 border border-slate-200 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center border border-teal-200">
                  {currentUser.nombre.substring(0, 2).toUpperCase()}
                </div>
                <div className="hidden lg:block">
                  <div className="text-xs font-semibold text-slate-800 leading-tight">
                    {currentUser.nombre}
                  </div>
                  <span className={`inline-block text-[10px] font-medium border px-1.5 py-0.2 rounded-md ${getRoleBadgeColor(currentUser.rol)}`}>
                    {currentUser.rol}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* DROPDOWN DE CAMBIO DE USUARIO (SIMULACIÓN RBAC) */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cambiar Perfil (RBAC Demo)</p>
                    <p className="text-xs text-slate-600 mt-0.5">Rol Actual: <strong className="text-slate-900">{currentUser.rol}</strong></p>
                  </div>
                  <div className="py-1">
                    {usersList.map((u) => (
                      <button
                        key={u.usuarioId}
                        onClick={() => {
                          onUserChange(u);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-teal-50 transition-colors ${
                          u.usuarioId === currentUser.usuarioId ? 'bg-teal-50/80 font-semibold text-teal-900' : 'text-slate-700'
                        }`}
                      >
                        <div>
                          <div>{u.nombre}</div>
                          <div className="text-[10px] text-slate-500">{u.email}</div>
                        </div>
                        <span className={`text-[10px] border px-1.5 py-0.5 rounded-md ${getRoleBadgeColor(u.rol)}`}>
                          {u.rol}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* BUSCADOR DESPLEGABLE MÓVIL */}
        {showMobileSearch && (
          <div className="md:hidden pb-3 pt-1 border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
            <form onSubmit={(e) => {
              handleSearchSubmit(e);
              setShowMobileSearch(false);
            }} className="relative flex items-center bg-slate-100 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Buscar paciente por nombre o cédula..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden ml-2 w-full font-medium"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-1 text-xs font-semibold text-white bg-teal-600 rounded-lg shrink-0 ml-1"
              >
                Buscar
              </button>
            </form>
          </div>
        )}

      </div>
    </header>
  );
};
