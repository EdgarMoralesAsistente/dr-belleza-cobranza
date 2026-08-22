import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Filter,
  Search,
  Users
} from 'lucide-react';
import { FinanciamientoCirugia, Paciente, RolUsuario, getRolePermissions } from '../types';

interface FinancingViewProps {
  financiamientos: FinanciamientoCirugia[];
  pacientes: Paciente[];
  userRole?: RolUsuario;
  onNewFinancingPlan: () => void;
  onOpenNewPaymentForPatient: (paciente: Paciente) => void;
  onSelectPatient: (pacienteId: string) => void;
}

export const FinancingView: React.FC<FinancingViewProps> = ({
  financiamientos,
  pacientes,
  userRole,
  onNewFinancingPlan,
  onOpenNewPaymentForPatient,
  onSelectPatient
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  const permissions = getRolePermissions(userRole);

  // Cálculo de KPIs Globales
  const totalFinanciado = financiamientos.reduce((sum, f) => sum + (f.costoTotalCirugia || 0), 0);
  const totalAbonado = financiamientos.reduce((sum, f) => sum + (f.montoAbonado || 0), 0);
  const totalPendiente = financiamientos.reduce((sum, f) => sum + (f.saldoPendiente || 0), 0);
  const enMoraCount = financiamientos.filter(f => f.estadoFinanciero === 'En Mora').length;

  // Filtrado de planes
  const filteredPlans = financiamientos.filter(f => {
    if (!f) return false;
    const paciente = pacientes.find(p => p && p.id === f.pacienteId);
    const pacienteNombre = (paciente?.nombre || '').toLowerCase();
    const term = (searchTerm || '').toLowerCase();

    const matchesSearch =
      (f.procedimiento || '').toLowerCase().includes(term) ||
      (f.planId || '').toLowerCase().includes(term) ||
      (f.pacienteId || '').toLowerCase().includes(term) ||
      pacienteNombre.includes(term);

    const matchesStatus = selectedStatus === 'Todos' || f.estadoFinanciero === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif italic font-bold text-teal-700 tracking-tight">Financiamiento de Cirugías</h1>
          <p className="text-xs text-slate-500 mt-1">
            Seguimiento de cuotas, montos abonados, saldos por cobrar y programación quirúrgica.
          </p>
        </div>

        {permissions.canCreateFinancingPlan && (
          <button
            onClick={onNewFinancingPlan}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg shadow-2xs flex items-center justify-center space-x-2 transition-all cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Nuevo Plan de Financiamiento</span>
          </button>
        )}
      </div>

      {/* TARJETAS KPI DE CRÉDITO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest">Total Proyectado</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">${totalFinanciado.toLocaleString()} <span className="text-xs font-normal text-slate-400">USD</span></div>
          <p className="text-[11px] text-slate-400 mt-0.5">{financiamientos.length} planes configurados</p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-emerald-700 block tracking-widest">Total Cobrado</span>
          <div className="text-2xl font-bold text-emerald-800 mt-1">${totalAbonado.toLocaleString()} <span className="text-xs font-normal text-slate-400">USD</span></div>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Recaudación acumulada</p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-amber-800 block tracking-widest">Saldo por Cobrar</span>
          <div className="text-2xl font-bold text-amber-900 mt-1">${totalPendiente.toLocaleString()} <span className="text-xs font-normal text-slate-400">USD</span></div>
          <p className="text-[11px] text-amber-700 font-medium mt-0.5">Pendiente por abonar</p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-rose-800 block tracking-widest">Planes en Mora</span>
          <div className="text-2xl font-bold text-rose-900 mt-1">{enMoraCount}</div>
          <p className="text-[11px] text-rose-700 font-medium mt-0.5">Requieren cobro urgente</p>
        </div>

      </div>

      {/* BÚSQUEDA Y FILTRO */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Buscar por Plan ID, Paciente, Cédula o Procedimiento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-100 border-none rounded-full focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 text-slate-800 placeholder-slate-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-700"
          >
            <option value="Todos">Todos los Estados Financieros</option>
            <option value="Al día">Al día</option>
            <option value="En Mora">En Mora</option>
            <option value="Pagado Totalmente">Pagado Totalmente</option>
          </select>
        </div>
      </div>

      {/* GRID DE PLANES FINANCIEROS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPlans.length === 0 ? (
          <div className="col-span-2 bg-white p-12 text-center rounded-lg border border-slate-200 text-slate-400 text-xs shadow-2xs">
            No hay planes de financiamiento que coincidan con la búsqueda.
          </div>
        ) : (
          filteredPlans.map((plan) => {
            const paciente = pacientes.find(p => p.id === plan.pacienteId);
            const porcentaje = Math.min(100, Math.round((plan.montoAbonado / plan.costoTotalCirugia) * 100));

            return (
              <div
                key={plan.planId}
                className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs hover:shadow-xs transition-all space-y-4"
              >
                {/* CABECERA PLAN */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{plan.planId}</span>
                    <h3 className="text-base font-bold text-slate-900">{plan.procedimiento}</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Paciente: <button onClick={() => onSelectPatient(plan.pacienteId)} className="text-teal-700 hover:underline font-bold cursor-pointer">{paciente?.nombre || plan.pacienteId}</button>
                    </p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    plan.estadoFinanciero === 'Pagado Totalmente' ? 'bg-emerald-50 text-emerald-700' :
                    plan.estadoFinanciero === 'En Mora' ? 'bg-rose-50 text-rose-700' :
                    'bg-sky-50 text-sky-700'
                  }`}>
                    {plan.estadoFinanciero}
                  </span>
                </div>

                {/* MÉTRICAS FINANCIERAS */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg text-center text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Costo Total</span>
                    <strong className="text-slate-900 font-bold">${plan.costoTotalCirugia.toLocaleString()} USD</strong>
                  </div>

                  <div>
                    <span className="text-[9px] text-emerald-700 uppercase tracking-wider block font-bold">Abonado</span>
                    <strong className="text-emerald-800 font-bold">${plan.montoAbonado.toLocaleString()} USD</strong>
                  </div>

                  <div>
                    <span className="text-[9px] text-amber-800 uppercase tracking-wider block font-bold">Pendiente</span>
                    <strong className="text-amber-900 font-bold">${plan.saldoPendiente.toLocaleString()} USD</strong>
                  </div>
                </div>

                {/* PROGRESO */}
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                    <span>Avance ({porcentaje}%)</span>
                    <span>Cuotas Totales: {plan.cuotasTotales}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-600 h-full rounded-full transition-all"
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </div>

                {/* FOOTER ACCIONES */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    Op. Est.: <strong className="ml-1 text-slate-700">{plan.fechaEstimadaCirugia}</strong>
                  </span>

                  {permissions.canRegisterPayment && paciente && (
                    <button
                      onClick={() => onOpenNewPaymentForPatient(paciente)}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Registrar Abono</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
