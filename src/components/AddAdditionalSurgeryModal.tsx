import React, { useState, useEffect } from 'react';
import {
  X,
  Scissors,
  PlusCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Layers,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Plus,
  Trash2,
  CreditCard
} from 'lucide-react';
import { Paciente, FinanciamientoCirugia, Pago, ProcedureItem, RolUsuario, getRolePermissions } from '../types';
import { StorageService } from '../services/storageService';
import {
  getActiveCatalog,
  getActiveCoupons,
  calculatePaymentSchedule,
  ProcedureCatalogItem,
  CouponItem,
  PaymentScheduleItem
} from '../services/financingConfig';

interface AddAdditionalSurgeryModalProps {
  paciente: Paciente;
  plan?: FinanciamientoCirugia | null;
  pagos: Pago[];
  userRole?: RolUsuario;
  onClose: () => void;
  onPlanUpdated: (updatedPlan: FinanciamientoCirugia, updatedPaciente: Paciente, newPago?: Pago) => void;
}

export const AddAdditionalSurgeryModal: React.FC<AddAdditionalSurgeryModalProps> = ({
  paciente,
  plan,
  pagos,
  userRole,
  onClose,
  onPlanUpdated
}) => {
  const permissions = getRolePermissions(userRole);

  // Verificación de permisos
  if (userRole && !permissions.canCreateFinancingPlan && !permissions.canRegisterPayment && !permissions.canAddPatient) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center space-y-4 shadow-xl border border-slate-200">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Acceso Restringido</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Tu perfil de usuario (<span className="font-semibold text-slate-800">{userRole}</span>) no cuenta con permisos para modificar planes ni agregar cirugías adicionales.
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

  // Catálogo quirúrgico activo
  const [catalog, setCatalog] = useState<ProcedureCatalogItem[]>(() => getActiveCatalog());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  // Procedimientos actuales ya contratados en el plan
  const initialCurrentProcedures: ProcedureItem[] = (() => {
    if (plan?.comboProcedimientos && plan.comboProcedimientos.length > 0) {
      return plan.comboProcedimientos.map(p => ({ ...p }));
    }
    if (paciente.procedimiento) {
      const parts = paciente.procedimiento.split(/[,+/]/).map(s => s.trim()).filter(Boolean);
      if (parts.length > 1) {
        const estCostPerItem = Math.round((plan?.costoTotalCirugia || 3500) / parts.length);
        return parts.map((name, idx) => ({
          id: `initial_${idx}`,
          nombre: name,
          precio: estCostPerItem
        }));
      }
    }
    return [
      {
        id: 'initial_0',
        nombre: paciente.procedimiento || 'Cirugía Inicial Contratada',
        precio: plan?.costoTotalCirugia || 3000
      }
    ];
  })();

  const [currentProcedures, setCurrentProcedures] = useState<ProcedureItem[]>(initialCurrentProcedures);

  // Cirugías adicionales que se van agregando
  const [additionalProcedures, setAdditionalProcedures] = useState<ProcedureItem[]>([]);

  // Formulario para cirugía personalizada
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customProcName, setCustomProcName] = useState('');
  const [customProcPrice, setCustomProcPrice] = useState<number | string>(1500);

  // Decision mode: 'financiamiento' (recalcular en cuotas) | 'pago_total' (liquidación directa)
  const [adjustmentMode, setAdjustmentMode] = useState<'financiamiento' | 'pago_total'>('financiamiento');

  // Opciones para Recálculo en Cuotas
  const [cuotasRestantes, setCuotasRestantes] = useState<number>(() => {
    const existing = plan?.cuotasTotales || 3;
    return Math.max(1, Math.min(24, existing));
  });
  const [fechaEstimadaCirugia, setFechaEstimadaCirugia] = useState<string>(() => {
    return plan?.fechaEstimadaCirugia || '2026-07-30';
  });
  const [regenerarAlarmasCRM, setRegenerarAlarmasCRM] = useState(true);

  // Opciones para Pago Total Directo
  const [pagoTotalAction, setPagoTotalAction] = useState<'inmediato' | 'pendiente_antes_cirugia'>('inmediato');
  const [metodoPago, setMetodoPago] = useState<'Zelle' | 'Mercantil' | 'Efectivo USD' | 'Transferencia BS' | 'Pago Móvil' | 'Binance' | 'Otro'>('Zelle');
  const [referenciaPago, setReferenciaPago] = useState<string>('');
  const [notaPago, setNotaPago] = useState<string>('Abono por Cirugía Adicional agregada al plan quirúrgico');

  // Estado de procesamiento
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Sincronización en tiempo real del catálogo
  useEffect(() => {
    const handleUpdate = () => {
      setCatalog(getActiveCatalog());
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('catalog-updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('catalog-updated', handleUpdate);
    };
  }, []);

  // Categorías de cirugías
  const categories = ['Todas', ...Array.from(new Set(catalog.map(p => p.categoria || 'General')))];

  // Filtrado de catálogo
  const filteredCatalog = catalog.filter(item => {
    const matchesSearch = item.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || item.categoria === selectedCategory;
    return matchesSearch && matchesCategory && item.activo !== false;
  });

  // Cálculos financieros
  // 1. Total ya abonado (preservado 100% de la historia de pagos de la paciente)
  const totalAbonado = plan?.montoAbonado ?? (pagos.filter(p => p.id === paciente.id).reduce((sum, p) => sum + (p.abono || 0), 0));

  // 2. Subtotal de cirugías actuales + adicionales
  const subtotalActuales = currentProcedures.reduce((acc, p) => acc + (Number(p.precio) || 0), 0);
  const subtotalAdicionales = additionalProcedures.reduce((acc, p) => acc + (Number(p.precio) || 0), 0);
  const nuevoSubtotalTotal = subtotalActuales + subtotalAdicionales;

  // 3. Descuentos / Cupones aplicados
  const descuentoActual = plan?.descuentoMonto || 0;
  const nuevoCostoTotal = Math.max(0, nuevoSubtotalTotal - descuentoActual);

  // 4. Nuevo saldo adeudado total
  const nuevoSaldoPendiente = Math.max(0, nuevoCostoTotal - totalAbonado);

  // 5. Cronograma recalculado de cuotas
  const schedulePreview: PaymentScheduleItem[] = calculatePaymentSchedule(
    new Date().toISOString().split('T')[0],
    cuotasRestantes,
    nuevoSaldoPendiente
  );

  // Manejador: Agregar procedimiento desde catálogo
  const handleAddProcedureFromCatalog = (item: ProcedureCatalogItem) => {
    const newProc: ProcedureItem = {
      id: `add_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      nombre: item.nombre,
      precio: item.precioDefault || 1500
    };
    setAdditionalProcedures(prev => [...prev, newProc]);
  };

  // Manejador: Agregar procedimiento personalizado
  const handleAddCustomProcedure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customProcName.trim()) return;

    const newProcItem: ProcedureCatalogItem = {
      id: `custom_${Date.now()}`,
      nombre: customProcName.trim(),
      categoria: 'Cirugía Especial',
      precioDefault: Number(customProcPrice) || 1500,
      activo: true
    };

    // Guardar en catálogo global para que esté disponible a todos
    const updated = StorageService.addCatalogItem(newProcItem);
    setCatalog(updated);

    // Añadir a las cirugías adicionales
    setAdditionalProcedures(prev => [
      ...prev,
      {
        id: newProcItem.id,
        nombre: newProcItem.nombre,
        precio: newProcItem.precioDefault
      }
    ]);

    setCustomProcName('');
    setCustomProcPrice(1500);
    setShowCustomForm(false);
  };

  // Manejador: Quitar procedimiento adicional
  const handleRemoveAdditionalProcedure = (id: string) => {
    setAdditionalProcedures(prev => prev.filter(p => p.id !== id));
  };

  // Manejador: Modificar precio de un procedimiento adicional
  const handleUpdateAdditionalPrice = (id: string, newPrice: number) => {
    setAdditionalProcedures(prev =>
      prev.map(p => (p.id === id ? { ...p, precio: Math.max(0, newPrice) } : p))
    );
  };

  // Guardar y aplicar recálculo general
  const handleApplyRecalculation = async () => {
    if (additionalProcedures.length === 0) {
      setNotification({
        message: 'Por favor selecciona al menos una cirugía adicional del catálogo para agregar.',
        type: 'error'
      });
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Consolidar el combo final de procedimientos
      const finalCombo: ProcedureItem[] = [...currentProcedures, ...additionalProcedures];
      const procedimientoNombres = finalCombo.map(p => p.nombre).join(' + ');

      // 2. Obtener o construir el Plan de Financiamiento
      const planId = plan?.planId || `FIN-${new Date().getFullYear()}-${paciente.cedula || Date.now().toString().slice(-4)}`;
      const fechaInicio = plan?.fechaInicio || new Date().toISOString().split('T')[0];

      let montoAbonadoFinal = totalAbonado;
      let saldoPendienteFinal = nuevoSaldoPendiente;
      let nuevoPagoRegistrado: Pago | undefined = undefined;

      // Si se eligió pago inmediato al contado
      if (adjustmentMode === 'pago_total' && pagoTotalAction === 'inmediato' && nuevoSaldoPendiente > 0) {
        const montoPago = nuevoSaldoPendiente;
        const codRecibo = `REC-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
        const fechaHoy = new Date().toISOString().split('T')[0];

        nuevoPagoRegistrado = {
          cod: codRecibo,
          id: paciente.id,
          nombre: paciente.nombre,
          fecha: fechaHoy,
          abono: montoPago,
          cargo: montoPago,
          diasVcto: 0,
          estatus: 'Pagado',
          metodoDePago: metodoPago,
          referencia: referenciaPago || 'Liquidación Cirugía Adicional',
          descripcion: notaPago || `Abono total por adición de ${additionalProcedures.map(p => p.nombre).join(', ')}`,
          mesProximaAccion: '',
          fechaProximaAccion: '',
          proximaAccion: 'Cirugía en curso'
        };

        montoAbonadoFinal = totalAbonado + montoPago;
        saldoPendienteFinal = 0;
      }

      const estadoFinancieroFinal =
        saldoPendienteFinal === 0
          ? 'Pagado Totalmente'
          : plan?.estadoFinanciero === 'En Mora'
          ? 'En Mora'
          : 'Al día';

      const cuotasFinales = adjustmentMode === 'pago_total' ? 1 : Math.max(1, cuotasRestantes);

      const updatedPlan: FinanciamientoCirugia = {
        planId,
        pacienteId: paciente.id,
        procedimiento: procedimientoNombres,
        comboProcedimientos: finalCombo,
        tipoPago: adjustmentMode === 'pago_total' ? 'Contado' : 'Financiamiento',
        costoSubtotal: nuevoSubtotalTotal,
        descuentoMonto: descuentoActual,
        cuponCodigo: plan?.cuponCodigo || 'NINGUNO',
        costoTotalCirugia: nuevoCostoTotal,
        cuotasTotales: cuotasFinales,
        montoAbonado: montoAbonadoFinal,
        saldoPendiente: saldoPendienteFinal,
        montoCuotaMensual: cuotasFinales > 0 && saldoPendienteFinal > 0 ? Math.round(saldoPendienteFinal / cuotasFinales) : 0,
        estadoFinanciero: estadoFinancieroFinal,
        fechaInicio,
        fechaEstimadaCirugia
      };

      // 3. Actualizar Paciente
      const updatedPaciente: Paciente = {
        ...paciente,
        procedimiento: procedimientoNombres
      };

      // 4. Persistir Plan y Paciente
      StorageService.saveFinanciamiento(updatedPlan);
      StorageService.updatePaciente(updatedPaciente);

      // 5. Si se generó pago inmediato, registrarlo
      if (nuevoPagoRegistrado) {
        StorageService.addPago(nuevoPagoRegistrado);
      }

      // 6. Si se eligió financiamiento en cuotas y regenerar alarmas CRM
      if (adjustmentMode === 'financiamiento' && regenerarAlarmasCRM && saldoPendienteFinal > 0) {
        // Eliminar alarmas de cuotas pendientes viejas para no duplicar
        const existingActs = StorageService.getActividades();
        const cleanedActs = existingActs.filter(
          a => !(a.pacienteId === paciente.id && a.actividadId.startsWith('ACT-PAY-') && a.estado === 'Pendiente')
        );
        StorageService.saveActividades(cleanedActs);

        // Generar nuevas alarmas
        StorageService.generateAndSavePaymentAlarms(updatedPaciente, updatedPlan);
      }

      // 7. Notificar y cerrar
      onPlanUpdated(updatedPlan, updatedPaciente, nuevoPagoRegistrado);
      onClose();
    } catch (err: any) {
      console.error('Error al agregar cirugía adicional:', err);
      setNotification({
        message: 'Ocurrió un error al recalcular y guardar el plan. Por favor reintenta.',
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* CABECERA */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold shadow-md shrink-0">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full">
                  Agregar Cirugía & Recálculo
                </span>
                <span className="text-xs text-slate-400">ID: <strong>{paciente.id}</strong> | C.I. {paciente.cedula}</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
                {paciente.nombre}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* NOTIFICACIÓN EN CASO DE ERROR */}
        {notification && (
          <div className={`px-6 py-2.5 text-xs font-semibold flex items-center justify-between ${
            notification.type === 'error' ? 'bg-rose-50 text-rose-800 border-b border-rose-200' : 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
          }`}>
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="text-slate-500 hover:text-slate-800">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* CUERPO DEL MODAL (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* SECCIÓN 1: RESUMEN ACTUAL (CONTRATADO + ABONADO) */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-teal-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Cirugías y Procedimientos Contratados Inicialmente
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-slate-500">Historial de Abonos:</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  ${totalAbonado.toLocaleString()} USD Abonados
                </span>
              </div>
            </div>

            {/* LISTA DE CIRUGÍAS CONTRATADAS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentProcedures.map((proc, idx) => (
                <div key={proc.id || idx} className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center space-x-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-800 truncate" title={proc.nombre}>
                      {proc.nombre}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 shrink-0 ml-2">
                    ${(proc.precio || 0).toLocaleString()} USD
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SECCIÓN 2: SELECCIONAR CIRUGÍA ADICIONAL DEL CATÁLOGO */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                  <PlusCircle className="w-4 h-4 text-teal-600" />
                  <span>Seleccionar Cirugía Adicional a Incorporar</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Elige una o más cirugías del catálogo quirúrgico para sumarlas a esta paciente.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCustomForm(!showCustomForm)}
                className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 font-semibold text-xs rounded-lg transition-colors flex items-center space-x-1 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Procedimiento Personalizado</span>
              </button>
            </div>

            {/* FORMULARIO CIRUGÍA PERSONALIZADA (SI SE DESPLIEGA) */}
            {showCustomForm && (
              <form onSubmit={handleAddCustomProcedure} className="bg-teal-50/50 p-4 rounded-xl border border-teal-200 space-y-3 animate-in fade-in duration-150">
                <span className="text-xs font-bold text-teal-900 block">Registrar e incorporar cirugía especial no listada:</span>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-8">
                    <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Nombre de la Cirugía</label>
                    <input
                      type="text"
                      placeholder="Ej: Marcaje Abdominal HD con Transferencia..."
                      value={customProcName}
                      onChange={e => setCustomProcName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Precio Estimado (USD)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">$</span>
                      <input
                        type="number"
                        min="0"
                        value={customProcPrice}
                        onChange={e => setCustomProcPrice(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-bold"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomForm(false)}
                    className="px-3 py-1.5 bg-white text-slate-600 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 shadow-2xs cursor-pointer"
                  >
                    Añadir al Plan
                  </button>
                </div>
              </form>
            )}

            {/* BÚSQUEDA Y FILTRO DE CATEGORÍAS */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar en el catálogo quirúrgico..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>

              <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* GRID DEL CATÁLOGO DE CIRUGÍAS DISPONIBLES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50/50">
              {filteredCatalog.map(proc => {
                const isAlreadySelected = additionalProcedures.some(p => p.nombre.toLowerCase().trim() === proc.nombre.toLowerCase().trim());
                return (
                  <div
                    key={proc.id}
                    className={`p-3 rounded-lg border transition-all flex flex-col justify-between ${
                      isAlreadySelected
                        ? 'bg-teal-50/80 border-teal-300 ring-1 ring-teal-400'
                        : 'bg-white border-slate-200 hover:border-teal-400 shadow-2xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[9px] uppercase font-bold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded-sm">
                          {proc.categoria}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          ${proc.precioDefault.toLocaleString()} USD
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-800 leading-snug">{proc.nombre}</h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddProcedureFromCatalog(proc)}
                      className={`mt-2.5 w-full py-1 text-xs font-bold rounded-md flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                        isAlreadySelected
                          ? 'bg-teal-600 text-white hover:bg-teal-700'
                          : 'bg-slate-100 hover:bg-teal-600 text-slate-700 hover:text-white'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                      <span>{isAlreadySelected ? '+ Añadir otra vez' : 'Añadir al Plan'}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* CIRUGÍAS ADICIONALES SELECCIONADAS */}
            {additionalProcedures.length > 0 && (
              <div className="bg-teal-50/60 rounded-xl p-3.5 border border-teal-200 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-900 block">
                  ✨ Cirugías Adicionales Incorporadas ({additionalProcedures.length}):
                </span>
                <div className="space-y-1.5">
                  {additionalProcedures.map((proc, index) => (
                    <div
                      key={proc.id || index}
                      className="bg-white p-2.5 rounded-lg border border-teal-100 flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-[10px] font-bold shrink-0">
                          +{index + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-900 truncate">{proc.nombre}</span>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <div className="relative">
                          <span className="absolute left-2 top-1.5 text-[10px] text-slate-400 font-bold">$</span>
                          <input
                            type="number"
                            min="0"
                            value={proc.precio}
                            onChange={e => handleUpdateAdditionalPrice(proc.id, Number(e.target.value))}
                            className="w-24 pl-5 pr-2 py-1 text-xs font-bold bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-teal-500 text-right"
                            title="Puedes ajustar el precio individual de esta cirugía"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAdditionalProcedure(proc.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Eliminar de las adicionales"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECCIÓN 3: RECÁLCULO FINANCIERO EN TIEMPO REAL */}
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-teal-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-300">
                  Recálculo Quirúrgico y Financiero en Vivo
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Abonos previos respetados al 100%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Costo Anterior</span>
                <div className="text-sm font-bold text-slate-200 mt-1">${subtotalActuales.toLocaleString()} USD</div>
              </div>

              <div className="bg-teal-950/60 p-3 rounded-lg border border-teal-700/50">
                <span className="text-[9px] uppercase font-bold text-teal-400 block tracking-wider">Adicionales</span>
                <div className="text-sm font-bold text-teal-300 mt-1">+${subtotalAdicionales.toLocaleString()} USD</div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <span className="text-[9px] uppercase font-bold text-emerald-400 block tracking-wider">Total ya Abonado</span>
                <div className="text-sm font-bold text-emerald-400 mt-1">${totalAbonado.toLocaleString()} USD</div>
              </div>

              <div className="bg-amber-950/60 p-3 rounded-lg border border-amber-600/50">
                <span className="text-[9px] uppercase font-bold text-amber-300 block tracking-wider">Nuevo Saldo Adeudado</span>
                <div className="text-base font-extrabold text-amber-400 mt-0.5">
                  ${nuevoSaldoPendiente.toLocaleString()} USD
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-300 bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50 flex items-center justify-between">
              <span><strong>Nuevo Costo Total Quirúrgico:</strong> ${nuevoCostoTotal.toLocaleString()} USD</span>
              <span className="text-[11px] text-teal-300 font-semibold">
                Combo: {[...currentProcedures, ...additionalProcedures].map(p => p.nombre).join(' + ')}
              </span>
            </div>
          </div>

          {/* SECCIÓN 4: OPCIÓN DE DECISIÓN (RECALCULAR EN CUOTAS VS PAGO TOTAL DIRECTO) */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900">
                ¿Cómo desea la paciente saldar o estructurar el nuevo saldo adeudado?
              </h3>
            </div>

            {/* SELECTOR DE 2 VÍAS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAdjustmentMode('financiamiento')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  adjustmentMode === 'financiamiento'
                    ? 'bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-teal-900 flex items-center space-x-1.5">
                      <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
                      <span>Opción A: Recalcular Plan en Cuotas</span>
                    </span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      adjustmentMode === 'financiamiento' ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300'
                    }`}>
                      {adjustmentMode === 'financiamiento' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Repartir el nuevo saldo adeudado (<strong className="text-slate-800">${nuevoSaldoPendiente.toLocaleString()} USD</strong>) en un nuevo cronograma de cuotas quincenales o mensuales hasta la fecha de operación.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAdjustmentMode('pago_total')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  adjustmentMode === 'pago_total'
                    ? 'bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-teal-900 flex items-center space-x-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-teal-600" />
                      <span>Opción B: Pago Total / Al Contado</span>
                    </span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      adjustmentMode === 'pago_total' ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300'
                    }`}>
                      {adjustmentMode === 'pago_total' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Liquidar o dejar como pago único de contado el monto restante (<strong className="text-slate-800">${nuevoSaldoPendiente.toLocaleString()} USD</strong>) antes de ingresar a quirófano.
                  </p>
                </div>
              </button>
            </div>

            {/* CONTENIDO SEGÚN LA OPCIÓN SELECCIONADA */}
            {adjustmentMode === 'financiamiento' ? (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                      Número de Cuotas Restantes
                    </label>
                    <select
                      value={cuotasRestantes}
                      onChange={e => setCuotasRestantes(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-semibold text-slate-800"
                    >
                      <option value="1">1 Cuota única final</option>
                      <option value="2">2 Cuotas mensuales</option>
                      <option value="3">3 Cuotas mensuales</option>
                      <option value="4">4 Cuotas mensuales</option>
                      <option value="6">6 Cuotas (Semestral)</option>
                      <option value="12">12 Cuotas (Anual)</option>
                      <option value="18">18 Cuotas (Extendido)</option>
                      <option value="24">24 Cuotas (VIP)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                      Fecha Estimada de Cirugía
                    </label>
                    <input
                      type="date"
                      value={fechaEstimadaCirugia}
                      onChange={e => setFechaEstimadaCirugia(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-medium text-slate-800"
                    />
                  </div>
                </div>

                {/* TABLA PREVIEW DEL CRONOGRAMA DE CUOTAS */}
                {schedulePreview.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Nuevo Cronograma de Pagos Proyectado ({schedulePreview.length} Cuotas de ${Math.round(nuevoSaldoPendiente / cuotasRestantes).toLocaleString()} USD aprox):
                    </span>
                    <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-lg bg-white divide-y divide-slate-100">
                      {schedulePreview.map(item => (
                        <div key={item.numeroCuota} className="px-3 py-2 flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">Cuota #{item.numeroCuota}</span>
                          <span className="text-slate-500">Vence: <strong>{item.fechaFormateada}</strong></span>
                          <span className="font-bold text-teal-700">${item.montoCuota.toLocaleString()} USD</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <label className="flex items-center space-x-2 text-xs text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={regenerarAlarmasCRM}
                    onChange={e => setRegenerarAlarmasCRM(e.target.checked)}
                    className="rounded-sm text-teal-600 focus:ring-teal-500"
                  />
                  <span>Actualizar automáticamente las alarmas y recordatorios de cobro en el CRM</span>
                </label>
              </div>
            ) : (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                    Modalidad de Liquidación Total
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className={`p-3 rounded-lg border cursor-pointer flex items-center space-x-2.5 transition-all ${
                      pagoTotalAction === 'inmediato' ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-400' : 'bg-white border-slate-200'
                    }`}>
                      <input
                        type="radio"
                        name="pagoTotalAction"
                        checked={pagoTotalAction === 'inmediato'}
                        onChange={() => setPagoTotalAction('inmediato')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Registrar Cobro / Abono Inmediato</span>
                        <span className="text-[10px] text-slate-500">La paciente paga los ${nuevoSaldoPendiente.toLocaleString()} USD ahora mismo y se genera su recibo.</span>
                      </div>
                    </label>

                    <label className={`p-3 rounded-lg border cursor-pointer flex items-center space-x-2.5 transition-all ${
                      pagoTotalAction === 'pendiente_antes_cirugia' ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-400' : 'bg-white border-slate-200'
                    }`}>
                      <input
                        type="radio"
                        name="pagoTotalAction"
                        checked={pagoTotalAction === 'pendiente_antes_cirugia'}
                        onChange={() => setPagoTotalAction('pendiente_antes_cirugia')}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Dejar como Pago Único antes de Operar</span>
                        <span className="text-[10px] text-slate-500">El plan quedará en 1 cuota de ${nuevoSaldoPendiente.toLocaleString()} USD a liquidar antes de la cirugía.</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* SI SE SELECCIONÓ REGISTRAR PAGO INMEDIATO */}
                {pagoTotalAction === 'inmediato' && (
                  <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-emerald-800 block">Detalles del Comprobante de Pago Inmediato:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Monto a Cobrar</label>
                        <div className="text-sm font-bold text-emerald-800 py-1.5 px-3 bg-emerald-50 rounded-lg border border-emerald-200">
                          ${nuevoSaldoPendiente.toLocaleString()} USD
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Método de Pago</label>
                        <select
                          value={metodoPago}
                          onChange={e => setMetodoPago(e.target.value as any)}
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 font-semibold"
                        >
                          <option value="Zelle">Zelle</option>
                          <option value="Efectivo USD">Efectivo USD</option>
                          <option value="Mercantil">Mercantil</option>
                          <option value="Transferencia BS">Transferencia BS</option>
                          <option value="Pago Móvil">Pago Móvil</option>
                          <option value="Binance">Binance</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Referencia / Comprobante</label>
                        <input
                          type="text"
                          placeholder="Ej: #ZELLE-99482"
                          value={referenciaPago}
                          onChange={e => setReferenciaPago(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Nota / Concepto</label>
                      <input
                        type="text"
                        value={notaPago}
                        onChange={e => setNotaPago(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* PIE DE PÁGINA / BOTONES DE ACCIÓN */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-600">
            {additionalProcedures.length === 0 ? (
              <span className="text-amber-700 font-medium">⚠️ Selecciona una cirugía adicional del catálogo para habilitar el guardado.</span>
            ) : (
              <span className="text-emerald-700 font-bold">
                ✓ {additionalProcedures.length} cirugía(s) adicional(es) lista(s) para recalcular el plan.
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleApplyRecalculation}
              disabled={isProcessing || additionalProcedures.length === 0}
              className={`px-5 py-2 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer ${
                isProcessing || additionalProcedures.length === 0
                  ? 'bg-slate-400 cursor-not-allowed opacity-70'
                  : 'bg-teal-600 hover:bg-teal-700 hover:shadow-lg'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Procesando Recálculo...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Guardar y Aplicar Recálculo</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
