import React from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  Clock,
  RotateCcw,
  ArrowDownLeft,
  ShieldAlert,
  Wallet,
  Activity,
  CheckCircle2,
  PieChart as PieChartIcon,
  Scale
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
  Legend,
  AreaChart,
  Area,
  ComposedChart,
  Line
} from 'recharts';
import {
  Paciente,
  Pago,
  ActividadCRM,
  FinanciamientoCirugia,
  Reintegro
} from '../types';

interface DashboardViewProps {
  pacientes: Paciente[];
  pagos: Pago[];
  actividades: ActividadCRM[];
  financiamientos: FinanciamientoCirugia[];
  reintegros?: Reintegro[];
  onSelectPatient: (pacienteId: string) => void;
  onNavigateToTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  pacientes = [],
  pagos = [],
  actividades = [],
  financiamientos = [],
  reintegros = [],
  onSelectPatient,
  onNavigateToTab
}) => {
  // -------------------------------------------------------------
  // CÁLCULO DE KPIS - COLUMNA 1: INGRESOS & FINANCIAMIENTOS
  // -------------------------------------------------------------
  const totalPacientes = (pacientes || []).length;
  const totalRecaudadoMes = (pagos || []).reduce((sum, p) => sum + (p?.abono || 0), 0);
  const totalSaldoPendienteCobro = (financiamientos || []).reduce((sum, f) => sum + (f?.saldoPendiente || 0), 0);
  const planesEnMora = (financiamientos || []).filter(f => f && f.estadoFinanciero === 'En Mora');
  const planesActivos = (financiamientos || []).length;

  // -------------------------------------------------------------
  // CÁLCULO DE KPIS - COLUMNA 2: EGRESOS & REINTEGROS
  // -------------------------------------------------------------
  const totalSolicitudesReintegro = (reintegros || []).length;
  const reintegrosPendientes = (reintegros || []).filter(
    r => r && (r.estadoReintegro === 'Pendiente' || r.estadoReintegro === 'En Proceso')
  ).length;

  const totalReintegroNetoAprobado = (reintegros || []).reduce((sum, r) => sum + (r?.montoNetoReintegro || 0), 0);
  const totalReintegroEfectivamentePagado = (reintegros || []).reduce((sum, r) => sum + (r?.montoEfectivamentePagado || 0), 0);
  const totalGastosAdminRetenidos = (reintegros || []).reduce((sum, r) => sum + (r?.gastosAdmin20 || 0), 0);
  const totalSaldoPendienteReintegro = (reintegros || []).reduce((sum, r) => sum + (r?.saldoPendiente || 0), 0);

  const porcentajeAvanceReintegroGlobal = totalReintegroNetoAprobado > 0
    ? Math.min(100, Math.round((totalReintegroEfectivamentePagado / totalReintegroNetoAprobado) * 100))
    : 100;

  // Flujo Neto Residual (Total Recaudado Bruto - Total Reintegro Devuelto)
  const flujoNetoReal = totalRecaudadoMes - totalReintegroEfectivamentePagado;

  // -------------------------------------------------------------
  // GRÁFICOS Y ANÁLISIS ESTRATÉGICO
  // -------------------------------------------------------------

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

  const COLORS_METODOS = ['#0d9488', '#0284c7', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981'];

  // 3. NUEVO GRÁFICO A: Flujo Financiero Comparativo (Ingresos Brutos vs Egresos Reintegro vs Flujo Neto)
  const chartFlujoFinanciero = [
    {
      concepto: 'Ingresos Abonados',
      Monto: totalRecaudadoMes,
      fill: '#10b981'
    },
    {
      concepto: 'Egresos Reintegros',
      Monto: totalReintegroEfectivamentePagado,
      fill: '#ef4444'
    },
    {
      concepto: 'Retención Admin 20%',
      Monto: totalGastosAdminRetenidos,
      fill: '#f59e0b'
    },
    {
      concepto: 'Flujo Neto Residual',
      Monto: Math.max(0, flujoNetoReal),
      fill: '#0284c7'
    }
  ];

  // 4. NUEVO GRÁFICO B: Desglose Estructural de Reintegros (Efectivamente Pagado vs Saldo Pendiente vs Gastos Admin)
  const chartDesgloseReintegros = [
    {
      categoria: 'Balance Reintegros',
      'Devuelto a la Fecha': totalReintegroEfectivamentePagado,
      'Saldo Pendiente Dev.': totalSaldoPendienteReintegro,
      'Gastos Admin Retenidos (20%)': totalGastosAdminRetenidos
    }
  ];

  // 5. NUEVO GRÁFICO C: Salud Crediticia & Estatus Financiero de Cartera
  const statusCounts: { [key: string]: number } = {
    'Al día': 0,
    'En Mora': 0,
    'Pagado Totalmente': 0,
    'En Reintegro': 0,
    'Reintegro Completado': 0
  };

  (financiamientos || []).forEach(f => {
    if (f && f.estadoFinanciero) {
      statusCounts[f.estadoFinanciero] = (statusCounts[f.estadoFinanciero] || 0) + 1;
    }
  });

  const pieDataEstatus = Object.keys(statusCounts)
    .filter(k => statusCounts[k] > 0)
    .map(key => ({
      name: key,
      value: statusCounts[key]
    }));

  const ESTATUS_COLORS: { [key: string]: string } = {
    'Al día': '#10b981',
    'En Mora': '#ef4444',
    'Pagado Totalmente': '#0284c7',
    'En Reintegro': '#f59e0b',
    'Reintegro Completado': '#64748b'
  };

  // Próximas Cirugías
  const proximasCirugias = [...(financiamientos || [])]
    .filter(f => f && f.fechaEstimadaCirugia)
    .sort((a, b) => (a.fechaEstimadaCirugia || '').localeCompare(b.fechaEstimadaCirugia || ''))
    .slice(0, 5);

  // Actividades CRM pendientes
  const actividadesUrgentes = (actividades || []).filter(a => a && a.estado === 'Pendiente');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 bg-slate-50/50 min-h-screen">
      
      {/* HEADER DE BIENVENIDA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 bg-white p-6 rounded-2xl border shadow-2xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-serif italic font-bold text-teal-800 tracking-tight">
              Dashboard Analítico Executive
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-extrabold uppercase border border-teal-200">
              SurgiControl Pro
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Análisis financiero consolidado de ingresos, cartera de financiamiento y flujo de egresos/reintegros.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigateToTab('google-sheets')}
            className="flex items-center space-x-2 bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sincronización Sheets Activa</span>
          </button>
        </div>
      </div>

      {/* ALERTAS CRÍTICAS DE MORA O REINTEGROS PENDIENTES */}
      {(planesEnMora.length > 0 || reintegrosPendientes > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {planesEnMora.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-rose-900 uppercase tracking-wider">Atención: Pacientes en Mora</h4>
                  <p className="text-xs text-rose-700">
                    {planesEnMora.length} plan(es) quirúrgico(s) con cuotas vencidas.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateToTab('financiamiento')}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-colors shrink-0 cursor-pointer"
              >
                Ver Morosos
              </button>
            </div>
          )}

          {reintegrosPendientes > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">Atención: Reintegros Pendientes</h4>
                  <p className="text-xs text-amber-800">
                    Hay {reintegrosPendientes} solicitud(es) de devolución por procesar.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateToTab('reintegros')}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-colors shrink-0 cursor-pointer"
              >
                Gestionar Egresos
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECCIÓN DE KPIS AGRUPADOS: 1 LÍNEA / 2 COLUMNAS (INGRESOS VS REINTEGROS)   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* COLUMNA 1: INGRESOS & FINANCIAMIENTOS */}
        <div className="bg-white p-5 rounded-2xl border border-teal-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-teal-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold shrink-0">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-teal-950">
                  1. Indicadores de Ingresos & Cobranza
                </h2>
                <p className="text-[11px] text-slate-500">Recaudación acumulada, cuentas por cobrar y pacientes</p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold uppercase bg-teal-50 text-teal-800 px-2.5 py-1 rounded-full border border-teal-200">
              Entradas ($)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* KPI 1.1: PACIENTES & PLANES */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Total Pacientes</span>
                <div className="w-7 h-7 rounded-md bg-teal-100 text-teal-700 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-extrabold text-slate-900">{totalPacientes}</div>
                <p className="text-[11px] text-teal-700 font-semibold mt-0.5">
                  {planesActivos} planes quirúrgicos activos
                </p>
              </div>
            </div>

            {/* KPI 1.2: TOTAL RECAUDADO (ABONOS) */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Total Recaudado</span>
                <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <DollarSign className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-extrabold text-emerald-800">
                  ${totalRecaudadoMes.toLocaleString()} <span className="text-xs font-normal text-slate-500">USD</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Ingresos abonados a la fecha</p>
              </div>
            </div>

            {/* KPI 1.3: SALDO POR COBRAR */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Saldo por Cobrar</span>
                <div className="w-7 h-7 rounded-md bg-sky-100 text-sky-700 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-extrabold text-sky-900">
                  ${totalSaldoPendienteCobro.toLocaleString()} <span className="text-xs font-normal text-slate-500">USD</span>
                </div>
                <p className="text-[11px] text-amber-700 font-semibold mt-0.5">
                  {planesEnMora.length} plan(es) con cuota en Mora
                </p>
              </div>
            </div>

            {/* KPI 1.4: FLUJO NETO DISPONIBLE */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Flujo Neto Retenido</span>
                <div className="w-7 h-7 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-extrabold text-indigo-950">
                  ${Math.max(0, flujoNetoReal).toLocaleString()} <span className="text-xs font-normal text-slate-500">USD</span>
                </div>
                <p className="text-[11px] text-indigo-700 font-semibold mt-0.5">
                  Recaudado neto descontando egresos
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA 2: EGRESOS & REINTEGROS */}
        <div className="bg-white p-5 rounded-2xl border border-amber-300/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-amber-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-amber-950">
                  2. Indicadores de Egresos & Reintegros
                </h2>
                <p className="text-[11px] text-slate-500">Solicitudes de devolución, desembolsos y retención del 20%</p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold uppercase bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200">
              Salidas ($)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* KPI 2.1: TOTAL SOLICITUDES */}
            <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200/70 hover:bg-amber-50/80 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-900">Solicitudes Reintegro</span>
                <div className="w-7 h-7 rounded-md bg-amber-200 text-amber-900 flex items-center justify-center font-extrabold text-xs">
                  {totalSolicitudesReintegro}
                </div>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-extrabold text-amber-950">{totalSolicitudesReintegro}</div>
                <p className="text-[11px] text-amber-800 font-semibold mt-0.5">
                  {reintegrosPendientes} pendientes de pago
                </p>
              </div>
            </div>

            {/* KPI 2.2: REINTEGRO NETO APROBADO ($R) */}
            <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200/70 hover:bg-amber-50/80 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-900">Reintegro Neto Aprobado ($R)</span>
                <div className="w-7 h-7 rounded-md bg-amber-200 text-amber-900 flex items-center justify-center">
                  <Scale className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-extrabold text-amber-900">
                  ${totalReintegroNetoAprobado.toLocaleString()} <span className="text-xs font-normal text-slate-500">USD</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Monto total computable (80%)</p>
              </div>
            </div>

            {/* KPI 2.3: EFECTIVAMENTE DEVUELTO + BARRA DE PROGRESO */}
            <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200/70 hover:bg-amber-50/80 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800">Efectivamente Devuelto</span>
                <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-extrabold text-emerald-700">
                  ${totalReintegroEfectivamentePagado.toLocaleString()} <span className="text-xs font-normal text-slate-500">USD</span>
                </div>
                <div className="mt-1.5">
                  <div className="flex justify-between text-[10px] text-slate-600 font-bold mb-0.5">
                    <span>Cumplimiento Global</span>
                    <span className="text-emerald-700">{porcentajeAvanceReintegroGlobal}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${porcentajeAvanceReintegroGlobal}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* KPI 2.4: SALDO PENDIENTE DEV & GASTOS ADMIN RETENIDOS */}
            <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200/70 hover:bg-amber-50/80 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-800">Saldo Pendiente Dev.</span>
                <div className="w-7 h-7 rounded-md bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                  20%
                </div>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-extrabold text-rose-700">
                  ${totalSaldoPendienteReintegro.toLocaleString()} <span className="text-xs font-normal text-slate-500">USD</span>
                </div>
                <p className="text-[11px] text-amber-900 font-bold mt-0.5">
                  Retenido Admin (20%): <span className="text-emerald-700">+${totalGastosAdminRetenidos.toLocaleString()} USD</span>
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN DE GRÁFICOS Y ANÁLISIS ESTRATÉGICO (5 GRÁFICOS DE ALTO VALOR)      */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-serif italic font-bold text-slate-900">
              Análisis Estratégico de Negocio & Cartera
            </h2>
            <p className="text-xs text-slate-500">
              Visualización de flujo de caja, balance de reintegros y salud crediticia para toma de decisiones.
            </p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold">
            5 Gráficos Analíticos
          </span>
        </div>

        {/* FILA 1: GRÁFICO EXISTENTE 1 + NUEVO GRÁFICO A (FLUJO NETO COMPARATIVO) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* GRÁFICO 1: RECAUDACIÓN VS PENDIENTE POR PROCEDIMIENTO */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">1. Financiamiento por Procedimiento Quirúrgico</h3>
                <p className="text-xs text-slate-400">Comparativa de Monto Abonado vs. Saldo Pendiente por tipo de cirugía</p>
              </div>
              <span className="text-[10px] uppercase font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">USD ($)</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDataProcedimientos} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-10} textAnchor="end" />
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

          {/* NUEVO GRÁFICO A: FLUJO NETO REAL (ENTRADAS VS REINTEGROS VS RETENCIÓN) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">2. Flujo Financiero Neto: Ingresos vs. Devoluciones</h3>
                <p className="text-xs text-slate-400">Monto total captado, egresos por devolución y margen retenido</p>
              </div>
              <span className="text-[10px] uppercase font-bold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
                Tasa de Retención
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartFlujoFinanciero} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="concepto" type="category" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                    formatter={(val: any) => [`$${Number(val).toLocaleString()} USD`, 'Monto Total']}
                  />
                  <Bar dataKey="Monto" radius={[0, 6, 6, 0]}>
                    {chartFlujoFinanciero.map((entry, index) => (
                      <Cell key={`cell-flujo-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* FILA 2: NUEVO GRÁFICO B + NUEVO GRÁFICO C + GRÁFICO EXISTENTE 2 (MÉTODOS) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* NUEVO GRÁFICO B: ESTRUCTURA DE REINTEGROS Y RETENCIÓN 20% */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-900 text-sm">3. Desglose Estructural de Reintegros</h3>
                <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded">Norma 20%</span>
              </div>
              <p className="text-xs text-slate-400">Devuelto efectivamente vs. Saldo por liquidar vs. Gastos Admin</p>
            </div>

            <div className="h-56 w-full my-auto pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDesgloseReintegros} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="categoria" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                    formatter={(val: any) => [`$${Number(val).toLocaleString()} USD`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="Devuelto a la Fecha" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Saldo Pendiente Dev." fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Gastos Admin Retenidos (20%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* NUEVO GRÁFICO C: SALUD CREDITICIA DE CARTERA (ESTATUS FINANCIERO) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-900 text-sm">4. Salud Crediticia de Cartera</h3>
                <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded">Estatus</span>
              </div>
              <p className="text-xs text-slate-400">Distribución de planes por estado financiero (Mora, Al día, Reintegro)</p>
            </div>

            <div className="h-56 w-full my-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieDataEstatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieDataEstatus.map((entry, index) => (
                      <Cell key={`cell-estatus-${index}`} fill={ESTATUS_COLORS[entry.name] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => [`${val} paciente(s)`, 'Cantidad']} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GRÁFICO EXISTENTE 2: MÉTODOS DE PAGO UTILIZADOS */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">5. Canales de Cobro Utilizados</h3>
              <p className="text-xs text-slate-400">Distribución porcentual por método de pago</p>
            </div>

            <div className="h-56 w-full my-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieDataMetodos}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieDataMetodos.map((_, index) => (
                      <Cell key={`cell-metodo-${index}`} fill={COLORS_METODOS[index % COLORS_METODOS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => [`$${Number(val).toLocaleString()} USD`, 'Monto']} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN INFERIOR: PRÓXIMAS CIRUGÍAS Y ACTIVIDADES CRM                     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LISTA DE PRÓXIMAS CIRUGÍAS */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-teal-700" />
              <h3 className="font-bold text-slate-900 text-base">Próximas Cirugías Programadas</h3>
            </div>
            <button
              onClick={() => onNavigateToTab('financiamiento')}
              className="text-xs text-teal-700 font-bold hover:underline flex items-center cursor-pointer"
            >
              Ver Todas <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {proximasCirugias.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No hay cirugías estimadas registradas en este período.
              </div>
            ) : (
              proximasCirugias.map((f) => {
                const paciente = pacientes.find(p => p.id === f.pacienteId);
                return (
                  <div
                    key={f.planId}
                    onClick={() => onSelectPatient(f.pacienteId)}
                    className="p-3.5 rounded-xl border border-slate-100 hover:border-teal-300 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">{f.procedimiento}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Paciente: <strong className="text-slate-800">{paciente?.nombre || f.pacienteId}</strong>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-extrabold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200 inline-block">
                        {f.fechaEstimadaCirugia}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-1 font-medium">
                        Saldo: ${f.saldoPendiente} USD
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ACTIVIDADES Y ALERTAS CRM DEL DÍA */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-base">Actividades CRM & Cobranza Pendientes</h3>
            </div>
            <button
              onClick={() => onNavigateToTab('crm')}
              className="text-xs text-amber-700 font-bold hover:underline flex items-center cursor-pointer"
            >
              Ver Agenda <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {actividadesUrgentes.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No hay actividades de seguimiento pendientes.
              </div>
            ) : (
              actividadesUrgentes.slice(0, 5).map((a) => (
                <div
                  key={a.actividadId}
                  className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 flex items-start justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                        {a.tipoActividad}
                      </span>
                      <span className="text-xs text-slate-500">{a.fechaProgramada} - {a.hora}</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium">{a.descripcion}</p>
                  </div>
                  <button
                    onClick={() => onSelectPatient(a.pacienteId)}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 underline shrink-0 ml-2 cursor-pointer"
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
