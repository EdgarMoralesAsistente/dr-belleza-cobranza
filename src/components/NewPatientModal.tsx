import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  PlusCircle,
  TrendingUp,
  Tag,
  Printer,
  Check,
  Plus,
  ArrowLeft,
  FileText,
  Eye
} from 'lucide-react';
import { Paciente, FinanciamientoCirugia } from '../types';
import { StorageService } from '../services/storageService';
import {
  getActiveCatalog,
  getActiveCoupons,
  getActivePlanOptions,
  getClinicConfig,
  ProcedureCatalogItem,
  CouponItem,
  printPatientFinancingPDF
} from '../services/financingConfig';

interface NewPatientModalProps {
  onClose: () => void;
  onSave: (paciente: Paciente, plan?: FinanciamientoCirugia) => void;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({ onClose, onSave }) => {
  // Datos personales
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [genero, setGenero] = useState<'Femenino' | 'Masculino' | 'Otro'>('Femenino');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [promocion, setPromocion] = useState('Instagram - Campaña Estética');
  const [direccion, setDireccion] = useState('');

  // Pestañas del modal de registro
  const [activeStep, setActiveStep] = useState<'datos' | 'financiamiento'>('datos');

  // Vista Previa de Ficha Médica PDF
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // Configuración Quirúrgica & Financiera
  const [incluirFinanciamiento, setIncluirFinanciamiento] = useState(true);
  const [tipoPago, setTipoPago] = useState<'Contado' | 'Financiamiento'>('Financiamiento');
  
  // Combo Quirúrgico
  const [catalog, setCatalog] = useState<ProcedureCatalogItem[]>(getActiveCatalog());
  const [selectedProcIds, setSelectedProcIds] = useState<string[]>(['proc_1']); // Mamoplastia
  
  // Cupones
  const [couponsList, setCouponsList] = useState<CouponItem[]>(getActiveCoupons());
  const [selectedCouponCode, setSelectedCouponCode] = useState<string>('NINGUNO');
  
  // Custom Coupon inline creation
  const [showNewCouponForm, setShowNewCouponForm] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDesc, setNewCouponDesc] = useState('');
  const [newCouponType, setNewCouponType] = useState<'porcentaje' | 'monto_fijo'>('porcentaje');
  const [newCouponVal, setNewCouponVal] = useState<number>(10);

  // Custom Procedure inline creation
  const [showCustomProcForm, setShowCustomProcForm] = useState(false);
  const [customProcName, setCustomProcName] = useState('');
  const [customProcPrice, setCustomProcPrice] = useState<number>(1500);

  // Plan & Cuotas
  const [selectedPlanOptionId, setSelectedPlanOptionId] = useState<string>('plan_12m');
  const [cuotasTotales, setCuotasTotales] = useState<number>(12);
  const [montoInicial, setMontoInicial] = useState<number>(1000);
  const [fechaEstimadaCirugia, setFechaEstimadaCirugia] = useState('2026-06-15');

  // Cálculos en tiempo real
  const selectedProcedures = catalog.filter(p => selectedProcIds.includes(p.id));
  const subtotalCost = selectedProcedures.reduce((acc, p) => acc + p.precioDefault, 0);

  const activeCoupon = couponsList.find(c => c.codigo === selectedCouponCode) || couponsList[0];
  let descuentoMonto = 0;
  if (activeCoupon.codigo !== 'NINGUNO') {
    if (activeCoupon.tipo === 'porcentaje') {
      descuentoMonto = Math.round((subtotalCost * activeCoupon.valor) / 100);
    } else {
      descuentoMonto = Math.min(subtotalCost, activeCoupon.valor);
    }
  }

  const costoTotalCirugia = Math.max(0, subtotalCost - descuentoMonto);
  const saldoPendiente = Math.max(0, costoTotalCirugia - montoInicial);
  const cuotasActuales = tipoPago === 'Contado' ? 1 : cuotasTotales;
  const montoCuotaEst = cuotasActuales > 0 ? Math.round(saldoPendiente / cuotasActuales) : 0;

  const toggleProcedure = (procId: string) => {
    if (selectedProcIds.includes(procId)) {
      setSelectedProcIds(selectedProcIds.filter(id => id !== procId));
    } else {
      setSelectedProcIds([...selectedProcIds, procId]);
    }
  };

  const handleProcedurePriceChange = (procId: string, newPrice: number) => {
    setCatalog(prev => prev.map(p => p.id === procId ? { ...p, precioDefault: newPrice } : p));
  };

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

  const handleAddCustomProcedure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customProcName.trim() || customProcPrice <= 0) return;

    const newProc: ProcedureCatalogItem = {
      id: `custom_${Date.now()}`,
      nombre: customProcName.trim(),
      categoria: 'Personalizada',
      precioDefault: Number(customProcPrice)
    };

    setCatalog([...catalog, newProc]);
    setSelectedProcIds([...selectedProcIds, newProc.id]);
    setCustomProcName('');
    setCustomProcPrice(1500);
    setShowCustomProcForm(false);
  };

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

    setCouponsList([...couponsList, newCoupon]);
    setSelectedCouponCode(formattedCode);
    setNewCouponCode('');
    setNewCouponDesc('');
    setNewCouponVal(10);
    setShowNewCouponForm(false);
  };

  const comboNombreConsolidado = selectedProcedures.map(p => p.nombre).join(' + ');

  const getConstructedPatient = (): Paciente => {
    return {
      id: StorageService.generatePatientId(),
      cedula: cedula.trim() || 'V-00000000',
      nombre: nombre.trim() || 'Paciente Nueva',
      genero,
      correo: correo.trim() || 'paciente@gmail.com',
      telefono: telefono.trim() || '+58 412 000-0000',
      contactada: 'Contactada - Ficha Registrada',
      fecha: new Date().toISOString().split('T')[0],
      promocion,
      procedimiento: comboNombreConsolidado || 'Mamoplastia de Aumento',
      direccion: direccion.trim() || 'Sin dirección registrada'
    };
  };

  const getConstructedPlan = (patientId: string): FinanciamientoCirugia => {
    return {
      planId: StorageService.generatePlanId(),
      pacienteId: patientId,
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
    if (!nombre.trim() || !cedula.trim()) return;

    const newPatient = getConstructedPatient();
    const newPlan = incluirFinanciamiento ? getConstructedPlan(newPatient.id) : undefined;

    onSave(newPatient, newPlan);
    onClose();
  };

  const handlePrintPDF = () => {
    setShowPrintPreview(true);
  };

  const patientToPrint = getConstructedPatient();
  const planToPrint = incluirFinanciamiento ? getConstructedPlan(patientToPrint.id) : null;
  const clinicConfig = getClinicConfig();
  const fechaHoyStr = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      
      {/* MODAL DE VISTA PREVIA DE FICHA PDF */}
      {showPrintPreview && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-700 overflow-hidden my-auto flex flex-col max-h-[96vh] text-slate-100">
            
            {/* Header de la Modal de Vista Previa */}
            <div className="px-5 py-3.5 bg-slate-800/90 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-teal-500/20 text-teal-400 rounded-lg border border-teal-500/30">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-white">Vista Previa — Ficha Médica & Plan Quirúrgico</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Previsualización PDF
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Verifique los datos antes de activar la impresión de su sistema</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPrintPreview(false)}
                  className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver a Editar</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    printPatientFinancingPDF(patientToPrint, planToPrint);
                  }}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg transition-all shadow-md flex items-center space-x-2 cursor-pointer active:scale-98"
                >
                  <Printer className="w-4 h-4" />
                  <span>🖨️ Mandar a Imprimir PDF</span>
                </button>
              </div>
            </div>

            {/* Document Preview Sheet Body */}
            <div className="p-4 sm:p-6 overflow-y-auto bg-slate-950/60 flex justify-center">
              
              {/* Paper Document Representation */}
              <div className="w-full max-w-3xl bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6 text-xs font-sans">
                
                {/* Banner Header de la Clínica */}
                <div className="bg-slate-900 text-white p-5 rounded-xl border-b-4 border-teal-600 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-600 text-white font-extrabold text-sm flex items-center justify-center tracking-wider border border-teal-400 shadow-2xs">
                      {clinicConfig.logoTexto ? clinicConfig.logoTexto.substring(0, 2).toUpperCase() : 'DB'}
                    </div>
                    <div>
                      <h1 className="text-base font-bold font-serif italic text-white tracking-tight">{clinicConfig.nombreClinica}</h1>
                      <p className="text-[11px] text-teal-300 font-medium">{clinicConfig.subtitulo}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="inline-block px-2.5 py-1 bg-teal-900/80 border border-teal-500/40 text-teal-200 font-mono text-[11px] font-bold rounded-md">
                      REGISTRO #{patientToPrint.id}
                    </div>
                    <div className="text-[10px] text-slate-300 mt-1">
                      Fecha: {fechaHoyStr}
                    </div>
                  </div>
                </div>

                {/* 1. Datos Personales del Paciente */}
                <div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                      <span>1. Información Personal del Paciente</span>
                    </h2>
                    <span className="text-[10px] text-slate-400">Expediente Médico CRM</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nombre y Apellidos</span>
                      <div className="text-sm font-bold text-teal-800">{patientToPrint.nombre}</div>

                      <div className="mt-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cédula de Identidad</span>
                        <div className="text-xs font-bold text-slate-800">{patientToPrint.cedula}</div>
                      </div>

                      <div className="mt-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Teléfono de Contacto</span>
                        <div className="text-xs font-semibold text-slate-700">{patientToPrint.telefono}</div>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Correo Electrónico</span>
                      <div className="text-xs font-semibold text-slate-800 truncate">{patientToPrint.correo}</div>

                      <div className="mt-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Promoción / Origen</span>
                        <div className="text-xs font-bold text-purple-700">{patientToPrint.promocion}</div>
                      </div>

                      <div className="mt-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dirección de Residencia</span>
                        <div className="text-xs text-slate-600">{patientToPrint.direccion}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Combo Quirúrgico Seleccionado */}
                <div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                      <span>2. Combo Quirúrgico & Procedimientos</span>
                    </h2>
                    <span className="text-[10px] text-slate-400">Intervención Programada</span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-wider">
                          <th className="p-2.5 w-8">#</th>
                          <th className="p-2.5">Procedimiento Quirúrgico Estético</th>
                          <th className="p-2.5 text-right">Costo Base ($ USD)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {selectedProcedures.map((proc, idx) => (
                          <tr key={proc.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                            <td className="p-2.5 font-bold text-slate-400">{idx + 1}</td>
                            <td className="p-2.5 font-bold text-slate-800">{proc.nombre}</td>
                            <td className="p-2.5 text-right font-bold text-teal-700">${proc.precioDefault.toLocaleString()} USD</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3. Desglose del Plan Financiero */}
                <div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                      <span>3. Desglose del Plan Financiero y Forma de Pago</span>
                    </h2>
                    <span className="text-[10px] text-slate-400">Acuerdo Comercial</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Modalidad de Pago</span>
                        <div className="text-xs font-extrabold text-teal-800 uppercase">{tipoPago}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cupón Aplicado</span>
                        <div className="text-xs font-bold text-purple-700">
                          {selectedCouponCode} {descuentoMonto > 0 ? `(-$${descuentoMonto.toLocaleString()} USD)` : ''}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Plan Elegido</span>
                        <div className="text-xs font-bold text-slate-800">
                          {getActivePlanOptions().find(o => o.id === selectedPlanOptionId)?.nombre || 'Contado'}
                        </div>
                      </div>
                      {fechaEstimadaCirugia && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fecha Estimada de Cirugía</span>
                          <div className="text-xs font-semibold text-slate-700">{fechaEstimadaCirugia}</div>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-900 text-white p-4 rounded-xl space-y-1.5 border border-slate-800">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Subtotal Combo Quirúrgico:</span>
                        <strong className="text-slate-200">${subtotalCost.toLocaleString()} USD</strong>
                      </div>
                      {descuentoMonto > 0 && (
                        <div className="flex justify-between text-xs text-emerald-400">
                          <span>Descuento Cupón:</span>
                          <strong>-${descuentoMonto.toLocaleString()} USD</strong>
                        </div>
                      )}
                      <div className="flex justify-between text-xs font-bold text-teal-300 border-t border-slate-800 pt-1.5">
                        <span>TOTAL NETO CIRUGÍA:</span>
                        <span>${costoTotalCirugia.toLocaleString()} USD</span>
                      </div>
                      {tipoPago === 'Financiamiento' && (
                        <>
                          <div className="flex justify-between text-xs text-purple-300 pt-1">
                            <span>Abono / Inicial Pagada:</span>
                            <span>-${Number(montoInicial).toLocaleString()} USD</span>
                          </div>
                          <div className="flex justify-between text-xs font-bold text-amber-400 border-t border-slate-800 pt-1">
                            <span>SALDO PENDIENTE:</span>
                            <span>${saldoPendiente.toLocaleString()} USD</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. Cronograma Estimado de Cuotas Mensuales */}
                {tipoPago === 'Financiamiento' && cuotasActuales > 1 && saldoPendiente > 0 && (
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-3">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                        <span>4. Cronograma Estimado de Cuotas Mensuales</span>
                      </h2>
                      <span className="text-[10px] text-slate-400">Calendario de Pagos</span>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-slate-900 text-white text-[10px] uppercase tracking-wider">
                          <tr>
                            <th className="p-2.5">N° Cuota</th>
                            <th className="p-2.5">Fecha de Vencimiento Estimada</th>
                            <th className="p-2.5 text-right">Monto Cuota ($ USD)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {Array.from({ length: cuotasActuales }).map((_, i) => {
                            const dueDate = new Date();
                            dueDate.setMonth(dueDate.getMonth() + (i + 1));
                            const dateStr = dueDate.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
                            return (
                              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                <td className="p-2.5 font-bold text-slate-900">Cuota #{i + 1}</td>
                                <td className="p-2.5 text-slate-600 font-medium">{dateStr}</td>
                                <td className="p-2.5 text-right font-bold text-teal-700">
                                  ${montoCuotaEst.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 5. Firmas de Conformidad */}
                <div className="pt-6 grid grid-cols-2 gap-8 border-t border-slate-200">
                  <div className="border-t-2 border-slate-300 pt-2 text-center">
                    <div className="font-bold text-slate-900 text-xs">Firma de la Paciente</div>
                    <div className="font-semibold text-slate-700 text-[11px] mt-0.5">{patientToPrint.nombre || 'Nombre de la Paciente'}</div>
                    <div className="text-[10px] text-slate-500">C.I: {patientToPrint.cedula || 'Documento'}</div>
                    <div className="text-[9px] text-slate-400 mt-1">Conforme con el Plan Quirúrgico y Financiero</div>
                  </div>

                  <div className="border-t-2 border-slate-300 pt-2 text-center">
                    <div className="font-bold text-slate-900 text-xs">Cirujano Plástico / Clínica</div>
                    <div className="font-semibold text-slate-700 text-[11px] mt-0.5">{clinicConfig.doctorRepresentante}</div>
                    <div className="text-[10px] text-slate-500">{clinicConfig.nombreClinica}</div>
                    <div className="text-[9px] text-slate-400 mt-1">Dirección Médica</div>
                  </div>
                </div>

                {/* Footer Términos */}
                <div className="text-[9px] text-slate-400 text-center border-t border-slate-100 pt-3 leading-relaxed">
                  <strong>{clinicConfig.nombreClinica}</strong> — {clinicConfig.direccion} — Tel: {clinicConfig.telefono}<br />
                  {clinicConfig.terminosReporte}
                </div>

              </div>
            </div>

            {/* Footer Bar de Acciones */}
            <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setShowPrintPreview(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-700 transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a Editar Datos</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  printPatientFinancingPDF(patientToPrint, planToPrint);
                }}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center space-x-2 cursor-pointer active:scale-98"
              >
                <Printer className="w-4 h-4" />
                <span>🖨️ Mandar a Imprimir / Guardar PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white w-full max-w-2xl sm:max-w-3xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* HEADER */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold shadow-2xs">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif italic font-bold text-base sm:text-lg text-white">Nuevo Registro de Paciente</h3>
              <p className="text-[11px] text-teal-300 font-medium">Ficha Médica & Plan Quirúrgico</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrintPDF}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-lg flex items-center space-x-1.5 transition-all shadow-2xs cursor-pointer"
              title="Generar e imprimir Ficha en PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">PDF / Imprimir</span>
            </button>

            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NAVEGACIÓN PESTAÑAS PASO A PASO */}
        <div className="bg-slate-100 px-5 pt-3 border-b border-slate-200 flex space-x-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveStep('datos')}
            className={`px-4 py-2 font-bold text-xs rounded-t-lg transition-all cursor-pointer ${
              activeStep === 'datos'
                ? 'bg-white text-teal-800 border-t-2 border-teal-600 shadow-2xs'
                : 'text-slate-500 hover:bg-slate-200/60'
            }`}
          >
            1. Datos Personales
          </button>
          <button
            type="button"
            onClick={() => setActiveStep('financiamiento')}
            className={`px-4 py-2 font-bold text-xs rounded-t-lg transition-all cursor-pointer ${
              activeStep === 'financiamiento'
                ? 'bg-white text-teal-800 border-t-2 border-teal-600 shadow-2xs'
                : 'text-slate-500 hover:bg-slate-200/60'
            }`}
          >
            2. Combo Quirúrgico & Financiamiento
          </button>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
          
          {/* PASO 1: DATOS PERSONALES */}
          {activeStep === 'datos' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Documento / Cédula *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: V-19283012"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Género</label>
                  <select
                    value={genero}
                    onChange={(e: any) => setGenero(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-semibold text-slate-900"
                  >
                    <option value="Femenino">Femenino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Nombres y Apellidos Completos *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: María Alejandra Pérez"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-semibold text-slate-900 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Teléfono de Contacto</label>
                  <input
                    type="text"
                    placeholder="+58 412 123-4567"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="paciente@gmail.com"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Campaña / Promoción Origen</label>
                  <select
                    value={promocion}
                    onChange={(e) => setPromocion(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-semibold text-slate-900"
                  >
                    <option value="Instagram - Campaña Estética">Instagram - Campaña Estética</option>
                    <option value="TikTok - Dra. Belleza">TikTok - Dra. Belleza</option>
                    <option value="Google Ads Search">Google Ads Search</option>
                    <option value="Recomendación VIP">Recomendación / Referido VIP</option>
                    <option value="Directo">Consulta Directa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Dirección de Residencia</label>
                  <input
                    type="text"
                    placeholder="Ciudad / Municipio / Zona"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveStep('financiamiento')}
                  className="px-4 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition-all cursor-pointer"
                >
                  Siguiente: Configurar Combo & Plan →
                </button>
              </div>
            </div>
          )}

          {/* PASO 2: COMBO QUIRÚRGICO, CUPONES Y PLAN */}
          {activeStep === 'financiamiento' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* 1. TIPO DE PAGO */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Tipo de Pago Proyectado
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectTipoPago('Contado')}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between cursor-pointer ${
                      tipoPago === 'Contado'
                        ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <span>Pago de Contado (1 Cuota)</span>
                    {tipoPago === 'Contado' && <Check className="w-4 h-4 text-teal-700" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectTipoPago('Financiamiento')}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between cursor-pointer ${
                      tipoPago === 'Financiamiento'
                        ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <span>Plan de Financiamiento</span>
                    {tipoPago === 'Financiamiento' && <Check className="w-4 h-4 text-purple-700" />}
                  </button>
                </div>
              </div>

              {/* 2. COMBO QUIRÚRGICO */}
              <div className="space-y-2 border-t border-slate-100 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Combo Quirúrgico (Suma Automática de Costos)
                  </label>
                  
                  <button
                    type="button"
                    onClick={() => setShowCustomProcForm(!showCustomProcForm)}
                    className="text-[10px] text-teal-700 font-bold hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Agregar Cirugía Especial</span>
                  </button>
                </div>

                {showCustomProcForm && (
                  <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Cirugía Especial"
                        value={customProcName}
                        onChange={(e) => setCustomProcName(e.target.value)}
                        className="col-span-2 px-2.5 py-1.5 bg-white border border-teal-300 rounded-lg text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Precio ($)"
                        value={customProcPrice}
                        onChange={(e) => setCustomProcPrice(Number(e.target.value))}
                        className="px-2.5 py-1.5 bg-white border border-teal-300 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCustomProcedure}
                      className="px-3 py-1 bg-teal-700 text-white text-[10px] font-bold rounded-md"
                    >
                      Añadir al Combo
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {catalog.map(proc => {
                    const isSelected = selectedProcIds.includes(proc.id);
                    return (
                      <div
                        key={proc.id}
                        onClick={() => toggleProcedure(proc.id)}
                        className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between gap-2 select-none ${
                          isSelected
                            ? 'border-teal-500 bg-teal-50/50 shadow-2xs font-bold text-teal-950 ring-1 ring-teal-500/30'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? 'bg-teal-600 text-white' : 'border border-slate-300 bg-white'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="truncate text-xs">{proc.nombre}</span>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`text-xs font-bold ${isSelected ? 'text-teal-700' : 'text-slate-600'}`}>
                            ${proc.precioDefault.toLocaleString()} USD
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* RESUMEN AUTOMÁTICO DE SUMA DE COMBO QUIRÚRGICO */}
                <div className="bg-teal-900 text-white p-3 rounded-xl flex items-center justify-between text-xs mt-2 shadow-2xs">
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] text-teal-300 font-bold uppercase tracking-wider block">
                      Combo Seleccionado ({selectedProcedures.length} {selectedProcedures.length === 1 ? 'cirugía' : 'cirugías'}):
                    </span>
                    <p className="font-semibold text-teal-100 truncate text-[11px]">
                      {comboNombreConsolidado || 'Ningún procedimiento seleccionado'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-teal-300 font-bold uppercase tracking-wider block">Suma Subtotal</span>
                    <strong className="text-base text-teal-200 font-extrabold">${subtotalCost.toLocaleString()} USD</strong>
                  </div>
                </div>
              </div>

              {/* 3. CUPONES DE DESCUENTO */}
              <div className="space-y-2 border-t border-slate-100 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Cupón de Descuento
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewCouponForm(!showNewCouponForm)}
                    className="text-[10px] text-purple-700 font-bold hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <Tag className="w-3 h-3" />
                    <span>+ Crear Cupón</span>
                  </button>
                </div>

                {showNewCouponForm && (
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-2">
                    <div className="grid grid-cols-4 gap-2">
                      <input
                        type="text"
                        placeholder="CÓDIGO"
                        value={newCouponCode}
                        onChange={(e) => setNewCouponCode(e.target.value)}
                        className="px-2 py-1 bg-white border border-purple-300 rounded-lg text-xs uppercase"
                      />
                      <input
                        type="text"
                        placeholder="Descripción"
                        value={newCouponDesc}
                        onChange={(e) => setNewCouponDesc(e.target.value)}
                        className="px-2 py-1 bg-white border border-purple-300 rounded-lg text-xs"
                      />
                      <select
                        value={newCouponType}
                        onChange={(e: any) => setNewCouponType(e.target.value)}
                        className="px-2 py-1 bg-white border border-purple-300 rounded-lg text-xs"
                      >
                        <option value="porcentaje">% Desc</option>
                        <option value="monto_fijo">$ Desc</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Valor"
                        value={newCouponVal}
                        onChange={(e) => setNewCouponVal(Number(e.target.value))}
                        className="px-2 py-1 bg-white border border-purple-300 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleCreateNewCoupon}
                      className="px-3 py-1 bg-purple-700 text-white text-[10px] font-bold rounded-md"
                    >
                      Guardar Cupón
                    </button>
                  </div>
                )}

                <select
                  value={selectedCouponCode}
                  onChange={(e) => setSelectedCouponCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 text-xs"
                >
                  {couponsList.map(c => (
                    <option key={c.codigo} value={c.codigo}>
                      {c.codigo} — {c.descripcion} ({c.tipo === 'porcentaje' ? `${c.valor}% OFF` : `-$${c.valor} USD`})
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. SELECCIÓN DE PLAN DE FINANCIAMIENTO (PLAZOS) */}
              {tipoPago === 'Financiamiento' && (
                <div className="space-y-3 border-t border-slate-100 pt-3">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-purple-700">
                    Plan de Financiamiento Elegido (Plazo y Cuotas) *
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                    {getActivePlanOptions().filter(o => o.id !== 'plan_contado').map((opt) => {
                      const isSelected = selectedPlanOptionId === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => handleSelectPlanOption(opt.id)}
                          className={`p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'border-purple-600 bg-purple-50/80 shadow-2xs font-bold text-purple-950 ring-1 ring-purple-500'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold">{opt.nombre}</span>
                            {isSelected && <Check className="w-4 h-4 text-purple-700 shrink-0" />}
                          </div>
                          <p className="text-[10px] text-slate-500 font-normal mt-0.5">{opt.descripcion}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Abono / Inicial ($ USD)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={montoInicial}
                        onChange={(e) => setMontoInicial(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Fecha Estimada de Cirugía
                      </label>
                      <input
                        type="date"
                        value={fechaEstimadaCirugia}
                        onChange={(e) => setFechaEstimadaCirugia(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* RESUMEN FINAL Y BOTONES */}
              <div className="bg-slate-900 text-white p-3.5 rounded-xl space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Subtotal Combo:</span>
                  <strong>${subtotalCost.toLocaleString()} USD</strong>
                </div>
                {descuentoMonto > 0 && (
                  <div className="flex justify-between text-xs text-emerald-400">
                    <span>Descuento Cupón ({selectedCouponCode}):</span>
                    <strong>-${descuentoMonto.toLocaleString()} USD</strong>
                  </div>
                )}
                <div className="flex justify-between text-xs font-bold text-teal-300 border-t border-slate-800 pt-1">
                  <span>Total Neto Cirugía:</span>
                  <span>${costoTotalCirugia.toLocaleString()} USD</span>
                </div>
                {tipoPago === 'Financiamiento' && (
                  <>
                    <div className="flex justify-between text-xs text-purple-300">
                      <span>Abono Inicial:</span>
                      <span>-${Number(montoInicial).toLocaleString()} USD</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-amber-300">
                      <span>Saldo Pendiente a Financiar:</span>
                      <span>${saldoPendiente.toLocaleString()} USD</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-300 bg-slate-800/80 p-2 rounded-lg mt-1 border border-slate-700/50">
                      <span>Plan: <strong>{getActivePlanOptions().find(o => o.id === selectedPlanOptionId)?.nombre || 'Personalizado'}</strong></span>
                      <span className="font-bold text-purple-200">{cuotasActuales} cuotas de ~${montoCuotaEst.toLocaleString()} USD/mes</span>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handlePrintPDF}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg border border-slate-700 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-teal-400" />
                  <span>📄 Imprimir Ficha PDF</span>
                </button>

                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-200 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-all cursor-pointer"
                  >
                    Guardar Paciente & Plan
                  </button>
                </div>
              </div>

            </div>
          )}

        </form>

      </div>
    </div>
  );
};
