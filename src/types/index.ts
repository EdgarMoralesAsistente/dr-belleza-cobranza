export type RolUsuario = 'Administrador' | 'Asistente' | 'Financiero' | 'Médico' | string;

export interface UserPermissions {
  canAddPatient: boolean;
  canEditPatient: boolean;
  canDeleteAnything: boolean;
  canCreateFinancingPlan: boolean;
  canRegisterPayment: boolean;
  canProcessRefund: boolean;
  canManageCrm: boolean;
  canAccessDashboard: boolean;
  canAccessPatients: boolean;
  canAccessCrm: boolean;
  canAccessFinancing: boolean;
  canAccessRefunds: boolean;
  canAccessPayments: boolean;
  canAccessUsers: boolean;
  canAccessSettings: boolean;
  canAccessGas: boolean;
}

export function getRolePermissions(role?: string): UserPermissions {
  const normalized = (role || 'Asistente').trim();

  // Administrador: Acceso a todo sin restricciones de ningún tipo
  if (normalized === 'Administrador' || normalized.toLowerCase() === 'administrador') {
    return {
      canAddPatient: true,
      canEditPatient: true,
      canDeleteAnything: true,
      canCreateFinancingPlan: true,
      canRegisterPayment: true,
      canProcessRefund: true,
      canManageCrm: true,
      canAccessDashboard: true,
      canAccessPatients: true,
      canAccessCrm: true,
      canAccessFinancing: true,
      canAccessRefunds: true,
      canAccessPayments: true,
      canAccessUsers: true,
      canAccessSettings: true,
      canAccessGas: true
    };
  }

  if (normalized === 'Financiero') {
    return {
      canAddPatient: true,
      canEditPatient: true,
      canDeleteAnything: false,
      canCreateFinancingPlan: false,
      canRegisterPayment: true,
      canProcessRefund: true,
      canManageCrm: true,
      canAccessDashboard: true,
      canAccessPatients: true,
      canAccessCrm: true,
      canAccessFinancing: true,
      canAccessRefunds: true,
      canAccessPayments: true,
      canAccessUsers: true,
      canAccessSettings: true,
      canAccessGas: true
    };
  }

  if (normalized === 'Médico' || normalized === 'Medico') {
    return {
      canAddPatient: false,
      canEditPatient: false,
      canDeleteAnything: false,
      canCreateFinancingPlan: true,
      canRegisterPayment: false,
      canProcessRefund: false,
      canManageCrm: true,
      canAccessDashboard: true,
      canAccessPatients: true,
      canAccessCrm: true,
      canAccessFinancing: true,
      canAccessRefunds: false,
      canAccessPayments: false,
      canAccessUsers: false,
      canAccessSettings: false,
      canAccessGas: false
    };
  }

  // Asistente (Default): Sólo lectura en Dashboard y Pacientes/Ficha 360°, pero gestión completa de Agenda & Alarmas CRM
  return {
    canAddPatient: false,
    canEditPatient: false,
    canDeleteAnything: false,
    canCreateFinancingPlan: false,
    canRegisterPayment: false,
    canProcessRefund: false,
    canManageCrm: true,
    canAccessDashboard: true,
    canAccessPatients: true,
    canAccessCrm: true,
    canAccessFinancing: false,
    canAccessRefunds: false,
    canAccessPayments: false,
    canAccessUsers: false,
    canAccessSettings: false,
    canAccessGas: false
  };
}

export interface Paciente {
  id: string; // Ej: P-2026-0130
  cedula: string;
  nombre: string;
  genero: 'Femenino' | 'Masculino' | 'Otro';
  correo: string;
  telefono: string;
  contactada: string; // Estatus o fecha de contacto
  fecha: string; // YYYY-MM-DD
  promocion: string; // Campaña de origen
  procedimiento: string; // Cirugía o tratamiento proyectado
  direccion: string;
}

export interface Pago {
  fecha: string; // YYYY-MM-DD
  cod: string; // Código de Pago / Recibo, ej: REC-2026-001
  id: string; // ID del Paciente o Cédula vinculada
  nombre: string; // Nombre del Paciente
  descripcion: string; // Ej: Abono a Cirugía, Consulta, Evaluación
  metodoDePago: 'Zelle' | 'Mercantil' | 'Efectivo USD' | 'Transferencia BS' | 'Pago Móvil' | 'Binance' | 'Otro';
  referencia: string; // Número de referencia bancaria
  cargo: number; // Costo total si aplica
  abono: number; // Monto cancelado
  diasVcto: number; // Días de vencimiento
  estatus: 'Activo' | 'Inactivo' | 'Moroso' | 'Pagado';
  mesProximaAccion: string;
  fechaProximaAccion: string;
  proximaAccion: string;
}

export interface Usuario {
  usuarioId: string; // Ej: USR-001
  nombre: string;
  email: string;
  passwordHash: string;
  rol: RolUsuario;
  estatus: 'Activo' | 'Inactivo';
  fechaCreacion: string;
  fotoUrl?: string;
}

export interface ActividadCRM {
  actividadId: string; // Ej: ACT-001
  pacienteId: string;
  tipoActividad: 'Llamada' | 'Cita' | 'Recordatorio de Pago' | 'Seguimiento Postquirúrgico' | 'Evaluación';
  descripcion: string;
  fechaProgramada: string; // YYYY-MM-DD
  hora: string; // HH:MM
  estado: 'Pendiente' | 'Realizada' | 'Cancelada';
  alarma: boolean; // Sí/No
  responsableId: string;
}

export interface ProcedureItem {
  id: string;
  nombre: string;
  precio: number;
}

export interface FinanciamientoCirugia {
  planId: string; // Ej: FIN-2026-001
  pacienteId: string;
  procedimiento: string;
  comboProcedimientos?: ProcedureItem[];
  tipoPago?: 'Contado' | 'Financiamiento';
  planOpcionId?: string;
  costoSubtotal?: number;
  cuponCodigo?: string;
  descuentoMonto?: number;
  costoTotalCirugia: number;
  cuotasTotales: number;
  montoAbonado: number;
  saldoPendiente: number;
  montoCuotaMensual?: number;
  estadoFinanciero: 'Al día' | 'En Mora' | 'Pagado Totalmente' | 'En Reintegro' | 'Reintegro Completado';
  fechaInicio: string;
  fechaEstimadaCirugia: string;
}

export type EstadoReintegro = 'Pendiente' | 'En Proceso' | 'Parcialmente Pagado' | 'Completado';

export interface Reintegro {
  reintegroId: string; // Ej: REINT-2026-001
  planId: string; // ID del Plan de Financiamiento
  pacienteId: string; // ID del Paciente
  fechaSolicitud: string; // YYYY-MM-DD
  fechaAprobacion?: string; // YYYY-MM-DD
  totalAbonado: number; // Suma de abonos hasta la solicitud
  gastosAdmin20: number; // 20% retención
  montoNetoReintegro: number; // 80% monto neto
  plazoMeses: number; // 1 cuota / 15 días hábiles si <=10 días, o ceil(días/30) hasta 12m
  esExcepcion10Dias: boolean; // true si solicitud <=10 días del primer abono
  montoCuotaMensual: number; // Monto por cuota programada
  montoEfectivamentePagado: number; // Acumulado devuelto
  saldoPendiente: number; // MontoNetoReintegro - MontoEfectivamentePagado
  estadoReintegro: EstadoReintegro;
  fechaEstimadaCulminacion: string; // YYYY-MM-DD
  observaciones?: string;
  motivo?: string;
}

export interface ReciboDigital {
  folio: string;
  fechaEmision: string;
  pacienteNombre: string;
  pacienteCedula: string;
  pacienteTelefono: string;
  pacienteCorreo: string;
  concepto: string;
  metodoPago: string;
  referencia: string;
  montoAbonado: number;
  costoTotalCirugia?: number;
  saldoRestante?: number;
  procedimiento?: string;
  atendidoPor: string;
}

export interface SyncStatus {
  lastSynced: string | null;
  isSyncing: boolean;
  error: string | null;
  gasUrl: string;
  mode: 'local' | 'gas';
}
