import { Paciente, Pago, Usuario, ActividadCRM, FinanciamientoCirugia, Reintegro } from '../types';

export const INITIAL_PACIENTES: Paciente[] = [
  {
    id: 'P-2026-0130',
    cedula: 'V-18492031',
    nombre: 'Valentina Mendoza Silva',
    genero: 'Femenino',
    correo: 'valentina.mendoza@email.com',
    telefono: '+58 414 555-0192',
    contactada: 'Atendida - En Plan Financiamiento',
    fecha: '2026-01-15',
    promocion: 'Instagram - Campaña Verano Estético',
    procedimiento: 'Mamoplastia de Aumento + Mastopexia',
    direccion: 'Av. Principal de Las Mercedes, Edif. Altamira, Apto 4B, Caracas'
  },
  {
    id: 'P-2026-0131',
    cedula: 'V-21394012',
    nombre: 'Sofia Carolina Gomez',
    genero: 'Femenino',
    correo: 'sofia.gomez@gmail.com',
    telefono: '+58 412 888-3411',
    contactada: 'Contactada WhatsApp',
    fecha: '2026-01-18',
    promocion: 'TikTok - Dra. Belleza Live',
    procedimiento: 'Rinoplastia Ultrasónica Estructurada',
    direccion: 'Urb. La Castellana, Res. Los Pinos, Chacao'
  },
  {
    id: 'P-2026-0132',
    cedula: 'V-16982341',
    nombre: 'Mariana Isabel Torres',
    genero: 'Femenino',
    correo: 'marianatorres.med@gmail.com',
    telefono: '+58 424 123-9988',
    contactada: 'Evaluación Médica Realizada',
    fecha: '2026-02-01',
    promocion: 'Recomendación Paciente VIP',
    procedimiento: 'Lipoescultura HD 360 + BBL',
    direccion: 'Urb. El Cafetal, Av. Santa Ana, Quinta San José'
  },
  {
    id: 'P-2026-0133',
    cedula: 'V-19827364',
    nombre: 'Alejandro José Benítez',
    genero: 'Masculino',
    correo: 'abenitez.consultor@gmail.com',
    telefono: '+58 416 999-4422',
    contactada: 'Agendado Quirófano',
    fecha: '2026-02-05',
    promocion: 'Google Ads Search',
    procedimiento: 'Ginecomastia + Marcación Abdominal',
    direccion: 'Urb. San Roman, Calle Cagua, Quinta El Sol'
  },
  {
    id: 'P-2026-0134',
    cedula: 'V-24112908',
    nombre: 'Camila Andrea Rivas',
    genero: 'Femenino',
    correo: 'camilatrends@hotmail.com',
    telefono: '+58 412 333-1100',
    contactada: 'Recordatorio Cuota Enviado',
    fecha: '2026-02-10',
    promocion: 'Instagram Reels',
    procedimiento: 'Abdominoplastia + Lipo 360',
    direccion: 'Urb. Terrazas del Ávila, Calle 3, Apto 12'
  }
];

export const INITIAL_PAGOS: Pago[] = [
  {
    fecha: '2026-01-15',
    cod: 'REC-2026-001',
    id: 'P-2026-0130',
    nombre: 'Valentina Mendoza Silva',
    descripcion: 'Abono Inicial - Plan Financiamiento Mamoplastia',
    metodoDePago: 'Zelle',
    referencia: 'ZEL-994827102',
    cargo: 4500,
    abono: 1500,
    diasVcto: 30,
    estatus: 'Activo',
    mesProximaAccion: 'Febrero 2026',
    fechaProximaAccion: '2026-02-15',
    proximaAccion: 'Cobro Cuota #2 - $1,000 USD'
  },
  {
    fecha: '2026-02-01',
    cod: 'REC-2026-002',
    id: 'P-2026-0130',
    nombre: 'Valentina Mendoza Silva',
    descripcion: 'Segundo Abono Cuota #2 - Mamoplastia',
    metodoDePago: 'Zelle',
    referencia: 'ZEL-104928374',
    cargo: 0,
    abono: 1000,
    diasVcto: 30,
    estatus: 'Activo',
    mesProximaAccion: 'Marzo 2026',
    fechaProximaAccion: '2026-03-01',
    proximaAccion: 'Cobro Cuota #3 - $1,000 USD'
  },
  {
    fecha: '2026-01-20',
    cod: 'REC-2026-003',
    id: 'P-2026-0131',
    nombre: 'Sofia Carolina Gomez',
    descripcion: 'Abono Reservación Quirófano - Rinoplastia',
    metodoDePago: 'Efectivo USD',
    referencia: 'EF-CASH-8812',
    cargo: 3800,
    abono: 1200,
    diasVcto: 15,
    estatus: 'Moroso',
    mesProximaAccion: 'Febrero 2026',
    fechaProximaAccion: '2026-02-02',
    proximaAccion: 'URGENTE: Cuota Vencida - Recordatorio por Llamada'
  },
  {
    fecha: '2026-02-02',
    cod: 'REC-2026-004',
    id: 'P-2026-0132',
    nombre: 'Mariana Isabel Torres',
    descripcion: 'Abono Inicial - Lipoescultura HD 360',
    metodoDePago: 'Mercantil',
    referencia: 'MER-883920112',
    cargo: 5200,
    abono: 2000,
    diasVcto: 30,
    estatus: 'Activo',
    mesProximaAccion: 'Marzo 2026',
    fechaProximaAccion: '2026-03-02',
    proximaAccion: 'Cobro Cuota #2 - $1,600 USD'
  },
  {
    fecha: '2026-02-06',
    cod: 'REC-2026-005',
    id: 'P-2026-0133',
    nombre: 'Alejandro José Benítez',
    descripcion: 'Pago Total - Ginecomastia + Marcación',
    metodoDePago: 'Zelle',
    referencia: 'ZEL-554192083',
    cargo: 3200,
    abono: 3200,
    diasVcto: 0,
    estatus: 'Pagado',
    mesProximaAccion: 'Febrero 2026',
    fechaProximaAccion: '2026-02-12',
    proximaAccion: 'Evaluación Médica Pre-Anestésica'
  }
];

export const INITIAL_USUARIOS: Usuario[] = [
  {
    usuarioId: 'USR-001',
    nombre: 'Edgar Morales',
    email: 'edgarmorales.asistente@gmail.com',
    passwordHash: '12697670',
    rol: 'Administrador',
    estatus: 'Activo',
    fechaCreacion: '2026-01-01'
  }
];

export const INITIAL_ACTIVIDADES: ActividadCRM[] = [
  {
    actividadId: 'ACT-001',
    pacienteId: 'P-2026-0130',
    tipoActividad: 'Recordatorio de Pago',
    descripcion: 'Llamada de confirmación para cuota de abono #3 de Mamoplastia ($1,000 USD)',
    fechaProgramada: '2026-08-03',
    hora: '10:30',
    estado: 'Pendiente',
    alarma: true,
    responsableId: 'USR-002'
  },
  {
    actividadId: 'ACT-002',
    pacienteId: 'P-2026-0131',
    tipoActividad: 'Llamada',
    descripcion: 'Contacto para cobro de cuota en mora de Rinoplastia. Ofrecer refinanciamiento.',
    fechaProgramada: '2026-08-03',
    hora: '14:00',
    estado: 'Pendiente',
    alarma: true,
    responsableId: 'USR-004'
  },
  {
    actividadId: 'ACT-003',
    pacienteId: 'P-2026-0132',
    tipoActividad: 'Evaluación',
    descripcion: 'Consulta con Dra. Belleza para entrega de exámenees pre-quirúrgicos y firma de contrato',
    fechaProgramada: '2026-08-04',
    hora: '11:00',
    estado: 'Pendiente',
    alarma: true,
    responsableId: 'USR-001'
  },
  {
    actividadId: 'ACT-004',
    pacienteId: 'P-2026-0133',
    tipoActividad: 'Cita',
    descripcion: 'Evaluación Anestésica Pre-Quirúrgica con Dr. Mendoza en clínica',
    fechaProgramada: '2026-08-05',
    hora: '09:00',
    estado: 'Pendiente',
    alarma: false,
    responsableId: 'USR-003'
  },
  {
    actividadId: 'ACT-005',
    pacienteId: 'P-2026-0134',
    tipoActividad: 'Seguimiento Postquirúrgico',
    descripcion: 'Control 15 días post-operatorio de Abdominoplastia. Retiro de puntos.',
    fechaProgramada: '2026-08-06',
    hora: '15:30',
    estado: 'Pendiente',
    alarma: true,
    responsableId: 'USR-001'
  }
];

export const INITIAL_FINANCIAMIENTOS: FinanciamientoCirugia[] = [
  {
    planId: 'FIN-2026-001',
    pacienteId: 'P-2026-0130',
    procedimiento: 'Mamoplastia de Aumento + Mastopexia',
    costoTotalCirugia: 4500,
    cuotasTotales: 4,
    montoAbonado: 2500,
    saldoPendiente: 2000,
    estadoFinanciero: 'Al día',
    fechaInicio: '2026-01-15',
    fechaEstimadaCirugia: '2026-03-20'
  },
  {
    planId: 'FIN-2026-002',
    pacienteId: 'P-2026-0131',
    procedimiento: 'Rinoplastia Ultrasónica Estructurada',
    costoTotalCirugia: 3800,
    cuotasTotales: 3,
    montoAbonado: 1200,
    saldoPendiente: 2600,
    estadoFinanciero: 'En Reintegro',
    fechaInicio: '2026-01-20',
    fechaEstimadaCirugia: '2026-04-10'
  },
  {
    planId: 'FIN-2026-003',
    pacienteId: 'P-2026-0132',
    procedimiento: 'Lipoescultura HD 360 + BBL',
    costoTotalCirugia: 5200,
    cuotasTotales: 4,
    montoAbonado: 2000,
    saldoPendiente: 3200,
    estadoFinanciero: 'Al día',
    fechaInicio: '2026-02-02',
    fechaEstimadaCirugia: '2026-04-25'
  },
  {
    planId: 'FIN-2026-004',
    pacienteId: 'P-2026-0133',
    procedimiento: 'Ginecomastia + Marcación Abdominal',
    costoTotalCirugia: 3200,
    cuotasTotales: 1,
    montoAbonado: 3200,
    saldoPendiente: 0,
    estadoFinanciero: 'Pagado Totalmente',
    fechaInicio: '2026-02-06',
    fechaEstimadaCirugia: '2026-02-20'
  },
  {
    planId: 'FIN-2026-005',
    pacienteId: 'P-2026-0134',
    procedimiento: 'Abdominoplastia + Lipo 360',
    costoTotalCirugia: 5800,
    cuotasTotales: 5,
    montoAbonado: 1800,
    saldoPendiente: 4000,
    estadoFinanciero: 'Al día',
    fechaInicio: '2026-02-10',
    fechaEstimadaCirugia: '2026-05-15'
  }
];

export const INITIAL_REINTEGROS: Reintegro[] = [
  {
    reintegroId: 'REINT-2026-001',
    planId: 'FIN-2026-002',
    pacienteId: 'P-2026-0131',
    fechaSolicitud: '2026-02-15',
    fechaAprobacion: '2026-02-16',
    totalAbonado: 1200,
    gastosAdmin20: 240,
    montoNetoReintegro: 960,
    plazoMeses: 1,
    esExcepcion10Dias: false,
    montoCuotaMensual: 960,
    montoEfectivamentePagado: 480,
    saldoPendiente: 480,
    estadoReintegro: 'Parcialmente Pagado',
    fechaEstimadaCulminacion: '2026-03-15',
    observaciones: 'Solicitud por traslado laboral fuera del país.',
    motivo: 'Motivo Personal / Traslado'
  }
];
