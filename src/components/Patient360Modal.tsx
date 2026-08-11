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
import { Paciente, Pago, ActividadCRM, FinanciamientoCirugia } from '../types';
import { printPatientFinancingPDF } from '../services/financingConfig';

interface Patient360ModalProps {
  paciente: Paciente | null;
  pagos: Pago[];
  actividades: ActividadCRM[];
  financiamientos: FinanciamientoCirugia[];
  userRole?: string;
  onClose: () => void;
  onOpenNewPaymentForPatient: (paciente: Paciente) => void;
  onOpenNewActivityForPatient: (paciente: Paciente) => void;
  onOpenNewFinancingPlanForPatient: (paciente: Paciente) => void;
  onPrintReceipt: (pago: Pago) => void;
  onDeletePatient?: (pacienteId: string) => void;
}

export const Patient360Modal: React.FC<Patient360ModalProps> = ({
  paciente,
  pagos,
  actividades,
  financiamientos,
  userRole,
  onClose,
  onOpenNewPaymentForPatient,
  onOpenNewActivityForPatient,
  onOpenNewFinancingPlanForPatient,
  onPrintReceipt,
  onDeletePatient
}) => {
  const [activeTab, setActiveTab] = useState<'datos' | 'crm' | 'financiamiento'>('datos');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isAdmin = userRole === 'Administrador';

  if (!paciente) return null;

  // Filtrar pagos de este paciente
  const patientPagos = pagos.filter(
    p => p && paciente && (p.id === paciente.id || p.id === paciente.cedula || ((p.nombre || '').toLowerCase() === (paciente.nombre || '').toLowerCase() && p.nombre))
  );

  // Filtrar actividades CRM
  const patientCRM = actividades.filter(a => a.pacienteId === paciente.id);

  // Filtrar plan de financiamiento
  const patientFin = financiamientos.find(f => f.pacienteId === paciente.id);

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
          <div className="flex space-x-2 mt-6 border-b border-white/10 pb-0">
            <button
              onClick={() => setActiveTab('datos')}
              className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all cursor-pointer ${
                activeTab === 'datos'
                  ? 'bg-white text-slate-900 font-bold'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              1. Datos Personales & Médicos
            </button>

            <button
              onClick={() => setActiveTab('crm')}
              className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'crm'
                  ? 'bg-white text-slate-900 font-bold'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <span>2. Timeline CRM ({patientCRM.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('financiamiento')}
              className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'financiamiento'
                  ? 'bg-white text-slate-900 font-bold'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>3. Plan Financiero Quirúrgico</span>
            </button>
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
                    {paciente.fecha}
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
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        patientFin.estadoFinanciero === 'Pagado Totalmente' ? 'bg-emerald-50 text-emerald-700' :
                        patientFin.estadoFinanciero === 'En Mora' ? 'bg-rose-50 text-rose-700' :
                        'bg-sky-50 text-sky-700'
                      }`}>
                        {patientFin.estadoFinanciero}
                      </span>
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

                  {/* HISTORIAL DE ABONOS Y BOTÓN DE IMPRIMIR RECIBO */}
                  <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Historial de Recibos y Abonos</h4>
                      <button
                        onClick={() => onOpenNewPaymentForPatient(paciente)}
                        className="px-3 py-1.5 bg-teal-600 text-white font-semibold text-xs rounded-lg shadow-2xs hover:bg-teal-700 transition-all cursor-pointer flex items-center space-x-1"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Registrar Nuevo Abono</span>
                      </button>
                    </div>

                    {patientPagos.length === 0 ? (
                      <div className="text-xs text-slate-400 py-4 text-center">No hay recibos registrados aún para esta paciente.</div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {patientPagos.map((p) => (
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
                                className="px-2.5 py-1 bg-slate-50 hover:bg-teal-600 hover:text-white text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1 border border-slate-200"
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
    </div>
  );
};
