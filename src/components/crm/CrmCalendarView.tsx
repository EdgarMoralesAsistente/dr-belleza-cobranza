import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
  PlusCircle,
  Check,
  ExternalLink,
  Download,
  AlertTriangle,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { ActividadCRM, Paciente } from '../../types';

interface CrmCalendarViewProps {
  actividades: ActividadCRM[];
  pacientes: Paciente[];
  onUpdateActivity: (actividad: ActividadCRM) => void;
  onSelectPatient: (pacienteId: string) => void;
  onNewActivity: () => void;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WEEKDAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const CrmCalendarView: React.FC<CrmCalendarViewProps> = ({
  actividades,
  pacientes,
  onUpdateActivity,
  onSelectPatient,
  onNewActivity
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const todayStr = new Date().toISOString().split('T')[0];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Generate Calendar Days Matrix
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Get Monday-based offset (0 = Monday, 6 = Sunday)
  let startDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  const daysInMonth = lastDayOfMonth.getDate();

  // Days from previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const calendarCells = [];

  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i;
    const prevDate = new Date(year, month - 1, d);
    const dateStr = prevDate.toISOString().split('T')[0];
    calendarCells.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: false,
      dateObj: prevDate
    });
  }

  // Days in current month
  for (let d = 1; d <= daysInMonth; d++) {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(d).padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${dayStr}`;
    calendarCells.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: true,
      dateObj: new Date(year, month, d)
    });
  }

  // Next month padding
  const totalCellsSoFar = calendarCells.length;
  const remainingCells = (42 - totalCellsSoFar) % 7 === 0 ? 0 : 7 - (totalCellsSoFar % 7);
  for (let d = 1; d <= remainingCells; d++) {
    const nextDate = new Date(year, month + 1, d);
    const dateStr = nextDate.toISOString().split('T')[0];
    calendarCells.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: false,
      dateObj: nextDate
    });
  }

  // Group activities by dateStr
  const activitiesByDate: Record<string, ActividadCRM[]> = {};
  actividades.forEach(a => {
    if (!activitiesByDate[a.fechaProgramada]) {
      activitiesByDate[a.fechaProgramada] = [];
    }
    activitiesByDate[a.fechaProgramada].push(a);
  });

  const selectedDayActivities = activitiesByDate[selectedDateStr] || [];

  const toggleEstado = (act: ActividadCRM) => {
    const nuevoEstado = act.estado === 'Pendiente' ? 'Realizada' : 'Pendiente';
    onUpdateActivity({ ...act, estado: nuevoEstado });
  };

  // Google Calendar URL generator
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

  // Export .ics calendar file
  const handleExportIcs = () => {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Clinica Dr Belleza//CRM Agenda//ES\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n";

    actividades.forEach(act => {
      const paciente = pacientes.find(p => p.id === act.pacienteId);
      const pacienteName = paciente ? paciente.nombre : act.pacienteId;
      const dateParts = act.fechaProgramada.replace(/-/g, '');
      const timeParts = act.hora ? act.hora.replace(':', '') + '00' : '090000';
      const startDt = `${dateParts}T${timeParts}`;

      icsContent += "BEGIN:VEVENT\n";
      icsContent += `SUMMARY:[Clínica] ${act.tipoActividad} - ${pacienteName}\n`;
      icsContent += `DESCRIPTION:${act.descripcion.replace(/\n/g, ' ')}\n`;
      icsContent += `DTSTART:${startDt}\n`;
      icsContent += `DTEND:${startDt}\n`;
      icsContent += `STATUS:${act.estado === 'Realizada' ? 'CONFIRMED' : 'TENTATIVE'}\n`;
      icsContent += "END:VEVENT\n";
    });

    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `agenda_crm_clinica_${todayStr}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* BARRA SUPERIOR CON GOOGLE CALENDAR SYNC & NAVEGACIÓN DE MES */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* NAVEGACIÓN MES/AÑO */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            <button
              onClick={prevMonth}
              className="p-1.5 hover:bg-white text-slate-700 hover:text-slate-900 rounded-md transition-all cursor-pointer"
              title="Mes Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Hoy
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 hover:bg-white text-slate-700 hover:text-slate-900 rounded-md transition-all cursor-pointer"
              title="Mes Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-lg font-serif italic font-bold text-slate-900">
            {MONTH_NAMES[month]} {year}
          </h2>
        </div>

        {/* INTEGRACIÓN Y DESCARGA GOOGLE CALENDAR */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Google Calendar Sincronizado</span>
          </div>

          <button
            onClick={handleExportIcs}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer border border-slate-200"
            title="Exportar archivo iCal / Google Calendar"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Exportar iCal / ICS</span>
          </button>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL: CALENDARIO GRID + DETALLE DEL DÍA SELECCIONADO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* REJILLA DE CALENDARIO (COL 2 SPAN) */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          
          {/* ENCABEZADO DÍAS DE LA SEMANA */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center py-2.5">
            {WEEKDAY_NAMES.map(day => (
              <span key={day} className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {day}
              </span>
            ))}
          </div>

          {/* CELDA DÍAS */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
            {calendarCells.map((cell, idx) => {
              const dayActs = activitiesByDate[cell.dateStr] || [];
              const isToday = cell.dateStr === todayStr;
              const isSelected = cell.dateStr === selectedDateStr;

              return (
                <div
                  key={`${cell.dateStr}-${idx}`}
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`min-h-[85px] p-2 transition-all cursor-pointer flex flex-col justify-between ${
                    cell.isCurrentMonth ? 'bg-white hover:bg-teal-50/30' : 'bg-slate-50/50 text-slate-300'
                  } ${isSelected ? 'ring-2 ring-teal-600 z-10 bg-teal-50/40' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-teal-600 text-white'
                          : isSelected
                          ? 'bg-slate-900 text-white'
                          : cell.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-300'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {dayActs.length > 0 && (
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-1.5 py-0.2 rounded-full">
                        {dayActs.length}
                      </span>
                    )}
                  </div>

                  {/* EVENTOS PEEKS EN CELDA */}
                  <div className="space-y-1 mt-1">
                    {dayActs.slice(0, 2).map((act) => (
                      <div
                        key={act.actividadId}
                        className={`text-[9px] truncate px-1.5 py-0.5 rounded-xs font-semibold ${
                          act.estado === 'Realizada'
                            ? 'bg-slate-100 text-slate-400 line-through'
                            : act.alarma
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-teal-100 text-teal-900'
                        }`}
                      >
                        {act.hora} - {act.tipoActividad}
                      </div>
                    ))}
                    {dayActs.length > 2 && (
                      <div className="text-[9px] text-slate-400 font-bold px-1">
                        +{dayActs.length - 2} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DETALLE Y ACTIVIDADES DEL DÍA SELECCIONADO */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-teal-600 tracking-wider">Gestión del Día</span>
              <h3 className="text-sm font-bold text-slate-900">
                {selectedDateStr === todayStr ? 'Hoy' : ''} {selectedDateStr}
              </h3>
            </div>

            <button
              onClick={onNewActivity}
              className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg shadow-2xs flex items-center space-x-1 cursor-pointer transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Agendar</span>
            </button>
          </div>

          {selectedDayActivities.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
              No hay actividades CRM programadas para esta fecha.
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {selectedDayActivities.map((act) => {
                const paciente = pacientes.find(p => p.id === act.pacienteId);
                const pName = paciente ? paciente.nombre : act.pacienteId;

                return (
                  <div
                    key={act.actividadId}
                    className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2 hover:border-teal-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {act.tipoActividad}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1 text-slate-400" />
                        {act.hora}
                      </span>
                    </div>

                    <p className={`text-xs ${act.estado === 'Realizada' ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}`}>
                      {act.descripcion}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                      <button
                        onClick={() => onSelectPatient(act.pacienteId)}
                        className="font-bold text-teal-700 hover:underline cursor-pointer flex items-center truncate max-w-[140px]"
                      >
                        <User className="w-3 h-3 mr-1 text-teal-600 shrink-0" />
                        <span className="truncate">{pName}</span>
                      </button>

                      <div className="flex items-center space-x-1">
                        <a
                          href={createGoogleCalendarUrl(act, pName)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 text-[10px] font-semibold rounded-md transition-colors flex items-center space-x-1"
                          title="Sincronizar con Google Calendar"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>GCalendar</span>
                        </a>

                        <button
                          onClick={() => toggleEstado(act)}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            act.estado === 'Realizada'
                              ? 'bg-teal-600 text-white'
                              : 'bg-white border border-slate-200 text-slate-400 hover:text-teal-600'
                          }`}
                          title="Cambiar Estado"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
