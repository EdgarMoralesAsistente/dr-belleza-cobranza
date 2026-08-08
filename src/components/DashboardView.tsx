import React from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Calendar,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  HeartHandshake
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  Paciente,
  Pago,
  ActividadCRM,
  FinanciamientoCirugia
} from '../types';

interface DashboardViewProps {
  pacientes: Paciente[];
  pagos: Pago[];
  actividades: ActividadCRM[];
  financiamientos: FinanciamientoCirugia[];
  onSelectPatient: (pacienteId: string) => void;
  onNavigateToTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  pacientes,
  pagos,
  actividades,
  financiamientos,
  onSelectPatient,
  onNavigateToTab
}) => {
  // CÁLCULO DE KPIS
  const totalPacientes = (pacientes || []).length;

  // Total recaudado este mes (Ej: Febrero / Agosto 2026)
  const totalRecaudadoMes = (pagos || []).reduce((sum, p) => sum + (p?.abono || 0), 0);

  // Total Saldo por Cobrar
  const totalSaldoPendiente = (financiamientos || []).reduce((sum, f) => sum + (f?.saldoPendiente || 0), 0);

  // Planes en Mora
  const planesEnMora = (financiamientos || []).filter(f => f && f.estadoFinanciero === 'En Mora');

  // Próximas Cirugías (Fecha estimada futura)
  const proximasCirugias = [...(financiamientos || [])]
    .filter(f => f && f.fechaEstimadaCirugia)
    .sort((a, b) => (a.fechaEstimadaCirugia || '').localeCompare(b.fechaEstimadaCirugia || ''))
    .slice(0, 5);

  // DATOS PARA GRÁFICOS RECHARTS
  // 1. Recaudación vs Saldo por Procedimiento
  const chartDataProcedimientos = (financiamientos || []).map(f => {
    const proc = f?.procedimiento || 'Sin especificación';
    return {
      name: proc.length > 18 ? proc.substring(0, 16) + '...' : proc,
      Abonado: f?.montoAbonado || 0,
      Pendiente: f?.saldoPendiente || 0
    };
  });

  // 2. Métodos de Pago Breakdown
  const metodosCount: { [key: string]: number } = {};
  (pagos || []).forEach(p => {
    if (p && p.metodoDePago) {
      metodosCount[p.metodoDePago] = (metodosCount[p.metodoDePago] || 0) + (p.abono || 0);
    }
  });

  const pieDataMetodos = Object.keys(metodosCount).map(key => ({
    name: key,
    value: metodosCount[key]
  }));

  const COLORS = ['#0d9488', '#0284c7', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981'];

  // Actividades del día o urgentes
  const todayStr = new Date().toISOString().split('T')[0];
  const actividadesUrgentes = (actividades || []).filter(a => a && a.estado === 'Pendiente');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      
      {/* HEADER DE BIENVENIDA CLEAN MINIMALISM */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif italic font-bold text-teal-700 tracking-tight">
            Dashboard Analítico
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Monitoreo en tiempo real de pacientes, financiamiento quirúrgico y agenda médica.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigateToTab('google-sheets')}
            className="flex items-center space-x-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold px-4 py-2 rounded-lg shadow-2xs transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Base de Datos Conectada</span>
          </button>
        </div>
      </div>

      {/* TARJETAS DE KPIS PRINCIPALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: PACIENTES ACTIVOS */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Total Pacientes</span>
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-slate-900">{totalPacientes}</div>
            <p className="text-xs text-teal-600 font-medium mt-1 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              100% Registrados en Sistema
            </p>
          </div>
        </div>

        {/* KPI 2: RECAUDACIÓN TOTAL */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Total Recaudado</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-slate-900">${totalRecaudadoMes.toLocaleString()} <span className="text-xs font-normal text-slate-400">USD</span></div>
            <p className="text-xs text-slate-400 mt-1">Abonos recibidos a la fecha</p>
          </div>
        </div>

        {/* KPI 3: SALDO POR COBRAR */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Saldo por Cobrar</span>
            <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-slate-900">${totalSaldoPendiente.toLocaleString()} <span className="text-xs font-normal text-slate-400">USD</span></div>
            <p className="text-xs text-amber-600 font-medium mt-1">
              {planesEnMora.length} Planes con cuota en Mora
            </p>
          </div>
        </div>

        {/* KPI 4: PLANES Y CIRUGÍAS */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Próximas Cirugías</span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-slate-900">{financiamientos.length}</div>
            <p className="text-xs text-slate-400 mt-1">Planes quirúrgicos activos</p>
          </div>
        </div>

      </div>

      {/* ALERTAS DE COBRO / MOROSOS */}
      {planesEnMora.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">Atención: Pacientes en Mora Detectados</h4>
              <p className="text-xs text-rose-700">
                Hay {planesEnMora.length} paciente(s) con cuota vencida que requieren seguimiento inmediato.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToTab('financiamiento')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors shrink-0 cursor-pointer"
          >
            Ver Morosos
          </button>
        </div>
      )}

      {/* SECCIÓN DE GRÁFICOS Y ANÁLISIS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRÁFICO BARRA: RECAUDACIÓN VS PENDIENTE */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Financiamiento por Cirugía / Procedimiento</h3>
              <p className="text-xs text-slate-400">Comparativa entre Monto Abonado vs. Saldo Pendiente (USD)</p>
            </div>
            <span className="text-[10px] uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-bold">USD ($)</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDataProcedimientos} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()} USD`, '']}
                />
                <Bar dataKey="Abonado" fill="#0d9488" radius={[4, 4, 0, 0]} name="Abonado ($)" />
                <Bar dataKey="Pendiente" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Pendiente ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO PIE: MÉTODOS DE PAGO */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 text-base">Métodos de Pago Utilizados</h3>
            <p className="text-xs text-slate-400">Distribución de ingresos abonados</p>
          </div>

          <div className="h-60 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieDataMetodos}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieDataMetodos.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`$${Number(val).toLocaleString()} USD`, 'Monto']} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* SECCIÓN INFERIOR: PRÓXIMAS CIRUGÍAS Y ACTIVIDADES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LISTA DE PRÓXIMAS CIRUGÍAS */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-teal-600" />
              <h3 className="font-semibold text-slate-900 text-base">Próximas Cirugías Programadas</h3>
            </div>
            <button
              onClick={() => onNavigateToTab('financiamiento')}
              className="text-xs text-teal-600 font-semibold hover:underline flex items-center cursor-pointer"
            >
              Ver Todas <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {proximasCirugias.map((f) => {
              const paciente = pacientes.find(p => p.id === f.pacienteId);
              return (
                <div
                  key={f.planId}
                  onClick={() => onSelectPatient(f.pacienteId)}
                  className="p-3.5 rounded-lg border border-slate-100 hover:border-teal-200 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{f.procedimiento}</h4>
                    <p className="text-xs text-slate-500">
                      Paciente: <strong className="text-slate-800">{paciente?.nombre || f.pacienteId}</strong>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 inline-block">
                      {f.fechaEstimadaCirugia}
                    </span>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Saldo: ${f.saldoPendiente} USD
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ACTIVIDADES Y ALERTAS CRM DEL DÍA */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h3 className="font-semibold text-slate-900 text-base">Actividades CRM Pendientes</h3>
            </div>
            <button
              onClick={() => onNavigateToTab('crm')}
              className="text-xs text-amber-600 font-semibold hover:underline flex items-center cursor-pointer"
            >
              Ver Agenda <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {actividadesUrgentes.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No hay actividades pendientes en el sistema.
              </div>
            ) : (
              actividadesUrgentes.slice(0, 5).map((a) => (
                <div
                  key={a.actividadId}
                  className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                        {a.tipoActividad}
                      </span>
                      <span className="text-xs text-slate-400">{a.fechaProgramada} - {a.hora}</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium">{a.descripcion}</p>
                  </div>
                  <button
                    onClick={() => onSelectPatient(a.pacienteId)}
                    className="text-xs font-semibold text-teal-600 hover:text-teal-800 underline shrink-0 ml-2 cursor-pointer"
                  >
                    Ficha 360°
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
