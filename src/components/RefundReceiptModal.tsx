import React from 'react';
import {
  X,
  Printer,
  FileText,
  CheckCircle2,
  RotateCcw,
  DollarSign,
  ArrowDownRight
} from 'lucide-react';
import { Pago, Paciente, Reintegro } from '../types';
import { printRefundReceiptPDF, getClinicConfig } from '../services/financingConfig';

interface RefundReceiptModalProps {
  pago: Pago | null;
  reintegro?: Reintegro | null;
  paciente?: Paciente | null;
  onClose: () => void;
}

export const RefundReceiptModal: React.FC<RefundReceiptModalProps> = ({
  pago,
  reintegro,
  paciente,
  onClose
}) => {
  if (!pago) return null;

  const config = getClinicConfig();

  const handlePrint = () => {
    printRefundReceiptPDF(pago, reintegro, paciente);
  };

  const montoDevuelto = pago.cargo || pago.abono || 0;
  const totalAbonado = reintegro?.totalAbonado || 0;
  const gastosAdmin = reintegro?.gastosAdmin20 || 0;
  const totalReintegroNeto = reintegro?.montoNetoReintegro || montoDevuelto;
  const totalDevueltoAcumulado = reintegro?.montoEfectivamentePagado || montoDevuelto;
  const saldoPendienteRestante = reintegro?.saldoPendiente ?? Math.max(0, totalReintegroNeto - totalDevueltoAcumulado);
  
  const porcentajeAvance = totalReintegroNeto > 0 
    ? Math.min(100, Math.round((totalDevueltoAcumulado / totalReintegroNeto) * 100))
    : 100;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      
      {/* CONTENEDOR PRINCIPAL */}
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col">
        
        {/* BARRA SUPERIOR DE ACCIONES */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400">
            <RotateCcw className="w-4 h-4" />
            <span>Comprobante Digital de Egreso / Reintegro</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg shadow-2xs transition-all flex items-center space-x-1.5 cursor-pointer"
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

        {/* PLANTILLA DE RECIBO DIGITAL DE DEVOLUCIÓN EN PANTALLA */}
        <div className="p-6 sm:p-8 space-y-6 bg-white overflow-y-auto max-h-[85vh]">
          
          {/* CABECERA ESTILO BRAND HEADER (DARK SLATE & AMBER) */}
          <div className="bg-slate-900 text-white p-5 rounded-xl border-b-4 border-amber-600 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-lg bg-amber-600 text-white flex items-center justify-center font-serif font-bold text-xl shadow-inner shrink-0">
                DB
              </div>
              <div>
                <h1 className="text-lg font-serif italic font-bold text-white leading-tight">{config.nombreClinica}</h1>
                <p className="text-[11px] font-semibold text-amber-300 mt-0.5">{config.subtitulo}</p>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 text-right px-3.5 py-2 rounded-lg self-end sm:self-auto">
              <span className="text-[11px] font-extrabold text-amber-300 tracking-wider block">RECIBO DE REINTEGRO #{pago.cod}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Fecha: {pago.fecha}</span>
            </div>
          </div>

          {/* 1. INFORMACIÓN DEL PACIENTE */}
          <div>
            <div className="bg-amber-50/80 border-l-4 border-amber-600 px-3 py-1.5 rounded-r-md text-[11px] font-bold uppercase tracking-wider text-amber-900 mb-3 flex items-center justify-between">
              <span>1. Información del Paciente Titular</span>
              <span className="text-[10px] text-slate-500 font-medium normal-case">Solicitud {reintegro?.reintegroId || ''}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Paciente Titular</span>
                <strong className="text-sm font-bold text-amber-900 block mt-0.5">{pago.nombre}</strong>
                <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
                  <div>ID Paciente: <span className="font-semibold text-slate-700">{pago.id}</span></div>
                  <div>Cédula / Documento: <span className="font-semibold text-slate-700">{paciente?.cedula || 'N/A'}</span></div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Estado del Desembolso</span>
                <div className="mt-1">
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-md text-[10px] font-bold uppercase">
                    <CheckCircle2 className="w-3 h-3 text-amber-700" />
                    <span>Devolución Registrada & Procesada</span>
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-2 space-y-0.5">
                  <div>Teléfono: <span className="font-semibold text-slate-700">{paciente?.telefono || 'N/A'}</span></div>
                  <div>Correo: <span className="font-semibold text-slate-700">{paciente?.correo || 'N/A'}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. DETALLE DEL DESEMBOLSO */}
          <div>
            <div className="bg-amber-50/80 border-l-4 border-amber-600 px-3 py-1.5 rounded-r-md text-[11px] font-bold uppercase tracking-wider text-amber-900 mb-3">
              2. Detalle del Egreso / Devolución Entregada
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-2.5 px-4">Concepto / Descripción del Egreso</th>
                    <th className="py-2.5 px-4">Método de Pago</th>
                    <th className="py-2.5 px-4">Referencia</th>
                    <th className="py-2.5 px-4 text-right">Monto Devuelto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-800">{pago.descripcion}</td>
                    <td className="py-3 px-4 font-semibold text-amber-800">{pago.metodoDePago}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{pago.referencia || 'N/A'}</td>
                    <td className="py-3 px-4 font-extrabold text-red-600 text-sm text-right">
                      -${montoDevuelto.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. RESUMEN Y BARRA DE PROGRESO DE DEVOLUCIÓN */}
          <div>
            <div className="bg-amber-50/80 border-l-4 border-amber-600 px-3 py-1.5 rounded-r-md text-[11px] font-bold uppercase tracking-wider text-amber-900 mb-3">
              3. Estatus Financiero & Barra de Progreso del Reintegro
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-xl border border-slate-700 space-y-3">
              
              {totalAbonado > 0 && (
                <div className="grid grid-cols-2 gap-2 text-xs border-b border-slate-800 pb-2">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Abonado Inicialmente (A)</span>
                    <strong className="text-white">${totalAbonado.toLocaleString('en-US')} USD</strong>
                  </div>
                  <div>
                    <span className="text-red-400 block text-[10px] uppercase font-semibold">Gastos Admin 20% (G)</span>
                    <strong className="text-red-400">-${gastosAdmin.toLocaleString('en-US')} USD</strong>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                  <span className="text-amber-300 block text-[10px] uppercase font-bold">Reintegro Neto (R)</span>
                  <strong className="text-base text-amber-300 font-extrabold">${totalReintegroNeto.toLocaleString('en-US')} USD</strong>
                </div>

                <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                  <span className="text-emerald-400 block text-[10px] uppercase font-bold">Devuelto a la Fecha</span>
                  <strong className="text-base text-emerald-400 font-extrabold">${totalDevueltoAcumulado.toLocaleString('en-US')} USD</strong>
                </div>

                <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                  <span className="text-amber-400 block text-[10px] uppercase font-bold">Saldo Pendiente</span>
                  <strong className="text-base text-amber-400 font-extrabold">${saldoPendienteRestante.toLocaleString('en-US')} USD</strong>
                </div>
              </div>

              {/* BARRA DE PROGRESO DE DEVOLUCIÓN */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    Progreso de Liquidación
                  </span>
                  <span className="font-bold text-emerald-400 text-xs">{porcentajeAvance}% Completado</span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${porcentajeAvance}%` }}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* FIRMAS DE CONFORMIDAD */}
          <div className="pt-4 grid grid-cols-2 gap-8 border-t border-slate-200 text-center text-xs text-slate-500">
            <div>
              <div className="border-t border-slate-300 pt-2 font-bold text-slate-800">{pago.nombre}</div>
              <div className="text-[10px]">Firma Paciente / Beneficiario</div>
            </div>
            <div>
              <div className="border-t border-slate-300 pt-2 font-bold text-slate-800">{config.doctorRepresentante}</div>
              <div className="text-[10px]">Caja & Administración Médica</div>
            </div>
          </div>

          {/* PIE DE PÁGINA */}
          <div className="text-[10px] text-center text-slate-400 pt-2 border-t border-slate-100 space-y-0.5">
            <p className="font-semibold text-slate-600">{config.nombreClinica} — {config.direccion}</p>
            <p>Comprobante de Egreso / Devolución generado electrónicamente.</p>
          </div>

        </div>

      </div>
    </div>
  );
};
