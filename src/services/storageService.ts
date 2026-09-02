import {
  Paciente,
  Pago,
  Usuario,
  RolUsuario,
  ActividadCRM,
  FinanciamientoCirugia,
  Reintegro,
  SyncStatus
} from '../types';
import {
  INITIAL_PACIENTES,
  INITIAL_PAGOS,
  INITIAL_USUARIOS,
  INITIAL_ACTIVIDADES,
  INITIAL_FINANCIAMIENTOS,
  INITIAL_REINTEGROS
} from './mockData';
import { GasService } from './gasService';
import { calculatePaymentSchedule, ProcedureCatalogItem, INITIAL_PROCEDURES_CATALOG } from './financingConfig';

const KEYS = {
  PACIENTES: 'drb_pacientes_v1',
  PAGOS: 'drb_pagos_v1',
  USUARIOS: 'drb_usuarios_v1',
  ACTIVIDADES: 'drb_actividades_v1',
  FINANCIAMIENTOS: 'drb_financiamientos_v1',
  REINTEGROS: 'drb_reintegros_v1',
  GAS_URL: 'drb_gas_url_v1',
  CURRENT_USER: 'drb_current_user_v1',
  LAST_SYNC: 'drb_last_sync_v1',
  CATALOG: 'drb_catalog_v1',
  COUPONS: 'drb_coupons_v1',
  PLAN_OPTIONS: 'drb_plan_options_v1',
  CLINIC_CONFIG: 'drb_clinic_config_v1',
  USER_ROLES: 'drb_user_roles_v1'
};

const DEFAULT_USER_ROLES = ['Administrador', 'Asistente', 'Financiero', 'Médico'];

export function normalizeUserRole(rawRole: any): RolUsuario {
  const str = String(rawRole || '').trim();
  const lower = str.toLowerCase();
  if (str === 'Administrador' || lower === 'administrador' || lower === 'admin') return 'Administrador';
  if (str === 'Financiero' || lower === 'financiero' || lower === 'fianciero' || lower === 'finanzas') return 'Financiero';
  if (str === 'Médico' || str === 'Medico' || lower === 'medico') return 'Médico';
  if (str === 'Asistente' || lower === 'asistente') return 'Asistente';
  return str || 'Asistente';
}

export function cleanField(val: any, fallback = ''): string {
  if (val === undefined || val === null) return fallback;
  let str = String(val).trim();
  if (str.startsWith("'")) {
    str = str.substring(1).trim();
  }
  if (
    str.includes('#ERROR') ||
    str.includes('#¡ERROR') ||
    str.includes('#REF!') ||
    str.includes('#VALUE!') ||
    str.includes('#NAME?') ||
    str.includes('#N/A') ||
    str === 'NaN' ||
    str === 'undefined' ||
    str === 'null'
  ) {
    return fallback;
  }
  return str || fallback;
}

export function cleanPhoneField(rawPhone: any, id?: string, cedula?: string): string {
  let cleaned = cleanField(rawPhone, '');
  if (cleaned.startsWith("'")) {
    cleaned = cleaned.substring(1).trim();
  }
  
  const isInvalid = (
    !cleaned ||
    cleaned === 'No especificado' ||
    cleaned.includes('#ERROR') ||
    cleaned.includes('#¡ERROR') ||
    cleaned.includes('#REF!') ||
    cleaned.includes('#VALUE!') ||
    cleaned.startsWith('#') ||
    cleaned.length < 4
  );

  if (isInvalid) {
    const cached = StorageService.getCachedPhone(id) || StorageService.getCachedPhone(cedula);
    if (cached) return cached;
    return 'No especificado';
  }

  // Cache valid phone number immediately
  if (id || cedula) {
    StorageService.cachePatientPhone(id || '', cedula || '', cleaned);
  }
  return cleaned;
}

export function normalizePaciente(p: any): Paciente {
  if (!p || typeof p !== 'object') {
    return {
      id: `PAC-${Date.now()}`,
      cedula: 'V-00000000',
      nombre: 'Paciente sin nombre',
      genero: 'Femenino',
      correo: 'paciente@gmail.com',
      telefono: 'No especificado',
      contactada: 'Por Contactar',
      fecha: new Date().toISOString().split('T')[0],
      promocion: 'Directo',
      procedimiento: 'Consulta General',
      direccion: 'Sin dirección'
    };
  }

  const pId = cleanField(p.id || p.ID || p.Id, `PAC-${Date.now()}`);
  const pCedula = cleanField(p.cedula || p.CEDULA || p.Cedula, 'V-00000000');
  const rawTel = p.telefono || p.TELEFONO || p.Telefono;
  const pTelefono = cleanPhoneField(rawTel, pId, pCedula);

  return {
    id: pId,
    cedula: pCedula,
    nombre: cleanField(p.nombre || p.NOMBRE || p.Nombre, 'Paciente sin nombre'),
    genero: (cleanField(p.genero || p.GENERO || p.Genero, 'Femenino')) as any,
    correo: cleanField(p.correo || p.CORREO || p.Correo, 'paciente@gmail.com'),
    telefono: pTelefono,
    contactada: cleanField(p.contactada || p.CONTACTADA || p.Contactada, 'Por Contactar'),
    fecha: cleanField(p.fecha || p.FECHA || p.Fecha, new Date().toISOString().split('T')[0]),
    promocion: cleanField(p.promocion || p.PROMOCION || p.Promocion, 'Directo'),
    procedimiento: cleanField(p.procedimiento || p.PROCEDIMIENTO || p.Procedimiento, 'Consulta General'),
    direccion: cleanField(p.direccion || p.DIRECCION || p.Direccion, 'Sin dirección')
  };
}

export function normalizeUsuario(u: any): Usuario {
  if (!u || typeof u !== 'object') {
    return INITIAL_USUARIOS[0];
  }
  return {
    usuarioId: String(u.usuarioId || u.Usuario_ID || u.usuario_id || u.USUARIO_ID || u.id || `USR-${Date.now()}`),
    nombre: String(u.nombre || u.Nombre || u.NOMBRE || 'Usuario'),
    email: String(u.email || u.Email || u.EMAIL || 'usuario@drbelleza.com'),
    passwordHash: String(u.passwordHash || u.Password_Hash || u.password_hash || u.password || '123456'),
    rol: normalizeUserRole(u.rol || u.Rol || u.ROL),
    estatus: (u.estatus || u.Estatus || u.ESTATUS || 'Activo') as any,
    fechaCreacion: String(u.fechaCreacion || u.Fecha_Creacion || u.fecha_creacion || new Date().toISOString().split('T')[0]),
    fotoUrl: u.fotoUrl || u.Foto_Url || u.foto_url || undefined
  };
}

export function normalizePago(p: any): Pago {
  if (!p || typeof p !== 'object') {
    return {
      fecha: new Date().toISOString().split('T')[0],
      cod: `REC-${Date.now()}`,
      id: 'PAC-000',
      nombre: 'Paciente',
      descripcion: 'Abono',
      metodoDePago: 'Efectivo USD',
      referencia: 'N/A',
      cargo: 0,
      abono: 0,
      diasVcto: 0,
      estatus: 'Pagado' as any,
      mesProximaAccion: '',
      fechaProximaAccion: '',
      proximaAccion: ''
    };
  }
  return {
    fecha: String(p.fecha || p.FECHA || p.Fecha || new Date().toISOString().split('T')[0]),
    cod: String(p.cod || p.COD || p.Cod || `REC-${Date.now()}`),
    id: String(p.id || p.ID || p.Id || 'PAC-000'),
    nombre: String(p.nombre || p.NOMBRE || p.Nombre || 'Paciente'),
    descripcion: String(p.descripcion || p.DESCRIPCION || p.Descripcion || 'Abono'),
    metodoDePago: (p.metodoDePago || p.METODO_DE_PAGO || p.Metodo_De_Pago || p.metodo_de_pago || 'Efectivo USD') as any,
    referencia: String(p.referencia || p.REFERENCIA || p.Referencia || 'N/A'),
    cargo: Number(p.cargo || p.CARGO || p.Cargo || 0),
    abono: Number(p.abono || p.ABONO || p.Abono || 0),
    diasVcto: Number(p.diasVcto || p.DIAS_VCTO || p.dias_vcto || 0),
    estatus: (p.estatus || p.Estatus || p.ESTATUS || 'Pagado') as any,
    mesProximaAccion: String(p.mesProximaAccion || p.Mes_Proxima_Accion || p.mes_proxima_accion || ''),
    fechaProximaAccion: String(p.fechaProximaAccion || p.Fecha_Proxima_Accion || p.fecha_proxima_accion || ''),
    proximaAccion: String(p.proximaAccion || p.Proxima_Accion || p.proxima_accion || '')
  };
}

export function normalizeActividad(a: any): ActividadCRM {
  if (!a || typeof a !== 'object') {
    return {
      actividadId: `ACT-${Date.now()}`,
      pacienteId: 'PAC-000',
      tipoActividad: 'Seguimiento Postquirúrgico' as any,
      descripcion: '',
      fechaProgramada: new Date().toISOString().split('T')[0],
      hora: '10:00 AM',
      estado: 'Pendiente',
      alarma: false,
      responsableId: 'USR-001'
    };
  }
  return {
    actividadId: String(a.actividadId || a.Actividad_ID || a.actividad_id || `ACT-${Date.now()}`),
    pacienteId: String(a.pacienteId || a.Paciente_ID || a.paciente_id || 'PAC-000'),
    tipoActividad: (a.tipoActividad || a.Tipo_Actividad || a.tipo_actividad || 'Seguimiento Postquirúrgico') as any,
    descripcion: String(a.descripcion || a.Descripcion || a.DESCRIPCION || ''),
    fechaProgramada: String(a.fechaProgramada || a.Fecha_Programada || a.fecha_programada || new Date().toISOString().split('T')[0]),
    hora: String(a.hora || a.Hora || a.HORA || '10:00 AM'),
    estado: (a.estado || a.Estado || a.ESTADO || 'Pendiente') as any,
    alarma: Boolean(a.alarma === true || a.alarma === 'Sí' || a.Alarma === 'Sí' || a.alarma === 'true' || a.Alarma === true),
    responsableId: String(a.responsableId || a.Responsable_ID || a.responsable_id || 'USR-001')
  };
}

export function normalizeFinanciamiento(f: any): FinanciamientoCirugia {
  if (!f || typeof f !== 'object') {
    return {
      planId: `FIN-${Date.now()}`,
      pacienteId: 'PAC-000',
      procedimiento: 'Cirugía',
      tipoPago: 'Financiamiento',
      planOpcionId: 'plan_12m',
      costoSubtotal: 0,
      cuponCodigo: 'NINGUNO',
      descuentoMonto: 0,
      costoTotalCirugia: 0,
      cuotasTotales: 1,
      montoAbonado: 0,
      saldoPendiente: 0,
      montoCuotaMensual: 0,
      estadoFinanciero: 'Al día',
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaEstimadaCirugia: new Date().toISOString().split('T')[0]
    };
  }
  return {
    planId: String(f.planId || f.Plan_ID || f.plan_id || `FIN-${Date.now()}`),
    pacienteId: String(f.pacienteId || f.Paciente_ID || f.paciente_id || 'PAC-000'),
    procedimiento: String(f.procedimiento || f.Procedimiento || f.PROCEDIMIENTO || 'Cirugía'),
    comboProcedimientos: Array.isArray(f.comboProcedimientos) ? f.comboProcedimientos : [],
    tipoPago: f.tipoPago || 'Financiamiento',
    planOpcionId: f.planOpcionId || 'plan_12m',
    costoSubtotal: Number(f.costoSubtotal || f.costoTotalCirugia || f.Costo_Total_Cirugia || 0),
    cuponCodigo: f.cuponCodigo || 'NINGUNO',
    descuentoMonto: Number(f.descuentoMonto || 0),
    costoTotalCirugia: Number(f.costoTotalCirugia || f.Costo_Total_Cirugia || f.costo_total_cirugia || 0),
    cuotasTotales: Number(f.cuotasTotales || f.Cuotas_Totales || f.cuotas_totales || 1),
    montoAbonado: Number(f.montoAbonado || f.Monto_Abonado || f.monto_abonado || 0),
    saldoPendiente: Number(f.saldoPendiente || f.Saldo_Pendiente || f.saldo_pendiente || 0),
    montoCuotaMensual: Number(f.montoCuotaMensual || 0),
    estadoFinanciero: (f.estadoFinanciero || f.Estado_Financiero || f.estado_financiero || 'Al día') as any,
    fechaInicio: String(f.fechaInicio || f.Fecha_Inicio || f.fecha_inicio || new Date().toISOString().split('T')[0]),
    fechaEstimadaCirugia: String(f.fechaEstimadaCirugia || f.Fecha_Estimada_Cirugia || f.fecha_estimada_cirugia || new Date().toISOString().split('T')[0])
  };
}

export function normalizeReintegro(r: any): Reintegro {
  if (!r || typeof r !== 'object') {
    return {
      reintegroId: `REINT-${Date.now()}`,
      planId: 'FIN-000',
      pacienteId: 'PAC-000',
      fechaSolicitud: new Date().toISOString().split('T')[0],
      totalAbonado: 0,
      gastosAdmin20: 0,
      montoNetoReintegro: 0,
      plazoMeses: 1,
      esExcepcion10Dias: false,
      montoCuotaMensual: 0,
      montoEfectivamentePagado: 0,
      saldoPendiente: 0,
      estadoReintegro: 'Pendiente',
      fechaEstimadaCulminacion: new Date().toISOString().split('T')[0]
    };
  }
  return {
    reintegroId: String(r.reintegroId || r.Reintegro_ID || r.reintegro_id || `REINT-${Date.now()}`),
    planId: String(r.planId || r.Plan_ID || r.plan_id || 'FIN-000'),
    pacienteId: String(r.pacienteId || r.Paciente_ID || r.paciente_id || 'PAC-000'),
    fechaSolicitud: String(r.fechaSolicitud || r.Fecha_Solicitud || r.fecha_solicitud || new Date().toISOString().split('T')[0]),
    fechaAprobacion: r.fechaAprobacion || r.Fecha_Aprobacion || r.fecha_aprobacion || undefined,
    totalAbonado: Number(r.totalAbonado || r.Total_Abonado || r.total_abonado || 0),
    gastosAdmin20: Number(r.gastosAdmin20 || r.Gastos_Admin_20 || r.gastos_admin_20 || 0),
    montoNetoReintegro: Number(r.montoNetoReintegro || r.Monto_Neto_Reintegro || r.monto_neto_reintegro || 0),
    plazoMeses: Number(r.plazoMeses || r.Plazo_Meses || r.plazo_meses || 1),
    esExcepcion10Dias: Boolean(r.esExcepcion10Dias === true || r.esExcepcion10Dias === 'Sí' || r.Es_Excepcion_10Dias === 'Sí' || r.esExcepcion10Dias === 'true'),
    montoCuotaMensual: Number(r.montoCuotaMensual || r.Monto_Cuota_Mensual || r.monto_cuota_mensual || 0),
    montoEfectivamentePagado: Number(r.montoEfectivamentePagado || r.Monto_Efectivamente_Pagado || r.monto_efectivamente_pagado || 0),
    saldoPendiente: Number(r.saldoPendiente || r.Saldo_Pendiente || r.saldo_pendiente || 0),
    estadoReintegro: (r.estadoReintegro || r.Estado_Reintegro || r.estado_reintegro || 'Pendiente') as any,
    fechaEstimadaCulminacion: String(r.fechaEstimadaCulminacion || r.Fecha_Estimada_Culminacion || r.fecha_estimada_culminacion || new Date().toISOString().split('T')[0]),
    observaciones: r.observaciones || r.Observaciones || undefined,
    motivo: r.motivo || r.Motivo || undefined
  };
}

export function calculateReintegroMetrics(
  plan: FinanciamientoCirugia,
  pagosPaciente: Pago[],
  fechaSolicitud: string = new Date().toISOString().split('T')[0]
) {
  // 1. Total Abonado ($A$) - Filtrar abonos positivos para este paciente/plan
  const filteredPagos = (pagosPaciente || []).filter(p => {
    if (!p) return false;
    const matchId = p.id === plan.pacienteId || p.id === plan.planId;
    return matchId && (p.abono || 0) > 0;
  });

  let totalAbonado = filteredPagos.reduce((acc, p) => acc + (p.abono || 0), 0);
  if (totalAbonado <= 0 && plan.montoAbonado > 0) {
    totalAbonado = plan.montoAbonado;
  }

  // 2. Gastos Administrativos (20%): G = A * 0.20
  const gastosAdmin20 = Math.round(totalAbonado * 0.20 * 100) / 100;

  // 3. Monto Neto Aprobado para Reintegro (R): R = A - G = A * 0.80
  const montoNetoReintegro = Math.round((totalAbonado - gastosAdmin20) * 100) / 100;

  // 4. Fecha Primer Abono
  let fechaPrimerAbono = plan.fechaInicio || fechaSolicitud;
  if (filteredPagos.length > 0) {
    const dates = filteredPagos.map(p => p.fecha).filter(Boolean).sort();
    if (dates.length > 0) {
      fechaPrimerAbono = dates[0];
    }
  }

  // Calcular días continuos transcurridos desde el primer abono
  const dSolicitud = new Date(fechaSolicitud);
  const dPrimerAbono = new Date(fechaPrimerAbono);
  const diffTime = dSolicitud.getTime() - dPrimerAbono.getTime();
  const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

  let esExcepcion10Dias = false;
  let plazoMeses = 1;
  let montoCuotaMensual = montoNetoReintegro;
  let fechaEstimadaCulminacion = '';

  if (diffDays <= 10) {
    // Regla de los 10 Días: Devolución única dentro de máximo 15 días hábiles (~21 días continuos)
    esExcepcion10Dias = true;
    plazoMeses = 1;
    montoCuotaMensual = montoNetoReintegro;

    const dTarget = new Date(dSolicitud);
    dTarget.setDate(dTarget.getDate() + 21);
    fechaEstimadaCulminacion = dTarget.toISOString().split('T')[0];
  } else {
    // Regla General Proporcional: Meses abonando = ceil(días / 30). Tope máximo 12 meses.
    esExcepcion10Dias = false;
    const mesesAbonando = Math.max(1, Math.ceil(diffDays / 30));
    plazoMeses = Math.min(12, mesesAbonando);
    montoCuotaMensual = plazoMeses > 0 ? Math.round((montoNetoReintegro / plazoMeses) * 100) / 100 : montoNetoReintegro;

    const dTarget = new Date(dSolicitud);
    dTarget.setMonth(dTarget.getMonth() + plazoMeses);
    fechaEstimadaCulminacion = dTarget.toISOString().split('T')[0];
  }

  return {
    totalAbonado,
    gastosAdmin20,
    montoNetoReintegro,
    fechaPrimerAbono,
    diffDays,
    esExcepcion10Dias,
    plazoMeses,
    montoCuotaMensual,
    fechaEstimadaCulminacion
  };
}

export class StorageService {
  // Lista explícita de IDs de usuarios conflictivos a purgar de Google Sheets y del sistema para siempre
  static readonly PROBLEMATIC_USER_IDS: string[] = [
    'USR-973',
    'USR-706',
    'USR-617',
    'USR-305',
    'USR-421',
    'USR-923'
  ];

  // --- INICIALIZACIÓN ---
  static getPacientes(): Paciente[] {
    const data = localStorage.getItem(KEYS.PACIENTES);
    let list: Paciente[] = [];
    if (data !== null) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) list = parsed;
      } catch (e) {
        list = [];
      }
    } else {
      list = [];
    }

    const normalized = list.map(normalizePaciente);
    const unique: Paciente[] = [];
    const seenIds = new Set<string>();
    const seenCedulas = new Set<string>();

    for (const p of normalized) {
      if (!p || !p.id) continue;
      const idKey = String(p.id).trim().toUpperCase();
      const cedKey = String(p.cedula || '').trim().toUpperCase();

      if (idKey && seenIds.has(idKey)) continue;
      if (cedKey && cedKey !== 'V-00000000' && seenCedulas.has(cedKey)) continue;

      if (idKey) seenIds.add(idKey);
      if (cedKey && cedKey !== 'V-00000000') seenCedulas.add(cedKey);
      unique.push(p);
    }

    return unique;
  }

  static savePacientes(list: Paciente[]): void {
    const normalized = (list || []).map(normalizePaciente);
    const unique: Paciente[] = [];
    const seenIds = new Set<string>();
    const seenCedulas = new Set<string>();

    for (const p of normalized) {
      if (!p || !p.id) continue;
      const idKey = String(p.id).trim().toUpperCase();
      const cedKey = String(p.cedula || '').trim().toUpperCase();

      if (idKey && seenIds.has(idKey)) continue;
      if (cedKey && cedKey !== 'V-00000000' && seenCedulas.has(cedKey)) continue;

      if (idKey) seenIds.add(idKey);
      if (cedKey && cedKey !== 'V-00000000') seenCedulas.add(cedKey);
      unique.push(p);
    }

    localStorage.setItem(KEYS.PACIENTES, JSON.stringify(unique));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('drb-data-changed'));
  }

  static getPagos(): Pago[] {
    const data = localStorage.getItem(KEYS.PAGOS);
    let list: Pago[] = [];
    if (data !== null) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) list = parsed;
      } catch (e) {
        list = [];
      }
    } else {
      list = [];
    }
    return list.map(normalizePago);
  }

  static savePagos(list: Pago[]): void {
    const normalized = (list || []).map(normalizePago);
    const unique: Pago[] = [];
    const seenCods = new Set<string>();

    for (const p of normalized) {
      if (!p || !p.cod) continue;
      const codKey = String(p.cod).trim().toUpperCase();
      if (seenCods.has(codKey)) continue;
      seenCods.add(codKey);
      unique.push(p);
    }

    localStorage.setItem(KEYS.PAGOS, JSON.stringify(unique));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('drb-data-changed'));
  }

  static getUsuarios(): Usuario[] {
    const data = localStorage.getItem(KEYS.USUARIOS);
    const deletedUserIds = this.getDeletedUserIds();
    let list: Usuario[] = [];
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
      } catch (e) {
        list = [...INITIAL_USUARIOS];
      }
    }
    if (list.length === 0) {
      list = [...INITIAL_USUARIOS];
    }
    list = list.map(normalizeUsuario);
    
    // Purgar usuarios antiguos de demostración y legacy permanentemente
    const oldDemoEmails = [
      'dra.isabella@drbelleza.com',
      'maria.crm@drbelleza.com',
      'dr.mendoza@drbelleza.com',
      'carlos.finanzas@drbelleza.com',
      'mendoza@drbelleza.com',
      'valeria@drbelleza.com'
    ];

    // --- PURGA ÚNICA SOLICITADA POR EL USUARIO ---
    // Conservar ÚNICAMENTE a Edgar Morales y Maria Claudia Colmenares, y registrar los demás desde cero
    const PURGE_KEY = 'drb_purge_all_users_except_edgar_maria_v2';
    if (!localStorage.getItem(PURGE_KEY)) {
      localStorage.setItem(PURGE_KEY, 'true');
      
      // Marcar correos de prueba y cualquier otro usuario viejo en la lista de eliminados permanentes
      oldDemoEmails.forEach(em => this.addDeletedUserId(undefined, em));
      list.forEach(u => {
        const em = (u.email || '').toLowerCase().trim();
        if (em !== 'edgarmorales.asistente@gmail.com' && em !== 'maria.colmenares@revierte.com') {
          this.addDeletedUserId(u.usuarioId, u.email);
        }
      });

      // Limpiar pendientes locales antiguos
      localStorage.removeItem('drb_pending_new_usuarios_v1');

      // Restablecer la lista a los dos administradores autorizados
      list = [...INITIAL_USUARIOS];
      localStorage.setItem(KEYS.USUARIOS, JSON.stringify(list));

      // Sobrescribir inmediatamente Google Sheets con la lista canónica limpia (Edgar Morales y Maria Claudia Colmenares)
      const gasUrl = this.getGasUrl();
      if (gasUrl) {
        GasService.sendPost(gasUrl, { action: 'syncUsuarios', usuarios: list }).catch(() => {});
        oldDemoEmails.forEach(em => {
          GasService.sendPost(gasUrl, { action: 'deleteUsuario', email: em }).catch(() => {});
        });
      }
    }
    
    // --- PURGA DE USUARIOS PROBLEMÁTICOS SOLICITADA POR EL USUARIO ---
    // USR-973, USR-706, USR-617, USR-305, USR-421, USR-923
    const PURGE_PROBLEMATIC_KEY = 'drb_purge_problematic_v7';
    if (!localStorage.getItem(PURGE_PROBLEMATIC_KEY)) {
      localStorage.setItem(PURGE_PROBLEMATIC_KEY, 'true');
      this.purgeProblematicUsersFromSheetsAndLocal().catch(() => {});
    }

    // Deduplicar estrictamente por correo electrónico (normalizado a minúsculas)
    const uniqueMap = new Map<string, Usuario>();
    const problematicUpper = this.PROBLEMATIC_USER_IDS.map(p => p.toUpperCase());
    for (const u of list) {
      if (!u || !u.email) continue;
      const emailKey = u.email.toLowerCase().trim();
      const uIdUpper = String(u.usuarioId || '').trim().toUpperCase();
      const emailUpper = String(u.email || '').trim().toUpperCase();
      if (oldDemoEmails.includes(emailKey)) continue;
      if (problematicUpper.includes(uIdUpper)) continue;
      if (deletedUserIds.has(uIdUpper) || deletedUserIds.has(emailUpper)) continue;

      if (!uniqueMap.has(emailKey)) {
        uniqueMap.set(emailKey, u);
      } else {
        // Combinar información existente si el nuevo tiene contraseña o rol más explícito
        const existing = uniqueMap.get(emailKey)!;
        uniqueMap.set(emailKey, {
          ...existing,
          ...u,
          passwordHash: (u.passwordHash && u.passwordHash !== '123456') ? u.passwordHash : existing.passwordHash,
          rol: u.rol || existing.rol,
          estatus: (existing.estatus === 'Activo' || u.estatus === 'Activo') ? 'Activo' : u.estatus
        });
      }
    }

    list = Array.from(uniqueMap.values());

    // 1. Asegurar Edgar Morales (Administrador Principal)
    let edgarIndex = list.findIndex(u => u && u.email && u.email.toLowerCase().trim() === 'edgarmorales.asistente@gmail.com');
    if (edgarIndex === -1) {
      list = [INITIAL_USUARIOS[0], ...list];
    } else {
      list[edgarIndex] = {
        ...list[edgarIndex],
        nombre: list[edgarIndex].nombre || 'Edgar Morales',
        rol: 'Administrador',
        estatus: 'Activo'
      };
    }

    // 2. Asegurar Maria Claudia Colmenares (Administrador)
    let mariaIndex = list.findIndex(u => u && u.email && u.email.toLowerCase().trim() === 'maria.colmenares@revierte.com');
    if (mariaIndex === -1) {
      list = [...list, INITIAL_USUARIOS[1]];
    } else {
      list[mariaIndex] = {
        ...list[mariaIndex],
        nombre: list[mariaIndex].nombre || 'Maria Claudia Colmenares',
        rol: 'Administrador',
        estatus: 'Activo'
      };
    }

    localStorage.setItem(KEYS.USUARIOS, JSON.stringify(list));
    return list;
  }

  static saveUsuarios(list: Usuario[]): void {
    const normalized = (list || []).map(normalizeUsuario);
    localStorage.setItem(KEYS.USUARIOS, JSON.stringify(normalized));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('drb-data-changed'));
  }

  static getUserRoles(): string[] {
    const data = localStorage.getItem(KEYS.USER_ROLES);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = Array.from(new Set(parsed.map(r => normalizeUserRole(r))));
          return sanitized;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_USER_ROLES;
  }

  static saveUserRoles(roles: string[]): void {
    const sanitized = Array.from(new Set(roles.map(r => normalizeUserRole(r))));
    localStorage.setItem(KEYS.USER_ROLES, JSON.stringify(sanitized));
    window.dispatchEvent(new Event('storage'));
  }

  static getActividades(): ActividadCRM[] {
    return this.syncAllAutomaticActivities();
  }

  static syncAllAutomaticActivities(): ActividadCRM[] {
    const data = localStorage.getItem(KEYS.ACTIVIDADES);
    let rawList: ActividadCRM[] = [];
    if (data !== null) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) rawList = parsed.map(normalizeActividad);
      } catch (e) {
        rawList = [];
      }
    } else {
      rawList = [];
    }

    const mapExisting = new Map<string, ActividadCRM>();
    rawList.forEach(a => {
      if (a && a.actividadId) mapExisting.set(a.actividadId, a);
    });

    const pacientes = this.getPacientes();
    const financiamientos = this.getFinanciamientos();
    const reintegros = this.getReintegros();
    const pagos = this.getPagos();

    const generatedMap = new Map<string, ActividadCRM>();

    // 1. REGISTRO DE PACIENTE -> Cita / Evaluación Inicial de Alta
    pacientes.forEach(p => {
      if (!p || !p.id) return;
      const actId = `ACT-REG-${p.id}`;
      const existing = mapExisting.get(actId);
      const regAct: ActividadCRM = {
        actividadId: actId,
        pacienteId: p.id,
        tipoActividad: 'Evaluación' as any,
        descripcion: `📌 Alta & Evaluación Inicial: Paciente ${p.nombre} (C.I. ${p.cedula || 'N/A'}). Procedimiento proyectado: ${p.procedimiento || 'Consulta'}.`,
        fechaProgramada: p.fecha || new Date().toISOString().split('T')[0],
        hora: '08:30 AM',
        estado: existing ? existing.estado : 'Realizada',
        alarma: false,
        responsableId: 'USR-001'
      };
      generatedMap.set(actId, regAct);
    });

    // 2. PLANES DE FINANCIAMIENTO QUIRÚRGICO -> Cobros de Cuotas y Fecha de Cirugía
    financiamientos.forEach(f => {
      if (!f || !f.planId) return;
      const paciente = pacientes.find(p => p.id === f.pacienteId);
      const pNombre = paciente ? paciente.nombre : (f.pacienteId || 'Paciente');
      const pCedula = paciente ? paciente.cedula : 'N/A';

      // 2a. Evento de Cita / Cirugía Programada
      if (f.fechaEstimadaCirugia) {
        const surgActId = `ACT-SURG-${f.planId}`;
        const existingSurg = mapExisting.get(surgActId);
        const surgAct: ActividadCRM = {
          actividadId: surgActId,
          pacienteId: f.pacienteId,
          tipoActividad: 'Cita' as any,
          descripcion: `🏥 Intervención Quirúrgica Programada: Paciente ${pNombre}. Procedimiento: ${f.procedimiento}. Total: $${f.costoTotalCirugia.toLocaleString()} USD.`,
          fechaProgramada: f.fechaEstimadaCirugia,
          hora: '08:00 AM',
          estado: existingSurg ? existingSurg.estado : 'Pendiente',
          alarma: true,
          responsableId: 'USR-001'
        };
        generatedMap.set(surgActId, surgAct);
      }

      // 2b. Cuotas de Cobro del Plan de Financiamiento
      if (f.cuotasTotales > 0) {
        const costoBase = f.costoTotalCirugia > 0 ? f.costoTotalCirugia : (f.montoAbonado + f.saldoPendiente);
        const numInicial = f.montoAbonado > 0 ? f.montoAbonado : 0;
        const saldoFin = Math.max(0, costoBase - numInicial);

        const schedule = calculatePaymentSchedule(
          f.fechaInicio || new Date().toISOString().split('T')[0],
          f.cuotasTotales,
          saldoFin > 0 ? saldoFin : costoBase
        );

        // Pagos acumulados reales
        const pagosPaciente = pagos.filter(p => (p.id === f.pacienteId || p.id === f.planId) && (p.abono || 0) > 0);
        const totalAbonadoReal = pagosPaciente.reduce((acc, p) => acc + (p.abono || 0), f.montoAbonado || 0);

        let acumuladoTarget = 0;
        schedule.forEach((item) => {
          acumuladoTarget += item.montoCuota;
          const payActId = `ACT-PAY-${f.planId}-${item.numeroCuota}`;
          const existingPay = mapExisting.get(payActId);

          const isCoveredByPayments = totalAbonadoReal >= acumuladoTarget || f.saldoPendiente === 0 || f.estadoFinanciero === 'Pagado Totalmente';
          const defaultStatus = isCoveredByPayments ? 'Realizada' : 'Pendiente';

          const payAct: ActividadCRM = {
            actividadId: payActId,
            pacienteId: f.pacienteId,
            tipoActividad: 'Recordatorio de Pago' as any,
            descripcion: `🔔 Cobro de Cuota #${item.numeroCuota}/${f.cuotasTotales}: Paciente ${pNombre} (C.I. ${pCedula}). Monto cuota: $${item.montoCuota.toLocaleString()} USD. Procedimiento: ${f.procedimiento}.`,
            fechaProgramada: item.fechaVencimiento,
            hora: '09:00 AM',
            estado: existingPay ? existingPay.estado : defaultStatus,
            alarma: true,
            responsableId: 'USR-001'
          };
          generatedMap.set(payActId, payAct);
        });
      }
    });

    // 3. PLAN DE REINTEGROS -> Fechas Programadas de Devolución
    reintegros.forEach(r => {
      if (!r || !r.reintegroId) return;
      const paciente = pacientes.find(p => p.id === r.pacienteId);
      const pNombre = paciente ? paciente.nombre : (r.pacienteId || 'Paciente');

      const totalReintegro = r.montoNetoReintegro || 0;
      const plazo = Math.max(1, r.plazoMeses || 1);
      const cuotaMonto = r.montoCuotaMensual || (plazo > 0 ? Math.round(totalReintegro / plazo) : totalReintegro);
      const pagadoDevuelto = r.montoEfectivamentePagado || 0;

      for (let i = 1; i <= plazo; i++) {
        const reintActId = `ACT-REINT-${r.reintegroId}-${i}`;
        const existingReint = mapExisting.get(reintActId);

        let targetDate = r.fechaSolicitud || new Date().toISOString().split('T')[0];
        if (r.esExcepcion10Dias && r.fechaEstimadaCulminacion) {
          targetDate = r.fechaEstimadaCulminacion;
        } else {
          const dSol = new Date(targetDate + 'T00:00:00');
          if (!isNaN(dSol.getTime())) {
            dSol.setMonth(dSol.getMonth() + i);
            const y = dSol.getFullYear();
            const m = String(dSol.getMonth() + 1).padStart(2, '0');
            const d = String(dSol.getDate()).padStart(2, '0');
            targetDate = `${y}-${m}-${d}`;
          }
        }

        const isFullyRefunded = pagadoDevuelto >= (i * cuotaMonto) || r.estadoReintegro === 'Completado';
        const defaultStatus = isFullyRefunded ? 'Realizada' : 'Pendiente';

        const reintAct: ActividadCRM = {
          actividadId: reintActId,
          pacienteId: r.pacienteId,
          tipoActividad: 'Recordatorio de Pago' as any,
          descripcion: `🚨 Reintegro / Devolución Pendiente Cuota #${i}/${plazo}: Paciente ${pNombre}. Monto a devolver: $${cuotaMonto.toLocaleString()} USD. (Ref: ${r.reintegroId})`,
          fechaProgramada: targetDate,
          hora: '10:00 AM',
          estado: existingReint ? existingReint.estado : defaultStatus,
          alarma: true,
          responsableId: 'USR-001'
        };
        generatedMap.set(reintActId, reintAct);
      }
    });

    // 4. PRESERVAR ACTIVIDADES MANUALES INGRESADAS POR USUARIOS
    mapExisting.forEach((act, id) => {
      if (!generatedMap.has(id)) {
        generatedMap.set(id, act);
      }
    });

    const finalActivities = Array.from(generatedMap.values()).map(normalizeActividad);
    finalActivities.sort((a, b) => {
      if (a.fechaProgramada !== b.fechaProgramada) {
        return a.fechaProgramada.localeCompare(b.fechaProgramada);
      }
      return a.hora.localeCompare(b.hora);
    });

    localStorage.setItem(KEYS.ACTIVIDADES, JSON.stringify(finalActivities));
    return finalActivities;
  }

  static saveActividades(list: ActividadCRM[]): void {
    const normalized = (list || []).map(normalizeActividad);
    localStorage.setItem(KEYS.ACTIVIDADES, JSON.stringify(normalized));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('drb-data-changed'));
  }

  static getFinanciamientos(): FinanciamientoCirugia[] {
    const data = localStorage.getItem(KEYS.FINANCIAMIENTOS);
    let list: FinanciamientoCirugia[] = [];
    if (data !== null) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) list = parsed;
      } catch (e) {
        list = [];
      }
    } else {
      list = [];
    }
    return list.map(normalizeFinanciamiento);
  }

  static saveFinanciamientos(list: FinanciamientoCirugia[]): void {
    const normalized = (list || []).map(normalizeFinanciamiento);
    localStorage.setItem(KEYS.FINANCIAMIENTOS, JSON.stringify(normalized));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('drb-data-changed'));
  }

  static getReintegros(): Reintegro[] {
    const data = localStorage.getItem(KEYS.REINTEGROS);
    let list: Reintegro[] = [];
    if (data !== null) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) list = parsed;
      } catch (e) {
        list = [];
      }
    } else {
      list = [];
    }
    return list.map(normalizeReintegro);
  }

  static saveReintegros(list: Reintegro[]): void {
    const normalized = (list || []).map(normalizeReintegro);
    localStorage.setItem(KEYS.REINTEGROS, JSON.stringify(normalized));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('drb-data-changed'));
  }

  private static isSyncingGas = false;
  private static inMemoryGasUrl = '';
  private static lastSyncSuccessful = false;
  private static lastSyncTimestamp: string | null = null;
  private static lastSyncError: string | null = null;

  static isSyncActive(): boolean {
    return this.isSyncingGas;
  }

  static isConnectedAndSynced(): boolean {
    const url = this.getGasUrl();
    if (!url) return false;
    const lastSync = localStorage.getItem(KEYS.LAST_SYNC);
    return Boolean(lastSync) && this.lastSyncSuccessful;
  }

  static getSyncState(): {
    isSynced: boolean;
    isSyncing: boolean;
    hasUrl: boolean;
    lastSync: string | null;
    error: string | null;
  } {
    const url = this.getGasUrl();
    const lastSync = localStorage.getItem(KEYS.LAST_SYNC) || this.lastSyncTimestamp;
    return {
      isSynced: Boolean(url && lastSync && this.lastSyncSuccessful),
      isSyncing: this.isSyncingGas,
      hasUrl: Boolean(url),
      lastSync,
      error: this.lastSyncError
    };
  }

  static getGasUrl(): string {
    if (this.inMemoryGasUrl) {
      return GasService.normalizeUrl(this.inMemoryGasUrl);
    }
    const savedUrl = localStorage.getItem(KEYS.GAS_URL);
    if (savedUrl && savedUrl.trim()) {
      return GasService.normalizeUrl(savedUrl);
    }
    const envUrl = (import.meta as any).env?.VITE_GAS_URL || 
                   (import.meta as any).env?.VITE_GOOGLE_SCRIPT_URL || 
                   (import.meta as any).env?.VITE_APPS_SCRIPT_URL || 
                   (window as any).__DRB_GAS_URL__ || '';
    return envUrl ? GasService.normalizeUrl(envUrl) : '';
  }

  static async initGasConfig(): Promise<string> {
    const current = this.getGasUrl();

    // 1. Sincronizar URL de GAS con el backend si existe
    try {
      const res = await fetch('/api/gas-config');
      if (res.ok) {
        const data = await res.json();
        if (data && data.gasUrl && !current) {
          const clean = GasService.normalizeUrl(data.gasUrl);
          this.inMemoryGasUrl = clean;
          localStorage.setItem(KEYS.GAS_URL, clean);
          window.dispatchEvent(new CustomEvent('drb-data-changed'));
        }
      }
    } catch (e) {
      // Endpoint local no crítico
    }

    // 2. Sincronizar catálogo quirúrgico centralizado con el backend
    try {
      const resCat = await fetch('/api/catalog');
      if (resCat.ok) {
        const catData = await resCat.json();
        if (catData && Array.isArray(catData.catalog) && catData.catalog.length > 0) {
          const currentLocal = this.getCatalog();
          const map = new Map<string, ProcedureCatalogItem>();
          currentLocal.forEach(p => map.set(p.nombre.toLowerCase().trim(), p));
          catData.catalog.forEach((p: ProcedureCatalogItem) => {
            if (p && p.nombre) map.set(p.nombre.toLowerCase().trim(), p);
          });
          const merged = Array.from(map.values());
          localStorage.setItem(KEYS.CATALOG, JSON.stringify(merged));
          window.dispatchEvent(new CustomEvent('catalog-updated', { detail: merged }));
          window.dispatchEvent(new CustomEvent('drb-data-changed'));
        }
      }
    } catch (e) {
      // Endpoint local no crítico
    }

    const activeGasUrl = this.getGasUrl();
    if (activeGasUrl) {
      this.purgeProblematicUsersFromSheetsAndLocal(activeGasUrl).catch(() => {});
    }

    return activeGasUrl;
  }

  static saveGasUrl(url: string): void {
    const clean = GasService.normalizeUrl(url.trim());
    this.inMemoryGasUrl = clean;
    localStorage.setItem(KEYS.GAS_URL, clean);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('drb-data-changed'));

    if (clean) {
      this.purgeProblematicUsersFromSheetsAndLocal(clean).catch(() => {});
    }

    // Intentar sincronizar URL con el backend para que otros usuarios la obtengan
    try {
      fetch('/api/gas-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gasUrl: clean })
      }).catch(() => {});
    } catch (e) {}
  }

  static getAuthenticatedUser(): Usuario | null {
    const isLoggedIn = localStorage.getItem('drb_logged_in_v1') === 'true';
    const data = localStorage.getItem(KEYS.CURRENT_USER);
    if (isLoggedIn && data) {
      try {
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === 'object') {
          return {
            ...parsed,
            rol: normalizeUserRole(parsed.rol)
          };
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  static getCurrentUser(): Usuario {
    const authUser = this.getAuthenticatedUser();
    if (authUser) return authUser;
    const users = this.getUsuarios();
    const user = users[0] || INITIAL_USUARIOS[0];
    return {
      ...user,
      rol: normalizeUserRole(user.rol)
    };
  }

  static setCurrentUser(user: Usuario): void {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    localStorage.setItem('drb_logged_in_v1', 'true');
  }

  static async loginAsync(emailOrUser: string, password: string): Promise<{ success: boolean; user?: Usuario; message?: string }> {
    const cleanIdentifier = (emailOrUser || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    const findUser = (list: Usuario[]) => list.find(u => u && (
      (u.email && u.email.toLowerCase().trim() === cleanIdentifier) ||
      (u.usuarioId && u.usuarioId.toLowerCase().trim() === cleanIdentifier) ||
      (u.nombre && u.nombre.toLowerCase().trim() === cleanIdentifier)
    ));

    // 1. Primero intentar con los usuarios en memoria local
    let users = this.getUsuarios();
    let foundUser = findUser(users);

    // 2. Si no se encuentra o la contraseña local no coincide, sincronizar en vivo con Google Sheets por si se actualizó
    const gasUrl = this.getGasUrl();
    const localPasswordMatch = foundUser && (foundUser.passwordHash || '').trim() === cleanPassword;

    if ((!foundUser || !localPasswordMatch) && gasUrl) {
      try {
        await this.syncFromGas();
        users = this.getUsuarios();
        foundUser = findUser(users);
      } catch (e) {
        console.warn('Error al verificar usuario en vivo con Google Sheets:', e);
      }
    }

    if (!foundUser) {
      return {
        success: false,
        message: 'No se encontró ningún usuario con el correo o ID proporcionado.'
      };
    }

    if (foundUser.estatus === 'Inactivo') {
      return {
        success: false,
        message: 'El usuario se encuentra inactivo. Contacta al administrador del sistema.'
      };
    }

    // Verificar contraseña
    const validPassword = (foundUser.passwordHash || '').trim() === cleanPassword;

    if (!validPassword) {
      return {
        success: false,
        message: 'Contraseña incorrecta. Verifica tus datos de acceso.'
      };
    }

    this.setCurrentUser(foundUser);
    return {
      success: true,
      user: foundUser,
      message: 'Inicio de sesión exitoso.'
    };
  }

  static login(emailOrUser: string, password: string): { success: boolean; user?: Usuario; message?: string } {
    const cleanIdentifier = (emailOrUser || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    const users = this.getUsuarios();
    const foundUser = users.find(u => u && (
      (u.email && u.email.toLowerCase().trim() === cleanIdentifier) ||
      (u.usuarioId && u.usuarioId.toLowerCase().trim() === cleanIdentifier) ||
      (u.nombre && u.nombre.toLowerCase().trim() === cleanIdentifier)
    ));

    if (!foundUser) {
      return {
        success: false,
        message: 'No se encontró ningún usuario con el correo o ID proporcionado.'
      };
    }

    if (foundUser.estatus === 'Inactivo') {
      return {
        success: false,
        message: 'El usuario se encuentra inactivo. Contacta al administrador del sistema.'
      };
    }

    const validPassword = (foundUser.passwordHash || '').trim() === cleanPassword;

    if (!validPassword) {
      return {
        success: false,
        message: 'Contraseña incorrecta. Verifica tus datos de acceso.'
      };
    }

    this.setCurrentUser(foundUser);
    return {
      success: true,
      user: foundUser,
      message: 'Inicio de sesión exitoso.'
    };
  }

  static logout(): void {
    localStorage.removeItem(KEYS.CURRENT_USER);
    localStorage.removeItem('drb_logged_in_v1');
  }

  // --- GENERADORES DE IDs ---
  static generatePatientId(): string {
    const list = this.getPacientes();
    let maxNum = 129;
    const year = new Date().getFullYear();
    for (const p of list) {
      if (p && p.id) {
        const match = p.id.match(/\d+$/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }
    }
    let nextNum = maxNum + 1;
    let newId = `P-${year}-${String(nextNum).padStart(4, '0')}`;
    while (list.some(p => p.id === newId)) {
      nextNum++;
      newId = `P-${year}-${String(nextNum).padStart(4, '0')}`;
    }
    return newId;
  }

  static generateReceiptCode(): string {
    const pagos = this.getPagos();
    let maxNum = 0;
    for (const p of pagos) {
      if (p && p.cod) {
        const match = p.cod.match(/\d+$/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      }
    }
    let nextNum = maxNum + 1;
    let newCod = `REC-2026-${String(nextNum).padStart(3, '0')}`;
    while (pagos.some(p => p.cod === newCod)) {
      nextNum++;
      newCod = `REC-2026-${String(nextNum).padStart(3, '0')}`;
    }
    return newCod;
  }

  static generateActivityId(): string {
    const list = this.getActividades();
    let maxNum = 0;
    for (const a of list) {
      if (a && a.actividadId) {
        const match = a.actividadId.match(/\d+$/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      }
    }
    let nextNum = maxNum + 1;
    let newId = `ACT-${String(nextNum).padStart(3, '0')}`;
    while (list.some(a => a.actividadId === newId)) {
      nextNum++;
      newId = `ACT-${String(nextNum).padStart(3, '0')}`;
    }
    return newId;
  }

  static generatePlanId(): string {
    const list = this.getFinanciamientos();
    let maxNum = 0;
    for (const f of list) {
      if (f && f.planId) {
        const match = f.planId.match(/\d+$/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      }
    }
    let nextNum = maxNum + 1;
    let newId = `FIN-2026-${String(nextNum).padStart(3, '0')}`;
    while (list.some(f => f.planId === newId)) {
      nextNum++;
      newId = `FIN-2026-${String(nextNum).padStart(3, '0')}`;
    }
    return newId;
  }

  static generateReintegroId(): string {
    const list = this.getReintegros();
    let maxNum = 0;
    for (const r of list) {
      if (r && r.reintegroId) {
        const match = r.reintegroId.match(/\d+$/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      }
    }
    let nextNum = maxNum + 1;
    let newId = `REINT-2026-${String(nextNum).padStart(3, '0')}`;
    while (list.some(r => r.reintegroId === newId)) {
      nextNum++;
      newId = `REINT-2026-${String(nextNum).padStart(3, '0')}`;
    }
    return newId;
  }

  static generateUserId(): string {
    const list = this.getUsuarios();
    let maxNum = 0;
    for (const u of list) {
      if (u && u.usuarioId) {
        const match = u.usuarioId.match(/\d+$/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      }
    }
    let nextNum = maxNum + 1;
    let newId = `USR-${String(nextNum).padStart(3, '0')}`;
    while (list.some(u => u.usuarioId === newId)) {
      nextNum++;
      newId = `USR-${String(nextNum).padStart(3, '0')}`;
    }
    return newId;
  }

  // --- REGISTRO DE TELÉFONOS EN VAULT PERSISTENTE ---
  static getPhoneVault(): Record<string, string> {
    try {
      const data = localStorage.getItem('drb_phones_vault_v2');
      if (data) return JSON.parse(data);
    } catch (e) {}
    return {};
  }

  static cachePatientPhone(id: string, cedula: string, phone: string): void {
    if (!phone) return;
    const cleanPhone = String(phone).trim().replace(/^'+/, '');
    if (
      !cleanPhone ||
      cleanPhone === 'No especificado' ||
      cleanPhone.includes('#ERROR') ||
      cleanPhone.includes('#¡ERROR') ||
      cleanPhone.startsWith('#') ||
      cleanPhone.length < 4
    ) return;

    try {
      const vault = this.getPhoneVault();
      if (id) vault[String(id).trim().toUpperCase()] = cleanPhone;
      if (cedula) vault[String(cedula).trim().toUpperCase()] = cleanPhone;
      localStorage.setItem('drb_phones_vault_v2', JSON.stringify(vault));
    } catch (e) {}
  }

  static getCachedPhone(idOrCedula?: string): string | null {
    if (!idOrCedula) return null;
    try {
      const vault = this.getPhoneVault();
      const key = String(idOrCedula).trim().toUpperCase();
      return vault[key] || null;
    } catch (e) {
      return null;
    }
  }

  // --- REGISTRO DE PACIENTES ELIMINADOS (TOMBSTONES) ---
  static getDeletedPatientIds(): Set<string> {
    try {
      const data = localStorage.getItem('drb_deleted_pacientes_v1');
      if (data) {
        const arr = JSON.parse(data);
        if (Array.isArray(arr)) {
          return new Set(arr.map((id: string) => String(id).trim().toUpperCase()));
        }
      }
    } catch (e) {
      // ignore
    }
    return new Set<string>();
  }

  static addDeletedPatientId(id: string): void {
    if (!id) return;
    const current = this.getDeletedPatientIds();
    current.add(String(id).trim().toUpperCase());
    localStorage.setItem('drb_deleted_pacientes_v1', JSON.stringify(Array.from(current)));
  }

  static removeDeletedPatientId(id: string): void {
    if (!id) return;
    const current = this.getDeletedPatientIds();
    current.delete(String(id).trim().toUpperCase());
    localStorage.setItem('drb_deleted_pacientes_v1', JSON.stringify(Array.from(current)));
  }

  // --- REGISTRO DE USUARIOS ELIMINADOS (TOMBSTONES) ---
  static getDeletedUserIds(): Set<string> {
    const set = new Set<string>(this.PROBLEMATIC_USER_IDS.map(id => id.toUpperCase()));
    try {
      const data = localStorage.getItem('drb_deleted_usuarios_v1');
      if (data) {
        const arr = JSON.parse(data);
        if (Array.isArray(arr)) {
          arr.forEach((id: string) => set.add(String(id).trim().toUpperCase()));
        }
      }
    } catch (e) {
      // ignore
    }
    return set;
  }

  static addDeletedUserId(id?: string, email?: string): void {
    const current = this.getDeletedUserIds();
    if (id) current.add(String(id).trim().toUpperCase());
    if (email) current.add(String(email).trim().toUpperCase());
    localStorage.setItem('drb_deleted_usuarios_v1', JSON.stringify(Array.from(current)));
  }

  static removeDeletedUserId(id?: string, email?: string): void {
    const current = this.getDeletedUserIds();
    const problematicUpper = this.PROBLEMATIC_USER_IDS.map(p => p.toUpperCase());
    if (id && !problematicUpper.includes(id.trim().toUpperCase())) {
      current.delete(String(id).trim().toUpperCase());
    }
    if (email) current.delete(String(email).trim().toUpperCase());
    localStorage.setItem('drb_deleted_usuarios_v1', JSON.stringify(Array.from(current)));
  }

  static getPendingNewUsers(): Usuario[] {
    const deleted = this.getDeletedUserIds();
    try {
      const data = localStorage.getItem('drb_pending_new_usuarios_v1');
      if (data) {
        const arr = JSON.parse(data);
        if (Array.isArray(arr)) {
          return arr.filter(u => {
            const uIdUpper = String(u?.usuarioId || '').trim().toUpperCase();
            const emailUpper = String(u?.email || '').trim().toUpperCase();
            return !deleted.has(uIdUpper) && !deleted.has(emailUpper);
          });
        }
      }
    } catch {
      // ignore
    }
    return [];
  }

  static addPendingNewUser(user: Usuario): void {
    const cleanId = (user.usuarioId || '').trim().toUpperCase();
    if (this.PROBLEMATIC_USER_IDS.map(p => p.toUpperCase()).includes(cleanId)) return;
    const list = this.getPendingNewUsers();
    const cleanEmail = (user.email || '').trim().toLowerCase();
    if (!list.some(u => (u.usuarioId && u.usuarioId.trim().toUpperCase() === cleanId) || (u.email && u.email.trim().toLowerCase() === cleanEmail))) {
      list.push(user);
      localStorage.setItem('drb_pending_new_usuarios_v1', JSON.stringify(list));
    }
  }

  static removePendingNewUser(usuarioId?: string, email?: string): void {
    let list = this.getPendingNewUsers();
    const cleanId = (usuarioId || '').trim().toUpperCase();
    const cleanEmail = (email || '').trim().toLowerCase();
    if (cleanId) {
      list = list.filter(u => !u.usuarioId || u.usuarioId.trim().toUpperCase() !== cleanId);
    }
    if (cleanEmail) {
      list = list.filter(u => !u.email || u.email.trim().toLowerCase() !== cleanEmail);
    }
    localStorage.setItem('drb_pending_new_usuarios_v1', JSON.stringify(list));
  }

  // --- PURGA EXPLÍCITA Y DEFINITIVA DE USUARIOS CONFLICTIVOS EN GOOGLE SHEETS Y LOCAL ---
  static async purgeProblematicUsersFromSheetsAndLocal(targetGasUrl?: string): Promise<{ success: boolean; message: string }> {
    const gasUrl = targetGasUrl || this.getGasUrl();

    // 1. Añadir a lista de eliminados permanentes (tombstones)
    this.PROBLEMATIC_USER_IDS.forEach(id => {
      this.addDeletedUserId(id);
    });

    // 2. Limpiar del almacenamiento local (KEYS.USUARIOS y drb_pending_new_usuarios_v1)
    try {
      const rawUsers = localStorage.getItem(KEYS.USUARIOS);
      if (rawUsers) {
        const parsed = JSON.parse(rawUsers);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((u: any) => {
            const uId = String(u.usuarioId || u.Usuario_ID || '').trim().toUpperCase();
            return !this.PROBLEMATIC_USER_IDS.map(p => p.toUpperCase()).includes(uId);
          });
          localStorage.setItem(KEYS.USUARIOS, JSON.stringify(filtered));
        }
      }

      const rawPending = localStorage.getItem('drb_pending_new_usuarios_v1');
      if (rawPending) {
        const parsed = JSON.parse(rawPending);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((u: any) => {
            const uId = String(u.usuarioId || u.Usuario_ID || '').trim().toUpperCase();
            return !this.PROBLEMATIC_USER_IDS.map(p => p.toUpperCase()).includes(uId);
          });
          localStorage.setItem('drb_pending_new_usuarios_v1', JSON.stringify(filtered));
        }
      }
    } catch (e) {
      console.warn('Error limpiando almacenamiento local de usuarios conflictivos:', e);
    }

    // 3. Enviar orden directa e imperativa a Google Sheets
    if (gasUrl) {
      try {
        // Enviar orden de eliminación directa por cada ID conflictivo individualmente
        await Promise.allSettled(
          this.PROBLEMATIC_USER_IDS.map(id =>
            GasService.sendPost(gasUrl, { action: 'deleteUsuario', usuarioId: id })
          )
        );

        // Enviar orden colectiva en lote para asegurar que cualquier fila sea borrada
        await GasService.sendPost(gasUrl, {
          action: 'deleteUsuario',
          usuarioIds: this.PROBLEMATIC_USER_IDS
        }).catch(() => {});

        // Obtener lista canónica de usuarios autorizados (sin los eliminados) y sincronizarla en la hoja Usuarios
        const cleanUsers = this.getUsuarios();
        await GasService.sendPost(gasUrl, {
          action: 'syncUsuarios',
          usuarios: cleanUsers
        });

        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('drb-data-changed'));

        return {
          success: true,
          message: `Orden ejecutada: los usuarios (${this.PROBLEMATIC_USER_IDS.join(', ')}) fueron borrados de Google Sheets y del sistema permanentemente.`
        };
      } catch (err: any) {
        console.warn('Error al enviar purga a Google Sheets:', err);
        return {
          success: false,
          message: `Error comunicando con Google Sheets: ${err?.message || err}`
        };
      }
    }

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('drb-data-changed'));
    return {
      success: true,
      message: `Usuarios (${this.PROBLEMATIC_USER_IDS.join(', ')}) eliminados localmente. Conéctate a Google Sheets para purgar la nube.`
    };
  }

  // --- OPERACIONES DE PACIENTES ---
  static addPaciente(paciente: Paciente): void {
    if (paciente.id) this.removeDeletedPatientId(paciente.id);
    if (paciente.cedula) this.removeDeletedPatientId(paciente.cedula);

    if (paciente.telefono && paciente.telefono !== 'No especificado') {
      this.cachePatientPhone(paciente.id, paciente.cedula, paciente.telefono);
    }

    const list = this.getPacientes();
    const filtered = list.filter(p => p.id !== paciente.id && (!paciente.cedula || p.cedula !== paciente.cedula));
    filtered.unshift(paciente);
    this.savePacientes(filtered);

    // Sync si hay URL
    const gasUrl = this.getGasUrl();
    if (gasUrl) {
      GasService.sendPost(gasUrl, { action: 'addPaciente', paciente }).catch(err => {
        console.warn('Aviso sincronización GAS (addPaciente):', err?.message || err);
      });
    }
  }

  static updatePaciente(paciente: Paciente): void {
    if (paciente.id) this.removeDeletedPatientId(paciente.id);
    if (paciente.cedula) this.removeDeletedPatientId(paciente.cedula);

    if (paciente.telefono && paciente.telefono !== 'No especificado') {
      this.cachePatientPhone(paciente.id, paciente.cedula, paciente.telefono);
    }

    const list = this.getPacientes().map(p => p.id === paciente.id ? paciente : p);
    this.savePacientes(list);

    const gasUrl = this.getGasUrl();
    if (gasUrl) {
      GasService.sendPost(gasUrl, { action: 'updatePaciente', paciente }).catch(err => {
        console.warn('Aviso sincronización GAS (updatePaciente):', err?.message || err);
      });
    }
  }

  static async deletePaciente(patientId: string): Promise<void> {
    const targetPatient = this.getPacientes().find(p => p.id === patientId);
    
    // Registrar identificadores en lista de borrados permanentes para evitar resurrección en auto-sync
    this.addDeletedPatientId(patientId);
    if (targetPatient?.cedula) {
      this.addDeletedPatientId(targetPatient.cedula);
    }

    // 1. Eliminar Paciente de la lista local
    const pacientes = this.getPacientes().filter(p => p.id !== patientId);
    this.savePacientes(pacientes);

    // 2. Eliminar Pagos vinculados
    const targetCedula = (targetPatient?.cedula || '').trim().toLowerCase();
    const targetNombre = (targetPatient?.nombre || '').trim().toLowerCase();

    const pagos = this.getPagos().filter(p => {
      if (!p) return false;
      if (p.id === patientId) return false;
      if (targetCedula && p.id && p.id.trim().toLowerCase() === targetCedula) return false;
      if (targetNombre && p.nombre && p.nombre.trim().toLowerCase() === targetNombre) return false;
      return true;
    });
    this.savePagos(pagos);

    // 3. Eliminar Actividades CRM & Alarmas de Calendario vinculadas
    const actividades = this.getActividades().filter(a => a.pacienteId !== patientId);
    this.saveActividades(actividades);

    // 4. Eliminar Planes de Financiamiento vinculados
    const financiamientos = this.getFinanciamientos().filter(f => f.pacienteId !== patientId);
    this.saveFinanciamientos(financiamientos);

    // 5. Eliminar Solicitudes/Registros de Reintegros vinculados
    const reintegros = this.getReintegros().filter(r => r.pacienteId !== patientId);
    this.saveReintegros(reintegros);

    // 6. Eliminar en Google Sheets en vivo
    const gasUrl = this.getGasUrl();
    if (gasUrl) {
      try {
        await GasService.sendPost(gasUrl, {
          action: 'deletePaciente',
          pacienteId: patientId,
          cedula: targetPatient?.cedula || ''
        });
      } catch (e) {
        console.warn('Error al borrar paciente en Google Sheets:', e);
      }
    }
  }

  // --- OPERACIONES DE PAGOS Y RECIBOS ---
  static addPago(pago: Pago, updateFinanciamientoPlanId?: string): void {
    const list = this.getPagos();
    list.unshift(pago);
    this.savePagos(list);

    let updatedFin: FinanciamientoCirugia | undefined = undefined;

    // Actualizar Plan de Financiamiento si está vinculado
    if (updateFinanciamientoPlanId) {
      const financiamientos = this.getFinanciamientos();
      const planIndex = financiamientos.findIndex(f => f.planId === updateFinanciamientoPlanId);
      if (planIndex !== -1) {
        const plan = financiamientos[planIndex];
        const nuevoAbonado = plan.montoAbonado + (pago.abono || 0);
        const nuevoSaldo = Math.max(0, plan.costoTotalCirugia - nuevoAbonado);
        const nuevoEstado = nuevoSaldo === 0 ? 'Pagado Totalmente' : (plan.estadoFinanciero === 'En Mora' ? 'En Mora' : 'Al día');

        plan.montoAbonado = nuevoAbonado;
        plan.saldoPendiente = nuevoSaldo;
        plan.estadoFinanciero = nuevoEstado;

        financiamientos[planIndex] = plan;
        this.saveFinanciamientos(financiamientos);
        updatedFin = plan;
      }
    }

    const gasUrl = this.getGasUrl();
    if (gasUrl) {
      GasService.sendPost(gasUrl, {
        action: 'addPago',
        pago,
        financiamiento: updatedFin
      }).catch(err => console.warn('Aviso sincronización GAS (addPago):', err?.message || err));
    }
  }

  // --- OPERACIONES CRM & ACTIVIDADES ---
  static addActividad(actividad: ActividadCRM): void {
    const list = this.getActividades();
    list.unshift(actividad);
    this.saveActividades(list);

    const gasUrl = this.getGasUrl();
    if (gasUrl) {
      GasService.sendPost(gasUrl, { action: 'addCRM', actividad }).catch(err =>
        console.warn('Aviso sincronización GAS (addCRM):', err?.message || err)
      );
    }
  }

  static updateActividad(actividad: ActividadCRM): void {
    const list = this.getActividades().map(a => a.actividadId === actividad.actividadId ? actividad : a);
    this.saveActividades(list);

    const gasUrl = this.getGasUrl();
    if (gasUrl) {
      GasService.sendPost(gasUrl, { action: 'updateCRM', actividad }).catch(err =>
        console.warn('Aviso sincronización GAS (updateCRM):', err?.message || err)
      );
    }
  }

  // --- OPERACIONES DE FINANCIAMIENTO ---
  static saveFinanciamiento(plan: FinanciamientoCirugia): void {
    const list = this.getFinanciamientos();
    const index = list.findIndex(f => f.planId === plan.planId);
    if (index !== -1) {
      list[index] = plan;
    } else {
      list.unshift(plan);
    }
    this.saveFinanciamientos(list);

    const gasUrl = this.getGasUrl();
    if (gasUrl) {
      GasService.sendPost(gasUrl, { action: 'saveFinanciamiento', financiamiento: plan }).catch(err =>
        console.warn('Aviso sincronización GAS (saveFinanciamiento):', err?.message || err)
      );
    }
  }

  static generateAndSavePaymentAlarms(paciente: Paciente, plan: FinanciamientoCirugia): ActividadCRM[] {
    if (!plan || plan.cuotasTotales <= 0 || plan.saldoPendiente <= 0) return [];

    const schedule = calculatePaymentSchedule(
      plan.fechaInicio || new Date().toISOString().split('T')[0],
      plan.cuotasTotales,
      plan.saldoPendiente
    );

    const createdActivities: ActividadCRM[] = [];
    const timestamp = Date.now();

    schedule.forEach((item, index) => {
      const act: ActividadCRM = {
        actividadId: `ACT-PAY-${plan.planId}-${index + 1}-${timestamp.toString().slice(-4)}`,
        pacienteId: paciente.id,
        tipoActividad: 'Recordatorio de Pago',
        descripcion: `🔔 Recordatorio de Pago Cuota #${item.numeroCuota}/${plan.cuotasTotales}: Paciente ${paciente.nombre} (C.I. ${paciente.cedula}). Monto a cobrar: $${item.montoCuota.toLocaleString()} USD. Procedimiento: ${plan.procedimiento}.`,
        fechaProgramada: item.fechaVencimiento,
        hora: '09:00 AM',
        estado: 'Pendiente',
        alarma: true,
        responsableId: 'USR-001'
      };

      this.addActividad(act);
      createdActivities.push(act);
    });

    return createdActivities;
  }

  // --- OPERACIONES DE REINTEGROS ---
  static solicitarReintegro(params: {
    planId: string;
    pacienteId: string;
    fechaSolicitud?: string;
    motivo?: string;
    observaciones?: string;
  }): Reintegro | null {
    const financiamientos = this.getFinanciamientos();
    const plan = financiamientos.find(f => f.planId === params.planId);
    if (!plan) return null;

    const paciente = this.getPacientes().find(p => p.id === params.pacienteId);
    const pagos = this.getPagos();

    const fechaSolicitud = params.fechaSolicitud || new Date().toISOString().split('T')[0];
    const metrics = calculateReintegroMetrics(plan, pagos, fechaSolicitud);

    const reintegroId = this.generateReintegroId();

    const nuevoReintegro: Reintegro = {
      reintegroId,
      planId: plan.planId,
      pacienteId: plan.pacienteId,
      fechaSolicitud,
      fechaAprobacion: fechaSolicitud,
      totalAbonado: metrics.totalAbonado,
      gastosAdmin20: metrics.gastosAdmin20,
      montoNetoReintegro: metrics.montoNetoReintegro,
      plazoMeses: metrics.plazoMeses,
      esExcepcion10Dias: metrics.esExcepcion10Dias,
      montoCuotaMensual: metrics.montoCuotaMensual,
      montoEfectivamentePagado: 0,
      saldoPendiente: metrics.montoNetoReintegro,
      estadoReintegro: 'Pendiente',
      fechaEstimadaCulminacion: metrics.fechaEstimadaCulminacion,
      motivo: params.motivo || 'Solicitud de Reintegro',
      observaciones: params.observaciones || ''
    };

    // 1. Guardar Reintegro
    const reintegros = this.getReintegros();
    reintegros.unshift(nuevoReintegro);
    this.saveReintegros(reintegros);

    // 2. Actualizar Financiamiento -> 'En Reintegro'
    plan.estadoFinanciero = 'En Reintegro';
    const planIndex = financiamientos.findIndex(f => f.planId === plan.planId);
    if (planIndex !== -1) {
      financiamientos[planIndex] = plan;
      this.saveFinanciamientos(financiamientos);
    }

    // 3. Crear Alarma/Evento en CRM & Calendario
    const nombrePaciente = paciente ? paciente.nombre : 'Paciente';
    const act: ActividadCRM = {
      actividadId: this.generateActivityId(),
      pacienteId: plan.pacienteId,
      tipoActividad: 'Recordatorio de Pago' as any,
      descripcion: `🚨 Alarma Reintegro ${reintegroId} - ${nombrePaciente}. Cuota mensual esperada: $${metrics.montoCuotaMensual.toLocaleString()} USD. Reintegro Neto Total: $${metrics.montoNetoReintegro.toLocaleString()} USD.`,
      fechaProgramada: metrics.fechaEstimadaCulminacion,
      hora: '10:00 AM',
      estado: 'Pendiente',
      alarma: true,
      responsableId: 'USR-001'
    };
    this.addActividad(act);

    // 4. Sincronizar en segundo plano con Google Sheets
    const gasUrl = this.getGasUrl();
    if (gasUrl) {
      GasService.sendPost(gasUrl, {
        action: 'solicitarReintegro',
        reintegro: nuevoReintegro,
        financiamiento: plan
      }).catch(err => console.warn('Aviso sincronización GAS (solicitarReintegro):', err?.message || err));
    }

    return nuevoReintegro;
  }

  static registrarPagoReintegro(params: {
    reintegroId: string;
    montoDevuelto: number;
    metodoPago: string;
    referencia: string;
    observaciones?: string;
    fecha?: string;
  }): { success: boolean; reintegro?: Reintegro; pago?: Pago; message: string } {
    const reintegros = this.getReintegros();
    const index = reintegros.findIndex(r => r.reintegroId === params.reintegroId);
    if (index === -1) {
      return { success: false, message: 'Reintegro no encontrado.' };
    }

    const reint = reintegros[index];
    const paciente = this.getPacientes().find(p => p.id === reint.pacienteId);
    const nombrePaciente = paciente ? paciente.nombre : 'Paciente';

    const fechaPago = params.fecha || new Date().toISOString().split('T')[0];
    const monto = Math.min(params.montoDevuelto, reint.saldoPendiente);

    const nuevoPagado = Math.round((reint.montoEfectivamentePagado + monto) * 100) / 100;
    const nuevoSaldo = Math.max(0, Math.round((reint.montoNetoReintegro - nuevoPagado) * 100) / 100);

    const nuevoEstado = nuevoSaldo === 0 ? 'Completado' : 'Parcialmente Pagado';

    reint.montoEfectivamentePagado = nuevoPagado;
    reint.saldoPendiente = nuevoSaldo;
    reint.estadoReintegro = nuevoEstado;
    if (params.observaciones) {
      reint.observaciones = (reint.observaciones ? reint.observaciones + ' | ' : '') + params.observaciones;
    }

    reintegros[index] = reint;
    this.saveReintegros(reintegros);

    // 1. Registrar egreso en Pagos
    const nuevoPagoEgreso: Pago = {
      fecha: fechaPago,
      cod: this.generateReceiptCode(),
      id: reint.pacienteId,
      nombre: nombrePaciente,
      descripcion: `Devolución de Reintegro [${reint.reintegroId}] ${params.observaciones ? '- ' + params.observaciones : ''}`,
      metodoDePago: (params.metodoPago || 'Zelle') as any,
      referencia: params.referencia || 'REINTEGRO',
      cargo: monto,
      abono: 0,
      diasVcto: 0,
      estatus: 'Pagado' as any,
      mesProximaAccion: '',
      fechaProximaAccion: '',
      proximaAccion: ''
    };
    this.addPago(nuevoPagoEgreso);

    // 2. Si se completó el reintegro total, actualizar Financiamiento a 'Reintegro Completado'
    let updatedFin: FinanciamientoCirugia | undefined = undefined;
    if (nuevoEstado === 'Completado') {
      const financiamientos = this.getFinanciamientos();
      const fIndex = financiamientos.findIndex(f => f.planId === reint.planId);
      if (fIndex !== -1) {
        financiamientos[fIndex].estadoFinanciero = 'Reintegro Completado';
        this.saveFinanciamientos(financiamientos);
        updatedFin = financiamientos[fIndex];
      }
    }

    // 3. GAS Sync
    const gasUrl = this.getGasUrl();
    if (gasUrl) {
      GasService.sendPost(gasUrl, {
        action: 'registrarPagoReintegro',
        reintegro: reint,
        pago: nuevoPagoEgreso,
        financiamiento: updatedFin
      }).catch(err => console.warn('Aviso sincronización GAS (registrarPagoReintegro):', err?.message || err));
    }

    return {
      success: true,
      reintegro: reint,
      pago: nuevoPagoEgreso,
      message: `Monto de $${monto.toLocaleString()} USD registrado con éxito.`
    };
  }

  // --- OPERACIONES DE USUARIOS ---
  static async saveUsuario(usuario: Usuario): Promise<{ success: boolean; message: string }> {
    const uIdUpper = String(usuario.usuarioId || '').trim().toUpperCase();
    if (this.PROBLEMATIC_USER_IDS.map(p => p.toUpperCase()).includes(uIdUpper)) {
      return { success: false, message: `El usuario con ID ${usuario.usuarioId} está marcado para eliminación definitiva y no puede ser creado con ese ID.` };
    }

    if (usuario.usuarioId) this.removeDeletedUserId(usuario.usuarioId);
    if (usuario.email) this.removeDeletedUserId(undefined, usuario.email);

    const list = this.getUsuarios();
    const isEdgar = usuario.email && usuario.email.toLowerCase().trim() === 'edgarmorales.asistente@gmail.com';
    const userToSave: Usuario = isEdgar
      ? { ...usuario, rol: 'Administrador', estatus: 'Activo' }
      : usuario;

    const index = list.findIndex(u => 
      (u.usuarioId && u.usuarioId.trim().toUpperCase() === (userToSave.usuarioId || '').trim().toUpperCase()) || 
      (u.email && u.email.toLowerCase().trim() === (userToSave.email || '').toLowerCase().trim())
    );

    if (index !== -1) {
      list[index] = userToSave;
    } else {
      list.push(userToSave);
      this.addPendingNewUser(userToSave);
    }
    this.saveUsuarios(list);

    // Si se actualizó el usuario que tiene sesión activa, actualizar la sesión
    const current = this.getAuthenticatedUser();
    if (current && (
      (current.usuarioId && current.usuarioId.trim().toUpperCase() === (userToSave.usuarioId || '').trim().toUpperCase()) || 
      (current.email && current.email.toLowerCase().trim() === (userToSave.email || '').toLowerCase().trim())
    )) {
      this.setCurrentUser(userToSave);
    }

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('drb-data-changed'));

    const gasUrl = this.getGasUrl();
    if (gasUrl) {
      try {
        await GasService.sendPost(gasUrl, { action: 'saveUsuario', usuario: userToSave });
        // Sincronizar la lista canónica limpia completa para consistencia instantánea en Sheets
        await GasService.sendPost(gasUrl, { action: 'syncUsuarios', usuarios: list });
        this.removePendingNewUser(userToSave.usuarioId, userToSave.email);
      } catch (err: any) {
        console.warn('Aviso sincronización GAS (saveUsuario):', err?.message || err);
      }
    }

    return { success: true, message: 'Usuario guardado y sincronizado correctamente.' };
  }

  static async deleteUsuario(usuarioId: string, callerUser?: Usuario, email?: string): Promise<{ success: boolean; message: string }> {
    const list = this.getUsuarios();
    const cleanId = (usuarioId || '').trim().toUpperCase();
    const cleanEmail = (email || '').trim().toLowerCase();

    const target = list.find(u => 
      (cleanId && u.usuarioId && u.usuarioId.trim().toUpperCase() === cleanId) || 
      (cleanEmail && u.email && u.email.toLowerCase().trim() === cleanEmail)
    );

    if (!target) {
      return { success: false, message: 'Usuario no encontrado.' };
    }

    const isEdgar = target.email && target.email.toLowerCase().trim() === 'edgarmorales.asistente@gmail.com';
    if (isEdgar) {
      const isCallerEdgar = callerUser && callerUser.email && callerUser.email.toLowerCase().trim() === 'edgarmorales.asistente@gmail.com';
      if (!isCallerEdgar) {
        return {
          success: false,
          message: 'El usuario Edgar Morales (Administrador Principal) no puede ser eliminado por nadie excepto por él mismo.'
        };
      }
    }

    const isMaria = target.email && target.email.toLowerCase().trim() === 'maria.colmenares@revierte.com';
    if (isMaria) {
      const isCallerAdmin = callerUser && callerUser.rol === 'Administrador';
      if (!isCallerAdmin) {
        return {
          success: false,
          message: 'El usuario Maria Claudia Colmenares (Administrador) está protegido y solo puede ser gestionado por un Administrador.'
        };
      }
    }

    // Registrar en lista de usuarios eliminados permanentes
    this.addDeletedUserId(target.usuarioId, target.email);
    this.removePendingNewUser(target.usuarioId, target.email);

    const updated = list.filter(u => {
      const uIdUpper = (u.usuarioId || '').trim().toUpperCase();
      const uEmailLower = (u.email || '').toLowerCase().trim();
      if (cleanId && uIdUpper === cleanId) return false;
      if (target.usuarioId && uIdUpper === target.usuarioId.trim().toUpperCase()) return false;
      if (cleanEmail && uEmailLower === cleanEmail) return false;
      if (target.email && uEmailLower === target.email.toLowerCase().trim()) return false;
      return true;
    });

    this.saveUsuarios(updated);

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('drb-data-changed'));

    const gasUrl = this.getGasUrl();
    if (gasUrl) {
      try {
        // 1. Enviar delete individual para purgar filas por ID y correo
        await GasService.sendPost(gasUrl, { 
          action: 'deleteUsuario', 
          usuarioId: target.usuarioId, 
          email: target.email 
        });

        // 2. Sobrescribir la hoja Usuarios con la lista limpia canónica para garantizar cero duplicados o residuos
        await GasService.sendPost(gasUrl, { 
          action: 'syncUsuarios', 
          usuarios: updated 
        });
      } catch (err: any) {
        console.warn('Aviso sincronización GAS (deleteUsuario):', err?.message || err);
      }
    }

    return { success: true, message: `Usuario ${target.nombre} eliminado correctamente de la aplicación y Google Sheets.` };
  }

  // --- SINCRONIZACIÓN COMPLETA DESDE GOOGLE SHEETS ---
  static async syncFromGas(): Promise<{ success: boolean; message: string }> {
    if (this.isSyncingGas) {
      return { success: true, message: 'Sincronización en curso...' };
    }

    let gasUrl = this.getGasUrl();
    if (!gasUrl) {
      gasUrl = await this.initGasConfig();
    }

    if (!gasUrl) {
      return { success: false, message: 'Ingresa primero la URL de tu Web App de Google Apps Script' };
    }

    this.isSyncingGas = true;

    try {
      const data = await GasService.sendGet(gasUrl, 'getAllData');
      if (data && data.success) {
        const deletedPatientIds = this.getDeletedPatientIds();
        const deletedUserIds = this.getDeletedUserIds();

        // 1. Pacientes: Merge no destructivo
        if (data.pacientes && Array.isArray(data.pacientes)) {
          const localPacientes = this.getPacientes();
          const localPacientesMap = new Map<string, Paciente>();
          localPacientes.forEach(p => {
            if (p.id) localPacientesMap.set(String(p.id).trim().toUpperCase(), p);
            if (p.cedula) localPacientesMap.set(String(p.cedula).trim().toUpperCase(), p);
            if (p.telefono && p.telefono !== 'No especificado') {
              this.cachePatientPhone(p.id, p.cedula, p.telefono);
            }
          });

          const remotePacientes = data.pacientes
            .map(normalizePaciente)
            .filter(p => {
              if (!p || !p.id) return false;
              const pIdUpper = String(p.id).trim().toUpperCase();
              const pCedUpper = String(p.cedula || '').trim().toUpperCase();
              const isDeleted = deletedPatientIds.has(pIdUpper) || (pCedUpper && deletedPatientIds.has(pCedUpper));
              
              if (isDeleted && gasUrl) {
                GasService.sendPost(gasUrl, {
                  action: 'deletePaciente',
                  pacienteId: p.id,
                  cedula: p.cedula || ''
                }).catch(() => {});
                return false;
              }
              return true;
            })
            .map(p => {
              const pIdUpper = String(p.id).trim().toUpperCase();
              const pCedUpper = String(p.cedula || '').trim().toUpperCase();
              const local = localPacientesMap.get(pIdUpper) || (pCedUpper ? localPacientesMap.get(pCedUpper) : undefined);
              const cachedPhone = this.getCachedPhone(p.id) || this.getCachedPhone(p.cedula);
              
              const currentTel = p.telefono;
              const isTelInvalid = (
                !currentTel ||
                currentTel === 'No especificado' ||
                currentTel.includes('#ERROR') ||
                currentTel.includes('#¡ERROR') ||
                currentTel.startsWith('#')
              );

              if (isTelInvalid) {
                const recoveredPhone = (local && local.telefono && local.telefono !== 'No especificado' && !local.telefono.includes('#ERROR'))
                  ? local.telefono
                  : cachedPhone;

                if (recoveredPhone) {
                  p.telefono = recoveredPhone;
                  this.cachePatientPhone(p.id, p.cedula, recoveredPhone);
                  if (gasUrl) {
                    GasService.sendPost(gasUrl, { action: 'updatePaciente', paciente: p }).catch(() => {});
                  }
                }
              } else {
                this.cachePatientPhone(p.id, p.cedula, currentTel);
              }
              return p;
            });

          // Mezclar preservando pacientes recién registrados localmente
          const mergedPacientesMap = new Map<string, Paciente>();
          remotePacientes.forEach(p => {
            const key = String(p.id || '').trim().toUpperCase();
            if (key) mergedPacientesMap.set(key, p);
          });
          localPacientes.forEach(p => {
            if (!p || !p.id) return;
            const pIdUpper = String(p.id).trim().toUpperCase();
            const pCedUpper = String(p.cedula || '').trim().toUpperCase();
            if (deletedPatientIds.has(pIdUpper) || (pCedUpper && deletedPatientIds.has(pCedUpper))) return;

            if (!mergedPacientesMap.has(pIdUpper)) {
              mergedPacientesMap.set(pIdUpper, p);
              if (gasUrl) {
                GasService.sendPost(gasUrl, { action: 'addPaciente', paciente: p }).catch(() => {});
              }
            }
          });

          this.savePacientes(Array.from(mergedPacientesMap.values()));
        }

        // 2. Pagos: Merge no destructivo
        if (data.pagos && Array.isArray(data.pagos)) {
          const localPagos = this.getPagos();
          const remotePagos = data.pagos
            .map(normalizePago)
            .filter(p => {
              if (!p || !p.cod) return false;
              const pIdUpper = String(p.id || '').trim().toUpperCase();
              if (pIdUpper && deletedPatientIds.has(pIdUpper)) return false;
              return true;
            });

          const mergedPagosMap = new Map<string, Pago>();
          remotePagos.forEach(p => {
            const codKey = String(p.cod).trim().toUpperCase();
            if (codKey) mergedPagosMap.set(codKey, p);
          });
          localPagos.forEach(p => {
            if (!p || !p.cod) return;
            const pIdUpper = String(p.id || '').trim().toUpperCase();
            if (pIdUpper && deletedPatientIds.has(pIdUpper)) return;
            const codKey = String(p.cod).trim().toUpperCase();
            if (!mergedPagosMap.has(codKey)) {
              mergedPagosMap.set(codKey, p);
              if (gasUrl) {
                GasService.sendPost(gasUrl, { action: 'addPago', pago: p }).catch(() => {});
              }
            }
          });

          this.savePagos(Array.from(mergedPagosMap.values()));
        }

        // 3. Usuarios: Merge no destructivo y deduplicado por correo único
        if (data.usuarios && Array.isArray(data.usuarios)) {
          const localUsuarios = this.getUsuarios();
          let remoteUsuarios = data.usuarios.map(normalizeUsuario).filter(u => u && u.usuarioId && u.email);
          const oldDemoEmails = [
            'dra.isabella@drbelleza.com',
            'maria.crm@drbelleza.com',
            'dr.mendoza@drbelleza.com',
            'carlos.finanzas@drbelleza.com',
            'mendoza@drbelleza.com',
            'valeria@drbelleza.com'
          ];
          const problematicUpper = this.PROBLEMATIC_USER_IDS.map(p => p.toUpperCase());
          let foundProblematicInRemote = false;

          remoteUsuarios = remoteUsuarios.filter(u => {
            const emailLower = u.email.toLowerCase().trim();
            const uIdUpper = String(u.usuarioId).trim().toUpperCase();
            const emailUpper = String(u.email).trim().toUpperCase();
            if (oldDemoEmails.includes(emailLower)) return false;
            if (problematicUpper.includes(uIdUpper)) {
              foundProblematicInRemote = true;
              if (gasUrl) {
                GasService.sendPost(gasUrl, { action: 'deleteUsuario', usuarioId: u.usuarioId }).catch(() => {});
              }
              return false;
            }
            const isDeleted = deletedUserIds.has(uIdUpper) || deletedUserIds.has(emailUpper);
            if (isDeleted && gasUrl) {
              GasService.sendPost(gasUrl, { action: 'deleteUsuario', usuarioId: u.usuarioId, email: u.email }).catch(() => {});
              return false;
            }
            return true;
          });

          // Mapa indexado por email único en minúsculas.
          // Google Sheets es la fuente de verdad central para los usuarios del sistema.
          const mergedUsersMap = new Map<string, Usuario>();
          remoteUsuarios.forEach(u => {
            const emailKey = u.email.toLowerCase().trim();
            mergedUsersMap.set(emailKey, u);
          });

          // Solo preservar usuarios nuevos creados localmente que estén pendientes de subir a Google Sheets
          const pendingUsers = this.getPendingNewUsers();
          pendingUsers.forEach(u => {
            if (!u || !u.email) return;
            const emailKey = u.email.toLowerCase().trim();
            const uIdUpper = String(u.usuarioId || '').trim().toUpperCase();
            const emailUpper = String(u.email || '').trim().toUpperCase();
            if (deletedUserIds.has(uIdUpper) || deletedUserIds.has(emailUpper)) return;

            if (!mergedUsersMap.has(emailKey)) {
              mergedUsersMap.set(emailKey, u);
              if (gasUrl) {
                GasService.sendPost(gasUrl, { action: 'saveUsuario', usuario: u }).catch(() => {});
              }
            }
          });

          // Limpiar de pendientes aquellos usuarios que ya figuran en Google Sheets
          pendingUsers.forEach(pu => {
            const puEmail = (pu.email || '').toLowerCase().trim();
            if (remoteUsuarios.some(ru => (ru.email || '').toLowerCase().trim() === puEmail)) {
              this.removePendingNewUser(pu.usuarioId, pu.email);
            }
          });

          let mergedList = Array.from(mergedUsersMap.values());
          let edgarIdx = mergedList.findIndex(u => u.email.toLowerCase().trim() === 'edgarmorales.asistente@gmail.com');
          if (edgarIdx === -1) {
            mergedList = [INITIAL_USUARIOS[0], ...mergedList];
          } else {
            mergedList[edgarIdx] = {
              ...mergedList[edgarIdx],
              rol: 'Administrador',
              estatus: 'Activo'
            };
          }

          let mariaIdx = mergedList.findIndex(u => u.email.toLowerCase().trim() === 'maria.colmenares@revierte.com');
          if (mariaIdx === -1) {
            mergedList = [...mergedList, INITIAL_USUARIOS[1]];
          } else {
            mergedList[mariaIdx] = {
              ...mergedList[mariaIdx],
              rol: 'Administrador',
              estatus: 'Activo'
            };
          }
          this.saveUsuarios(mergedList);

          // Si Google Sheets contenía usuarios eliminados, problemáticos o de prueba, limpiar la hoja inmediatamente
          const hadDeletedOrLegacyInRemote = data.usuarios.length !== remoteUsuarios.length || foundProblematicInRemote;
          if (hadDeletedOrLegacyInRemote && gasUrl) {
            GasService.sendPost(gasUrl, { action: 'deleteUsuario', usuarioIds: this.PROBLEMATIC_USER_IDS }).catch(() => {});
            GasService.sendPost(gasUrl, { action: 'syncUsuarios', usuarios: mergedList }).catch(() => {});
          }

          // Si el usuario autenticado actualmente sufrió cambios remotos (rol, nombre, contraseña o estatus), sincronizar su sesión activa
          const currentAuth = this.getAuthenticatedUser();
          if (currentAuth && currentAuth.email) {
            const updatedAuth = mergedList.find(u => u.email.toLowerCase().trim() === currentAuth.email.toLowerCase().trim());
            if (updatedAuth && (
              updatedAuth.rol !== currentAuth.rol ||
              updatedAuth.nombre !== currentAuth.nombre ||
              updatedAuth.passwordHash !== currentAuth.passwordHash ||
              updatedAuth.estatus !== currentAuth.estatus
            )) {
              this.setCurrentUser(updatedAuth);
            }
          }
        }

        // 4. Actividades CRM: Merge no destructivo
        if (data.actividades && Array.isArray(data.actividades)) {
          const localActividades = this.getActividades();
          const remoteCRM = data.actividades
            .map(normalizeActividad)
            .filter(a => {
              if (!a || !a.actividadId) return false;
              const pIdUpper = String(a.pacienteId || '').trim().toUpperCase();
              if (pIdUpper && deletedPatientIds.has(pIdUpper)) return false;
              return true;
            });

          const mergedActMap = new Map<string, ActividadCRM>();
          remoteCRM.forEach(a => {
            const key = String(a.actividadId).trim().toUpperCase();
            if (key) mergedActMap.set(key, a);
          });
          localActividades.forEach(a => {
            if (!a || !a.actividadId) return;
            const pIdUpper = String(a.pacienteId || '').trim().toUpperCase();
            if (pIdUpper && deletedPatientIds.has(pIdUpper)) return;
            const key = String(a.actividadId).trim().toUpperCase();
            if (!mergedActMap.has(key)) {
              mergedActMap.set(key, a);
            }
          });

          this.saveActividades(Array.from(mergedActMap.values()));
        }

        // 5. Financiamientos: Merge no destructivo
        if (data.financiamientos && Array.isArray(data.financiamientos)) {
          const localFin = this.getFinanciamientos();
          const remoteFin = data.financiamientos
            .map(normalizeFinanciamiento)
            .filter(f => {
              if (!f || !f.planId) return false;
              const pIdUpper = String(f.pacienteId || '').trim().toUpperCase();
              if (pIdUpper && deletedPatientIds.has(pIdUpper)) return false;
              return true;
            });

          const mergedFinMap = new Map<string, FinanciamientoCirugia>();
          remoteFin.forEach(f => {
            const key = String(f.planId).trim().toUpperCase();
            if (key) mergedFinMap.set(key, f);
          });
          localFin.forEach(f => {
            if (!f || !f.planId) return;
            const pIdUpper = String(f.pacienteId || '').trim().toUpperCase();
            if (pIdUpper && deletedPatientIds.has(pIdUpper)) return;
            const key = String(f.planId).trim().toUpperCase();
            if (!mergedFinMap.has(key)) {
              mergedFinMap.set(key, f);
              if (gasUrl) {
                GasService.sendPost(gasUrl, { action: 'saveFinanciamiento', financiamiento: f }).catch(() => {});
              }
            }
          });

          this.saveFinanciamientos(Array.from(mergedFinMap.values()));
        }

        // 6. Reintegros: Merge no destructivo
        if (data.reintegros && Array.isArray(data.reintegros)) {
          const localReint = this.getReintegros();
          const remoteReint = data.reintegros
            .map(normalizeReintegro)
            .filter(r => {
              if (!r || !r.reintegroId) return false;
              const pIdUpper = String(r.pacienteId || '').trim().toUpperCase();
              if (pIdUpper && deletedPatientIds.has(pIdUpper)) return false;
              return true;
            });

          const mergedReintMap = new Map<string, Reintegro>();
          remoteReint.forEach(r => {
            const key = String(r.reintegroId).trim().toUpperCase();
            if (key) mergedReintMap.set(key, r);
          });
          localReint.forEach(r => {
            if (!r || !r.reintegroId) return;
            const pIdUpper = String(r.pacienteId || '').trim().toUpperCase();
            if (pIdUpper && deletedPatientIds.has(pIdUpper)) return;
            const key = String(r.reintegroId).trim().toUpperCase();
            if (!mergedReintMap.has(key)) {
              mergedReintMap.set(key, r);
            }
          });

          this.saveReintegros(Array.from(mergedReintMap.values()));
        }

        // 7. Catálogo Quirúrgico: Integración remota desde Google Sheets y consolidación
        if (data.catalogo && Array.isArray(data.catalogo)) {
          const remoteCatalog: ProcedureCatalogItem[] = data.catalogo
            .filter((c: any) => c && (c.Nombre || c.nombre || c.Procedimiento || c.procedimiento || c.NOMBRE || c.PROCEDIMIENTO))
            .map((c: any) => ({
              id: c.ID || c.id || `proc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              nombre: cleanField(c.Nombre || c.nombre || c.Procedimiento || c.procedimiento || c.NOMBRE || c.PROCEDIMIENTO),
              categoria: cleanField(c.Categoria || c.categoria || c.CATEGORIA, 'General'),
              precioDefault: Number(c.Precio_Default || c.precioDefault || c.precio || c.Precio || c.PRECIO || 1500),
              activo: String(c.Activo || c.activo || c.ACTIVO || 'true').toLowerCase() !== 'false' && String(c.Activo || c.activo || c.ACTIVO).toLowerCase() !== 'no'
            }));

          if (remoteCatalog.length > 0) {
            const currentLocal = this.getCatalog();
            const map = new Map<string, ProcedureCatalogItem>();
            currentLocal.forEach(p => map.set(p.nombre.toLowerCase().trim(), p));
            remoteCatalog.forEach((p: ProcedureCatalogItem) => map.set(p.nombre.toLowerCase().trim(), p));
            this.saveCatalog(Array.from(map.values()), false);
          }
        } else {
          // Re-consolidar catálogo local con los nuevos financiamientos y pacientes descargados
          const consolidated = this.getCatalog();
          this.saveCatalog(consolidated, false);
        }

        const nowIso = new Date().toISOString();
        localStorage.setItem(KEYS.LAST_SYNC, nowIso);
        this.lastSyncSuccessful = true;
        this.lastSyncTimestamp = nowIso;
        this.lastSyncError = null;
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('drb-data-changed'));
        return { success: true, message: '¡Datos descargados y sincronizados correctamente desde Google Sheets!' };
      }
      this.lastSyncSuccessful = false;
      this.lastSyncError = data?.error || 'Respuesta no válida de Google Sheets';
      window.dispatchEvent(new CustomEvent('drb-data-changed'));
      return { success: false, message: data.error || 'Respuesta de sincronización no válida.' };
    } catch (err: any) {
      this.lastSyncSuccessful = false;
      this.lastSyncError = err.message || 'Error de conexión';
      window.dispatchEvent(new CustomEvent('drb-data-changed'));
      return { success: false, message: err.message || 'Error durante la sincronización.' };
    } finally {
      this.isSyncingGas = false;
    }
  }

  // --- SUBIR BASE DE DATOS COMPLETA HACIA SHEETS ---
  static async pushFullDatabaseToGas(): Promise<{ success: boolean; message: string }> {
    const gasUrl = this.getGasUrl();
    if (!gasUrl) {
      return { success: false, message: 'Ingresa primero la URL de tu Web App de Google Apps Script' };
    }

    try {
      const payload = {
        action: 'syncFullDatabase',
        pacientes: this.getPacientes(),
        pagos: this.getPagos(),
        usuarios: this.getUsuarios(),
        actividades: this.getActividades(),
        financiamientos: this.getFinanciamientos(),
        reintegros: this.getReintegros(),
        catalogo: this.getCatalog()
      };

      const result = await GasService.sendPost(gasUrl, payload);
      if (result && result.success) {
        localStorage.setItem(KEYS.LAST_SYNC, new Date().toISOString());
        return { success: true, message: '¡Base de datos cargada a Google Sheets con éxito!' };
      }
      return { 
        success: false, 
        message: result?.error ? `Error desde Google Sheets: ${result.error}` : 'Error al volcar datos a Sheets. Copia y actualiza el código Code.gs en Google Apps Script.' 
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error al subir datos a Google Sheets.' };
    }
  }

  // --- CONFIGURACIÓN DEL SISTEMA Y CATÁLOGO QUIRÚRGICO MULTIUSUARIO ---
  static getCatalog(): ProcedureCatalogItem[] {
    let list: ProcedureCatalogItem[] = [];
    try {
      const raw = localStorage.getItem(KEYS.CATALOG);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          list = parsed;
        }
      }
    } catch (e) {
      console.warn('Error al leer catálogo local', e);
    }

    // Mapa único indexado por nombre normalizado (en minúsculas y sin espacios)
    const mapByName = new Map<string, ProcedureCatalogItem>();

    // 1. Cirugías base predeterminadas
    INITIAL_PROCEDURES_CATALOG.forEach(proc => {
      mapByName.set(proc.nombre.trim().toLowerCase(), { ...proc });
    });

    // 2. Cirugías guardadas en catálogo local (incluye modificaciones de precios y cirugías añadidas)
    list.forEach(proc => {
      if (proc && proc.nombre) {
        const key = String(proc.nombre).trim().toLowerCase();
        if (key) {
          mapByName.set(key, {
            id: proc.id || `proc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            nombre: String(proc.nombre).trim(),
            categoria: proc.categoria || 'Cirugía Especial',
            precioDefault: Number(proc.precioDefault || (proc as any).precio || 1500),
            activo: proc.activo !== false
          });
        }
      }
    });

    // 3. Extracción automática desde todos los Financiamientos registrados (garantiza que cirugías creadas por cualquier usuario aparezcan a todos)
    const financiamientos = this.getFinanciamientos();
    financiamientos.forEach(f => {
      if (Array.isArray(f.comboProcedimientos)) {
        f.comboProcedimientos.forEach(cp => {
          if (cp && cp.nombre) {
            const key = String(cp.nombre).trim().toLowerCase();
            if (key && !mapByName.has(key)) {
              mapByName.set(key, {
                id: cp.id || `proc_fin_${Math.random().toString(36).substring(2, 7)}`,
                nombre: String(cp.nombre).trim(),
                categoria: 'Cirugía Especial',
                precioDefault: Number(cp.precio || 1500),
                activo: true
              });
            }
          }
        });
      }
      if (f.procedimiento && typeof f.procedimiento === 'string') {
        const procs = f.procedimiento.split(/[,+/]/).map(s => s.trim()).filter(Boolean);
        procs.forEach(name => {
          const key = name.toLowerCase();
          if (key && !mapByName.has(key)) {
            mapByName.set(key, {
              id: `proc_fin_${Math.random().toString(36).substring(2, 7)}`,
              nombre: name,
              categoria: 'Cirugía Especial',
              precioDefault: 2000,
              activo: true
            });
          }
        });
      }
    });

    // 4. Extracción automática desde todos los Pacientes registrados
    const pacientes = this.getPacientes();
    pacientes.forEach(p => {
      if (p && p.procedimiento && typeof p.procedimiento === 'string') {
        const procs = p.procedimiento.split(/[,+/]/).map(s => s.trim()).filter(Boolean);
        procs.forEach(name => {
          const key = name.toLowerCase();
          if (key && !mapByName.has(key)) {
            mapByName.set(key, {
              id: `proc_pac_${Math.random().toString(36).substring(2, 7)}`,
              nombre: name,
              categoria: 'Cirugía Especial',
              precioDefault: 2000,
              activo: true
            });
          }
        });
      }
    });

    return Array.from(mapByName.values());
  }

  static saveCatalog(list: ProcedureCatalogItem[], syncToGas: boolean = true): void {
    localStorage.setItem(KEYS.CATALOG, JSON.stringify(list));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('catalog-updated', { detail: list }));
    window.dispatchEvent(new CustomEvent('drb-data-changed'));

    // 1. Sincronizar con el backend de la app para persistencia multi-usuario inmediata
    try {
      fetch('/api/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ catalog: list })
      }).catch(() => {});
    } catch (e) {}

    // 2. Sincronizar asíncronamente con Google Sheets si la URL está configurada y se solicita
    if (syncToGas) {
      const gasUrl = this.getGasUrl();
      if (gasUrl) {
        GasService.sendPost(gasUrl, {
          action: 'syncCatalog',
          catalogo: list
        }).catch(err => {
          console.warn('Sincronización en segundo plano de catálogo con Sheets:', err);
        });
      }
    }
  }

  static addCatalogItem(item: ProcedureCatalogItem): ProcedureCatalogItem[] {
    const current = this.getCatalog();
    const cleanName = (item.nombre || '').trim();
    if (!cleanName) return current;

    const existingIndex = current.findIndex(
      p => p.id === item.id || p.nombre.trim().toLowerCase() === cleanName.toLowerCase()
    );

    let updated: ProcedureCatalogItem[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = {
        ...updated[existingIndex],
        ...item,
        nombre: cleanName,
        precioDefault: Number(item.precioDefault || (item as any).precio || updated[existingIndex].precioDefault || 1500),
        activo: true
      };
    } else {
      updated = [...current, { ...item, nombre: cleanName, activo: true }];
    }

    this.saveCatalog(updated, true);
    return updated;
  }

  static deleteCatalogItem(idOrName: string): ProcedureCatalogItem[] {
    const current = this.getCatalog();
    const target = (idOrName || '').trim().toLowerCase();
    const updated = current.filter(p => p.id !== idOrName && p.nombre.trim().toLowerCase() !== target);
    this.saveCatalog(updated, true);
    return updated;
  }

  static getCoupons(): any[] {
    const data = localStorage.getItem(KEYS.COUPONS);
    if (data) return JSON.parse(data);
    return [];
  }

  static saveCoupons(list: any[]): void {
    localStorage.setItem(KEYS.COUPONS, JSON.stringify(list));
  }

  static getPlanOptions(): any[] {
    const data = localStorage.getItem(KEYS.PLAN_OPTIONS);
    if (data) return JSON.parse(data);
    return [];
  }

  static savePlanOptions(list: any[]): void {
    localStorage.setItem(KEYS.PLAN_OPTIONS, JSON.stringify(list));
  }

  static getClinicConfig(): any {
    const data = localStorage.getItem(KEYS.CLINIC_CONFIG);
    if (data) return JSON.parse(data);
    return null;
  }

  static saveClinicConfig(config: any): void {
    localStorage.setItem(KEYS.CLINIC_CONFIG, JSON.stringify(config));
  }

  // --- VACIAR BASE DE DATOS (SISTEMA VIRGEN PARA PRODUCCIÓN) ---
  static async clearAllData(syncToSheets: boolean = true): Promise<{ success: boolean; message: string }> {
    localStorage.setItem('drb_clean_mode', 'true');
    localStorage.setItem(KEYS.PACIENTES, JSON.stringify([]));
    localStorage.setItem(KEYS.PAGOS, JSON.stringify([]));
    localStorage.setItem(KEYS.ACTIVIDADES, JSON.stringify([]));
    localStorage.setItem(KEYS.FINANCIAMIENTOS, JSON.stringify([]));
    localStorage.setItem(KEYS.REINTEGROS, JSON.stringify([]));
    
    // Dejar únicamente a los Administradores autorizados (Edgar Morales y Maria Claudia Colmenares)
    const adminOnly = [...INITIAL_USUARIOS];
    localStorage.setItem(KEYS.USUARIOS, JSON.stringify(adminOnly));

    if (syncToSheets) {
      const gasUrl = this.getGasUrl();
      if (gasUrl) {
        try {
          const payload = {
            action: 'syncFullDatabase',
            pacientes: [],
            pagos: [],
            usuarios: adminOnly,
            actividades: [],
            financiamientos: [],
            reintegros: []
          };
          const result = await GasService.sendPost(gasUrl, payload);
          if (result && result.success) {
            localStorage.setItem(KEYS.LAST_SYNC, new Date().toISOString());
            return { success: true, message: '¡Base de datos vaciada con éxito (Sistema Virgen) en la Web App y Google Sheets!' };
          }
        } catch (e: any) {
          return { success: true, message: 'Base de datos de la Web App vaciada. No se pudo vaciar Google Sheets (Verifica la URL o conexión).' };
        }
      }
    }
    return { success: true, message: '¡Base de datos local vaciada con éxito (Sistema Virgen)!' };
  }

  // --- REINICIAR A DATOS DEMO ---
  static resetToDemoData(): void {
    localStorage.removeItem('drb_clean_mode');
    localStorage.setItem(KEYS.PACIENTES, JSON.stringify(INITIAL_PACIENTES));
    localStorage.setItem(KEYS.PAGOS, JSON.stringify(INITIAL_PAGOS));
    localStorage.setItem(KEYS.USUARIOS, JSON.stringify(INITIAL_USUARIOS));
    localStorage.setItem(KEYS.ACTIVIDADES, JSON.stringify(INITIAL_ACTIVIDADES));
    localStorage.setItem(KEYS.FINANCIAMIENTOS, JSON.stringify(INITIAL_FINANCIAMIENTOS));
    localStorage.setItem(KEYS.REINTEGROS, JSON.stringify(INITIAL_REINTEGROS));
  }
}
