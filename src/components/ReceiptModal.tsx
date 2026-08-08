import React from 'react';
import {
  X,
  Printer,
  Sparkles,
  ShieldCheck,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { Pago, Paciente, FinanciamientoCirugia } from '../types';
import { printPaymentReceiptPDF, getClinicConfig } from '../services/financingConfig';

interface ReceiptModalProps {
  pago: Pago | null;
  paciente?: Paciente | null;
  financiamiento?: FinanciamientoCirugia | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  pago,
  paciente,
  financiamiento,
  onClose
}) => {
  if (!pago) return null;

  const config = getClinicConfig();

  const handlePrint = () => {
    printPaymentReceiptPDF(pago, paciente, financiamiento);
  };

  const cargoTotal = (pago.cargo || financiamiento?.costoTotalCirugia || 0);
  const abonosAcumulados = (financiamiento?.montoAbonado || pago.abono || 0);
  const saldoRestante = financiamiento?.saldoPendiente ?? Math.max(0, cargoTotal - abonosAcumulados);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      
      {/* CONTENEDOR PRINCIPAL */}
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col">
        
        {/* BARRA SUPERIOR DE ACCIONES */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2 text-xs font-semibold text-teal-400">
            <FileText className="w-4 h-4" />
            <span>Comprobante Digital Oficial {config.nombreClinica}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg shadow-2xs transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Descargar PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PLANTILLA DE RECIBO MÉDICO/FINANCIERO EN PANTALLA */}
        <div className="p-6 sm:p-8 space-y-6 bg-white overflow-y-auto max-h-[85vh]">
          
          {/* CABECERA ESTILO BRAND HEADER (DARK SLATE & TEAL) */}
          <div className="bg-slate-900 text-white p-5 rounded-xl border-b-4 border-teal-600 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-lg bg-teal-600 text-white flex items-center justify-center font-serif font-bold text-xl shadow-inner shrink-0">
                DB
              </div>
              <div>
                <h1 className="text-lg font-serif italic font-bold text-white leading-tight">{config.nombreClinica}</h1>
                <p className="text-[11px] font-semibold text-teal-300 mt-0.5">{config.subtitulo}</p>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 text-right px-3.5 py-2 rounded-lg self-end sm:self-auto">
              <span className="text-[11px] font-extrabold text-teal-300 tracking-wider block">RECIBO #{pago.cod}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Fecha: {pago.fecha}</span>
            </div>
          </div>

          {/* 1. INFORMACIÓN DEL PACIENTE */}
          <div>
            <div className="bg-teal-50/70 border-l-4 border-teal-600 px-3 py-1.5 rounded-r-md text-[11px] font-bold uppercase tracking-wider text-teal-800 mb-3 flex items-center justify-between">
              <span>1. Información del Paciente & Estado del Pago</span>
              <span className="text-[10px] text-slate-500 font-medium normal-case">Comprobante Oficial</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Paciente Titular</span>
                <strong className="text-sm font-bold text-teal-800 block mt-0.5">{pago.nombre}</strong>
                <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
                  <div>ID: <span className="font-semibold text-slate-700">{pago.id}</span></div>
                  <div>Cédula: <span className="font-semibold text-slate-700">{paciente?.cedula || 'N/A'}</span></div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Estado de la Transacción</span>
                <div className="mt-1">
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-bold uppercase">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Confirmado & Registrado</span>
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-2 space-y-0.5">
                  <div>Teléfono: <span className="font-semibold text-slate-700">{paciente?.telefono || 'N/A'}</span></div>
                  <div>Correo: <span className="font-semibold text-slate-700">{paciente?.correo || 'N/A'}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. DETALLE DEL ABONO */}
          <div>
            <div className="bg-teal-50/70 border-l-4 border-teal-600 px-3 py-1.5 rounded-r-md text-[11px] font-bold uppercase tracking-wider text-teal-800 mb-3">
              2. Detalle del Abono y Método de Pago
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-2.5 px-4">Concepto / Descripción</th>
                    <th className="py-2.5 px-4">Método</th>
                    <th className="py-2.5 px-4">Referencia</th>
                    <th className="py-2.5 px-4 text-right">Monto Cancelado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-800">{pago.descripcion}</td>
                    <td className="py-3 px-4 font-semibold text-teal-700">{pago.metodoDePago}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{pago.referencia || 'N/A'}</td>
                    <td className="py-3 px-4 font-extrabold text-teal-700 text-sm text-right">
                      +${pago.abono.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. RESUMEN DEL PLAN QUIRÚRGICO */}
          <div>
            <div className="bg-teal-50/70 border-l-4 border-teal-600 px-3 py-1.5 rounded-r-md text-[11px] font-bold uppercase tracking-wider text-teal-800 mb-3">
              3. Estado Actual del Plan Quirúrgico & Saldo Restante
            </div>

            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-xl border border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-300 pb-2 border-b border-slate-700/80">
                <span>Procedimiento:</span>
                <strong className="text-white text-sm">{financiamiento?.procedimiento || 'Evaluación & Tratamiento Quirúrgico'}</strong>
              </div>

              {cargoTotal > 0 && (
                <div className="flex justify-between items-center text-slate-300">
                  <span>Costo Total del Plan:</span>
                  <span className="font-bold text-slate-100">${cargoTotal.toLocaleString()} USD</span>
                </div>
              )}

              <div className="flex justify-between items-center text-sky-300">
                <span>Monto de este Abono:</span>
                <span className="font-bold text-sky-300">+${pago.abono.toLocaleString()} USD</span>
              </div>

              {abonosAcumulados > 0 && (
                <div className="flex justify-between items-center text-emerald-400">
                  <span>Total Abonado Acumulado:</span>
                  <span className="font-bold text-emerald-400">${abonosAcumulados.toLocaleString()} USD</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-slate-700 text-teal-300 font-extrabold text-sm">
                <span>SALDO PENDIENTE RESTANTE:</span>
                <span className="text-teal-300">${saldoRestante.toLocaleString()} USD</span>
              </div>
            </div>
          </div>

          {/* 4. FIRMAS Y VALIDACIÓN */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
            <div className="border-t-2 border-slate-300 pt-2">
              <div className="font-bold text-slate-900">{pago.nombre}</div>
              <div className="text-[10px] text-slate-400">Firma del Paciente</div>
            </div>

            <div className="border-t-2 border-slate-300 pt-2">
              <div className="font-bold text-slate-900">{config.doctorRepresentante}</div>
              <div className="text-[10px] text-slate-400">Caja & Administración — {config.nombreClinica}</div>
            </div>
          </div>

          {/* FOOTER TERMINOS */}
          <div className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-3">
            <strong>{config.nombreClinica}</strong> — {config.direccion} — Tel: {config.telefono} — {config.email}<br />
            Este recibo electrónico certifica el pago recibido por el concepto arriba descrito. Conservar como comprobante oficial.
          </div>

        </div>

      </div>
    </div>
  );
};

