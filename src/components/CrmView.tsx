import React, { useState } from 'react';
import {
  CalendarCheck,
  Clock,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  User,
  Calendar,
  Filter,
  Check,
  LayoutGrid,
  ListFilter,
  CalendarDays
} from 'lucide-react';
import { ActividadCRM, Paciente, FinanciamientoCirugia, Pago } from '../types';
import { CrmKanbanView } from './crm/CrmKanbanView';
import { CrmCalendarView } from './crm/CrmCalendarView';

interface CrmViewProps {
  actividades: ActividadCRM[];
  pacientes: Paciente[];
  financiamientos?: FinanciamientoCirugia[];
  pagos?: Pago[];
  onNewActivity: () => void;
  onUpdateActivity: (actividad: ActividadCRM) => void;
  onUpdatePatient: (paciente: Paciente) => void;
  onSelectPatient: (pacienteId: string) => void;
  onNewPatient?: () => void;
  onNewActivityForPatient?: (paciente: Paciente) => void;
  onNewPaymentForPatient?: (paciente: Paciente) => void;
}

export const CrmView: React.FC<CrmViewProps> = ({
  actividades,
  pacientes,
  financiamientos = [],
  pagos = [],
  onNewActivity,
  onUpdateActivity,
  onUpdatePatient,
  onSelectPatient,
  onNewPatient,
  onNewActivityForPatient,
  onNewPaymentForPatient
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'alarmas' | 'kanban' | 'calendario'>('alarmas');
  const [filterType, setFilterType] = useState<string>('Todos');
  const [filterStatus, setFilterStatus] = useState<string>('Pendientes');

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredActividades = actividades.filter(a => {
    const matchesType = filterType === 'Todos' || a.tipoActividad === filterType;
    const matchesStatus =
      filterStatus === 'Todos' ||
      (filterStatus === 'Pendientes' && a.estado === 'Pendiente') ||
      (filterStatus === 'Realizadas' && a.estado === 'Realizada');

    return matchesType && matchesStatus;
  });

  const alarmasHoyOVencidas = actividades.filter(
    a => a.alarma && a.estado === 'Pendiente' && a.fechaProgramada <= todayStr
  );

  const toggleEstado = (act: ActividadCRM) => {
    const nuevoEstado = act.estado === 'Pendiente' ? 'Realizada' : 'Pendiente';
    onUpdateActivity({ ...act, estado: nuevoEstado });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif italic font-bold text-teal-700 tracking-tight">Agenda & Alarmas CRM</h1>
          <p className="text-xs text-slate-500 mt-1">
            Control de citas pre-quirúrgicas, llamadas de cobro, seguimiento postoperatorio y Google Calendar.
          </p>
        </div>

        <button
          onClick={onNewActivity}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg shadow-2xs flex items-center justify-center space-x-2 transition-all cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Agendar Actividad</span>
        </button>
      </div>

      {/* BANNER DE ALERTAS VENCIDAS */}
      {alarmasHoyOVencidas.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Alarmas CRM Requeridas para Hoy</h4>
              <p className="text-xs text-amber-700">
                Tiene {alarmasHoyOVencidas.length} actividad(es) agendada(s) que requieren acción inmediata.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* NAVEGACIÓN SUB-PESTAÑAS (ALARMAS / KANBAN / CALENDARIO) */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-0">
        <button
          onClick={() => setActiveSubTab('alarmas')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all flex items-center space-x-2 cursor-pointer ${
            activeSubTab === 'alarmas'
              ? 'bg-white text-teal-700 border-t-2 border-x border-teal-600 border-b-white -mb-px font-bold shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ListFilter className="w-4 h-4" />
          <span>Alarmas & Lista</span>
          {alarmasHoyOVencidas.length > 0 && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {alarmasHoyOVencidas.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('kanban')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all flex items-center space-x-2 cursor-pointer ${
            activeSubTab === 'kanban'
              ? 'bg-white text-teal-700 border-t-2 border-x border-teal-600 border-b-white -mb-px font-bold shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Tablero Kanban</span>
        </button>

        <button
          onClick={() => setActiveSubTab('calendario')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all flex items-center space-x-2 cursor-pointer ${
            activeSubTab === 'calendario'
              ? 'bg-white text-teal-700 border-t-2 border-x border-teal-600 border-b-white -mb-px font-bold shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Calendario & Google Calendar</span>
        </button>
      </div>

      {/* VISTA 1: ALARMAS Y LISTA */}
      {activeSubTab === 'alarmas' && (
        <div className="space-y-6">
          {/* FILTROS DE NAVEGACIÓN */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex flex-wrap items-center gap-2">
              {['Pendientes', 'Realizadas', 'Todos'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    filterStatus === st
                      ? 'bg-teal-700 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-700"
              >
                <option value="Todos">Todos los Tipos</option>
                <option value="Llamada">Llamada</option>
                <option value="Cita">Cita</option>
                <option value="Recordatorio de Pago">Recordatorio de Pago</option>
                <option value="Seguimiento Postquirúrgico">Seguimiento Postquirúrgico</option>
                <option value="Evaluación">Evaluación Médica</option>
              </select>
            </div>
          </div>

          {/* LISTA DE ACTIVIDADES */}
          <div className="space-y-3">
            {filteredActividades.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-lg border border-slate-200 text-slate-400 text-xs shadow-2xs">
                No se encontraron actividades CRM con el filtro seleccionado.
              </div>
            ) : (
              filteredActividades.map((act) => {
                const paciente = pacientes.find(p => p.id === act.pacienteId);
                const isOverdue = act.estado === 'Pendiente' && act.fechaProgramada <= todayStr;

                return (
                  <div
                    key={act.actividadId}
                    className={`bg-white p-4 sm:p-5 rounded-lg border shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isOverdue ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <button
                        onClick={() => toggleEstado(act)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer shrink-0 mt-0.5 ${
                          act.estado === 'Realizada'
                            ? 'bg-teal-600 border-teal-600 text-white'
                            : 'border-slate-300 hover:border-teal-500'
                        }`}
                        title="Marcar como realizada / pendiente"
                      >
                        {act.estado === 'Realizada' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="font-semibold text-[11px] text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md">
                            {act.tipoActividad}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center font-medium">
                            <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                            {act.fechaProgramada} - {act.hora}
                          </span>
                          {act.alarma && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full flex items-center">
                              <AlertTriangle className="w-3 h-3 mr-0.5" /> Alarma
                            </span>
                          )}
                        </div>

                        <p className={`text-xs ${act.estado === 'Realizada' ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
                          {act.descripcion}
                        </p>

                        <div className="text-[11px] text-slate-400 pt-0.5">
                          Paciente: <button onClick={() => onSelectPatient(act.pacienteId)} className="font-semibold text-teal-700 hover:underline cursor-pointer">{paciente?.nombre || act.pacienteId}</button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => onSelectPatient(act.pacienteId)}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 font-semibold text-xs rounded-lg transition-colors cursor-pointer border border-slate-200"
                      >
                        Ficha Paciente
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VISTA 2: TABLERO KANBAN */}
      {activeSubTab === 'kanban' && (
        <CrmKanbanView
          actividades={actividades}
          pacientes={pacientes}
          financiamientos={financiamientos}
          pagos={pagos}
          onUpdateActivity={onUpdateActivity}
          onUpdatePatient={onUpdatePatient}
          onSelectPatient={onSelectPatient}
          onNewActivity={onNewActivity}
          onNewPatient={onNewPatient}
          onNewActivityForPatient={onNewActivityForPatient}
          onNewPaymentForPatient={onNewPaymentForPatient}
        />
      )}

      {/* VISTA 3: CALENDARIO & GOOGLE CALENDAR */}
      {activeSubTab === 'calendario' && (
        <CrmCalendarView
          actividades={actividades}
          pacientes={pacientes}
          onUpdateActivity={onUpdateActivity}
          onSelectPatient={onSelectPatient}
          onNewActivity={onNewActivity}
        />
      )}

    </div>
  );
};

