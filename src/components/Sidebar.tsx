import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CreditCard,
  Receipt,
  UserCheck,
  FileCode2,
  PlusCircle,
  TrendingUp,
  Sparkles,
  ShieldAlert,
  Settings,
  X
} from 'lucide-react';
import { RolUsuario } from '../types';

export type TabType =
  | 'dashboard'
  | 'pacientes'
  | 'crm'
  | 'financiamiento'
  | 'pagos'
  | 'usuarios'
  | 'google-sheets'
  | 'configuracion';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  userRole: RolUsuario;
  onNewPatient: () => void;
  onNewPayment: () => void;
  onNewActivity: () => void;
  alarmsCount: number;
  isMobileOpen?: boolean;
  onCloseMobileMenu?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  userRole,
  onNewPatient,
  onNewPayment,
  onNewActivity,
  alarmsCount,
  isMobileOpen = false,
  onCloseMobileMenu
}) => {
  // Permisos según el Rol (RBAC)
  const isAllowed = (tab: TabType): boolean => {
    if (userRole === 'Administrador') return true;
    if (tab === 'configuracion') return userRole === 'Administrador';
    if (tab === 'google-sheets') return userRole === 'Administrador';
    if (tab === 'usuarios') return userRole === 'Administrador';
    if (tab === 'financiamiento') return userRole === 'Administrador' || userRole === 'Financiero';
    if (tab === 'pagos') return userRole === 'Administrador' || userRole === 'Financiero';
    if (tab === 'crm') return userRole === 'Administrador' || userRole === 'Asistente' || userRole === 'Médico';
    if (tab === 'pacientes') return true;
    if (tab === 'dashboard') return true;
    return true;
  };

  const navItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard Analítico', icon: LayoutDashboard },
    { id: 'pacientes' as TabType, label: 'Pacientes & Ficha 360°', icon: Users },
    { id: 'crm' as TabType, label: 'Agenda & Alarmas CRM', icon: CalendarCheck, badge: alarmsCount > 0 ? alarmsCount : undefined },
    { id: 'financiamiento' as TabType, label: 'Financiamiento Cirugías', icon: TrendingUp },
    { id: 'pagos' as TabType, label: 'Pagos & Recibos', icon: Receipt },
    { id: 'usuarios' as TabType, label: 'Gestión de Usuarios', icon: UserCheck },
    { id: 'configuracion' as TabType, label: 'Configuración', icon: Settings },
    { id: 'google-sheets' as TabType, label: 'Google Sheets (Code.gs)', icon: FileCode2 }
  ];

  const handleSelectTab = (tab: TabType) => {
    onTabChange(tab);
    if (onCloseMobileMenu) {
      onCloseMobileMenu();
    }
  };

  const content = (
    <div className="w-64 bg-white text-slate-700 flex flex-col h-full border-r border-slate-200 select-none">
      
      {/* BRANDING EN SIDEBAR */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h1 className="text-teal-700 font-serif italic text-2xl font-bold tracking-tight">Dr. Belleza</h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-0.5">Management System</p>
        </div>

        {onCloseMobileMenu && (
          <button
            onClick={onCloseMobileMenu}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* BOTONES RÁPIDOS DE ACCIÓN */}
      <div className="p-4 space-y-2 border-b border-slate-100">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNewPatient();
            if (onCloseMobileMenu) onCloseMobileMenu();
          }}
          className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold text-xs py-2.5 px-3 rounded-lg shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer relative z-10"
        >
          <PlusCircle className="w-4 h-4 shrink-0" />
          <span>+ Nuevo Paciente</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNewPayment();
              if (onCloseMobileMenu) onCloseMobileMenu();
            }}
            className="bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 border border-slate-200 font-medium text-[11px] py-2 px-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer relative z-10"
            title="Registrar Abono o Cargo"
          >
            <CreditCard className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Cobro</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNewActivity();
              if (onCloseMobileMenu) onCloseMobileMenu();
            }}
            className="bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 border border-slate-200 font-medium text-[11px] py-2 px-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer relative z-10"
            title="Agendar Alarma o Cita"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Alarma</span>
          </button>
        </div>
      </div>

      {/* MENÚ DE NAVEGACIÓN */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 px-3 py-2">
          Navegación
        </div>

        {navItems.map((item) => {
          const allowed = isAllowed(item.id);
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (!allowed) {
            return (
              <div
                key={item.id}
                className="flex items-center justify-between px-4 py-2.5 rounded-lg text-slate-400 text-xs cursor-not-allowed opacity-50"
                title={`Acceso no permitido para el rol ${userRole}`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-teal-50 text-teal-700 font-semibold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="bg-amber-100 text-amber-800 font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* FOOTER CLINIC INFO */}
      <div className="p-4 border-t border-slate-100 text-xs text-slate-500 shrink-0">
        <div className="flex items-center space-x-2 text-teal-700 font-medium mb-1">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Clínica Dr. Belleza</span>
        </div>
        <p className="text-[11px] leading-tight text-slate-400">Sistema Serverless con Google Sheets API</p>
      </div>

    </div>
  );

  return (
    <>
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden lg:flex shrink-0 min-h-[calc(100vh-4rem)]">
        {content}
      </aside>

      {/* SIDEBAR MÓVIL (DRAWER DESLIZANTE CON TELÓN DE FONDO) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* TELÓN DE FONDO OSCURO */}
          <div
            onClick={onCloseMobileMenu}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          {/* DRAWER LATERAL */}
          <div className="relative z-10 w-64 max-w-[80vw] bg-white h-full shadow-2xl animate-in slide-in-from-left duration-250">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
