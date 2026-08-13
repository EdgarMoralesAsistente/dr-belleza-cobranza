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
  CalendarDays,
  ExternalLink,
  DollarSign,
  RotateCcw,
  UserCheck,
  Sparkles,
  Search
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
  const [dateFilterMode, setDateFilterMode] = useState<'Todos' | 'Hoy' | 'Semana' | 'FechaEspecifica'>('Todos');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const todayStr = new Date().toISOString().split('T')[0];

  const getEndOfWeekDateStr = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    const sunday = new Date(today);
    sunday.setDate(today.getDate() + daysUntilSunday);
    return sunday.toISOString().split('T')[0];
  };
  const endOfWeekStr = getEndOfWeekDateStr();

  const filteredActividades = actividades.filter(a => {
    let matchesType = true;
    if (filterType === 'Cobros') {
      matchesType = a.descripcion.includes('Cobro de Cuota') || a.tipoActividad === 'Recordatorio de Pago';
    } else if (filterType === 'Reintegros') {
      matchesType = a.descripcion.includes('Reintegro') || a.descripcion.includes('Devolución');
    } else if (filterType === 'Citas') {
      matchesType = a.tipoActividad === 'Cita' || a.descripcion.includes('Intervención') || a.descripcion.includes('Quirúrgica');
    } else if (filterType === 'Llamadas') {
      matchesType = a.tipoActividad === 'Llamada' || a.tipoActividad === 'Seguimiento Postquirúrgico';
    } else if (filterType !== 'Todos') {
      matchesType = a.tipoActividad === filterType;
    }

    const matchesStatus =
      filterStatus === 'Todos' ||
      (filterStatus === 'Pendientes' && a.estado === 'Pendiente') ||
      (filterStatus === 'Realizadas' && a.estado === 'Realizada');

    let matchesDate = true;
    if (dateFilterMode === 'Hoy') {
      matchesDate = a.fechaProgramada === todayStr;
    } else if (dateFilterMode === 'Semana') {
      matchesDate = a.fechaProgramada >= todayStr && a.fechaProgramada <= endOfWeekStr;
    } else if (dateFilterMode === 'FechaEspecifica') {
      matchesDate = a.fechaProgramada === selectedDate;
    }

    let matchesSearch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const paciente = pacientes.find(p => p.id === a.pacienteId);
      const pName = paciente ? paciente.nombre.toLowerCase() : '';
      matchesSearch =
        a.descripcion.toLowerCase().includes(q) ||
        a.tipoActividad.toLowerCase().includes(q) ||
        pName.includes(q) ||
        a.pacienteId.toLowerCase().includes(q);
    }

    return matchesType && matchesStatus && matchesDate && matchesSearch;
  });

  const alarmasHoyOVencidas = actividades.filter(
    a => a.alarma && a.estado === 'Pendiente' && a.fechaProgramada <= todayStr
  );

  const cobrosPendientesCount = actividades.filter(
    a => a.estado === 'Pendiente' && (a.descripcion.includes('Cobro') || a.tipoActividad === 'Recordatorio de Pago') && !a.descripcion.includes('Reintegro')
  ).length;

  const reintegrosPendientesCount = actividades.filter(
    a => a.estado === 'Pendiente' && (a.descripcion.includes('Reintegro') || a.descripcion.includes('Devolución'))
  ).length;

  const citasHoyCount = actividades.filter(
    a => a.fechaProgramada === todayStr && (a.tipoActividad === 'Cita' || a.descripcion.includes('Quirúrgica'))
  ).length;

  const toggleEstado = (act: ActividadCRM) => {
    const nuevoEstado = act.estado === 'Pendiente' ? 'Realizada' : 'Pendiente';
    onUpdateActivity({ ...act, estado: nuevoEstado });
  };

  const createGoogleCalendarUrl = (act: ActividadCRM, pacienteName: string) => {
    const dateParts = act.fechaProgramada.split('-');
    const timeParts = act.hora ? act.hora.split(':') : ['09', '00'];
    if (dateParts.length !== 3) return '#';
    const y = dateParts[0];
    const m = dateParts[1];
    const d = dateParts[2];
    const hour = timeParts[0].padStart(2, '0');
    const minute = timeParts[1] ? timeParts[1].padStart(2, '0') : '00';

    const startISO = `${y}${m}${d}T${hour}${minute}00`;
    const endHour = String(Math.min(23, parseInt(hour, 10) + 1)).padStart(2, '0');
    const endISO = `${y}${m}${d}T${endHour}${minute}00`;

    const title = `[Clínica Dr. Belleza] ${act.tipoActividad}: ${pacienteName}`;
    const details = `Actividad CRM - Clínica Dr. Belleza\nTipo: ${act.tipoActividad}\nPaciente: ${pacienteName}\nDetalles: ${act.descripcion}`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(details)}&dates=${startISO}/${endISO}`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* CABECERA PRINCIPAL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-serif italic font-bold text-teal-800 tracking-tight">Agenda & Alarmas CRM</h1>
            <span className="bg-teal-100 text-teal-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center">
              <Sparkles className="w-3 h-3 mr-1 text-teal-600" /> Sincronización Automática
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Programación diaria de cobros de financiamiento, reintegros programados, citas quirúrgicas y seguimiento CRM.
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

      {/* METRICAS Y KPIs RESUMEN DIARIO */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Alarmas para Hoy</span>
            <span className="text-lg font-bold text-slate-900">{alarmasHoyOVencidas.length}</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Cobros Pendientes</span>
            <span className="text-lg font-bold text-emerald-700">{cobrosPendientesCount}</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Reintegros por Hacer</span>
            <span className="text-lg font-bold text-amber-700">{reintegrosPendientesCount}</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Citas de Hoy</span>
            <span className="text-lg font-bold text-purple-800">{citasHoyCount}</span>
          </div>
        </div>
      </div>

      {/* BANNER DE ALERTAS REQUERIDAS */}
      {alarmasHoyOVencidas.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 animate-pulse text-amber-600" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Gestión Requerida para Hoy</h4>
              <p className="text-xs text-amber-800 font-medium">
                Tiene {alarmasHoyOVencidas.length} gestión(es) o cobro(s) agendado(s) para la fecha actual que requieren atención.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setDateFilterMode('Hoy');
              setFilterStatus('Pendientes');
            }}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg cursor-pointer transition-colors shrink-0"
          >
            Ver Solo Hoy
          </button>
        </div>
      )}

      {/* SUB-PESTAÑAS (ALARMAS / KANBAN / CALENDARIO) */}
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
          <span>Agenda & Alarmas Diarias</span>
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
          <span>Calendario Mensual & Google Calendar</span>
        </button>
      </div>

      {/* VISTA 1: ALARMAS Y AGENDA */}
      {activeSubTab === 'alarmas' && (
        <div className="space-y-6">
          
          {/* BARRA DE FILTROS DE FECHA Y BUSCADOR */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            
            {/* FILTROS TEMPORALES Y BUSCADOR */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              
              {/* SELECTOR DE MODO DE FECHA */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg w-full md:w-auto">
                <button
                  onClick={() => setDateFilterMode('Todos')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    dateFilterMode === 'Todos' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todas las Fechas
                </button>

                <button
                  onClick={() => setDateFilterMode('Hoy')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    dateFilterMode === 'Hoy' ? 'bg-teal-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Hoy ({todayStr})
                </button>

                <button
                  onClick={() => setDateFilterMode('Semana')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    dateFilterMode === 'Semana' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Esta Semana
                </button>

                <button
                  onClick={() => setDateFilterMode('FechaEspecifica')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    dateFilterMode === 'FechaEspecifica' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Por Fecha
                </button>
              </div>

              {/* BÚSQUEDA Y ESTADO */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                {dateFilterMode === 'FechaEspecifica' && (
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500"
                  />
                )}

                <div className="relative flex-1 md:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Buscar por paciente, cédula o concepto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

            </div>

            {/* SEGUNDA FILA DE FILTROS: TIPO Y ESTADO */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
              
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Estado:</span>
                {['Pendientes', 'Realizadas', 'Todos'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      filterStatus === st
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Todos">Todos los Eventos</option>
                  <option value="Cobros">🔔 Cobros de Cuotas</option>
                  <option value="Reintegros">🚨 Reintegros Paciente</option>
                  <option value="Citas">🏥 Citas & Cirugías</option>
                  <option value="Llamadas">📞 Llamadas de Seguimiento</option>
                  <option value="Evaluación">📌 Evaluaciones Médicas</option>
                </select>
              </div>

            </div>

          </div>

          {/* LISTA DE ACTIVIDADES Y EVENTOS */}
          <div className="space-y-3">
            {filteredActividades.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400 text-xs shadow-2xs">
                No se encontraron eventos o actividades CRM con los criterios seleccionados.
              </div>
            ) : (
              filteredActividades.map((act) => {
                const paciente = pacientes.find(p => p.id === act.pacienteId);
                const isOverdue = act.estado === 'Pendiente' && act.fechaProgramada <= todayStr;
                const isRefund = act.descripcion.includes('Reintegro') || act.descripcion.includes('Devolución');
                const isCobro = act.descripcion.includes('Cobro de Cuota') || act.tipoActividad === 'Recordatorio de Pago';
                const isSurgery = act.tipoActividad === 'Cita' || act.descripcion.includes('Quirúrgica');

                return (
                  <div
                    key={act.actividadId}
                    className={`bg-white p-4 sm:p-5 rounded-xl border shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isRefund
                        ? 'border-amber-200 bg-amber-50/10 hover:border-amber-400'
                        : isCobro
                        ? 'border-teal-200 bg-teal-50/10 hover:border-teal-400'
                        : isOverdue
                        ? 'border-rose-300 bg-rose-50/20'
                        : 'border-slate-200 hover:border-slate-300'
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
                          
                          {/* INSIGNIAS VISUALES DIFERENCIADAS */}
                          {isRefund ? (
                            <span className="font-bold text-[10px] text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md flex items-center">
                              <RotateCcw className="w-3 h-3 mr-1 text-amber-700" /> Reintegro Paciente
                            </span>
                          ) : isCobro ? (
                            <span className="font-bold text-[10px] text-emerald-900 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md flex items-center">
                              <DollarSign className="w-3 h-3 mr-1 text-emerald-700" /> Cobro Plan Financiero
                            </span>
                          ) : isSurgery ? (
                            <span className="font-bold text-[10px] text-purple-900 bg-purple-100 border border-purple-300 px-2 py-0.5 rounded-md flex items-center">
                              <UserCheck className="w-3 h-3 mr-1 text-purple-700" /> Cita / Cirugía
                            </span>
                          ) : (
                            <span className="font-semibold text-[11px] text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md">
                              {act.tipoActividad}
                            </span>
                          )}

                          <span className="text-xs text-slate-500 flex items-center font-semibold">
                            <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                            {act.fechaProgramada} - {act.hora}
                          </span>

                          {act.alarma && act.estado === 'Pendiente' && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full flex items-center">
                              <AlertTriangle className="w-3 h-3 mr-0.5" /> Alarma
                            </span>
                          )}
                        </div>

                        <p className={`text-xs ${act.estado === 'Realizada' ? 'line-through text-slate-400' : 'text-slate-800 font-semibold'}`}>
                          {act.descripcion}
                        </p>

                        <div className="text-[11px] text-slate-500 pt-0.5 flex items-center space-x-1">
                          <span>Paciente:</span>
                          <button
                            onClick={() => onSelectPatient(act.pacienteId)}
                            className="font-bold text-teal-700 hover:underline cursor-pointer flex items-center"
                          >
                            <User className="w-3 h-3 mr-1 text-teal-600" />
                            <span>{paciente?.nombre || act.pacienteId}</span>
                            {paciente?.cedula && <span className="ml-1 text-[10px] text-slate-400 font-mono">(C.I. {paciente.cedula})</span>}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                      <a
                        href={createGoogleCalendarUrl(act, paciente?.nombre || act.pacienteId)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 font-semibold text-xs rounded-lg transition-colors cursor-pointer border border-slate-200 flex items-center space-x-1"
                        title="Agendar en Google Calendar"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-teal-600" />
                        <span className="hidden sm:inline">GCalendar</span>
                      </a>

                      <button
                        onClick={() => onSelectPatient(act.pacienteId)}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-2xs"
                      >
                        Ficha 360°
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

