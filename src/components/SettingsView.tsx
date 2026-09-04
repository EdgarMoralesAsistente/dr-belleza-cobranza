import React, { useState, useEffect } from 'react';
import {
  Settings,
  Scissors,
  Tag,
  TrendingUp,
  FileText,
  Database,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Save,
  RefreshCw,
  Printer,
  Sparkles,
  ShieldCheck,
  DollarSign,
  Building,
  Phone,
  Mail,
  MapPin,
  Info,
  Lock,
  ShieldAlert,
  Search
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { Usuario, RolUsuario, getRolePermissions } from '../types';
import {
  getActiveCatalog,
  getActiveCoupons,
  getActivePlanOptions,
  getClinicConfig,
  ProcedureCatalogItem,
  CouponItem,
  FinancingPlanOption,
  ClinicConfig,
  matchesSearch,
  normalizeSearchText
} from '../services/financingConfig';

interface SettingsViewProps {
  currentUser?: Usuario;
  userRole?: RolUsuario;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ currentUser, userRole }) => {
  const currentRole = userRole || currentUser?.rol;
  const permissions = getRolePermissions(currentRole);

  const [activeTab, setActiveTab] = useState<'catalog' | 'coupons' | 'plans' | 'clinic' | 'sheets'>('catalog');

  // --- ACCESO RESTRINGIDO ---
  if (!permissions.canAccessSettings) {
    return (
      <div className="p-8 max-w-2xl mx-auto my-12 text-center space-y-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Acceso Restringido - Configuración</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          El módulo de <strong>Configuración del Sistema</strong> (catálogos de precios, cupones, parámetros de financiamiento e integraciones) está reservado exclusivamente para perfiles de administración autorizados.
        </p>
        <div className="inline-flex items-center space-x-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-xs font-semibold">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
          <span>Tu perfil actual es: <strong>{currentRole || 'Financiero'}</strong></span>
        </div>
      </div>
    );
  }

  // --- ESTADOS DE CONFIGURACIÓN ---
  const [catalog, setCatalog] = useState<ProcedureCatalogItem[]>(() => getActiveCatalog());
  const [searchProcCatalog, setSearchProcCatalog] = useState('');
  const [coupons, setCoupons] = useState<CouponItem[]>(() => getActiveCoupons());
  const [plans, setPlans] = useState<FinancingPlanOption[]>(() => getActivePlanOptions());
  const [clinicConfig, setClinicConfig] = useState<ClinicConfig>(() => getClinicConfig());
  const [gasUrl, setGasUrl] = useState(() => StorageService.getGasUrl());

  // Sincronización en tiempo real con cambios de catálogo multiusuario
  useEffect(() => {
    const handleUpdate = () => {
      setCatalog(getActiveCatalog());
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

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // --- ACCIONES DE CATÁLOGO DE PROCEDIMIENTOS ---
  const [showAddProc, setShowAddProc] = useState(false);
  const [newProcName, setNewProcName] = useState('');
  const [newProcCategory, setNewProcCategory] = useState('Contorno Corporal');
  const [newProcPrice, setNewProcPrice] = useState<number>(2000);

  const handleAddProcedure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProcName.trim()) {
      showToast('Ingresa un nombre válido para el procedimiento', 'error');
      return;
    }

    const newItem: ProcedureCatalogItem = {
      id: `proc_${Date.now()}`,
      nombre: newProcName.trim(),
      categoria: newProcCategory,
      precioDefault: Number(newProcPrice) || 0,
      activo: true
    };

    const updated = StorageService.addCatalogItem(newItem);
    setCatalog(updated);
    setNewProcName('');
    setNewProcPrice(2000);
    setShowAddProc(false);
    showToast('Procedimiento quirúrgico agregado al catálogo con éxito');
  };

  const handleToggleProcStatus = (id: string) => {
    const updated = catalog.map(p => p.id === id ? { ...p, activo: p.activo === false } : p);
    setCatalog(updated);
    StorageService.saveCatalog(updated);
    showToast('Estado del procedimiento actualizado');
  };

  const handleDeleteProcedure = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este procedimiento del catálogo?')) {
      const updated = StorageService.deleteCatalogItem(id);
      setCatalog(updated);
      showToast('Procedimiento eliminado del catálogo');
    }
  };

  const handleUpdateProcPrice = (id: string, newPrice: number) => {
    const updated = catalog.map(p => p.id === id ? { ...p, precioDefault: newPrice } : p);
    setCatalog(updated);
    StorageService.saveCatalog(updated);
  };

  // --- ACCIONES DE CUPONES ---
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDesc, setCouponDesc] = useState('');
  const [couponType, setCouponType] = useState<'porcentaje' | 'monto_fijo'>('porcentaje');
  const [couponVal, setCouponVal] = useState<number>(10);

  // Estado para Edición de Cupón
  const [editingCouponCode, setEditingCouponCode] = useState<string | null>(null);
  const [editCouponCode, setEditCouponCode] = useState('');
  const [editCouponDesc, setEditCouponDesc] = useState('');
  const [editCouponType, setEditCouponType] = useState<'porcentaje' | 'monto_fijo'>('porcentaje');
  const [editCouponVal, setEditCouponVal] = useState<number>(0);

  const handleStartEditCoupon = (coupon: CouponItem) => {
    setEditingCouponCode(coupon.codigo);
    setEditCouponCode(coupon.codigo);
    setEditCouponDesc(coupon.descripcion);
    setEditCouponType(coupon.tipo);
    setEditCouponVal(coupon.valor);
  };

  const handleCancelEditCoupon = () => {
    setEditingCouponCode(null);
  };

  const handleSaveEditCoupon = (e: React.FormEvent, originalCode: string) => {
    e.preventDefault();
    const cleanCode = editCouponCode.trim().toUpperCase();
    if (!cleanCode) {
      showToast('Ingresa un código de cupón válido', 'error');
      return;
    }

    if (cleanCode !== originalCode && coupons.some(c => c.codigo === cleanCode)) {
      showToast('Ya existe otro cupón con este código', 'error');
      return;
    }

    const updated = coupons.map(c => {
      if (c.codigo === originalCode) {
        return {
          ...c,
          codigo: cleanCode,
          descripcion: editCouponDesc.trim() || `Descuento especial (${cleanCode})`,
          tipo: editCouponType,
          valor: Number(editCouponVal) || 0
        };
      }
      return c;
    });

    setCoupons(updated);
    StorageService.saveCoupons(updated);
    setEditingCouponCode(null);
    showToast(`Cupón ${cleanCode} actualizado correctamente`);
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) {
      showToast('Ingresa un código de cupón válido', 'error');
      return;
    }

    if (coupons.some(c => c.codigo === cleanCode)) {
      showToast('Ya existe un cupón con este código', 'error');
      return;
    }

    const newCoupon: CouponItem = {
      codigo: cleanCode,
      descripcion: couponDesc.trim() || `Descuento especial (${cleanCode})`,
      tipo: couponType,
      valor: Number(couponVal) || 0,
      activo: true
    };

    const updated = [newCoupon, ...coupons];
    setCoupons(updated);
    StorageService.saveCoupons(updated);
    setCouponCode('');
    setCouponDesc('');
    setShowAddCoupon(false);
    showToast(`Cupón ${cleanCode} configurado correctamente`);
  };

  const handleToggleCouponStatus = (code: string) => {
    const updated = coupons.map(c => c.codigo === code ? { ...c, activo: !c.activo } : c);
    setCoupons(updated);
    StorageService.saveCoupons(updated);
    showToast('Estado del cupón actualizado');
  };

  const handleDeleteCoupon = (code: string) => {
    if (code === 'NINGUNO') {
      showToast('No se puede eliminar la opción por defecto NINGUNO', 'error');
      return;
    }
    if (confirm(`¿Eliminar el cupón ${code}?`)) {
      const updated = coupons.filter(c => c.codigo !== code);
      setCoupons(updated);
      StorageService.saveCoupons(updated);
      showToast('Cupón eliminado');
    }
  };

  // --- ACCIONES DE PLANES DE FINANCIAMIENTO ---
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [planName, setPlanName] = useState('');
  const [planMonths, setPlanMonths] = useState<number>(12);
  const [planCuotas, setPlanCuotas] = useState<number>(12);
  const [planFreq, setPlanFreq] = useState('Mensual');
  const [planDesc, setPlanDesc] = useState('');

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim()) {
      showToast('Ingresa un nombre para el plan de financiamiento', 'error');
      return;
    }

    const newPlan: FinancingPlanOption = {
      id: `plan_${Date.now()}`,
      nombre: planName.trim(),
      meses: Number(planMonths) || 1,
      cuotas: Number(planCuotas) || 1,
      frecuencia: planFreq,
      descripcion: planDesc.trim() || 'Plan de pago financiado predeterminado.',
      activo: true
    };

    const updated = [...plans, newPlan];
    setPlans(updated);
    StorageService.savePlanOptions(updated);
    setPlanName('');
    setPlanDesc('');
    setShowAddPlan(false);
    showToast('Nuevo plan de financiamiento registrado');
  };

  const handleDeletePlan = (id: string) => {
    if (id === 'plan_contado') {
      showToast('El plan Pago de Contado no se puede eliminar', 'error');
      return;
    }
    if (confirm('¿Eliminar este plan de financiamiento?')) {
      const updated = plans.filter(p => p.id !== id);
      setPlans(updated);
      StorageService.savePlanOptions(updated);
      showToast('Plan de financiamiento eliminado');
    }
  };

  // --- ACCIONES DE PLANTILLA Y CLÍNICA ---
  const handleSaveClinicConfig = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveClinicConfig(clinicConfig);
    showToast('Configuración de la clínica y plantilla de reportes guardada');
  };

  // --- ACCIONES DE GOOGLE SHEETS ---
  const handleSaveGasUrl = () => {
    StorageService.saveGasUrl(gasUrl);
    showToast('URL de Web App de Google Apps Script actualizada');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* NOTIFICACIÓN TOAST */}
      {notification && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl font-medium text-xs flex items-center space-x-2 animate-in fade-in slide-in-from-top-3 duration-200 ${
          notification.type === 'success' ? 'bg-emerald-900 text-emerald-100 border border-emerald-700' : 'bg-rose-900 text-rose-100 border border-rose-700'
        }`}>
          <Check className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* ENCABEZADO DE CONFIGURACIÓN */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif italic font-bold text-xl sm:text-2xl text-white">
              Configuración General del Sistema
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Administración de Catálogo Quirúrgico, Cupones, Planes de Financiamiento, Datos de la Clínica y Sincronización
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 self-start md:self-auto text-xs text-teal-300">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>Módulo de Administración & Control</span>
        </div>
      </div>

      {/* TABS DE NAVEGACIÓN */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2.5 font-bold rounded-t-xl transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'catalog'
              ? 'bg-slate-900 text-teal-300 border-t-2 border-teal-500 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>Catálogo Quirúrgico ({catalog.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-4 py-2.5 font-bold rounded-t-xl transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'coupons'
              ? 'bg-slate-900 text-teal-300 border-t-2 border-teal-500 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Cupones de Descuento ({coupons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2.5 font-bold rounded-t-xl transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'plans'
              ? 'bg-slate-900 text-teal-300 border-t-2 border-teal-500 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Planes Financieros ({plans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('clinic')}
          className={`px-4 py-2.5 font-bold rounded-t-xl transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'clinic'
              ? 'bg-slate-900 text-teal-300 border-t-2 border-teal-500 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Plantilla Ficha & Datos Clínica</span>
        </button>

        <button
          onClick={() => setActiveTab('sheets')}
          className={`px-4 py-2.5 font-bold rounded-t-xl transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'sheets'
              ? 'bg-slate-900 text-teal-300 border-t-2 border-teal-500 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Sincronización Sheets</span>
        </button>
      </div>

      {/* CONTENIDO DE TAB 1: CATÁLOGO DE PROCEDIMIENTOS QUIRÚRGICOS */}
      {activeTab === 'catalog' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Scissors className="w-5 h-5 text-teal-600" />
                  <span>Catálogo de Procedimientos Quirúrgicos Estéticos</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Configura los procedimientos disponibles para seleccionar en los combos quirúrgicos y sus precios predeterminados.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddProc(!showAddProc)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center space-x-2 transition-all shadow-2xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>+ Agregar Procedimiento</span>
              </button>
            </div>

            {/* NOTA DE PROTECCIÓN DE PRECIOS */}
            <div className="bg-sky-50/80 border border-sky-200 rounded-xl p-3 flex items-start space-x-2 text-xs text-sky-900">
              <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <strong>Protección de Precios & Planes Existentes:</strong> Los cambios de precios en esta lista se aplicarán únicamente a las nuevas pacientes registradas a partir de este momento. Las pacientes con un plan de financiamiento ya registrado mantendrán el precio y presupuesto acordado de forma inmutable.
              </div>
            </div>

            {/* FORMULARIO AGREGAR PROCEDIMIENTO */}
            {showAddProc && (
              <form onSubmit={handleAddProcedure} className="p-4 bg-teal-50/70 rounded-xl border border-teal-200 space-y-3 animate-in fade-in duration-150">
                <span className="text-xs font-bold text-teal-900 block uppercase tracking-wider">Nuevo Procedimiento Quirúrgico</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Nombre del Procedimiento</label>
                    <input
                      type="text"
                      placeholder="Ej. Gluteoplastia con Prótesis"
                      value={newProcName}
                      onChange={(e) => setNewProcName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Categoría Anatomía</label>
                    <select
                      value={newProcCategory}
                      onChange={(e) => setNewProcCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                    >
                      <option value="Contorno Corporal">Contorno Corporal</option>
                      <option value="Mamas">Mamas / Busto</option>
                      <option value="Corporal + Mamas">Corporal + Mamas</option>
                      <option value="Facial">Facial & Cuello</option>
                      <option value="Medicina Estética">Medicina Estética / No Invasivo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Precio Default ($ USD)</label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={newProcPrice}
                      onChange={(e) => setNewProcPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-teal-800"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddProc(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 font-medium hover:bg-slate-200 rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-lg cursor-pointer shadow-2xs"
                  >
                    Guardar Procedimiento
                  </button>
                </div>
              </form>
            )}

            {/* BARRA DE BÚSQUEDA Y FILTRADO DEL CATÁLOGO */}
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar procedimiento en el catálogo (ej. Lipo, Rino, Aumento...)"
                value={searchProcCatalog}
                onChange={(e) => setSearchProcCatalog(e.target.value)}
                className="w-full pl-9 pr-24 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all shadow-2xs"
              />
              <div className="absolute right-2 flex items-center space-x-1.5">
                {searchProcCatalog && (
                  <button
                    type="button"
                    onClick={() => setSearchProcCatalog('')}
                    className="px-2 py-0.5 text-[10px] text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded flex items-center space-x-1 transition-colors cursor-pointer"
                    title="Limpiar búsqueda"
                  >
                    <X className="w-3 h-3" />
                    <span>Limpiar</span>
                  </button>
                )}
                <span className="text-[10px] text-slate-500 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md font-mono">
                  {catalog.filter(p => matchesSearch(p.nombre, searchProcCatalog) || matchesSearch(p.categoria, searchProcCatalog)).length} de {catalog.length}
                </span>
              </div>
            </div>

            {/* TABLA DE PROCEDIMIENTOS */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="p-3">Procedimiento Quirúrgico</th>
                    <th className="p-3">Categoría</th>
                    <th className="p-3 text-right">Precio USD Default</th>
                    <th className="p-3 text-center">Estado</th>
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(() => {
                    const filtered = catalog.filter(item =>
                      matchesSearch(item.nombre, searchProcCatalog) || matchesSearch(item.categoria, searchProcCatalog)
                    );

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-500">
                            <Search className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                            <p className="font-semibold text-slate-700">No se encontraron procedimientos</p>
                            <p className="text-slate-400 text-xs">No hay procedimientos que coincidan con &ldquo;{searchProcCatalog}&rdquo;</p>
                            <button
                              type="button"
                              onClick={() => setSearchProcCatalog('')}
                              className="mt-2 text-xs text-teal-700 font-bold hover:underline"
                            >
                              Restablecer búsqueda
                            </button>
                          </td>
                        </tr>
                      );
                    }

                    return filtered.map((item) => {
                      const isActivo = item.activo !== false;
                      return (
                        <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${!isActivo ? 'opacity-50 bg-slate-50/50' : ''}`}>
                          <td className="p-3 font-bold text-slate-900">{item.nombre}</td>
                          <td className="p-3">
                            <span className="px-2.5 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-md font-semibold text-[10px]">
                              {item.categoria}
                            </span>
                          </td>
                          <td className="p-3 text-right font-extrabold text-teal-700 text-sm">
                            <div className="flex items-center justify-end space-x-1">
                              <span>$</span>
                              <input
                                type="number"
                                min="0"
                                step="50"
                                value={item.precioDefault}
                                onChange={(e) => handleUpdateProcPrice(item.id, Number(e.target.value))}
                                className="w-24 text-right px-2 py-1 bg-slate-50 border border-slate-200 rounded font-bold text-teal-800 focus:bg-white"
                              />
                              <span className="text-[10px] text-slate-400 font-normal">USD</span>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleProcStatus(item.id)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                                isActivo
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                              }`}
                            >
                              {isActivo ? '● Activo' : '○ Inactivo'}
                            </button>
                          </td>
                          <td className="p-3 text-right space-x-1">
                            <button
                              type="button"
                              onClick={() => handleDeleteProcedure(item.id)}
                              className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar procedimiento"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO DE TAB 2: CUPONES DE DESCUENTO */}
      {activeTab === 'coupons' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Tag className="w-5 h-5 text-purple-600" />
                  <span>Cupones y Niveles de Descuento Promocional</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Crea y configura cupones con descuentos por porcentaje o monto fijo en dólares para aplicar en las negociaciones.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddCoupon(!showAddCoupon)}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl flex items-center space-x-2 transition-all shadow-2xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>+ Crear Nuevo Cupón</span>
              </button>
            </div>

            {/* NOTA DE INMUTABILIDAD DE CUPONES */}
            <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-3 flex items-start space-x-2 text-xs text-purple-900">
              <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <strong>Inmutabilidad de Descuentos Aplicados:</strong> Modificar o desactivar un cupón aplicará únicamente a nuevos presupuestos y registros. Los cupones aplicados a pacientes registradas previamente permanecerán sin alteración.
              </div>
            </div>

            {/* FORMULARIO NUEVO CUPÓN */}
            {showAddCoupon && (
              <form onSubmit={handleAddCoupon} className="p-4 bg-purple-50/80 rounded-xl border border-purple-200 space-y-3 animate-in fade-in duration-150">
                <span className="text-xs font-bold text-purple-900 block uppercase tracking-wider">Configurar Nuevo Cupón</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Código del Cupón</label>
                    <input
                      type="text"
                      placeholder="Ej. VERANO20"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs font-bold uppercase text-purple-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Descripción del Descuento</label>
                    <input
                      type="text"
                      placeholder="Ej. Descuento Especial Temporada de Verano 20%"
                      value={couponDesc}
                      onChange={(e) => setCouponDesc(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Tipo & Valor</label>
                    <div className="flex space-x-1">
                      <select
                        value={couponType}
                        onChange={(e: any) => setCouponType(e.target.value)}
                        className="px-2 py-2 bg-white border border-purple-300 rounded-lg text-xs font-semibold"
                      >
                        <option value="porcentaje">% OFF</option>
                        <option value="monto_fijo">$ USD</option>
                      </select>
                      <input
                        type="number"
                        min="0"
                        value={couponVal}
                        onChange={(e) => setCouponVal(Number(e.target.value))}
                        className="w-full px-2 py-2 bg-white border border-purple-300 rounded-lg text-xs font-bold text-purple-900 text-right"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddCoupon(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 font-medium hover:bg-slate-200 rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-purple-800 hover:bg-purple-900 text-white font-bold text-xs rounded-lg cursor-pointer shadow-2xs"
                  >
                    Guardar Cupón
                  </button>
                </div>
              </form>
            )}

            {/* LISTA DE CUPONES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {coupons.map((c) => {
                const isActivo = c.activo !== false;
                const isEditing = editingCouponCode === c.codigo;

                if (isEditing) {
                  return (
                    <form
                      key={c.codigo}
                      onSubmit={(e) => handleSaveEditCoupon(e, c.codigo)}
                      className="p-4 rounded-xl border-2 border-purple-400 bg-purple-50/90 space-y-3 md:col-span-2 animate-in fade-in duration-150 shadow-sm"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-purple-200">
                        <span className="text-xs font-extrabold text-purple-900 uppercase tracking-wider flex items-center space-x-1.5">
                          <Edit2 className="w-4 h-4 text-purple-700" />
                          <span>Editar Cupón: {c.codigo}</span>
                        </span>
                        <span className="text-[10px] text-purple-700 font-medium">
                          Los cambios aplicarán únicamente a nuevos presupuestos y registros
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Código del Cupón</label>
                          <input
                            type="text"
                            disabled={c.codigo === 'NINGUNO'}
                            value={editCouponCode}
                            onChange={(e) => setEditCouponCode(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-purple-300 rounded-lg text-xs font-bold uppercase text-purple-900 disabled:bg-slate-100 disabled:text-slate-500"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Descripción del Descuento</label>
                          <input
                            type="text"
                            value={editCouponDesc}
                            onChange={(e) => setEditCouponDesc(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-purple-300 rounded-lg text-xs font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Tipo & Valor</label>
                          <div className="flex space-x-1">
                            <select
                              value={editCouponType}
                              onChange={(e: any) => setEditCouponType(e.target.value)}
                              className="px-2 py-1.5 bg-white border border-purple-300 rounded-lg text-xs font-semibold"
                            >
                              <option value="porcentaje">% OFF</option>
                              <option value="monto_fijo">$ USD</option>
                            </select>
                            <input
                              type="number"
                              min="0"
                              value={editCouponVal}
                              onChange={(e) => setEditCouponVal(Number(e.target.value))}
                              className="w-full px-2 py-1.5 bg-white border border-purple-300 rounded-lg text-xs font-bold text-purple-900 text-right"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 pt-2 border-t border-purple-200">
                        <button
                          type="button"
                          onClick={handleCancelEditCoupon}
                          className="px-3 py-1.5 text-xs text-slate-600 font-medium hover:bg-purple-100 rounded-lg cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-purple-800 hover:bg-purple-900 text-white font-bold text-xs rounded-lg cursor-pointer shadow-2xs flex items-center space-x-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Guardar Cambios</span>
                        </button>
                      </div>
                    </form>
                  );
                }

                return (
                  <div
                    key={c.codigo}
                    className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                      isActivo
                        ? 'bg-slate-50/70 border-slate-200 hover:border-purple-300'
                        : 'bg-slate-100 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="space-y-1 min-w-0 pr-3">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 bg-purple-100 text-purple-900 font-extrabold text-xs rounded-md border border-purple-200 uppercase tracking-wider">
                          {c.codigo}
                        </span>
                        <span className="font-extrabold text-sm text-purple-900">
                          {c.tipo === 'porcentaje' ? `${c.valor}% OFF` : `-$${c.valor} USD`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 truncate">{c.descripcion}</p>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEditCoupon(c)}
                        className="p-1.5 text-purple-700 hover:bg-purple-100 rounded-lg cursor-pointer transition-colors"
                        title="Editar cupón de descuento"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleCouponStatus(c.codigo)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer ${
                          isActivo
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                        title={isActivo ? 'Desactivar cupón' : 'Activar cupón'}
                      >
                        {isActivo ? '● Activo' : '○ Inactivo'}
                      </button>

                      {c.codigo !== 'NINGUNO' && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(c.codigo)}
                          className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg cursor-pointer transition-colors"
                          title="Eliminar cupón"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO DE TAB 3: PLANES DE FINANCIAMIENTO */}
      {activeTab === 'plans' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-teal-600" />
                  <span>Configuración de Planes de Financiamiento</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Establece los plazos y la cantidad de cuotas permitidas (12 meses, 24 meses, etc.) para que el asesor pueda asignarlas.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddPlan(!showAddPlan)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center space-x-2 transition-all shadow-2xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>+ Crear Nuevo Plan</span>
              </button>
            </div>

            {/* NOTA DE PROTECCIÓN DE PLANES Y CUOTAS */}
            <div className="bg-sky-50/80 border border-sky-200 rounded-xl p-3 flex items-start space-x-2 text-xs text-sky-900">
              <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <strong>Protección de Cuotas & Plazos Contratados:</strong> Las modificaciones en las opciones de financiamiento solo aplican a nuevos acuerdos. Los contratos y calendarios de cuotas asignados a pacientes existentes no sufrirán alteraciones.
              </div>
            </div>

            {/* FORMULARIO NUEVO PLAN */}
            {showAddPlan && (
              <form onSubmit={handleAddPlan} className="p-4 bg-teal-50/80 rounded-xl border border-teal-200 space-y-3 animate-in fade-in duration-150">
                <span className="text-xs font-bold text-teal-900 block uppercase tracking-wider">Crear Nuevo Plan de Financiamiento</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Nombre del Plan</label>
                    <input
                      type="text"
                      placeholder="Ej. Plan Personalizado 15 Meses"
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-teal-300 rounded-lg text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Número de Meses</label>
                    <input
                      type="number"
                      min="1"
                      max="48"
                      value={planMonths}
                      onChange={(e) => {
                        const m = Number(e.target.value);
                        setPlanMonths(m);
                        setPlanCuotas(m);
                      }}
                      className="w-full px-3 py-2 bg-white border border-teal-300 rounded-lg text-xs font-bold text-teal-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Frecuencia de Pago</label>
                    <select
                      value={planFreq}
                      onChange={(e) => setPlanFreq(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-teal-300 rounded-lg text-xs font-medium"
                    >
                      <option value="Mensual">Mensual</option>
                      <option value="Quincenal">Quincenal</option>
                      <option value="Semanal">Semanal</option>
                      <option value="Único pago">Único pago</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Descripción Informativa</label>
                  <input
                    type="text"
                    placeholder="Ej. 15 cuotas mensuales ajustables..."
                    value={planDesc}
                    onChange={(e) => setPlanDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-teal-300 rounded-lg text-xs font-medium"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddPlan(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 font-medium hover:bg-slate-200 rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-lg cursor-pointer shadow-2xs"
                  >
                    Guardar Plan
                  </button>
                </div>
              </form>
            )}

            {/* LISTA DE PLANES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {plans.map((p) => (
                <div key={p.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-teal-300 transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{p.nombre}</span>
                    <span className="px-2.5 py-1 bg-teal-100 text-teal-800 font-extrabold text-xs rounded-md border border-teal-200">
                      {p.meses} Meses / {p.cuotas} Cuota(s)
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{p.descripcion}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px]">
                    <span className="text-slate-500 font-medium">Frecuencia: <strong className="text-slate-800">{p.frecuencia}</strong></span>
                    {p.id !== 'plan_contado' && (
                      <button
                        type="button"
                        onClick={() => handleDeletePlan(p.id)}
                        className="text-rose-600 hover:text-rose-800 font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO DE TAB 4: PLANTILLA FICHA Y DATOS DE LA CLÍNICA */}
      {activeTab === 'clinic' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <form onSubmit={handleSaveClinicConfig} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Building className="w-5 h-5 text-teal-600" />
                  <span>Datos Institucionales & Estilo del Reporte PDF Imprimible</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Configura el nombre oficial de la clínica, los títulos del encabezado y las cláusulas legales para los reportes impresos.
                </p>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-teal-300 font-bold text-xs rounded-xl flex items-center space-x-2 transition-all shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4 text-teal-400" />
                <span>Guardar Cambios</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nombre Oficial de la Clínica / Centro
                </label>
                <input
                  type="text"
                  value={clinicConfig.nombreClinica}
                  onChange={(e) => setClinicConfig({ ...clinicConfig, nombreClinica: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Subtítulo de la Especialidad / Unidad
                </label>
                <input
                  type="text"
                  value={clinicConfig.subtitulo}
                  onChange={(e) => setClinicConfig({ ...clinicConfig, subtitulo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-teal-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Cirujano Principal / Representante Médico
                </label>
                <input
                  type="text"
                  value={clinicConfig.doctorRepresentante}
                  onChange={(e) => setClinicConfig({ ...clinicConfig, doctorRepresentante: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Teléfonos de Atención / WhatsApp CRM
                </label>
                <input
                  type="text"
                  value={clinicConfig.telefono}
                  onChange={(e) => setClinicConfig({ ...clinicConfig, telefono: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Correo Electrónico Institucional
                </label>
                <input
                  type="email"
                  value={clinicConfig.email}
                  onChange={(e) => setClinicConfig({ ...clinicConfig, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Dirección Física de la Clínica
                </label>
                <input
                  type="text"
                  value={clinicConfig.direccion}
                  onChange={(e) => setClinicConfig({ ...clinicConfig, direccion: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-900 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Términos, Cláusulas y Nota Legal del Reporte Imprimible
              </label>
              <textarea
                rows={3}
                value={clinicConfig.terminosReporte}
                onChange={(e) => setClinicConfig({ ...clinicConfig, terminosReporte: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-900 focus:bg-white"
              />
            </div>

            {/* VISTA PREVIA DEL ENCABEZADO PDF */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Vista Previa del Encabezado del Reporte PDF Imprimible
              </span>

              <div className="bg-slate-900 text-white p-4 rounded-xl border-b-4 border-teal-600 flex items-center justify-between shadow-md">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-600 text-white flex items-center justify-center font-serif font-bold text-lg">
                    DB
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base text-white">{clinicConfig.nombreClinica || 'Nombre de la Clínica'}</h4>
                    <p className="text-[11px] text-teal-300 font-semibold">{clinicConfig.subtitulo || 'Subtítulo'}</p>
                  </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-right">
                  <div className="text-[10px] font-bold text-teal-400">REGISTRO # P-2026-0001</div>
                  <div className="text-[9px] text-slate-400">Fecha: {new Date().toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* CONTENIDO DE TAB 5: SINCRONIZACIÓN CON GOOGLE SHEETS */}
      {activeTab === 'sheets' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Database className="w-5 h-5 text-teal-600" />
                <span>Configuración de Google Apps Script & Base de Datos</span>
              </h3>
              <p className="text-xs text-slate-500">
                Vincula tu hoja de cálculo en Google Sheets para sincronización bidireccional y copias de seguridad automáticas.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                URL de la Web App de Google Apps Script (GAS)
              </label>

              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={gasUrl}
                  onChange={(e) => setGasUrl(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-medium focus:ring-2 focus:ring-teal-500/20"
                />

                <button
                  type="button"
                  onClick={handleSaveGasUrl}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-2xs cursor-pointer transition-colors"
                >
                  Guardar URL
                </button>
              </div>

              <div className="flex items-start space-x-2 text-[11px] text-slate-500 pt-1">
                <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  Al guardar la URL, cada registro de paciente, abono o plan de financiamiento se sincronizará automáticamente con tu Google Sheet.
                </span>
              </div>
            </div>

            {/* BOTONES MANTENIMIENTO: DEPURAR GHOSTS, DATOS DEMO Y VACIAR SISTEMA VIRGEN */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-amber-50/60 border border-amber-200 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-amber-900 block flex items-center space-x-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    <span>Depurar Registros Vacíos y Fantasmas (Cédula V-00000000)</span>
                  </span>
                  <span className="text-[11px] text-slate-600">Elimina de forma segura y permanente los registros sin cédula o con "V-00000000" y todos sus datos asociados en Financiamientos, Actividades y Pagos, tanto en la Web App como en Google Sheets.</span>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    if (confirm('¿Deseas ejecutar la depuración de registros sin cédula y pacientes fantasma en todas las tablas?')) {
                      const res = await StorageService.purgeGhostRecordsFromAllTables();
                      alert(res.message);
                      window.location.reload();
                    }
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer shrink-0"
                >
                  Depurar Registros Vacíos
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-rose-50/50 border border-rose-100 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-rose-900 block flex items-center space-x-1.5">
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Vaciar Base de Datos (Sistema Virgen)</span>
                  </span>
                  <span className="text-[11px] text-slate-600">Elimina todos los pacientes y pagos para iniciar a usar el sistema desde cero en producción.</span>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    if (confirm('⚠️ ¿Estás seguro de que deseas VACIAR completamente toda la base de datos?\n\nEsto borrará todos los pacientes, abonos y financiamientos de esta Web App y de tu Google Sheets para dejar el sistema 100% virgen.')) {
                      const res = await StorageService.clearAllData(true);
                      alert(res.message);
                      window.location.reload();
                    }
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer shrink-0"
                >
                  Vaciar Todo (Sistema Virgen)
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Restablecer Datos de Demostración</span>
                  <span className="text-[11px] text-slate-500">Restaura la base de datos a los pacientes y actividades de ejemplo por defecto.</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('¿Deseas cargar nuevamente los datos iniciales de demostración?')) {
                      StorageService.resetToDemoData();
                      window.location.reload();
                    }
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all border border-slate-300 cursor-pointer shrink-0"
                >
                  Cargar Datos Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
