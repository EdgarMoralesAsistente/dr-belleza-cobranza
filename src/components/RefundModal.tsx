import React, { useState, useMemo } from 'react';
import { X, DollarSign, Calendar, AlertTriangle, ShieldCheck, ArrowRight, FileText, Info } from 'lucide-react';
import { Paciente, FinanciamientoCirugia, Pago } from '../types';
import { StorageService, calculateReintegroMetrics } from '../services/storageService';

interface RefundModalProps {
  paciente: Paciente;
  plan: FinanciamientoCirugia;
  pagosPaciente: Pago[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RefundModal: React.FC<RefundModalProps> = ({
  paciente,
  plan,
  pagosPaciente,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [fechaSolicitud, setFechaSolicitud] = useState<string>(new Date().toISOString().split('T')[0]);
  const [motivo, setMotivo] = useState<string>('Motivo Personal / Decisión de la Paciente');
  const [observaciones, setObservaciones] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Cálculo en tiempo real de métricas
  const metrics = useMemo(() => {
    return calculateReintegroMetrics(plan, pagosPaciente, fechaSolicitud);
  }, [plan, pagosPaciente, fechaSolicitud]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (metrics.montoNetoReintegro <= 0) {
      alert('La paciente no posee abonos o el saldo abonado no genera un monto a devolver superior a $0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = StorageService.solicitarReintegro({
        planId: plan.planId,
        pacienteId: paciente.id,
        fechaSolicitud,
        motivo,
        observaciones
      });

      if (result) {
        onSuccess();
        onClose();
      } else {
        alert('Ocurrió un error al procesar la solicitud de reintegro.');
      }
    } catch (err) {
      console.error(err);
      alert('Error inesperado al generar la solicitud de reintegro.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden flex flex-col">
        
        {/* HEADER */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Solicitar Reintegro de Financiamiento</h2>
              <p className="text-xs text-slate-400">Cancelación de Plan y Liquidación de Fondos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(85vh-130px)]">
          
          {/* PACIENTE Y PLAN SUMMARY */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Paciente</p>
              <p className="font-bold text-slate-800 mt-0.5">{paciente.nombre}</p>
              <p className="text-xs text-slate-500">C.I.: {paciente.cedula} | ID: {paciente.id}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Plan de Financiamiento</p>
              <p className="font-bold text-teal-700 mt-0.5">{plan.procedimiento}</p>
              <p className="text-xs text-slate-500">Plan ID: {plan.planId} | Costo Total: ${plan.costoTotalCirugia.toLocaleString()} USD</p>
            </div>
          </div>

          {/* FORM INPUTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Fecha de Solicitud *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="date"
                  required
                  value={fechaSolicitud}
                  onChange={(e) => setFechaSolicitud(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Motivo de la Cancelación
              </label>
              <select
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="Motivo Personal / Decisión de la Paciente">Motivo Personal / Decisión de la Paciente</option>
                <option value="Indicación Médica / Reagendamiento Cancelado">Indicación Médica / Reagendamiento Cancelado</option>
                <option value="Fuerza Mayor / Traslado Laboral o Familiar">Fuerza Mayor / Traslado Laboral o Familiar</option>
                <option value="Incapacidad Financiera Continuada">Incapacidad Financiera Continuada</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Observaciones / Justificación
            </label>
            <textarea
              rows={2}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Detalles adicionales sobre la cancelación y acuerdo de reembolso..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 placeholder:text-slate-400"
            />
          </div>

          {/* DESGLOSE MATEMÁTICO & REGLAS CLINICA */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                Cálculo de Reintegro de Fondos
              </span>
              <span className="text-xs font-medium text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                Gastos Admin: 20% Estándar
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="bg-white p-3 rounded-lg border border-amber-200/70 shadow-xs">
                <p className="text-[11px] font-semibold text-slate-500 uppercase">A) Total Abonado</p>
                <p className="text-lg font-bold text-slate-800 mt-0.5">${metrics.totalAbonado.toLocaleString('es-ES', { minimumFractionDigits: 2 })} USD</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-red-200/70 shadow-xs">
                <p className="text-[11px] font-semibold text-red-600 uppercase">G) Gastos Admin (20%)</p>
                <p className="text-lg font-bold text-red-700 mt-0.5">-${metrics.gastosAdmin20.toLocaleString('es-ES', { minimumFractionDigits: 2 })} USD</p>
              </div>
              <div className="bg-teal-700 text-white p-3 rounded-lg shadow-xs">
                <p className="text-[11px] font-semibold text-teal-100 uppercase">R) Reintegro Neto Aprobado</p>
                <p className="text-lg font-bold text-white mt-0.5">${metrics.montoNetoReintegro.toLocaleString('es-ES', { minimumFractionDigits: 2 })} USD</p>
              </div>
            </div>

            {/* EVALUACIÓN DE REGLAS DE TIEMPO */}
            <div className="bg-white rounded-lg p-3.5 border border-amber-200/80 text-xs space-y-2">
              <div className="flex items-center justify-between font-medium text-slate-700">
                <span>Fecha del 1er Abono: <strong className="text-slate-900">{metrics.fechaPrimerAbono}</strong></span>
                <span>Días transcurridos: <strong className="text-slate-900">{metrics.diffDays} días</strong></span>
              </div>

              {metrics.esExcepcion10Dias ? (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-900 flex items-start gap-2">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Aplica Regla Especial (≤ 10 Días Continuos)</p>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      La cancelación ocurre dentro de los primeros 10 días desde el primer abono. Se aprueba la devolución en <strong>1 solo pago</strong> en un plazo máximo de <strong>15 días hábiles</strong>.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-md text-blue-900 flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Aplica Regla General Proporcional ({metrics.plazoMeses} {metrics.plazoMeses === 1 ? 'Mes' : 'Meses'})</p>
                    <p className="text-[11px] text-blue-800 mt-0.5">
                      El plazo de devolución equivale al número de meses transcurridos abonando ({metrics.plazoMeses} {metrics.plazoMeses === 1 ? 'mes' : 'meses'}, tope máx 12 meses).
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-slate-700 gap-2">
                <div>
                  Monto Cuota Estimativo: <strong className="text-teal-700">${metrics.montoCuotaMensual.toLocaleString('es-ES', { minimumFractionDigits: 2 })} USD / mes</strong>
                </div>
                <div>
                  Fecha Est. Culminación: <strong className="text-slate-900">{metrics.fechaEstimadaCulminacion}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || metrics.montoNetoReintegro <= 0}
              className="px-5 py-2 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Procesando Solicitud...' : 'Confirmar & Generar Solicitud de Reintegro'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
