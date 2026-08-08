import React, { useState } from 'react';
import { X, CreditCard, DollarSign, CheckCircle2, Search, User, Check, ChevronDown } from 'lucide-react';
import { Pago, Paciente, FinanciamientoCirugia } from '../types';
import { StorageService } from '../services/storageService';

interface NewPaymentModalProps {
  pacientes: Paciente[];
  financiamientos: FinanciamientoCirugia[];
  preselectedPatient?: Paciente | null;
  onClose: () => void;
  onSave: (pago: Pago, updatePlanId?: string) => void;
}

export const NewPaymentModal: React.FC<NewPaymentModalProps> = ({
  pacientes,
  financiamientos,
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
  const activePlan = financiamientos.find(f => f.pacienteId === selectedPacienteId);

  const [descripcion, setDescripcion] = useState(
    activePlan ? `Abono a Cirugía (${activePlan.procedimiento})` : 'Abono a Evaluación Médica'
  );
  const [metodoDePago, setMetodoDePago] = useState<Pago['metodoDePago']>('Zelle');
  const [referencia, setReferencia] = useState('');
  const [abono, setAbono] = useState<number>(500);

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

    // Actualizar descripción por defecto según el plan del paciente seleccionado
    const plan = financiamientos.find(f => f.pacienteId === paciente.id);
    if (plan) {
      setDescripcion(`Abono a Cirugía (${plan.procedimiento})`);
    } else {
      setDescripcion('Abono a Evaluación Médica');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient || abono <= 0) return;

    const newPayment: Pago = {
      fecha: new Date().toISOString().split('T')[0],
      cod: StorageService.generateReceiptCode(),
      id: activePatient.id,
      nombre: activePatient.nombre,
      descripcion: descripcion.trim() || 'Abono a Plan Quirúrgico',
      metodoDePago,
      referencia: referencia.trim() || 'REF-' + Math.floor(100000 + Math.random() * 900000),
      cargo: activePlan ? activePlan.costoTotalCirugia : 0,
      abono: Number(abono),
      diasVcto: 30,
      estatus: 'Activo',
      mesProximaAccion: 'Siguiente Mes',
      fechaProximaAccion: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      proximaAccion: 'Seguimiento de Siguiente Cuota'
    };

    onSave(newPayment, activePlan?.planId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* HEADER */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif italic font-bold text-base text-white">Registrar Abono / Pago</h3>
              <p className="text-[11px] text-slate-400">Emisión de Recibo y Actualización de Saldo</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* BUSCADOR DE PACIENTES */}
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
                    const pPlan = financiamientos.find(f => f.pacienteId === p.id);

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
                          <div className="text-[10px] text-slate-500 flex items-center space-x-2">
                            <span>Cédula: {p.cedula || 'N/A'}</span>
                            {pPlan && (
                              <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded-sm border border-emerald-200">
                                Plan: {pPlan.procedimiento}
                              </span>
                            )}
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

          {activePlan && (
            <div className="bg-teal-50/50 p-3.5 rounded-lg border border-teal-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-teal-700 tracking-wider">Plan Quirúrgico Detectado</span>
              <p className="font-bold text-slate-900 text-xs">{activePlan.procedimiento}</p>
              <div className="flex justify-between text-[11px] text-teal-800 font-medium">
                <span>Costo Total: ${activePlan.costoTotalCirugia} USD</span>
                <span>Saldo Pendiente: <strong>${activePlan.saldoPendiente} USD</strong></span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Monto Abonado ($ USD) *</label>
            <input
              type="number"
              min="1"
              required
              value={abono}
              onChange={(e) => setAbono(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-lg font-bold text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Método de Pago *</label>
              <select
                value={metodoDePago}
                onChange={(e: any) => setMetodoDePago(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-semibold text-slate-900"
              >
                <option value="Zelle">Zelle</option>
                <option value="Mercantil">Mercantil Banco</option>
                <option value="Efectivo USD">Efectivo USD</option>
                <option value="Transferencia BS">Transferencia BS</option>
                <option value="Pago Móvil">Pago Móvil</option>
                <option value="Binance">Binance USDT</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Referencia / N° Comprobante</label>
              <input
                type="text"
                placeholder="Ej: ZEL-9920192"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-mono text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Concepto / Descripción del Pago</label>
            <input
              type="text"
              placeholder="Ej: Abono Cuota #2 de Cirugía"
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
              Emitir Recibo y Guardar
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

