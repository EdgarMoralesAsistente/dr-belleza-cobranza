import React, { useState } from 'react';
import {
  CreditCard,
  Receipt,
  Search,
  PlusCircle,
  FileText,
  DollarSign,
  Calendar,
  Filter,
  CheckCircle2,
  Printer
} from 'lucide-react';
import { Pago, RolUsuario, getRolePermissions } from '../types';

interface PaymentsViewProps {
  pagos: Pago[];
  userRole?: RolUsuario;
  onNewPayment: () => void;
  onPrintReceipt: (pago: Pago) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  pagos,
  userRole,
  onNewPayment,
  onPrintReceipt
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('Todos');
  const permissions = getRolePermissions(userRole);

  const filteredPagos = pagos.filter(p => {
    if (!p) return false;
    const term = (searchTerm || '').toLowerCase();
    const matchesSearch =
      (p.cod || '').toLowerCase().includes(term) ||
      (p.nombre || '').toLowerCase().includes(term) ||
      (p.id || '').toLowerCase().includes(term) ||
      (p.referencia || '').toLowerCase().includes(term);

    const matchesMethod = selectedMethod === 'Todos' || p.metodoDePago === selectedMethod;

    return matchesSearch && matchesMethod;
  });

  const totalAbonadoGlobal = filteredPagos.reduce((sum, p) => sum + (p.abono || 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif italic font-bold text-teal-700 tracking-tight">Registro de Pagos & Recibos</h1>
          <p className="text-xs text-slate-500 mt-1">
            Control de abonos, cargos y emisión de recibos digitales e imprimibles.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 text-right">
            <span className="text-[9px] uppercase font-bold text-emerald-700 block tracking-widest">Recaudado Filtrado</span>
            <strong className="text-sm font-bold text-emerald-800">${totalAbonadoGlobal.toLocaleString()} USD</strong>
          </div>

          {permissions.canRegisterPayment && (
            <button
              onClick={onNewPayment}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg shadow-2xs flex items-center justify-center space-x-2 transition-all cursor-pointer shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Registrar Pago</span>
            </button>
          )}
        </div>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Buscar por Folio, Paciente, Cédula o Referencia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-100 border-none rounded-full focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 text-slate-800 placeholder-slate-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-700"
          >
            <option value="Todos">Todos los Métodos de Pago</option>
            <option value="Zelle">Zelle</option>
            <option value="Mercantil">Mercantil</option>
            <option value="Efectivo USD">Efectivo USD</option>
            <option value="Transferencia BS">Transferencia BS</option>
            <option value="Pago Móvil">Pago Móvil</option>
          </select>
        </div>
      </div>

      {/* LISTA DE RECIBOS Y PAGOS: VISTA MÓVIL EN TARJETAS + TABLA EN ESCRITORIO */}
      
      {/* Vista Móvil (Tarjetas) */}
      <div className="block md:hidden space-y-3">
        {filteredPagos.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border border-slate-200 text-center text-slate-400 text-xs">
            No hay transacciones de pago registradas.
          </div>
        ) : (
          filteredPagos.map((p) => (
            <div key={p.cod} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                    {p.cod}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{p.nombre || 'Paciente'}</h3>
                  <span className="text-xs text-slate-500">ID: {p.id} — {p.fecha}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-emerald-700 block">
                    +${(p.abono || 0).toLocaleString()} USD
                  </span>
                  <span className="text-[10px] font-semibold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-md">
                    {p.metodoDePago}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div className="font-semibold text-slate-800">{p.descripcion}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Ref: {p.referencia || 'S/N'}</div>
              </div>

              <button
                onClick={() => onPrintReceipt(p)}
                className="w-full py-2 bg-slate-100 hover:bg-teal-600 hover:text-white text-slate-800 font-semibold text-xs rounded-lg transition-all flex items-center justify-center space-x-2 border border-slate-200 cursor-pointer active:scale-98"
              >
                <Printer className="w-4 h-4" />
                <span>Ver / Imprimir Recibo</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Vista Escritorio (Tabla) */}
      <div className="hidden md:block bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-6">Folio / Fecha</th>
                <th className="py-3.5 px-6">Paciente</th>
                <th className="py-3.5 px-6">Descripción del Pago</th>
                <th className="py-3.5 px-6">Método & Ref</th>
                <th className="py-3.5 px-6">Monto Abonado</th>
                <th className="py-3.5 px-6 text-right">Recibo Digital</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredPagos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No hay transacciones de pago registradas.
                  </td>
                </tr>
              ) : (
                filteredPagos.map((p) => (
                  <tr key={p.cod} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-6">
                      <span className="font-semibold text-slate-900 block">{p.cod}</span>
                      <span className="text-[11px] text-slate-400">{p.fecha}</span>
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-800">
                      <div>{p.nombre}</div>
                      <span className="text-[10px] text-slate-400 font-normal">ID: {p.id}</span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 max-w-xs">
                      {p.descripcion}
                    </td>
                    <td className="py-3.5 px-6 space-y-0.5">
                      <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded-md">
                        {p.metodoDePago}
                      </span>
                      <div className="text-[11px] font-mono text-slate-400">Ref: {p.referencia || 'S/N'}</div>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-emerald-700 text-sm">
                      +${(p.abono || 0).toLocaleString()} USD
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => onPrintReceipt(p)}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-teal-600 hover:text-white text-slate-700 font-semibold rounded-lg transition-all text-xs flex items-center justify-end space-x-1.5 ml-auto cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Ver / Imprimir</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
