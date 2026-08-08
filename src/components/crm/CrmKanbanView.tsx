import React, { useState } from 'react';
import {
  User,
  PlusCircle,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Phone,
  ChevronRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { Paciente, ActividadCRM, FinanciamientoCirugia, Pago } from '../../types';

interface CrmKanbanViewProps {
  pacientes: Paciente[];
  actividades: ActividadCRM[];
  financiamientos?: FinanciamientoCirugia[];
  pagos?: Pago[];
  onUpdatePatient: (paciente: Paciente) => void;
  onUpdateActivity?: (actividad: ActividadCRM) => void;
  onSelectPatient: (pacienteId: string) => void;
  onNewActivity?: () => void;
  onNewPatient?: () => void;
  onNewActivityForPatient?: (paciente: Paciente) => void;
  onNewPaymentForPatient?: (paciente: Paciente) => void;
}

export interface ColumnConfig {
  id: string;
  title: string;
  subtitle: string;
  defaultContactada: string;
  borderColor: string;
  bgColor: string;
  headerBg: string;
  dotColor: string;
  badgeBg: string;
  badgeText: string;
}

export const KANBAN_COLUMNS: ColumnConfig[] = [
  {
    id: 'contacto',
    title: '1. Contacto / Lead',
    subtitle: 'Primer contacto & WhatsApp',
    defaultContactada: 'Contactada WhatsApp',
    borderColor: 'border-sky-200',
    bgColor: 'bg-sky-50/40',
    headerBg: 'bg-sky-50/80',
    dotColor: 'bg-sky-500',
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-800'
  },
  {
    id: 'evaluacion',
    title: '2. Evaluación Médica',
    subtitle: 'Consulta de valoración',
    defaultContactada: 'Evaluación Médica Realizada',
    borderColor: 'border-teal-200',
    bgColor: 'bg-teal-50/40',
    headerBg: 'bg-teal-50/80',
    dotColor: 'bg-teal-500',
    badgeBg: 'bg-teal-100',
    badgeText: 'text-teal-800'
  },
  {
    id: 'financiamiento',
    title: '3. Plan Financiero',
    subtitle: 'Presupuesto y cuotas',
    defaultContactada: 'Atendida - En Plan Financiamiento',
    borderColor: 'border-purple-200',
    bgColor: 'bg-purple-50/40',
    headerBg: 'bg-purple-50/80',
    dotColor: 'bg-purple-500',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800'
  },
  {
    id: 'quirofano',
    title: '4. Agendado Quirófano',
    subtitle: 'Cirugía programada',
    defaultContactada: 'Agendado Quirófano',
    borderColor: 'border-amber-200',
    bgColor: 'bg-amber-50/40',
    headerBg: 'bg-amber-50/80',
    dotColor: 'bg-amber-500',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800'
  },
  {
    id: 'postquirurgico',
    title: '5. Postquirúrgico',
    subtitle: 'Controles & recuperadas',
    defaultContactada: 'Postquirúrgico',
    borderColor: 'border-emerald-200',
    bgColor: 'bg-emerald-50/40',
    headerBg: 'bg-emerald-50/80',
    dotColor: 'bg-emerald-500',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800'
  }
];

export function getPatientColumnId(paciente: Paciente): string {
  const status = (paciente.contactada || '').toLowerCase();
  if (
    status.includes('quirofano') ||
    status.includes('quirúrgico') ||
    status.includes('agendad') ||
    status.includes('cirugía programada')
  ) {
    return 'quirofano';
  }
  if (
    status.includes('postquirúrgico') ||
    status.includes('operada') ||
    status.includes('postop') ||
    status.includes('recuperada') ||
    status.includes('alta')
  ) {
    return 'postquirurgico';
  }
  if (
    status.includes('financiamiento') ||
    status.includes('plan') ||
    status.includes('cuota') ||
    status.includes('presupuesto') ||
    status.includes('abono') ||
    status.includes('recordatorio cuota')
  ) {
    return 'financiamiento';
  }
  if (
    status.includes('evaluación') ||
    status.includes('consulta') ||
    status.includes('valoración') ||
    status.includes('cita') ||
    status.includes('médica')
  ) {
    return 'evaluacion';
  }
  return 'contacto';
}

export const CrmKanbanView: React.FC<CrmKanbanViewProps> = ({
  pacientes,
  actividades,
  financiamientos = [],
  pagos = [],
  onUpdatePatient,
  onSelectPatient,
  onNewPatient,
  onNewActivityForPatient,
  onNewPaymentForPatient
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProcedure, setSelectedProcedure] = useState<string>('Todos');
  const [draggedPatientId, setDraggedPatientId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Procedimientos únicos para el filtro
  const procedimientosUnicos = Array.from(
    new Set(pacientes.map(p => p.procedimiento).filter(Boolean))
  );

  // Filtrado de pacientes
  const filteredPatients = pacientes.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      p.nombre.toLowerCase().includes(q) ||
      p.cedula.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.procedimiento.toLowerCase().includes(q) ||
      p.promocion.toLowerCase().includes(q);

    const matchesProcedure =
      selectedProcedure === 'Todos' || p.procedimiento === selectedProcedure;

    return matchesSearch && matchesProcedure;
  });

  // Mover paciente a otra columna (estatus)
  const handleMovePatientStatus = (paciente: Paciente, targetColId: string) => {
    const targetCol = KANBAN_COLUMNS.find(c => c.id === targetColId);
    if (!targetCol) return;

    const updatedPatient: Paciente = {
      ...paciente,
      contactada: targetCol.defaultContactada
    };
    onUpdatePatient(updatedPatient);
  };

  // Handlers para HTML5 Drag and Drop tipo Trello
  const handleDragStart = (e: React.DragEvent, pacienteId: string) => {
    setDraggedPatientId(pacienteId);
    e.dataTransfer.setData('text/plain', pacienteId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumnId !== colId) {
      setDragOverColumnId(colId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    if (dragOverColumnId === colId) {
      setDragOverColumnId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetColId: string) => {
    e.preventDefault();
    setDragOverColumnId(null);
    const patientId = e.dataTransfer.getData('text/plain') || draggedPatientId;
    if (!patientId) return;

    const paciente = pacientes.find(p => p.id === patientId);
    if (paciente) {
      handleMovePatientStatus(paciente, targetColId);
    }
    setDraggedPatientId(null);
  };

  return (
    <div className="space-y-6">
      
      {/* BARRA SUPERIOR DE FILTROS Y CONTROL */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
          {/* BUSCADOR */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Buscar por nombre, cédula, cirugía..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800 placeholder-slate-400 font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* FILTRO POR CIRUGÍA */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedProcedure}
              onChange={(e) => setSelectedProcedure(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 text-slate-700 font-medium"
            >
              <option value="Todos">Todas las Cirugías</option>
              {procedimientosUnicos.map(proc => (
                <option key={proc} value={proc}>{proc}</option>
              ))}
            </select>
          </div>
        </div>

        {/* MÉTRICAS & BOTÓN REGISTRAR PACIENTE */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end shrink-0">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Fichas Kanban</span>
            <p className="text-xs font-bold text-teal-700">{filteredPatients.length} paciente(s)</p>
          </div>

          {onNewPatient && (
            <button
              onClick={onNewPatient}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg shadow-2xs flex items-center space-x-1.5 transition-all cursor-pointer shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Nuevo Paciente</span>
            </button>
          )}
        </div>
      </div>

      {/* INSTRUCCIONES TRELLO */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-medium">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Arrastra y suelta las fichas de paciente entre columnas para cambiar de estatus, o usa los controles de cada tarjeta.</span>
        </div>
      </div>

      {/* CONTENEDOR DE COLUMNAS TRELLO */}
      <div className="flex overflow-x-auto gap-5 pb-6 pt-1 items-start w-full min-w-0 scroll-smooth">
        {KANBAN_COLUMNS.map((col, colIdx) => {
          const colPatients = filteredPatients.filter(
            p => getPatientColumnId(p) === col.id
          );

          const isDragTarget = dragOverColumnId === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={(e) => handleDragLeave(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`w-[320px] sm:w-[350px] shrink-0 rounded-xl border flex flex-col min-h-[550px] max-h-[78vh] transition-all duration-150 ${
                col.borderColor
              } ${col.bgColor} ${
                isDragTarget
                  ? 'ring-2 ring-teal-500 bg-teal-50/80 scale-[1.01] shadow-md'
                  : 'shadow-2xs'
              }`}
            >
              {/* ENCABEZADO DE LA COLUMNA TRELLO */}
              <div
                className={`p-3.5 border-b border-slate-200/80 rounded-t-xl ${col.headerBg} flex items-center justify-between sticky top-0 z-10 backdrop-blur-xs`}
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${col.dotColor} shrink-0`} />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-tight">
                      {col.title}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium">{col.subtitle}</p>
                  </div>
                </div>

                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.badgeBg} ${col.badgeText} shrink-0`}
                >
                  {colPatients.length}
                </span>
              </div>

              {/* LISTA DE FICHAS DE PACIENTES */}
              <div className="p-3 space-y-3 overflow-y-auto flex-1">
                {colPatients.length === 0 ? (
                  <div
                    className={`p-8 text-center text-slate-400 text-xs border border-dashed rounded-lg flex flex-col items-center justify-center space-y-1 my-2 ${
                      isDragTarget ? 'border-teal-400 bg-white/80' : 'border-slate-300'
                    }`}
                  >
                    <User className="w-5 h-5 text-slate-300 mb-1" />
                    <span className="font-semibold text-slate-500">Sin pacientes en este estatus</span>
                    <span className="text-[10px] text-slate-400">Arrastra una ficha aquí</span>
                  </div>
                ) : (
                  colPatients.map((paciente) => {
                    // Datos financieros del paciente
                    const finPlan = financiamientos.find(f => f.pacienteId === paciente.id);
                    const patientPagos = pagos.filter(
                      p => p.id === paciente.id || p.id === paciente.cedula || p.nombre.toLowerCase() === paciente.nombre.toLowerCase()
                    );
                    const totalAbonado = patientPagos.reduce((sum, p) => sum + (p.abono || 0), 0);

                    // Actividades CRM del paciente
                    const patientCRM = actividades.filter(a => a.pacienteId === paciente.id);
                    const pendingActivities = patientCRM.filter(a => a.estado === 'Pendiente');
                    const hasOverdueAlarm = pendingActivities.some(
                      a => a.alarma && a.fechaProgramada <= todayStr
                    );

                    return (
                      <div
                        key={paciente.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, paciente.id)}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-3 cursor-grab active:cursor-grabbing group hover:border-teal-300 relative"
                      >
                        {/* CABECERA TARJETA PACIENTE */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-teal-800 shadow-2xs">
                              {paciente.nombre.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <h4
                                onClick={() => onSelectPatient(paciente.id)}
                                className="text-xs font-bold text-slate-900 hover:text-teal-700 cursor-pointer truncate leading-tight transition-colors"
                              >
                                {paciente.nombre}
                              </h4>
                              <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 mt-0.5">
                                <span className="font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded-xs">
                                  {paciente.id}
                                </span>
                                <span>•</span>
                                <span className="truncate">{paciente.cedula}</span>
                              </div>
                            </div>
                          </div>

                          {/* ALERTA DE ALARMA PENDIENTE */}
                          {hasOverdueAlarm && (
                            <span className="p-1 bg-amber-100 text-amber-800 rounded-full shrink-0" title="Alarmas CRM pendientes para hoy">
                              <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                            </span>
                          )}
                        </div>

                        {/* DETALLE DE CIRUGÍA & CAMPAÑA */}
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150 space-y-1 text-xs">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-800">
                            <span className="truncate text-teal-800">{paciente.procedimiento}</span>
                          </div>
                          {paciente.promocion && (
                            <div className="text-[10px] text-slate-500 truncate flex items-center space-x-1">
                              <span className="text-slate-400">Origen:</span>
                              <span className="font-medium text-slate-700">{paciente.promocion}</span>
                            </div>
                          )}
                        </div>

                        {/* ESTADO FINANCIERO / SALDO */}
                        <div className="flex items-center justify-between text-[11px] pt-0.5">
                          {finPlan ? (
                            <div className="flex items-center space-x-1 text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md font-medium border border-purple-100 w-full justify-between">
                              <span className="text-[10px] uppercase font-bold text-purple-600">Plan Fin:</span>
                              <span className="font-bold text-purple-900">
                                ${finPlan.saldoPendiente.toLocaleString()} USD pend.
                              </span>
                            </div>
                          ) : totalAbonado > 0 ? (
                            <div className="flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium border border-emerald-100 w-full justify-between">
                              <span className="text-[10px] uppercase font-bold text-emerald-600">Abonos:</span>
                              <span className="font-bold text-emerald-900">
                                ${totalAbonado.toLocaleString()} USD rec.
                              </span>
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-400 font-medium">
                              Sin plan de pago registrado
                            </div>
                          )}
                        </div>

                        {/* ACTIVIDADES PENDIENTES */}
                        {pendingActivities.length > 0 && (
                          <div className="text-[10px] bg-slate-100/80 p-1.5 rounded-md flex items-center justify-between text-slate-600 font-medium">
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1 text-teal-600 shrink-0" />
                              {pendingActivities.length} gestión(es) CRM pend.
                            </span>
                            <span className="font-bold text-slate-700">
                              {pendingActivities[0].tipoActividad}
                            </span>
                          </div>
                        )}

                        {/* SELECTOR RÁPIDO Y MOVER DE COLUMNA */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                          {/* MOVER A COLUMNA ANTERIOR */}
                          <button
                            disabled={colIdx === 0}
                            onClick={() => handleMovePatientStatus(paciente, KANBAN_COLUMNS[colIdx - 1].id)}
                            className="p-1 rounded-md text-slate-400 hover:text-teal-700 hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer transition-colors"
                            title="Mover a etapa anterior"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>

                          {/* DESPLEGABLE DE CAMBIO DIRECTO DE ESTATUS */}
                          <select
                            value={col.id}
                            onChange={(e) => handleMovePatientStatus(paciente, e.target.value)}
                            className="px-2 py-1 text-[10px] bg-slate-100 border border-slate-200 rounded-md font-bold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-teal-500 cursor-pointer"
                          >
                            {KANBAN_COLUMNS.map(c => (
                              <option key={c.id} value={c.id}>
                                {c.title}
                              </option>
                            ))}
                          </select>

                          {/* MOVER A COLUMNA SIGUIENTE */}
                          <button
                            disabled={colIdx === KANBAN_COLUMNS.length - 1}
                            onClick={() => handleMovePatientStatus(paciente, KANBAN_COLUMNS[colIdx + 1].id)}
                            className="p-1 rounded-md text-slate-400 hover:text-teal-700 hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer transition-colors"
                            title="Mover a etapa siguiente"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* BOTONES DE ACCIÓN SOBRE LA FICHA */}
                        <div className="grid grid-cols-3 gap-1 pt-1 text-[10px] font-semibold">
                          <button
                            onClick={() => onSelectPatient(paciente.id)}
                            className="py-1 px-1 bg-teal-50 hover:bg-teal-600 text-teal-800 hover:text-white rounded-md border border-teal-200 transition-colors text-center cursor-pointer truncate"
                            title="Abrir Ficha 360°"
                          >
                            Ficha 360°
                          </button>

                          {onNewActivityForPatient ? (
                            <button
                              onClick={() => onNewActivityForPatient(paciente)}
                              className="py-1 px-1 bg-slate-50 hover:bg-slate-800 text-slate-700 hover:text-white rounded-md border border-slate-200 transition-colors text-center cursor-pointer truncate"
                              title="Agendar nueva actividad CRM"
                            >
                              + Cita/CRM
                            </button>
                          ) : (
                            <div />
                          )}

                          {onNewPaymentForPatient ? (
                            <button
                              onClick={() => onNewPaymentForPatient(paciente)}
                              className="py-1 px-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white rounded-md border border-emerald-200 transition-colors text-center cursor-pointer truncate"
                              title="Registrar abono de pago"
                            >
                              + Abono
                            </button>
                          ) : (
                            <div />
                          )}
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
