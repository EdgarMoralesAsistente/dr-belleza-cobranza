import React, { useState } from 'react';
import { X, Calendar, Clock, AlertTriangle, Search, User, Check, ChevronDown } from 'lucide-react';
import { ActividadCRM, Paciente, Usuario } from '../types';
import { StorageService } from '../services/storageService';

interface NewActivityModalProps {
  pacientes: Paciente[];
  currentUser: Usuario;
  preselectedPatient?: Paciente | null;
  onClose: () => void;
  onSave: (actividad: ActividadCRM) => void;
}

export const NewActivityModal: React.FC<NewActivityModalProps> = ({
  pacientes,
  currentUser,
  preselectedPatient,
  onClose,
  onSave
}) => {
  const [selectedPacienteId, setSelectedPacienteId] = useState(
    preselectedPatient ? preselectedPatient.id : (pacientes[0]?.id || '')
  );
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const activePatient = pacientes.find(p => p.id === selectedPacienteId);

  const [tipoActividad, setTipoActividad] = useState<ActividadCRM['tipoActividad']>('Recordatorio de Pago');
  const [descripcion, setDescripcion] = useState('');
  const [fechaProgramada, setFechaProgramada] = useState(new Date().toISOString().split('T')[0]);
  const [hora, setHora] = useState('10:00');
  const [alarma, setAlarma] = useState(true);

  const filteredPacientes = pacientes.filter(p => {
    if (!p) return false;
    if (!patientSearchQuery.trim()) return true;
    const q = patientSearchQuery.toLowerCase();
    return (
      (p.nombre || '').toLowerCase().includes(q) ||
      (p.id || '').toLowerCase().includes(q) ||
      (p.cedula && p.cedula.toLowerCase().includes(q)) ||
      (p.telefono && p.telefono.toLowerCase().includes(q))
    );
  });

  const handleSelectPatient = (paciente: Paciente) => {
    setSelectedPacienteId(paciente.id);
    setIsDropdownOpen(false);
    setPatientSearchQuery('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPacienteId || !descripcion.trim()) return;

    const newActivity: ActividadCRM = {
      actividadId: StorageService.generateActivityId(),
      pacienteId: selectedPacienteId,
      tipoActividad,
      descripcion: descripcion.trim(),
      fechaProgramada,
      hora,
      estado: 'Pendiente',
      alarma,
      responsableId: currentUser.usuarioId
    };

    onSave(newActivity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* HEADER */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif italic font-bold text-base text-white">Nueva Actividad CRM / Alarma</h3>
              <p className="text-[11px] text-slate-400">Google Sheets Base de Datos</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* BUSCADOR INTELIGENTE DE PACIENTES */}
          <div className="relative">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Buscar y Seleccionar Paciente *
            </label>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por Nombre, Cédula o Código (Ej: PAC-001)..."
                value={patientSearchQuery}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setPatientSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-medium text-slate-900"
              />
              {patientSearchQuery && (
                <button
                  type="button"
                  onClick={() => setPatientSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Tarjeta del Paciente Seleccionado */}
            {activePatient && (
              <div className="mt-2 bg-teal-50/80 border border-teal-200 rounded-lg p-2.5 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                      <span>{activePatient.nombre}</span>
                      <span className="text-[10px] bg-teal-100 text-teal-800 font-mono px-1.5 py-0.2 rounded-sm">{activePatient.id}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Cédula: {activePatient.cedula || 'N/A'} • Tel: {activePatient.telefono || 'N/A'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-900 bg-white border border-teal-200 px-2.5 py-1 rounded-md cursor-pointer flex items-center space-x-1 shadow-2xs"
                >
                  <span>{isDropdownOpen ? 'Cerrar' : 'Cambiar'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
            )}

            {/* Menú Desplegable con Resultados */}
            {isDropdownOpen && (
              <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100 animate-in fade-in duration-100">
                <div className="p-2 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex justify-between items-center sticky top-0 border-b border-slate-100">
                  <span>Resultados de Pacientes ({filteredPacientes.length})</span>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(false)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                {filteredPacientes.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No se encontraron pacientes con "{patientSearchQuery}"
                  </div>
                ) : (
                  filteredPacientes.map((p) => {
                    const isSelected = p.id === selectedPacienteId;

                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPatient(p)}
                        className={`w-full text-left p-2.5 transition-colors cursor-pointer flex items-center justify-between ${
                          isSelected ? 'bg-teal-50/90 text-teal-900 font-medium' : 'hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-xs flex items-center space-x-1.5">
                            <span>{p.nombre}</span>
                            <span className="text-[10px] font-mono text-slate-500">({p.id})</span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Cédula: {p.cedula || 'N/A'} • Teléfono: {p.telefono || 'N/A'}
                          </div>
                        </div>

                        {isSelected && (
                          <Check className="w-4 h-4 text-teal-600 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Tipo de Gestión *</label>
              <select
                value={tipoActividad}
                onChange={(e: any) => setTipoActividad(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-semibold text-slate-900"
              >
                <option value="Recordatorio de Pago">Recordatorio de Pago</option>
                <option value="Llamada">Llamada de Seguimiento</option>
                <option value="Cita">Cita Quirúrgica / Consulta</option>
                <option value="Evaluación">Evaluación Médica / Anestésica</option>
                <option value="Seguimiento Postquirúrgico">Seguimiento Postquirúrgico</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Activar Alarma Emergente</label>
              <label className="flex items-center space-x-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alarma}
                  onChange={(e) => setAlarma(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded-xs focus:ring-teal-500"
                />
                <span className="font-semibold text-slate-700">Sí, notificar en pantalla</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Fecha Programada *</label>
              <input
                type="date"
                required
                value={fechaProgramada}
                onChange={(e) => setFechaProgramada(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Hora Programada *</label>
              <input
                type="time"
                required
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-semibold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Detalles o Indicaciones de la Actividad *</label>
            <textarea
              required
              rows={3}
              placeholder="Ej: Llamada para recordar abono de cuota #3 de $1,000 USD antes del 15 de este mes."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-semibold text-slate-900"
            />
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
              Agendar Actividad
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
