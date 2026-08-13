import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  Search,
  Filter,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  PlusCircle,
  ArrowUpRight,
  ShieldAlert,
  FileText,
  User,
  CreditCard,
  Building2,
  X,
  Check,
  Printer
} from 'lucide-react';
import { Paciente, Reintegro, EstadoReintegro, RolUsuario, Pago } from '../types';
import { StorageService } from '../services/storageService';
import { RefundReceiptModal } from './RefundReceiptModal';

interface RefundsViewProps {
  reintegros: Reintegro[];
  pacientes: Paciente[];
  userRole: RolUsuario;
  onRefresh: () => void;
  onSelectPatient: (patient: Paciente) => void;
}

export const RefundsView: React.FC<RefundsViewProps> = ({
  reintegros,
  pacientes,
  userRole,
  onRefresh,
  onSelectPatient
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');

  // Modal para registrar pago de reintegro
  const [selectedReintegroForPayment, setSelectedReintegroForPayment] = useState<Reintegro | null>(null);
  const [montoPago, setMontoPago] = useState<number>(0);
  const [metodoPago, setMetodoPago] = useState<string>('Transferencia Zelle');
  const [referencia, setReferencia] = useState<string>('');
  const [observaciones, setObservaciones] = useState<string>('');
  const [fechaPago, setFechaPago] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Modal de vista previa del recibo generado
  const [createdReceiptModalData, setCreatedReceiptModalData] = useState<{
    pago: Pago;
    reintegro: Reintegro;
    paciente: Paciente | null;
  } | null>(null);

  // Map rápido de pacientes por ID
  const patientsMap = useMemo(() => {
    const map = new Map<string, Paciente>();
    pacientes.forEach(p => map.set(p.id, p));
    return map;
  }, [pacientes]);

  // Filtrado de Reintegros
  const filteredReintegros = useMemo(() => {
    return reintegros.filter(r => {
      const p = patientsMap.get(r.pacienteId);
      const name = p ? p.nombre.toLowerCase() : '';
      const cedula = p ? p.cedula.toLowerCase() : '';
      const id = r.reintegroId.toLowerCase();
      const matchSearch =
        name.includes(searchTerm.toLowerCase()) ||
        cedula.includes(searchTerm.toLowerCase()) ||
        id.includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'Todos' || r.estadoReintegro === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [reintegros, patientsMap, searchTerm, statusFilter]);

  // MÉTIRCAS Y KPIs
  const kpis = useMemo(() => {
    const totalSolicitudes = reintegros.length;
    const totalMontoNeto = reintegros.reduce((acc, r) => acc + (r.montoNetoReintegro || 0), 0);
    const totalDevuelto = reintegros.reduce((acc, r) => acc + (r.montoEfectivamentePagado || 0), 0);
    const totalPendiente = reintegros.reduce((acc, r) => acc + (r.saldoPendiente || 0), 0);
    const enProcesoCount = reintegros.filter(r => r.estadoReintegro === 'Pendiente' || r.estadoReintegro === 'En Proceso' || r.estadoReintegro === 'Parcialmente Pagado').length;
    const completadasCount = reintegros.filter(r => r.estadoReintegro === 'Completado').length;

    return {
      totalSolicitudes,
      totalMontoNeto,
      totalDevuelto,
      totalPendiente,
      enProcesoCount,
      completadasCount
    };
  }, [reintegros]);

  const handleOpenPaymentModal = (reint: Reintegro) => {
    setSelectedReintegroForPayment(reint);
    setMontoPago(reint.saldoPendiente > 0 ? reint.montoCuotaMensual > 0 && reint.montoCuotaMensual <= reint.saldoPendiente ? reint.montoCuotaMensual : reint.saldoPendiente : 0);
    setMetodoPago('Transferencia Zelle');
    setReferencia('');
    setObservaciones('');
    setFechaPago(new Date().toISOString().split('T')[0]);
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReintegroForPayment) return;
    if (montoPago <= 0) {
      alert('Ingresa un monto válido a devolver superior a $0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = StorageService.registrarPagoReintegro({
        reintegroId: selectedReintegroForPayment.reintegroId,
        montoDevuelto: montoPago,
        metodoPago,
        referencia,
        observaciones,
        fecha: fechaPago
      });

      if (res.success && res.pago && res.reintegro) {
        onRefresh();
        const pac = patientsMap.get(selectedReintegroForPayment.pacienteId) || null;
        
        // Abrir vista previa del recibo del reintegro inmediatamente
        setCreatedReceiptModalData({
          pago: res.pago,
          reintegro: res.reintegro,
          paciente: pac
        });

        setSelectedReintegroForPayment(null);
      } else {
        alert(res.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error al registrar el egreso de reintegro.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: EstadoReintegro) => {
    switch (status) {
      case 'Pendiente':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full border border-amber-200"><Clock className="w-3 h-3" /> Pendiente</span>;
      case 'En Proceso':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full border border-blue-200"><RotateCcw className="w-3 h-3" /> En Proceso</span>;
      case 'Parcialmente Pagado':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded-full border border-indigo-200"><DollarSign className="w-3 h-3" /> Parcialmente Pagado</span>;
      case 'Completado':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200"><CheckCircle2 className="w-3 h-3" /> Completado</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 p-6 rounded-2xl text-white shadow-lg border border-slate-700">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
            <RotateCcw className="w-4 h-4" />
            Módulo Administrativo & Financiero
          </div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-tight">Gestión General de Reintegros</h1>
          <p className="text-xs text-slate-300">Monitoreo de solicitudes, liquidación de retenidos (20%) y desembolsos a pacientes.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-xs text-right">
            <span className="block text-slate-300">Regla Activa</span>
            <span className="font-bold text-amber-300">Retención Admin 20% | Máx 12 Meses</span>
          </div>
        </div>
      </div>

      {/* KPI METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Solicitudes Totales</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{kpis.totalSolicitudes}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">{kpis.enProcesoCount} Activas | {kpis.completadasCount} Finalizadas</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <RotateCcw className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Aprobado Neto ($R$)</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">${kpis.totalMontoNeto.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Monto tras deducción 20%</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Monto Efectivamente Pagado</p>
            <h3 className="text-2xl font-bold text-emerald-700 mt-1">${kpis.totalDevuelto.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Egresos ejecutados</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Saldo Pendiente por Devolver</p>
            <h3 className="text-2xl font-bold text-amber-700 mt-1">${kpis.totalPendiente.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</h3>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5">Por liquidar a pacientes</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* FILTER BAR & SEARCH */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* BUSCADOR */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por paciente, C.I. o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
          />
        </div>

        {/* FILTROS DE ESTADO */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto text-xs font-semibold">
          {['Todos', 'Pendiente', 'Parcialmente Pagado', 'Completado'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

      </div>

      {/* REINTEGROS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold tracking-wider">
                <th className="p-4">ID / Fecha Solicitud</th>
                <th className="p-4">Paciente</th>
                <th className="p-4">Total Abonado (A)</th>
                <th className="p-4 text-red-600">Gastos Admin 20% (G)</th>
                <th className="p-4 text-teal-800">Reintegro Neto (R)</th>
                <th className="p-4">Plazo / Regla</th>
                <th className="p-4">Devuelto</th>
                <th className="p-4 text-amber-700">Saldo Pendiente</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {filteredReintegros.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400">
                    <RotateCcw className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold">No se encontraron solicitudes de reintegro.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Las solicitudes se generan directamente desde la Ficha 360° de la Paciente.</p>
                  </td>
                </tr>
              ) : (
                filteredReintegros.map((r) => {
                  const pac = patientsMap.get(r.pacienteId);
                  return (
                    <tr key={r.reintegroId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-slate-900 block">{r.reintegroId}</span>
                        <span className="text-[11px] text-slate-400">{r.fechaSolicitud}</span>
                      </td>

                      <td className="p-4">
                        {pac ? (
                          <button
                            onClick={() => onSelectPatient(pac)}
                            className="font-bold text-teal-700 hover:text-teal-900 hover:underline text-left cursor-pointer"
                          >
                            {pac.nombre}
                          </button>
                        ) : (
                          <span className="text-slate-500">Paciente ID: {r.pacienteId}</span>
                        )}
                        <span className="text-[11px] text-slate-400 block">C.I.: {pac?.cedula || 'N/A'}</span>
                      </td>

                      <td className="p-4 font-semibold text-slate-700">
                        ${r.totalAbonado.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="p-4 font-semibold text-red-600">
                        -${r.gastosAdmin20.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="p-4 font-bold text-teal-700 bg-teal-50/50">
                        ${r.montoNetoReintegro.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="p-4 text-[11px]">
                        {r.esExcepcion10Dias ? (
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Excepción 10 Días (1 Pago)
                          </span>
                        ) : (
                          <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {r.plazoMeses} {r.plazoMeses === 1 ? 'Mes' : 'Meses'} (${r.montoCuotaMensual.toLocaleString()}/mes)
                          </span>
                        )}
                        <span className="text-slate-400 block mt-0.5">Est.: {r.fechaEstimadaCulminacion}</span>
                      </td>

                      <td className="p-4 font-bold text-emerald-700">
                        <div>
                          <span>${r.montoEfectivamentePagado.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                          {r.montoNetoReintegro > 0 && (
                            <div className="mt-1 w-28">
                              <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold mb-0.5">
                                <span>Progreso</span>
                                <span className="text-emerald-700 font-extrabold">
                                  {Math.min(100, Math.round((r.montoEfectivamentePagado / r.montoNetoReintegro) * 100))}%
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                                  style={{
                                    width: `${Math.min(100, (r.montoEfectivamentePagado / r.montoNetoReintegro) * 100)}%`
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="p-4 font-bold text-amber-700">
                        ${r.saldoPendiente.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="p-4">
                        {getStatusBadge(r.estadoReintegro)}
                      </td>

                      <td className="p-4 text-right">
                        {r.saldoPendiente > 0 && (userRole === 'Administrador' || userRole === 'Financiero') ? (
                          <button
                            onClick={() => handleOpenPaymentModal(r)}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors shadow-xs flex items-center gap-1.5 ml-auto cursor-pointer"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            Registrar Egreso
                          </button>
                        ) : r.saldoPendiente === 0 ? (
                          <span className="text-xs text-emerald-600 font-bold flex items-center justify-end gap-1">
                            <Check className="w-4 h-4" /> Pagado
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Solo Lectura</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PARA REGISTRAR PAGO DE REINTEGRO */}
      {selectedReintegroForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">Registrar Egreso de Reintegro</h3>
                  <p className="text-xs text-slate-400">{selectedReintegroForPayment.reintegroId}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReintegroForPayment(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessPayment} className="p-6 space-y-4">
              
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Reintegro Neto Aprobado:</span>
                  <strong className="text-slate-900">${selectedReintegroForPayment.montoNetoReintegro.toLocaleString()} USD</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Monto Devuelto a la Fecha:</span>
                  <strong className="text-emerald-700">${selectedReintegroForPayment.montoEfectivamentePagado.toLocaleString()} USD</strong>
                </div>
                <div className="flex justify-between text-slate-800 font-bold pt-1 border-t border-slate-200 text-sm">
                  <span>Saldo Pendiente Actual:</span>
                  <strong className="text-amber-700">${selectedReintegroForPayment.saldoPendiente.toLocaleString()} USD</strong>
                </div>

                {/* BARRA DE PROGRESO DE LA DEVOLUCIÓN (IGUAL QUE EN LA TABLA REINTEGROS) */}
                {selectedReintegroForPayment.montoNetoReintegro > 0 && (
                  <div className="pt-2">
                    {(() => {
                      const totalActual = selectedReintegroForPayment.montoEfectivamentePagado;
                      const proyectado = Math.min(
                        selectedReintegroForPayment.montoNetoReintegro,
                        totalActual + (montoPago || 0)
                      );
                      const pctActual = Math.min(100, Math.round((totalActual / selectedReintegroForPayment.montoNetoReintegro) * 100));
                      const pctProyectado = Math.min(100, Math.round((proyectado / selectedReintegroForPayment.montoNetoReintegro) * 100));
                      
                      return (
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                            <span>Progreso</span>
                            <span className="text-emerald-700 font-extrabold">
                              {pctActual}% {montoPago > 0 && pctProyectado > pctActual ? `➔ ${pctProyectado}%` : ''}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden relative">
                            {montoPago > 0 && pctProyectado > pctActual && (
                              <div
                                className="bg-emerald-300 h-full rounded-full absolute top-0 left-0 transition-all duration-300"
                                style={{ width: `${pctProyectado}%` }}
                              />
                            )}
                            <div
                              className="bg-emerald-600 h-full rounded-full relative z-10 transition-all duration-300"
                              style={{ width: `${pctActual}%` }}
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* AVISO DE SOPORTE DE PAGOS PARCIALES */}
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Admite Abonos Parciales:</strong> Puedes registrar un abono parcial o la cuota programada. El saldo pendiente se recalculará automáticamente.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 uppercase">Monto a Devolver (USD) *</label>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    max={selectedReintegroForPayment.saldoPendiente}
                    min={0.01}
                    required
                    value={montoPago}
                    onChange={(e) => setMontoPago(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 font-bold focus:ring-2 focus:ring-amber-500"
                  />
                  {/* PRESETS DE MONTO */}
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {selectedReintegroForPayment.montoCuotaMensual > 0 &&
                      selectedReintegroForPayment.montoCuotaMensual < selectedReintegroForPayment.saldoPendiente && (
                        <button
                          type="button"
                          onClick={() => setMontoPago(selectedReintegroForPayment.montoCuotaMensual)}
                          className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          Cuota (${selectedReintegroForPayment.montoCuotaMensual.toLocaleString()})
                        </button>
                      )}
                    <button
                      type="button"
                      onClick={() => setMontoPago(selectedReintegroForPayment.saldoPendiente)}
                      className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      Total Saldo (${selectedReintegroForPayment.saldoPendiente.toLocaleString()})
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Fecha de Egreso *</label>
                  <input
                    type="date"
                    required
                    value={fechaPago}
                    onChange={(e) => setFechaPago(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Método de Pago *</label>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Transferencia Zelle">Transferencia Zelle</option>
                  <option value="Efectivo USD">Efectivo USD</option>
                  <option value="Transferencia Bancaria">Transferencia Bancaria Nacional</option>
                  <option value="Pago Móvil">Pago Móvil</option>
                  <option value="Tarjeta de Crédito / Débito">Tarjeta de Crédito / Débito</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Referencia Bancaria / Comprobante *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: REF-983241 / Zelle Gabriel M."
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Observaciones / Recibo</label>
                <input
                  type="text"
                  placeholder="Notas adicionales..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedReintegroForPayment(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-md transition-all cursor-pointer"
                >
                  {isSubmitting ? 'Procesando...' : 'Confirmar Egreso'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* VISTA PREVIA Y RECIBO DE REINTEGRO GENERADO */}
      {createdReceiptModalData && (
        <RefundReceiptModal
          pago={createdReceiptModalData.pago}
          reintegro={createdReceiptModalData.reintegro}
          paciente={createdReceiptModalData.paciente}
          onClose={() => setCreatedReceiptModalData(null)}
        />
      )}

    </div>
  );
};
