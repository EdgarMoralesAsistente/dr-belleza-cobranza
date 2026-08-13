import {
  Paciente,
  Pago,
  Usuario,
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
import { calculatePaymentSchedule } from './financingConfig';

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

export function normalizePaciente(p: any): Paciente {
  if (!p || typeof p !== 'object') {
    return {
      id: `PAC-${Date.now()}`,
      cedula: 'V-00000000',
      nombre: 'Paciente sin nombre',
      genero: 'Femenino',
      correo: 'paciente@gmail.com',
      telefono: '0412-0000000',
      contactada: 'Por Contactar',
      fecha: new Date().toISOString().split('T')[0],
      promocion: 'Directo',
      procedimiento: 'Consulta General',
      direccion: 'Sin dirección'
    };
  }
  return {
    id: String(p.id || p.ID || p.Id || `PAC-${Date.now()}`),
    cedula: String(p.cedula || p.CEDULA || p.Cedula || 'V-00000000'),
    nombre: String(p.nombre || p.NOMBRE || p.Nombre || 'Paciente sin nombre'),
    genero: (p.genero || p.GENERO || p.Genero || 'Femenino') as any,
    correo: String(p.correo || p.CORREO || p.Correo || 'paciente@gmail.com'),
    telefono: String(p.telefono || p.TELEFONO || p.Telefono || '0412-0000000'),
    contactada: String(p.contactada || p.CONTACTADA || p.Contactada || 'Por Contactar'),
    fecha: String(p.fecha || p.FECHA || p.Fecha || new Date().toISOString().split('T')[0]),
    promocion: String(p.promocion || p.PROMOCION || p.Promocion || 'Directo'),
    procedimiento: String(p.procedimiento || p.PROCEDIMIENTO || p.Procedimiento || 'Consulta General'),
    direccion: String(p.direccion || p.DIRECCION || p.Direccion || 'Sin dirección')
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
    rol: (u.rol || u.Rol || u.ROL || 'Asistente') as any,
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
      list = localStorage.getItem('drb_clean_mode') === 'true' ? [] : INITIAL_PACIENTES;
    }
    return list.map(normalizePaciente);
  }

  static savePacientes(list: Paciente[]): void {
    const normalized = (list || []).map(normalizePaciente);
    localStorage.setItem(KEYS.PACIENTES, JSON.stringify(normalized));
    window.dispatchEvent(new Event('storage'));
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
      list = localStorage.getItem('drb_clean_mode') === 'true' ? [] : INITIAL_PAGOS;
    }
    return list.map(normalizePago);
  }

  static savePagos(list: Pago[]): void {
    const normalized = (list || []).map(normalizePago);
    localStorage.setItem(KEYS.PAGOS, JSON.stringify(normalized));
    window.dispatchEvent(new Event('storage'));
  }

  static getUsuarios(): Usuario[] {
    const data = localStorage.getItem(KEYS.USUARIOS);
    let list: Usuario[] = [];
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) list = parsed;
      } catch (e) {
        list = INITIAL_USUARIOS;
      }
    } else {
      list = INITIAL_USUARIOS;
    }
    list = list.map(normalizeUsuario);
    
    // Purgar usuarios antiguos de demostración
    const oldDemoEmails = [
      'dra.isabella@drbelleza.com',
      'maria.crm@drbelleza.com',
      'dr.mendoza@drbelleza.com',
      'carlos.finanzas@drbelleza.com'
    ];
    const initialCount = list.length;
    list = list.filter(u => u && u.email && !oldDemoEmails.includes(u.email.toLowerCase()));

    const edgarExists = list.some(u => u && u.email && u.email.toLowerCase() === 'edgarmorales.asistente@gmail.com');
    if (!edgarExists) {
      list = [INITIAL_USUARIOS[0], ...list];
    }

    if (list.length !== initialCount || !data) {
      localStorage.setItem(KEYS.USUARIOS, JSON.stringify(list));
    }
    return list;
  }

  static saveUsuarios(list: Usuario[]): void {
    const normalized = (list || []).map(normalizeUsuario);
    localStorage.setItem(KEYS.USUARIOS, JSON.stringify(normalized));
    window.dispatchEvent(new Event('storage'));
  }

  static getUserRoles(): string[] {
    const data = localStorage.getItem(KEYS.USER_ROLES);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_USER_ROLES;
  }

  static saveUserRoles(roles: string[]): void {
    localStorage.setItem(KEYS.USER_ROLES, JSON.stringify(roles));
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
      rawList = localStorage.getItem('drb_clean_mode') === 'true' ? [] : INITIAL_ACTIVIDADES.map(normalizeActividad);
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
      list = localStorage.getItem('drb_clean_mode') === 'true' ? [] : INITIAL_FINANCIAMIENTOS;
    }
    return list.map(normalizeFinanciamiento);
  }

  static saveFinanciamientos(list: FinanciamientoCirugia[]): void {
    const normalized = (list || []).map(normalizeFinanciamiento);
    localStorage.setItem(KEYS.FINANCIAMIENTOS, JSON.stringify(normalized));
    window.dispatchEvent(new Event('storage'));
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
      list = localStorage.getItem('drb_clean_mode') === 'true' ? [] : INITIAL_REINTEGROS;
    }
    return list.map(normalizeReintegro);
  }

  static saveReintegros(list: Reintegro[]): void {
    const normalized = (list || []).map(normalizeReintegro);
    localStorage.setItem(KEYS.REINTEGROS, JSON.stringify(normalized));
    window.dispatchEvent(new Event('storage'));
  }

  static getGasUrl(): string {
    const savedUrl = localStorage.getItem(KEYS.GAS_URL);
    if (savedUrl && savedUrl.trim()) {
      return GasService.normalizeUrl(savedUrl);
    }
    const envUrl = (import.meta as any).env?.VITE_GAS_URL || (import.meta as any).env?.VITE_GOOGLE_SCRIPT_URL || '';
    return envUrl ? GasService.normalizeUrl(envUrl) : '';
  }

  static saveGasUrl(url: string): void {
    localStorage.setItem(KEYS.GAS_URL, url.trim());
  }

  static getAuthenticatedUser(): Usuario | null {
    const isLoggedIn = localStorage.getItem('drb_logged_in_v1') === 'true';
    const data = localStorage.getItem(KEYS.CURRENT_USER);
    if (isLoggedIn && data) {
      try {
        return JSON.parse(data);
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
    return users[0] || INITIAL_USUARIOS[0];
  }

  static setCurrentUser(user: Usuario): void {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    localStorage.setItem('drb_logged_in_v1', 'true');
  }

  static login(emailOrUser: string, password: string): { success: boolean; user?: Usuario; message?: string } {
    const cleanIdentifier = emailOrUser.trim().toLowerCase();
    const cleanPassword = password.trim();

    const users = this.getUsuarios();
    const foundUser = users.find(u => u && (
      (u.email && u.email.toLowerCase() === cleanIdentifier) ||
      (u.usuarioId && u.usuarioId.toLowerCase() === cleanIdentifier) ||
      (u.nombre && u.nombre.toLowerCase().includes(cleanIdentifier))
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

    // Verificar contraseña estrictamente
    const validPassword = foundUser.passwordHash === cleanPassword;

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
    const count = list.length + 130;
    return `P-2026-${String(count).padStart(4, '0')}`;
  }

  static generateReceiptCode(): string {
    const pagos = this.getPagos();
    const count = pagos.length + 1;
    return `REC-2026-${String(count).padStart(3, '0')}`;
  }

  static generateActivityId(): string {
    const list = this.getActividades();
    const count = list.length + 1;
    return `ACT-${String(count).padStart(3, '0')}`;
  }

  static generatePlanId(): string {
    const list = this.getFinanciamientos();
    const count = list.length + 1;
    return `FIN-2026-${String(count).padStart(3, '0')}`;
  }

  static generateReintegroId(): string {
    const list = this.getReintegros();
    const count = list.length + 1;
    return `REINT-2026-${String(count).padStart(3, '0')}`;
  }

  // --- OPERACIONES DE PACIENTES ---
  static addPaciente(paciente: Paciente): void {
    const list = this.getPacientes();
    list.unshift(paciente);
    this.savePacientes(list);

    // Sync si hay URL
    const gasUrl = this.getGasUrl();
    if (gasUrl) {
      GasService.sendPost(gasUrl, { action: 'addPaciente', paciente }).catch(console.error);
    }
  }

  static updatePaciente(paciente: Paciente): void {
    const list = this.getPacientes().map(p => p.id === paciente.id ? paciente : p);
    this.savePacientes(list);

    const gasUrl = this.getGasUrl();
    if (gasUrl) {
      GasService.sendPost(gasUrl, { action: 'updatePaciente', paciente }).catch(console.error);
    }
  }

  static deletePaciente(patientId: string): void {
    const targetPatient = this.getPacientes().find(p => p.id === patientId);
    if (!targetPatient) return;

    // 1. Eliminar Paciente de la lista
    const pacientes = this.getPacientes().filter(p => p.id !== patientId);
    this.savePacientes(pacientes);

    // 2. Eliminar Pagos vinculados
    const targetCedula = (targetPatient.cedula || '').trim().toLowerCase();
    const targetNombre = (targetPatient.nombre || '').trim().toLowerCase();

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

    // 6. Sync en segundo plano con Google Sheets si existe URL
    const gasUrl = this.getGasUrl();
    if (gasUrl) {
      GasService.sendPost(gasUrl, { action: 'deletePaciente', pacienteId: patientId }).catch(console.error);
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
      }).catch(console.error);
    }
  }

  // --- OPERACIONES CRM & ACTIVIDADES ---
  static addActividad(actividad: ActividadCRM): void {
    const list = this.getActividades();
    list.unshift(actividad);
    this.saveActividades(list);

    const gasUrl = this.getGasUrl();
    if (gasUrl) {
      GasService.sendPost(gasUrl, { action: 'addCRM', actividad }).catch(console.error);
    }
  }

  static updateActividad(actividad: ActividadCRM): void {
    const list = this.getActividades().map(a => a.actividadId === actividad.actividadId ? actividad : a);
    this.saveActividades(list);

    const gasUrl = this.getGasUrl();
    if (gasUrl) {
      GasService.sendPost(gasUrl, { action: 'updateCRM', actividad }).catch(console.error);
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
      GasService.sendPost(gasUrl, { action: 'saveFinanciamiento', financiamiento: plan }).catch(console.error);
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
      }).catch(console.error);
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
      }).catch(console.error);
    }

    return {
      success: true,
      reintegro: reint,
      pago: nuevoPagoEgreso,
      message: `Monto de $${monto.toLocaleString()} USD registrado con éxito.`
    };
  }

  // --- OPERACIONES DE USUARIOS ---
  static saveUsuario(usuario: Usuario): void {
    const list = this.getUsuarios();
    const index = list.findIndex(u => u.usuarioId === usuario.usuarioId);
    if (index !== -1) {
      list[index] = usuario;
    } else {
      list.push(usuario);
    }
    this.saveUsuarios(list);

    // Si se actualizó el usuario que tiene sesión activa, actualizar la sesión
    const current = this.getAuthenticatedUser();
    if (current && current.usuarioId === usuario.usuarioId) {
      this.setCurrentUser(usuario);
    }

    const gasUrl = this.getGasUrl();
    if (gasUrl) {
      GasService.sendPost(gasUrl, { action: 'saveUsuario', usuario }).catch(console.error);
    }
  }

  // --- SINCRONIZACIÓN COMPLETA DESDE GOOGLE SHEETS ---
  static async syncFromGas(): Promise<{ success: boolean; message: string }> {
    const gasUrl = this.getGasUrl();
    if (!gasUrl) {
      return { success: false, message: 'Ingresa primero la URL de tu Web App de Google Apps Script' };
    }

    try {
      const data = await GasService.sendGet(gasUrl, 'getAllData');
      if (data && data.success) {
        if (data.pacientes && Array.isArray(data.pacientes) && data.pacientes.length > 0) {
          const remotePacientes = data.pacientes.map(normalizePaciente).filter(p => p.id);
          const localPacientes = this.getPacientes();
          const mergedMap = new Map<string, Paciente>();

          remotePacientes.forEach(p => {
            if (p.id) mergedMap.set(p.id, p);
          });

          localPacientes.forEach(p => {
            if (!mergedMap.has(p.id)) {
              mergedMap.set(p.id, p);
            } else {
              const remote = mergedMap.get(p.id)!;
              if ((!remote.nombre || remote.nombre === 'Paciente sin nombre') && p.nombre && p.nombre !== 'Paciente sin nombre') {
                mergedMap.set(p.id, p);
              }
            }
          });

          this.savePacientes(Array.from(mergedMap.values()));
        }

        if (data.pagos && Array.isArray(data.pagos) && data.pagos.length > 0) {
          const remotePagos = data.pagos.map(normalizePago).filter(p => p.cod);
          const localPagos = this.getPagos();
          const mergedMap = new Map<string, Pago>();

          remotePagos.forEach(p => {
            if (p.cod) mergedMap.set(p.cod, p);
          });

          localPagos.forEach(p => {
            if (!mergedMap.has(p.cod)) {
              mergedMap.set(p.cod, p);
            }
          });

          this.savePagos(Array.from(mergedMap.values()));
        }

        if (data.usuarios && Array.isArray(data.usuarios) && data.usuarios.length > 0) {
          const remoteUsuarios = data.usuarios.map(normalizeUsuario).filter(u => u.usuarioId);
          const localUsuarios = this.getUsuarios();
          const mergedMap = new Map<string, Usuario>();

          remoteUsuarios.forEach(u => {
            if (u.usuarioId) mergedMap.set(u.usuarioId, u);
          });

          localUsuarios.forEach(u => {
            if (!mergedMap.has(u.usuarioId)) {
              mergedMap.set(u.usuarioId, u);
            }
          });

          this.saveUsuarios(Array.from(mergedMap.values()));
        }

        if (data.actividades && Array.isArray(data.actividades) && data.actividades.length > 0) {
          const remoteCRM = data.actividades.map(normalizeActividad).filter(a => a.actividadId);
          const localCRM = this.getActividades();
          const mergedMap = new Map<string, ActividadCRM>();

          remoteCRM.forEach(a => {
            if (a.actividadId) mergedMap.set(a.actividadId, a);
          });

          localCRM.forEach(a => {
            if (!mergedMap.has(a.actividadId)) {
              mergedMap.set(a.actividadId, a);
            }
          });

          this.saveActividades(Array.from(mergedMap.values()));
        }

        if (data.financiamientos && Array.isArray(data.financiamientos) && data.financiamientos.length > 0) {
          const remoteFin = data.financiamientos.map(normalizeFinanciamiento).filter(f => f.planId);
          const localFin = this.getFinanciamientos();
          const mergedMap = new Map<string, FinanciamientoCirugia>();

          remoteFin.forEach(f => {
            if (f.planId) mergedMap.set(f.planId, f);
          });

          localFin.forEach(f => {
            if (!mergedMap.has(f.planId)) {
              mergedMap.set(f.planId, f);
            }
          });

          this.saveFinanciamientos(Array.from(mergedMap.values()));
        }

        if (data.reintegros && Array.isArray(data.reintegros) && data.reintegros.length > 0) {
          const remoteReint = data.reintegros.map(normalizeReintegro).filter(r => r.reintegroId);
          const localReint = this.getReintegros();
          const mergedMap = new Map<string, Reintegro>();

          remoteReint.forEach(r => {
            if (r.reintegroId) mergedMap.set(r.reintegroId, r);
          });

          localReint.forEach(r => {
            if (!mergedMap.has(r.reintegroId)) {
              mergedMap.set(r.reintegroId, r);
            }
          });

          this.saveReintegros(Array.from(mergedMap.values()));
        }

        localStorage.setItem(KEYS.LAST_SYNC, new Date().toISOString());
        return { success: true, message: '¡Datos descargados y sincronizados correctamente desde Google Sheets!' };
      }
      return { success: false, message: data.error || 'Respuesta de sincronización no válida.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error durante la sincronización.' };
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
        reintegros: this.getReintegros()
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

  // --- CONFIGURACIÓN DEL SISTEMA ---
  static getCatalog(): any[] {
    const data = localStorage.getItem(KEYS.CATALOG);
    if (data) return JSON.parse(data);
    return [];
  }

  static saveCatalog(list: any[]): void {
    localStorage.setItem(KEYS.CATALOG, JSON.stringify(list));
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
    
    // Dejar únicamente al Administrador inicial (Edgar Morales) en usuarios
    const adminOnly = [INITIAL_USUARIOS[0]];
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
