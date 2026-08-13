import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  TrendingUp,
  Clock,
  PlusCircle,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Printer,
  Trash2
} from 'lucide-react';
import { Paciente, Pago, ActividadCRM, FinanciamientoCirugia, Reintegro } from '../types';
import { printPatientFinancingPDF } from '../services/financingConfig';
import { StorageService } from '../services/storageService';
import { RefundModal } from './RefundModal';
import { RefundReceiptModal } from './RefundReceiptModal';
import { RotateCcw } from 'lucide-react';

interface Patient360ModalProps {
  paciente: Paciente | null;
  pagos: Pago[];
  actividades: ActividadCRM[];
  financiamientos: FinanciamientoCirugia[];
  reintegros?: Reintegro[];
  userRole?: string;
  onClose: () => void;
  onOpenNewPaymentForPatient: (paciente: Paciente) => void;
  onOpenNewActivityForPatient: (paciente: Paciente) => void;
  onOpenNewFinancingPlanForPatient: (paciente: Paciente) => void;
  onPrintReceipt: (pago: Pago) => void;
  onDeletePatient?: (pacienteId: string) => void;
  onRefreshData?: () => void;
}

export const Patient360Modal: React.FC<Patient360ModalProps> = ({
  paciente,
  pagos,
  actividades,
  financiamientos,
  reintegros,
  userRole,
  onClose,
  onOpenNewPaymentForPatient,
  onOpenNewActivityForPatient,
  onOpenNewFinancingPlanForPatient,
  onPrintReceipt,
  onDeletePatient,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<'datos' | 'crm' | 'financiamiento' | 'reintegro'>('datos');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedRefundForReceipt, setSelectedRefundForReceipt] = useState<Pago | null>(null);

  const isAdmin = userRole === 'Administrador';

  if (!paciente) return null;

  // Helper para identificar egresos/reintegros a la paciente
  const isReintegroPago = (p: Pago) => {
    if (!p) return false;
    const desc = (p.descripcion || '').toLowerCase();
    const ref = (p.referencia || '').toLowerCase();
    return desc.includes('reintegro') || ref.includes('reintegro') || (p.cargo && p.cargo > 0 && (!p.abono || p.abono === 0));
  };

  // Helper para formatear la fecha de registro en formato dd/mm/aaaa hh:mm
  const formatFechaRegistro = (fechaStr?: string): string => {
    if (!fechaStr) return 'N/A';
    try {
      const date = new Date(fechaStr);
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      }
    } catch (e) {
      // fallback
    }
    if (fechaStr.includes('-')) {
      const parts = fechaStr.split('T');
      const dateParts = parts[0].split('-');
      if (dateParts.length === 3) {
        const year = dateParts[0];
        const month = dateParts[1].padStart(2, '0');
        const day = dateParts[2].padStart(2, '0');
        const timeStr = parts[1] ? parts[1].substring(0, 5) : '08:30';
        return `${day}/${month}/${year} ${timeStr}`;
      }
    }
    return fechaStr;
  };

  // Filtrar pagos de este paciente
  const patientPagos = pagos.filter(
    p => p && paciente && (p.id === paciente.id || p.id === paciente.cedula || ((p.nombre || '').toLowerCase() === (paciente.nombre || '').toLowerCase() && p.nombre))
  );

  // Tab 3: Exclusivamente abonos recibidos de la paciente al médico/clínica
  const patientAbonoPagos = patientPagos.filter(p => !isReintegroPago(p));

  // Tab 4: Exclusivamente egresos/reintegros devueltos a la paciente
  const patientReintegroEgresos = patientPagos.filter(p => isReintegroPago(p));

  // Filtrar actividades CRM
  const patientCRM = actividades.filter(a => a.pacienteId === paciente.id);

  // Filtrar plan de financiamiento
  const patientFin = financiamientos.find(f => f.pacienteId === paciente.id);

  // Filtrar reintegro de esta paciente
  const patientReintegro = (reintegros || StorageService.getReintegros()).find(r => r.pacienteId === paciente.id);

  // Calcular abono total
  const totalAbonado = patientPagos.reduce((sum, p) => sum + (p.abono || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[90vh]">
        
        {/* HEADER DE LA FICHA 360° */}
        <div className="bg-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pr-12">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-full bg-teal-600 flex items-center justify-center text-white text-xl font-bold border border-white/20 shrink-0">
                {(paciente?.nombre || 'PA').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full">
                    {paciente?.id || ''}
                  </span>
                  <span className="text-xs text-slate-300">Cédula: <strong>{paciente?.cedula || 'N/A'}</strong></span>
                </div>
                <h2 className="text-2xl font-serif italic font-bold tracking-tight text-white mt-1">{paciente?.nombre || 'Paciente sin nombre'}</h2>
                <p className="text-xs text-teal-300 font-medium">{paciente?.procedimiento || 'Procedimiento no especificado'}</p>
              </div>
            </div>

            {/* BOTONES DE ACCIÓN RÁPIDA EN CABECERA */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => printPatientFinancingPDF(paciente, patientFin)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-lg border border-white/20 flex items-center space-x-1.5 transition-all cursor-pointer"
                title="Generar e imprimir Ficha en PDF"
              >
                <Printer className="w-4 h-4 text-teal-300" />
                <span>PDF / Imprimir Ficha</span>
              </button>

              <button
                onClick={() => onOpenNewPaymentForPatient(paciente)}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg shadow-2xs flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <DollarSign className="w-4 h-4" />
                <span>Registrar Abono</span>
              </button>

              <button
                onClick={() => onOpenNewActivityForPatient(paciente)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg border border-slate-700 flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                <span>Agendar CRM</span>
              </button>

              {patientReintegro ? (
                <button
                  onClick={() => setActiveTab('reintegro')}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs rounded-lg border border-amber-500/40 flex items-center space-x-1.5 transition-all cursor-pointer"
                  title="Ver Pestaña de Reintegro de la paciente"
                >
                  <RotateCcw className="w-4 h-4 text-amber-300" />
                  <span>Reintegro Solicitado</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowRefundModal(true)}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs rounded-lg border border-amber-500/40 flex items-center space-x-1.5 transition-all cursor-pointer"
                  title="Activar o solicitar reintegro del dinero abonado"
                >
                  <RotateCcw className="w-4 h-4 text-amber-300" />
                  <span>Solicitar Reintegro</span>
                </button>
              )}

              {isAdmin && onDeletePatient && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-semibold text-xs rounded-lg border border-rose-500/40 flex items-center space-x-1.5 transition-all cursor-pointer shrink-0"
                  title="Eliminar paciente y todos sus registros (Solo Administrador)"
                >
                  <Trash2 className="w-4 h-4 text-rose-400 group-hover:text-white" />
                  <span>Borrar Paciente</span>
                </button>
              )}
            </div>
          </div>

          {/* PESTAÑAS DE LA FICHA */}
          <div className="flex space-x-2 mt-6 border-b border-white/10 pb-0 overflow-x-auto">
            <button
              onClick={() => setActiveTab('datos')}
              className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all cursor-pointer shrink-0 ${
                activeTab === 'datos'
                  ? 'bg-white text-slate-900 font-bold'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              1. Datos Personales & Médicos
            </button>

            <button
              onClick={() => setActiveTab('crm')}
              className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all cursor-pointer shrink-0 flex items-center space-x-1.5 ${
                activeTab === 'crm'
                  ? 'bg-white text-slate-900 font-bold'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <span>2. Timeline CRM ({patientCRM.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('financiamiento')}
              className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all cursor-pointer shrink-0 flex items-center space-x-1.5 ${
                activeTab === 'financiamiento'
                  ? 'bg-white text-slate-900 font-bold'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>3. Plan Financiero Quirúrgico</span>
            </button>

            {patientReintegro && (
              <button
                onClick={() => setActiveTab('reintegro')}
                className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all cursor-pointer shrink-0 flex items-center space-x-1.5 ${
                  activeTab === 'reintegro'
                    ? 'bg-amber-100 text-amber-950 font-bold border-t-2 border-amber-600'
                    : 'text-amber-300 hover:bg-white/10 bg-amber-500/10'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>4. Reintegro</span>
              </button>
            )}
          </div>
        </div>

        {/* CUERPO INTERACTIVO DEL MODAL */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 space-y-6">
          
          {/* TAB 1: DATOS PERSONALES Y MÉDICOS */}
          {activeTab === 'datos' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estatus de Contacto</div>
                  <div className="text-sm font-bold text-teal-800 mt-1 flex items-center">
                    <Sparkles className="w-4 h-4 text-teal-500 mr-1.5" />
                    {paciente.contactada || 'Sin especificar'}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Campaña / Promoción Orig.</div>
                  <div className="text-sm font-bold text-slate-800 mt-1">{paciente.promocion || 'Directo'}</div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fecha de Registro</div>
                  <div className="text-sm font-bold text-slate-800 mt-1 flex items-center">
                    <Calendar className="w-4 h-4 text-slate-400 mr-1.5" />
                    {formatFechaRegistro(paciente.fecha)}
                  </div>
                </div>

              </div>

              {/* INFORMACIÓN DE CONTACTO DETALLADA */}
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">Información de Contacto & Dirección</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                    <Phone className="w-4 h-4 text-teal-600" />
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Teléfono Móvil</span>
                      <strong className="text-slate-800 text-sm">{paciente.telefono}</strong>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                    <Mail className="w-4 h-4 text-teal-600" />
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Correo Electrónico</span>
                      <strong className="text-slate-800 text-sm">{paciente.correo}</strong>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg sm:col-span-2">
                    <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Dirección de Residencia</span>
                      <strong className="text-slate-800 text-sm">{paciente.direccion}</strong>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: TIMELINE DE ACTIVIDADES CRM */}
          {activeTab === 'crm' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Historial e Interacciones de la Paciente</h3>
                <button
                  onClick={() => onOpenNewActivityForPatient(paciente)}
                  className="px-3 py-1.5 bg-slate-100 text-teal-700 hover:bg-slate-200 font-semibold text-xs rounded-lg transition-colors flex items-center space-x-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Agregar Nota / Alarma</span>
                </button>
              </div>

              {patientCRM.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-lg border border-slate-200 text-slate-400 text-xs shadow-2xs">
                  No hay actividades o notas registradas para esta paciente aún.
                </div>
              ) : (
                <div className="space-y-3">
                  {patientCRM.map((act) => (
                    <div key={act.actividadId} className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex items-start space-x-3">
                      <div className={`p-2 rounded-lg text-white shrink-0 ${
                        act.tipoActividad === 'Recordatorio de Pago' ? 'bg-amber-500' :
                        act.tipoActividad === 'Cita' ? 'bg-sky-500' :
                        act.tipoActividad === 'Evaluación' ? 'bg-purple-500' : 'bg-teal-600'
                      }`}>
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">{act.tipoActividad}</span>
                          <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                            {act.fechaProgramada} a las {act.hora}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{act.descripcion}</p>
                        <div className="flex items-center space-x-3 mt-2 text-[11px]">
                          <span className={`font-semibold ${act.estado === 'Realizada' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            • Estado: {act.estado}
                          </span>
                          {act.alarma && (
                            <span className="text-amber-600 font-medium flex items-center">
                              <AlertTriangle className="w-3 h-3 mr-0.5" />
                              Alarma Activa
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PLAN DE FINANCIAMIENTO DE CIRUGÍA */}
          {activeTab === 'financiamiento' && (
            <div className="space-y-6">
              
              {!patientFin ? (
                <div className="bg-white p-8 text-center rounded-lg border border-slate-200 space-y-3 shadow-2xs">
                  <TrendingUp className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800">Esta paciente aún no posee un Plan de Financiamiento Quirúrgico</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Crea un plan de financiamiento para definir el costo total de la cirugía, número de cuotas y fecha estimada de operación.
                  </p>
                  <button
                    onClick={() => onOpenNewFinancingPlanForPatient(paciente)}
                    className="px-4 py-2 bg-teal-600 text-white font-semibold text-xs rounded-lg shadow-2xs hover:bg-teal-700 transition-all cursor-pointer"
                  >
                    Crear Plan de Financiamiento
                  </button>
                </div>
              ) : (
                <>
                  {/* RESUMEN FINANCIERO CON BARRAS DE PROGRESO */}
                  <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-teal-600 tracking-wider">Plan quirúrgico Activo</span>
                        <h3 className="text-base font-bold text-slate-900">{patientFin.procedimiento}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          patientFin.estadoFinanciero === 'Pagado Totalmente' ? 'bg-emerald-50 text-emerald-700' :
                          patientFin.estadoFinanciero === 'En Mora' ? 'bg-rose-50 text-rose-700' :
                          patientFin.estadoFinanciero === 'En Reintegro' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          'bg-sky-50 text-sky-700'
                        }`}>
                          {patientFin.estadoFinanciero}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Costo Total</span>
                        <div className="text-base font-bold text-slate-900">${(patientFin.costoTotalCirugia || 0).toLocaleString()} USD</div>
                      </div>

                      <div className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-100">
                        <span className="text-[9px] text-emerald-700 uppercase font-bold tracking-wider">Monto Abonado</span>
                        <div className="text-base font-bold text-emerald-800">${(patientFin.montoAbonado || 0).toLocaleString()} USD</div>
                      </div>

                      <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-100">
                        <span className="text-[9px] text-amber-700 uppercase font-bold tracking-wider">Saldo Pendiente</span>
                        <div className="text-base font-bold text-amber-900">${(patientFin.saldoPendiente || 0).toLocaleString()} USD</div>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-lg">
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Fecha Est. Operación</span>
                        <div className="text-xs font-bold text-slate-700 mt-1">{patientFin.fechaEstimadaCirugia || 'Por definir'}</div>
                      </div>
                    </div>

                    {/* BARRA DE PROGRESO DE PAGOS */}
                    <div>
                      {(() => {
                        const total = patientFin.costoTotalCirugia || 0;
                        const abonado = patientFin.montoAbonado || 0;
                        const pct = total > 0 ? Math.min(100, Math.round((abonado / total) * 100)) : 0;
                        return (
                          <>
                            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                              <span>Progreso de Financiamiento ({pct}%)</span>
                              <span>Cuotas: {patientFin.cuotasTotales || 1}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-teal-600 h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* HISTORIAL DE ABONOS Y BOTÓN DE IMPRIMIR RECIBO (EXCLUSIVO ABONOS DE PACIENTE A MÉDICO) */}
                  <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Historial de Recibos y Abonos Recibidos ({patientAbonoPagos.length})</h4>
                      <button
                        onClick={() => onOpenNewPaymentForPatient(paciente)}
                        className="px-3 py-1.5 bg-teal-600 text-white font-semibold text-xs rounded-lg shadow-2xs hover:bg-teal-700 transition-all cursor-pointer flex items-center space-x-1"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Registrar Nuevo Abono</span>
                      </button>
                    </div>

                    {patientAbonoPagos.length === 0 ? (
                      <div className="text-xs text-slate-400 py-4 text-center">No hay abonos de paciente registrados aún en esta ficha.</div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {patientAbonoPagos.map((p) => (
                          <div key={p.cod} className="py-3 flex items-center justify-between hover:bg-slate-50 transition-colors px-2 rounded-lg">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-xs text-slate-900">{p.cod}</span>
                                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">{p.metodoDePago}</span>
                              </div>
                              <p className="text-xs text-slate-600 mt-0.5">{p.descripcion} (Ref: {p.referencia})</p>
                              <span className="text-[10px] text-slate-400">{p.fecha}</span>
                            </div>
                            <div className="text-right flex items-center space-x-3">
                              <span className="text-sm font-bold text-emerald-700">+${p.abono} USD</span>
                              <button
                                onClick={() => onPrintReceipt(p)}
                                className="px-2.5 py-1 bg-slate-50 hover:bg-teal-600 hover:text-white text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1 border border-slate-200 cursor-pointer"
                                title="Ver e Imprimir Recibo Médico"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Recibo</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

            </div>
          )}

          {/* TAB 4: REINTEGRO (DEDICADO) */}
          {activeTab === 'reintegro' && (
            <div className="space-y-6">
              {patientReintegro ? (
                <>
                  {/* TARJETA PRINCIPAL DE SOLICITUD DE REINTEGRO */}
                  <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-2xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl border border-amber-200">
                          <RotateCcw className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                            Solicitud de Reintegro ID: {patientReintegro.reintegroId}
                          </span>
                          <h3 className="text-base font-bold text-slate-900">Devolución de Fondos Abonados</h3>
                          <p className="text-xs text-slate-500">Solicitado el {patientReintegro.fechaSolicitud}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          patientReintegro.estadoReintegro === 'Completado' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                          patientReintegro.estadoReintegro === 'Parcialmente Pagado' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                          'bg-slate-100 text-slate-800 border-slate-300'
                        }`}>
                          {patientReintegro.estadoReintegro}
                        </span>

                        <button
                          onClick={() => onOpenNewPaymentForPatient(paciente)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-all flex items-center space-x-1 cursor-pointer"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Registrar Egreso</span>
                        </button>
                      </div>
                    </div>

                    {/* MOTIVO Y REGLA APLICADA */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-100">
                        <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Regla / Plazo de Devolución</span>
                        <div className="font-semibold text-slate-800 mt-0.5">
                          {patientReintegro.esExcepcion10Dias
                            ? '⚡ Regla Excepción 10 Días (Devolución en 1 sola cuota a los 15 días hábiles)'
                            : `📅 Plan Especial de ${patientReintegro.plazoMeses} Meses (Cuota Mensual Est.: $${(patientReintegro.montoCuotaMensual || 0).toLocaleString()} USD)`}
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Motivo Registrado</span>
                        <div className="font-medium text-slate-700 mt-0.5">
                          {patientReintegro.motivo || 'Solicitud de reintegro formalizada por la paciente.'}
                        </div>
                      </div>
                    </div>

                    {/* INDICADORES FINANCIEROS DE DEVOLUCIÓN */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center pt-1">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Total Abonado (100%)</span>
                        <div className="text-sm sm:text-base font-bold text-slate-900">${(patientReintegro.totalAbonado || 0).toLocaleString()} USD</div>
                      </div>

                      <div className="bg-rose-50 p-3 rounded-lg border border-rose-200">
                        <span className="text-[9px] text-rose-700 uppercase font-bold tracking-wider">Gastos Admin (20%)</span>
                        <div className="text-sm sm:text-base font-bold text-rose-800">-${(patientReintegro.gastosAdmin20 || 0).toLocaleString()} USD</div>
                      </div>

                      <div className="bg-teal-50 p-3 rounded-lg border border-teal-200">
                        <span className="text-[9px] text-teal-800 uppercase font-bold tracking-wider">Reintegro Neto (80%)</span>
                        <div className="text-sm sm:text-base font-bold text-teal-900">${(patientReintegro.montoNetoReintegro || 0).toLocaleString()} USD</div>
                      </div>

                      <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                        <span className="text-[9px] text-emerald-800 uppercase font-bold tracking-wider">Devuelto a la Fecha</span>
                        <div className="text-sm sm:text-base font-bold text-emerald-800">${(patientReintegro.montoEfectivamentePagado || 0).toLocaleString()} USD</div>
                      </div>

                      <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 col-span-2 sm:col-span-1">
                        <span className="text-[9px] text-amber-800 uppercase font-bold tracking-wider">Saldo Pendiente</span>
                        <div className="text-sm sm:text-base font-bold text-amber-900">${(patientReintegro.saldoPendiente || 0).toLocaleString()} USD</div>
                      </div>
                    </div>

                    {/* BARRA DE PROGRESO DE DEVOLUCIÓN EN COLOR VERDE */}
                    <div className="pt-2 border-t border-slate-100">
                      {(() => {
                        const neto = patientReintegro.montoNetoReintegro || 1;
                        const devuelto = patientReintegro.montoEfectivamentePagado || 0;
                        const pct = Math.min(100, Math.round((devuelto / neto) * 100));
                        return (
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                              <span>Progreso del Reintegro</span>
                              <span className="text-emerald-700 font-extrabold">{pct}% Devuelto</span>
                            </div>
                            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* HISTORIAL DE EGRESOS / COMPROBANTES DE REINTEGRO REALIZADOS A LA PACIENTE */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                    {/* AVISO EXPLICATIVO */}
                    <div className="bg-amber-50/90 border border-amber-200 text-amber-950 p-3.5 rounded-xl text-xs flex items-start space-x-3 shadow-2xs">
                      <div className="p-1.5 bg-amber-200/90 text-amber-900 rounded-lg shrink-0 mt-0.5">
                        <RotateCcw className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-extrabold block text-amber-950 text-xs">Historial Exclusivo de Reintegros & Egresos a la Paciente</span>
                        <p className="text-amber-800 text-[11px] leading-relaxed mt-0.5">
                          Esta sección muestra únicamente los recibos de desembolsos de devolución entregados por la clínica a la paciente. Los abonos recibidos de la paciente al médico se consultan en la pestaña <strong>3. Plan Financiero Quirúrgico</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
                        <RotateCcw className="w-4 h-4 text-amber-600" />
                        <span>Historial de Recibos de Reintegro ({patientReintegroEgresos.length})</span>
                      </h4>
                      <button
                        onClick={() => onOpenNewPaymentForPatient(paciente)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all flex items-center space-x-1 cursor-pointer shadow-2xs"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Registrar Nuevo Egreso</span>
                      </button>
                    </div>

                    {patientReintegroEgresos.length === 0 ? (
                      <div className="text-xs text-slate-400 py-8 text-center bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                        <RotateCcw className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                        <p className="font-semibold text-slate-600">No hay desembolsos de reintegro registrados aún para esta paciente.</p>
                        <p className="text-[11px] text-slate-400">Haz clic en "Registrar Nuevo Egreso" para procesar una devolución de dinero.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {patientReintegroEgresos.map((p) => (
                          <div key={p.cod} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-amber-50/30 transition-colors px-3 rounded-xl border border-transparent hover:border-amber-100">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                <span className="font-extrabold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{p.cod}</span>
                                <span className="text-[10px] bg-rose-100 text-rose-900 px-2 py-0.5 rounded-md font-extrabold border border-rose-200 flex items-center space-x-1">
                                  <RotateCcw className="w-3 h-3 text-rose-700 shrink-0" />
                                  <span>EGRESO / DEVOLUCIÓN A PACIENTE</span>
                                </span>
                                <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-bold border border-amber-200">
                                  {p.metodoDePago}
                                </span>
                              </div>
                              <p className="text-xs font-medium text-slate-700">{p.descripcion} <span className="text-slate-400 font-mono">(Ref: {p.referencia})</span></p>
                              <span className="text-[10px] text-slate-400 block">{p.fecha}</span>
                            </div>

                            <div className="text-right flex items-center justify-between sm:justify-end space-x-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                              <div className="text-left sm:text-right">
                                <span className="text-xs text-slate-400 font-medium block">Monto Devuelto:</span>
                                <span className="text-sm sm:text-base font-extrabold text-rose-700">-${(p.cargo || p.abono || 0).toLocaleString()} USD</span>
                              </div>

                              <button
                                onClick={() => setSelectedRefundForReceipt(p)}
                                className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-600 hover:text-white text-amber-900 font-bold text-xs rounded-lg transition-all flex items-center space-x-1.5 border border-amber-300/80 cursor-pointer shadow-2xs"
                                title="Ver e Imprimir Detalle del Reintegro a la Paciente"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Ver Recibo</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-white p-8 text-center rounded-xl border border-slate-200 space-y-4 shadow-2xs">
                  <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto">
                    <RotateCcw className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">No hay Solicitud de Reintegro Activa</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                      Esta paciente no ha solicitado la devolución de los fondos abonados. Puedes activar una solicitud de reintegro usando el botón del encabezado.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRefundModal(true)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 mx-auto cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Solicitar Reintegro de Fondos</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* MODAL CONFIRMACIÓN ELIMINAR PACIENTE FICHA 360 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Borrar Ficha de Paciente</h3>
                <span className="text-xs text-rose-600 font-semibold uppercase tracking-wider">Acción Exclusiva de Administrador</span>
              </div>
            </div>

            <div className="bg-rose-50/70 border border-rose-200 p-3.5 rounded-xl text-xs text-slate-700 space-y-2">
              <p>
                Estás a punto de borrar definitivamente la ficha médica de:
              </p>
              <div className="font-bold text-slate-900 text-sm bg-white p-2 rounded-lg border border-rose-200">
                {paciente.nombre} <span className="font-normal text-slate-500 text-xs">({paciente.id} - C.I. {paciente.cedula})</span>
              </div>
              <p className="text-rose-700 font-semibold pt-1">
                ⚠️ Se eliminará de forma irreversible toda la información asociada:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-600">
                <li>Expediente clínico y datos personales</li>
                <li>Historial de abonos ({patientPagos.length} recibos)</li>
                <li>Plan de financiamiento quirúrgico</li>
                <li>Alarmas de cobro y agenda CRM ({patientCRM.length} actividades)</li>
              </ul>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeletePatient) {
                    onDeletePatient(paciente.id);
                  }
                  setShowDeleteConfirm(false);
                  onClose();
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sí, Borrar Definitivamente</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SOLICITAR REINTEGRO */}
      {showRefundModal && patientFin && (
        <RefundModal
          paciente={paciente}
          plan={patientFin}
          pagosPaciente={patientPagos}
          isOpen={showRefundModal}
          onClose={() => setShowRefundModal(false)}
          onSuccess={() => {
            if (onRefreshData) onRefreshData();
            setShowRefundModal(false);
          }}
        />
      )}

      {/* MODAL RECIBO DE REINTEGRO EXCLUSIVO A LA PACIENTE */}
      {selectedRefundForReceipt && (
        <RefundReceiptModal
          pago={selectedRefundForReceipt}
          reintegro={patientReintegro}
          paciente={paciente}
          onClose={() => setSelectedRefundForReceipt(null)}
        />
      )}
    </div>
  );
};
