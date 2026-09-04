import React, { useState, useEffect } from 'react';
import {
  X,
  TrendingUp,
  DollarSign,
  Plus,
  Check,
  Tag,
  Printer,
  Sparkles,
  Calculator,
  Calendar,
  CheckSquare,
  Square,
  Gift,
  Search
} from 'lucide-react';
import { FinanciamientoCirugia, Paciente, RolUsuario, getRolePermissions } from '../types';
import { StorageService } from '../services/storageService';
import {
  getActiveCatalog,
  getActiveCoupons,
  getActivePlanOptions,
  ProcedureCatalogItem,
  CouponItem,
  FinancingPlanOption,
  printPatientFinancingPDF,
  calculatePaymentSchedule,
  matchesSearch,
  normalizeSearchText
} from '../services/financingConfig';

interface NewFinancingPlanModalProps {
  pacientes: Paciente[];
  preselectedPatient?: Paciente | null;
  onClose: () => void;
  onSave: (plan: FinanciamientoCirugia) => void;
  userRole?: RolUsuario;
}

export const NewFinancingPlanModal: React.FC<NewFinancingPlanModalProps> = ({
  pacientes,
  preselectedPatient,
  onClose,
  onSave,
  userRole
}) => {
  const permissions = getRolePermissions(userRole);

  if (userRole && !permissions.canCreateFinancingPlan) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center space-y-4 shadow-xl border border-slate-200">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Acceso Restringido</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Tu perfil de usuario (<span className="font-semibold text-slate-800">{userRole}</span>) no cuenta con permisos para crear o configurar nuevos planes de financiamiento quirúrgico.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Cerrar Ventana
          </button>
        </div>
      </div>
    );
  }
  const [selectedPacienteId, setSelectedPacienteId] = useState(
    preselectedPatient ? preselectedPatient.id : (pacientes[0]?.id || '')
  );

  const activePatient = pacientes.find(p => p.id === selectedPacienteId) || pacientes[0];

  // 1. Tipo de Pago: Contado vs Financiamiento
  const [tipoPago, setTipoPago] = useState<'Contado' | 'Financiamiento'>('Financiamiento');

  // 2. Combo Quirúrgico (Selección Múltiple)
  const [catalog, setCatalog] = useState<ProcedureCatalogItem[]>(getActiveCatalog());
  const [selectedProcIds, setSelectedProcIds] = useState<string[]>(['proc_1']); // Default: Mamoplastia
  const [searchProcText, setSearchProcText] = useState('');

  // Modal para agregar cirugía personalizada
  const [showCustomProcForm, setShowCustomProcForm] = useState(false);
  const [customProcName, setCustomProcName] = useState('');
  const [customProcPrice, setCustomProcPrice] = useState<number>(1500);

  // 3. Cupones de Descuento
  const [couponsList, setCouponsList] = useState<CouponItem[]>(getActiveCoupons());
  const [selectedCouponCode, setSelectedCouponCode] = useState<string>('NINGUNO');

  // Modal/Inline form para crear nuevo cupón
  const [showNewCouponForm, setShowNewCouponForm] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDesc, setNewCouponDesc] = useState('');
  const [newCouponType, setNewCouponType] = useState<'porcentaje' | 'monto_fijo'>('porcentaje');
  const [newCouponVal, setNewCouponVal] = useState<number>(10);

  // 4. Plan de Financiamiento (Duración / Cuotas)
  const [selectedPlanOptionId, setSelectedPlanOptionId] = useState<string>('plan_12m');
  const [cuotasTotales, setCuotasTotales] = useState<number>(12);
  const [montoInicial, setMontoInicial] = useState<number | string>(1000);
  const [fechaEstimadaCirugia, setFechaEstimadaCirugia] = useState('2026-06-15');

  // Sincronización en tiempo real del catálogo quirúrgico multiusuario
  useEffect(() => {
    const handleUpdate = () => {
      setCatalog(getActiveCatalog());
      setCouponsList(getActiveCoupons());
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('catalog-updated', handleUpdate);
    window.addEventListener('drb-data-changed', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('catalog-updated', handleUpdate);
      window.removeEventListener('drb-data-changed', handleUpdate);
    };
  }, []);

  // CÁLCULOS EN TIEMPO REAL
  const selectedProcedures = catalog.filter(p => selectedProcIds.includes(p.id));
  
  // Subtotal de procedimientos seleccionados
  const subtotalCost = selectedProcedures.reduce((acc, p) => acc + p.precioDefault, 0);

  // Cupón seleccionado
  const activeCoupon = couponsList.find(c => c.codigo === selectedCouponCode) || couponsList[0];

  // Descuento calculado
  let descuentoMonto = 0;
  if (activeCoupon && activeCoupon.codigo !== 'NINGUNO') {
    if (activeCoupon.tipo === 'porcentaje') {
      descuentoMonto = Math.round((subtotalCost * activeCoupon.valor) / 100);
    } else {
      descuentoMonto = Math.min(subtotalCost, activeCoupon.valor);
    }
  }

  // Costo Total Neto
  const costoTotalCirugia = Math.max(0, subtotalCost - descuentoMonto);

  // Abono Inicial numérico
  const numMontoInicial = typeof montoInicial === 'number' ? montoInicial : (parseFloat(montoInicial as string) || 0);

  // Saldo Pendiente
  const saldoPendiente = Math.max(0, costoTotalCirugia - numMontoInicial);

  // Valor por cuota
  const cuotasActuales = tipoPago === 'Contado' ? 1 : cuotasTotales;
  const montoCuotaEst = cuotasActuales > 0 ? Math.round(saldoPendiente / cuotasActuales) : 0;

  // Actualizar cuando cambia el paciente
  useEffect(() => {
    if (activePatient) {
      // Buscar match con el procedimiento del paciente si existe
      const procMatch = catalog.find(p => p && p.nombre && activePatient.procedimiento && p.nombre.toLowerCase().includes(activePatient.procedimiento.toLowerCase()));
      if (procMatch) {
        setSelectedProcIds([procMatch.id]);
      }
    }
  }, [selectedPacienteId]);

  // Cambiar tipo de pago ajusta la opción de plan
  const handleSelectTipoPago = (type: 'Contado' | 'Financiamiento') => {
    setTipoPago(type);
    if (type === 'Contado') {
      setSelectedPlanOptionId('plan_contado');
      setCuotasTotales(1);
    } else {
      setSelectedPlanOptionId('plan_12m');
      setCuotasTotales(12);
    }
  };

  // Cambiar plan de financiamiento preconfigurado
  const handleSelectPlanOption = (optionId: string) => {
    setSelectedPlanOptionId(optionId);
    const opt = getActivePlanOptions().find(o => o.id === optionId);
    if (opt) {
      setCuotasTotales(opt.cuotas);
      if (opt.id === 'plan_contado') {
        setTipoPago('Contado');
      } else {
        setTipoPago('Financiamiento');
      }
    }
  };

  // Toggle procedimiento quirúrgico en el combo
  const toggleProcedure = (procId: string) => {
    if (selectedProcIds.includes(procId)) {
      if (selectedProcIds.length > 1) {
        setSelectedProcIds(selectedProcIds.filter(id => id !== procId));
      }
    } else {
      setSelectedProcIds([...selectedProcIds, procId]);
    }
  };

  // Agregar procedimiento personalizado
  const handleAddCustomProcedure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customProcName.trim() || customProcPrice <= 0) return;

    const newProc: ProcedureCatalogItem = {
      id: `custom_${Date.now()}`,
      nombre: customProcName.trim(),
      categoria: 'Cirugía Especial',
      precioDefault: Number(customProcPrice),
      activo: true
    };

    const updated = StorageService.addCatalogItem(newProc);
    setCatalog(updated);
    setSelectedProcIds(prev => prev.includes(newProc.id) ? prev : [...prev, newProc.id]);
    setCustomProcName('');
    setCustomProcPrice(1500);
    setShowCustomProcForm(false);
  };

  // Crear nuevo cupón de descuento
  const handleCreateNewCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim() || newCouponVal <= 0) return;

    const formattedCode = newCouponCode.trim().toUpperCase().replace(/\s+/g, '');
    const newCoupon: CouponItem = {
      codigo: formattedCode,
      descripcion: newCouponDesc.trim() || `Descuento ${formattedCode}`,
      tipo: newCouponType,
      valor: Number(newCouponVal),
      activo: true
    };

    const updatedCoupons = [...couponsList, newCoupon];
    setCouponsList(updatedCoupons);
    StorageService.saveCoupons(updatedCoupons);
    setSelectedCouponCode(formattedCode);
    setNewCouponCode('');
    setNewCouponDesc('');
    setNewCouponVal(10);
    setShowNewCouponForm(false);
  };

  // Construir nombre consolidado del combo quirúrgico
  const comboNombreConsolidado = selectedProcedures.map(p => p.nombre).join(' + ');

  // Crear objeto plan para guardar o imprimir
  const getCurrentPlanData = (): FinanciamientoCirugia => {
    return {
      planId: StorageService.generatePlanId(),
      pacienteId: selectedPacienteId,
      procedimiento: comboNombreConsolidado || 'Procedimiento Quirúrgico',
      comboProcedimientos: selectedProcedures.map(p => ({
        id: p.id,
        nombre: p.nombre,
        precio: p.precioDefault
      })),
      tipoPago,
      planOpcionId: selectedPlanOptionId,
      costoSubtotal: subtotalCost,
      cuponCodigo: selectedCouponCode,
      descuentoMonto,
      costoTotalCirugia,
      cuotasTotales: cuotasActuales,
      montoAbonado: Number(montoInicial),
      saldoPendiente,
      montoCuotaMensual: montoCuotaEst,
      estadoFinanciero: 'Al día',
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaEstimadaCirugia
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPacienteId) return;
    const planToSave = getCurrentPlanData();
    onSave(planToSave);
    onClose();
  };

  const handlePrintPDF = () => {
    if (!activePatient) return;
    const planToPrint = getCurrentPlanData();
    printPatientFinancingPDF(activePatient, planToPrint);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* ENCABEZADO */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold shadow-2xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif italic font-bold text-base sm:text-lg text-white">
                Plan de Financiamiento Quirúrgico
              </h3>
              <p className="text-[11px] text-teal-300 font-medium">
                Combo Quirúrgico, Cupones, Tipo de Pago y PDF Imprimible
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrintPDF}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-lg flex items-center space-x-1.5 transition-all shadow-2xs cursor-pointer"
              title="Generar e imprimir PDF de la ficha de financiamiento"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">PDF / Imprimir</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CUERPO DEL FORMULARIO CON SCROLL */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto text-xs flex-1">
          
          {/* PACIENTE SELECCIONADO */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Paciente Beneficiaria de Cirugía *
            </label>
            <select
              value={selectedPacienteId}
              onChange={(e) => setSelectedPacienteId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-bold text-slate-900 text-xs"
            >
              {pacientes.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nombre} — Documento: {p.cedula} ({p.id})
                </option>
              ))}
            </select>
          </div>

          {/* 1. TIPO DE PAGO: CONTADO VS FINANCIAMIENTO */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              1. Seleccionar Tipo de Pago *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSelectTipoPago('Contado')}
                className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  tipoPago === 'Contado'
                    ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-500/20 text-teal-900 font-bold shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <div>
                  <div className="text-xs font-bold flex items-center">
                    <span>Pago de Contado</span>
                    <span className="ml-2 text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">1 Cuota</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Pago directo sin plazos ni intereses</p>
                </div>
                {tipoPago === 'Contado' && <Check className="w-4 h-4 text-teal-700 shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => handleSelectTipoPago('Financiamiento')}
                className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  tipoPago === 'Financiamiento'
                    ? 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-500/20 text-purple-900 font-bold shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <div>
                  <div className="text-xs font-bold flex items-center">
                    <span>Plan de Financiamiento</span>
                    <span className="ml-2 text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded-full font-bold">A Plazos</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">3, 6, 12, 18 o 24 cuotas mensuales</p>
                </div>
                {tipoPago === 'Financiamiento' && <Check className="w-4 h-4 text-purple-700 shrink-0" />}
              </button>
            </div>
          </div>

          {/* 2. COMBO QUIRÚRGICO (SELECCIÓN MÚLTIPLE DE PROCEDIMIENTOS) */}
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                2. Configuración de Combo Quirúrgico (Suma Automática) *
              </label>
              
              <button
                type="button"
                onClick={() => setShowCustomProcForm(!showCustomProcForm)}
                className="text-[10px] text-teal-700 font-bold hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>+ Agregar Procedimiento Especial</span>
              </button>
            </div>

            {/* FORMULARIO AGREGAR CIRUGÍA PERSONALIZADA */}
            {showCustomProcForm && (
              <div className="p-3 bg-teal-50/80 rounded-xl border border-teal-200 space-y-2 animate-in fade-in duration-150">
                <span className="text-[10px] font-bold text-teal-900 block">Nueva Cirugía / Procedimiento Especial</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Nombre (ej. BBL + Lipotransfer)"
                    value={customProcName}
                    onChange={(e) => setCustomProcName(e.target.value)}
                    className="sm:col-span-2 px-2.5 py-1.5 bg-white border border-teal-300 rounded-lg text-xs font-medium"
                  />
                  <input
                    type="number"
                    placeholder="Costo ($ USD)"
                    value={customProcPrice}
                    onChange={(e) => setCustomProcPrice(Number(e.target.value))}
                    className="px-2.5 py-1.5 bg-white border border-teal-300 rounded-lg text-xs font-bold"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCustomProcForm(false)}
                    className="px-2.5 py-1 text-[10px] text-slate-600 hover:bg-teal-100 rounded-md"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleAddCustomProcedure}
                    className="px-3 py-1 bg-teal-700 text-white text-[10px] font-bold rounded-md shadow-2xs"
                  >
                    Agregar al Catálogo
                  </button>
                </div>
              </div>
            )}

            {/* BARRA DE BÚSQUEDA Y FILTRADO DE PROCEDIMIENTOS */}
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar procedimiento por nombre o categoría (ej. Lipo, Rino, Mamoplastia...)"
                value={searchProcText}
                onChange={(e) => setSearchProcText(e.target.value)}
                className="w-full pl-8 pr-20 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all shadow-2xs"
              />
              <div className="absolute right-2 flex items-center space-x-1">
                {searchProcText && (
                  <button
                    type="button"
                    onClick={() => setSearchProcText('')}
                    className="px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded flex items-center space-x-0.5 transition-colors cursor-pointer"
                    title="Limpiar búsqueda"
                  >
                    <X className="w-3 h-3" />
                    <span>Borrar</span>
                  </button>
                )}
                <span className="text-[10px] text-slate-400 px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded-md font-mono">
                  {catalog.filter(p => matchesSearch(p.nombre, searchProcText) || matchesSearch(p.categoria, searchProcText)).length}/{catalog.length}
                </span>
              </div>
            </div>

            {/* LISTA DE CHECKBOXES DE CATÁLOGO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
              {(() => {
                const filteredList = catalog.filter(proc =>
                  matchesSearch(proc.nombre, searchProcText) || matchesSearch(proc.categoria, searchProcText)
                );

                if (filteredList.length === 0) {
                  return (
                    <div className="col-span-full py-6 text-center text-slate-500 text-xs flex flex-col items-center justify-center space-y-1">
                      <Search className="w-5 h-5 text-slate-300" />
                      <p className="font-medium text-slate-700">No se encontraron procedimientos</p>
                      <p className="text-[11px] text-slate-400">
                        No hay coincidencias para &ldquo;{searchProcText}&rdquo;.
                      </p>
                      <button
                        type="button"
                        onClick={() => setSearchProcText('')}
                        className="mt-1 text-[11px] text-teal-700 font-semibold hover:underline cursor-pointer"
                      >
                        Limpiar filtro
                      </button>
                    </div>
                  );
                }

                return filteredList.map(proc => {
                  const isSelected = selectedProcIds.includes(proc.id);
                  return (
                    <div
                      key={proc.id}
                      onClick={() => toggleProcedure(proc.id)}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between gap-2 select-none ${
                        isSelected
                          ? 'border-teal-500 bg-white shadow-2xs text-teal-950 font-bold'
                          : 'border-slate-200 bg-white/60 hover:bg-white text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2 min-w-0 pr-2 flex-1">
                        <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-teal-600 text-white' : 'border border-slate-300'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="truncate text-[11px]">{proc.nombre}</span>
                      </div>

                      <span className="text-[11px] font-bold text-teal-700 shrink-0">
                        ${proc.precioDefault.toLocaleString()}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>

            {/* RESUMEN DEL COMBO SELECCIONADO */}
            <div className="bg-teal-900 text-white p-3 rounded-xl flex items-center justify-between text-xs">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] text-teal-300 font-bold uppercase tracking-wider block">Combo Seleccionado ({selectedProcedures.length}):</span>
                <p className="font-semibold text-teal-100 truncate text-[11px]">{comboNombreConsolidado}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] text-teal-300 font-bold uppercase tracking-wider block">Subtotal Quirúrgico</span>
                <strong className="text-base text-teal-200 font-bold">${subtotalCost.toLocaleString()} USD</strong>
              </div>
            </div>
          </div>

          {/* 3. CUPONES DE DESCUENTO */}
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                3. Selección o Configuración de Cupón de Descuento
              </label>

              <button
                type="button"
                onClick={() => setShowNewCouponForm(!showNewCouponForm)}
                className="text-[10px] text-purple-700 font-bold hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <Tag className="w-3 h-3" />
                <span>+ Crear Nuevo Cupón</span>
              </button>
            </div>

            {/* FORMULARIO CREAR CUPÓN */}
            {showNewCouponForm && (
              <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-200 space-y-2 animate-in fade-in duration-150">
                <span className="text-[10px] font-bold text-purple-900 block">Crear Nuevo Cupón de Descuento</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Código (ej. VERANO20)"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-purple-300 rounded-lg text-xs font-bold uppercase"
                  />
                  <input
                    type="text"
                    placeholder="Descripción (ej. Promo Verano)"
                    value={newCouponDesc}
                    onChange={(e) => setNewCouponDesc(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-purple-300 rounded-lg text-xs"
                  />
                  <select
                    value={newCouponType}
                    onChange={(e: any) => setNewCouponType(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-purple-300 rounded-lg text-xs font-medium"
                  >
                    <option value="porcentaje">Porcentaje (%)</option>
                    <option value="monto_fijo">Monto Fijo ($ USD)</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Valor (ej. 15)"
                    value={newCouponVal}
                    onChange={(e) => setNewCouponVal(Number(e.target.value))}
                    className="px-2.5 py-1.5 bg-white border border-purple-300 rounded-lg text-xs font-bold"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowNewCouponForm(false)}
                    className="px-2.5 py-1 text-[10px] text-slate-600 hover:bg-purple-100 rounded-md"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateNewCoupon}
                    className="px-3 py-1 bg-purple-700 text-white text-[10px] font-bold rounded-md shadow-2xs"
                  >
                    Guardar Cupón
                  </button>
                </div>
              </div>
            )}

            {/* SELECTOR DE CUPONES */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <select
                  value={selectedCouponCode}
                  onChange={(e) => setSelectedCouponCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/20"
                >
                  {couponsList.map(c => (
                    <option key={c.codigo} value={c.codigo}>
                      {c.codigo} — {c.descripcion} ({c.tipo === 'porcentaje' ? `${c.valor}% OFF` : `-$${c.valor} USD`})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-purple-50 border border-purple-200 px-3 py-2 rounded-lg flex items-center justify-between text-purple-900">
                <span className="text-[10px] uppercase font-bold text-purple-700">Descuento:</span>
                <strong className="text-xs font-bold text-purple-900">
                  {descuentoMonto > 0 ? `-$${descuentoMonto.toLocaleString()} USD` : '$0 USD'}
                </strong>
              </div>
            </div>
          </div>

          {/* 4. PLANES DE FINANCIAMIENTO / PLAZOS */}
          {tipoPago === 'Financiamiento' && (
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                4. Opciones de Plazo de Financiamiento
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {getActivePlanOptions().filter(o => o.id !== 'plan_contado').map(opt => {
                  const isSelected = selectedPlanOptionId === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectPlanOption(opt.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50/80 ring-2 ring-purple-500/20 text-purple-950 font-bold'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="text-[11px] font-bold text-purple-900">{opt.nombre}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{opt.frecuencia}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MONTO INICIAL Y FECHA ESTIMADA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-100 pt-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Abono Inicial / Cuota Inicial ($ USD) *
              </label>
              <input
                type="number"
                min="0"
                value={montoInicial}
                onChange={(e) => setMontoInicial(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-emerald-800 text-xs focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Fecha Proyectada de Operación *
              </label>
              <input
                type="date"
                required
                value={fechaEstimadaCirugia}
                onChange={(e) => setFechaEstimadaCirugia(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-900 text-xs focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          {/* CUADRO RESUMEN DE CÁLCULOS FINALES EN TIEMPO REAL */}
          <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2.5 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-teal-400 tracking-wider">
              <span>Resumen Financiero Consolidado (Cálculo en Tiempo Real)</span>
              <span className="bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full text-[9px] border border-teal-500/30 font-mono">
                Suma Automática
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-800 text-xs">
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block font-medium">1. Subtotal Combo:</span>
                <strong className="text-sm text-slate-100 font-extrabold">${subtotalCost.toLocaleString()} USD</strong>
              </div>

              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block font-medium">2. Descuento ({selectedCouponCode}):</span>
                <strong className="text-sm text-emerald-400 font-extrabold">
                  {descuentoMonto > 0 ? `-$${descuentoMonto.toLocaleString()} USD` : '$0 USD'}
                </strong>
              </div>

              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                <span className="text-[10px] text-teal-300 block font-medium">3. Total Neto Cirugía:</span>
                <strong className="text-sm text-teal-300 font-extrabold">${costoTotalCirugia.toLocaleString()} USD</strong>
              </div>

              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                <span className="text-[10px] text-purple-300 block font-medium">4. Abono Inicial:</span>
                <strong className="text-sm text-purple-300 font-extrabold">-${numMontoInicial.toLocaleString()} USD</strong>
              </div>

              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-amber-300 block font-medium">5. Saldo Pendiente:</span>
                <strong className="text-sm text-amber-400 font-extrabold">${saldoPendiente.toLocaleString()} USD</strong>
              </div>
            </div>

            {tipoPago === 'Financiamiento' && cuotasActuales > 1 && (
              <div className="bg-slate-800/90 p-2.5 rounded-lg flex items-center justify-between text-[11px] mt-1 border border-slate-700">
                <span className="text-slate-300">
                  Plan Elegido ({cuotasActuales} cuotas):
                </span>
                <strong className="text-teal-300 text-xs font-bold bg-teal-950/80 px-2.5 py-1 rounded-md border border-teal-500/30">
                  ~${montoCuotaEst.toLocaleString()} USD / mes
                </strong>
              </div>
            )}
          </div>

          {/* CRONOGRAMA DE CUOTAS Y ALARMAS EN TIEMPO REAL */}
          {tipoPago === 'Financiamiento' && cuotasActuales > 0 && saldoPendiente > 0 && (
            <div className="bg-slate-900 text-white p-4 rounded-xl space-y-3 border border-slate-800 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-300">
                    Cronograma de Cuotas & Alarmas de Calendario
                  </h4>
                </div>
                <span className="text-[10px] bg-purple-950 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-500/40 font-bold">
                  🔔 {cuotasActuales} Alarmas de Cobro en Calendario
                </span>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                Al guardar el plan, se generará de forma automática una alarma en el módulo <strong>"Calendario & Alarmas"</strong> para cada cuota:
              </p>

              <div className="border border-slate-800 rounded-lg overflow-hidden max-h-52 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-800 text-slate-300 text-[10px] uppercase font-bold sticky top-0">
                    <tr>
                      <th className="p-2 border-b border-slate-700">N° Cuota</th>
                      <th className="p-2 border-b border-slate-700">Fecha Vencimiento</th>
                      <th className="p-2 border-b border-slate-700 text-right">Monto Cuota ($ USD)</th>
                      <th className="p-2 border-b border-slate-700 text-center">Alarma CRM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {calculatePaymentSchedule(fechaEstimadaCirugia || new Date().toISOString().split('T')[0], cuotasActuales, saldoPendiente).map((item) => (
                      <tr key={item.numeroCuota} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-2 font-bold text-white">Cuota #{item.numeroCuota}</td>
                        <td className="p-2 text-teal-300 font-mono font-bold">{item.fechaFormateada}</td>
                        <td className="p-2 text-right font-bold text-emerald-400">${item.montoCuota.toLocaleString()} USD</td>
                        <td className="p-2 text-center">
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            <span>🔔</span>
                            <span>Programada</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BOTONES DE ACCIÓN */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrintPDF}
              className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg border border-slate-700 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-teal-400" />
              <span>📄 Imprimir Ficha PDF</span>
            </button>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-all cursor-pointer"
              >
                Guardar Plan Financiero
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
