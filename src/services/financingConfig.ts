import { Paciente, FinanciamientoCirugia, Pago, Reintegro } from '../types';
import { StorageService } from './storageService';

export interface ProcedureCatalogItem {
  id: string;
  nombre: string;
  categoria: string;
  precioDefault: number;
  activo?: boolean;
}

export interface CouponItem {
  codigo: string;
  descripcion: string;
  tipo: 'porcentaje' | 'monto_fijo';
  valor: number; // Ej: 10 para 10% o 500 para $500
  activo: boolean;
}

export interface FinancingPlanOption {
  id: string;
  nombre: string;
  meses: number;
  cuotas: number;
  frecuencia: string;
  descripcion: string;
  activo?: boolean;
}

export interface ClinicConfig {
  nombreClinica: string;
  subtitulo: string;
  doctorRepresentante: string;
  direccion: string;
  telefono: string;
  email: string;
  logoTexto: string;
  terminosReporte: string;
}

// Catálogo de Procedimientos Quirúrgicos Estéticos Inicial
export const INITIAL_PROCEDURES_CATALOG: ProcedureCatalogItem[] = [
  { id: 'proc_1', nombre: 'Mamoplastia de Aumento', categoria: 'Mamas', precioDefault: 2500, activo: true },
  { id: 'proc_2', nombre: 'Lipoescultura HD 360°', categoria: 'Contorno Corporal', precioDefault: 3200, activo: true },
  { id: 'proc_3', nombre: 'Abdominoplastia / Dermolipectomía', categoria: 'Contorno Corporal', precioDefault: 3800, activo: true },
  { id: 'proc_4', nombre: 'Mastopexia con Prótesis', categoria: 'Mamas', precioDefault: 3400, activo: true },
  { id: 'proc_5', nombre: 'Lipoescultura HD 360° + Mamoplastia', categoria: 'Corporal + Mamas', precioDefault: 4800, activo: true },
  { id: 'proc_6', nombre: 'Abdominoplastia + Mastopexia', categoria: 'Corporal + Mamas', precioDefault: 5200, activo: true },
  { id: 'proc_7', nombre: 'Rinoplastia Ultrasónica Estructurada', categoria: 'Facial', precioDefault: 2800, activo: true },
  { id: 'proc_8', nombre: 'Bichectomía & Lipopada Ultrasónica', categoria: 'Facial', precioDefault: 1200, activo: true },
  { id: 'proc_9', nombre: 'Marcaje Abdominal (High Def)', categoria: 'Contorno Corporal', precioDefault: 1500, activo: true },
  { id: 'proc_10', nombre: 'Transferencia Glútea (BBL)', categoria: 'Contorno Corporal', precioDefault: 1800, activo: true },
  { id: 'proc_11', nombre: 'Blefaroplastia Superior e Inferior', categoria: 'Facial', precioDefault: 1400, activo: true },
  { id: 'proc_12', nombre: 'Otoplastia Bilateral', categoria: 'Facial', precioDefault: 1100, activo: true }
];

// Cupones de Descuento Preconfigurados Iniciales
export const INITIAL_COUPONS: CouponItem[] = [
  { codigo: 'NINGUNO', descripcion: 'Sin cupón aplicado', tipo: 'monto_fijo', valor: 0, activo: true },
  { codigo: 'VERANO10', descripcion: 'Promoción Verano Estético (10% Desc.)', tipo: 'porcentaje', valor: 10, activo: true },
  { codigo: 'VIP500', descripcion: 'Descuento Paciente VIP Preferencial ($500 USD)', tipo: 'monto_fijo', valor: 500, activo: true },
  { codigo: 'PRIMERACITA', descripcion: 'Incentivo Primera Consulta de Valoración (15% Desc.)', tipo: 'porcentaje', valor: 15, activo: true },
  { codigo: 'CONVENIO20', descripcion: 'Convenio Corporativo Especial (20% Desc.)', tipo: 'porcentaje', valor: 20, activo: true },
  { codigo: 'PRONTOPAGO5', descripcion: 'Bonificación Pago Contado (5% Desc.)', tipo: 'porcentaje', valor: 5, activo: true }
];

// Opciones de Planes de Financiamiento Iniciales
export const FINANCING_PLAN_OPTIONS: FinancingPlanOption[] = [
  { id: 'plan_contado', nombre: 'Pago de Contado (1 Cuota Directa)', meses: 1, cuotas: 1, frecuencia: 'Único pago', descripcion: 'Sin intereses ni plazos. Pago inmediato antes de la cirugía.', activo: true },
  { id: 'plan_3m', nombre: 'Plan Corto 3 Meses (6 Cuotas Quincenales)', meses: 3, cuotas: 6, frecuencia: 'Quincenal', descripcion: '6 cuotas quincenales fijas en un plazo de 3 meses.', activo: true },
  { id: 'plan_6m', nombre: 'Plan Semestral 6 Meses (6 Cuotas Mensuales)', meses: 6, cuotas: 6, frecuencia: 'Mensual', descripcion: '6 giros mensuales fijos previos o posteriores a la intervención.', activo: true },
  { id: 'plan_12m', nombre: 'Plan Estándar 12 Meses (12 Cuotas Mensuales)', meses: 12, cuotas: 12, frecuencia: 'Mensual', descripcion: '12 giros mensuales cómodos. El plan más solicitado.', activo: true },
  { id: 'plan_18m', nombre: 'Plan Extendido 18 Meses (18 Cuotas Mensuales)', meses: 18, cuotas: 18, frecuencia: 'Mensual', descripcion: '18 cuotas reducidas para máxima flexibilidad.', activo: true },
  { id: 'plan_24m', nombre: 'Plan VIP 24 Meses (24 Cuotas Mensuales)', meses: 24, cuotas: 24, frecuencia: 'Mensual', descripcion: '24 meses de financiamiento en cuotas mínimas.', activo: true }
];

// Configuración Predeterminada de la Clínica
export const DEFAULT_CLINIC_CONFIG: ClinicConfig = {
  nombreClinica: 'Centro Médico Estético & Cirugía Plástica',
  subtitulo: 'Unidad Especializada Dr. Belleza',
  doctorRepresentante: 'Dr. Alejandro Fernández — Cirujano Plástico Reconstructivo & Estético',
  direccion: 'Av. Principal de Las Mercedes, Edif. Altamira, Caracas',
  telefono: '+58 212 999-8877 / +58 412 555-0192',
  email: 'contacto@drbelleza.com',
  logoTexto: 'Dr. Belleza',
  terminosReporte: 'Este documento constituye una ficha oficial de registro quirúrgico y propuesta de financiamiento formal. Todos los precios y cuotas indicadas están expresadas en USD y sujetas a la evaluación médica preoperatoria definitiva.'
};

// Carga Dinámica desde Storage con Fallbacks
export function getActiveCatalog(): ProcedureCatalogItem[] {
  const stored = StorageService.getCatalog();
  if (stored && stored.length > 0) return stored;
  return INITIAL_PROCEDURES_CATALOG;
}

export function getActiveCoupons(): CouponItem[] {
  const stored = StorageService.getCoupons();
  if (stored && stored.length > 0) return stored;
  return INITIAL_COUPONS;
}

export function getActivePlanOptions(): FinancingPlanOption[] {
  const stored = StorageService.getPlanOptions();
  if (stored && stored.length > 0) return stored;
  return FINANCING_PLAN_OPTIONS;
}

export function getClinicConfig(): ClinicConfig {
  const stored = StorageService.getClinicConfig();
  if (stored && stored.nombreClinica) return stored;
  return DEFAULT_CLINIC_CONFIG;
}

export interface PaymentScheduleItem {
  numeroCuota: number;
  fechaVencimiento: string; // YYYY-MM-DD
  fechaFormateada: string; // DD/MM/YYYY
  montoCuota: number;
}

/**
 * Calcula el cronograma exacto de fechas de pago y montos para un plan de financiamiento.
 */
export function calculatePaymentSchedule(
  fechaInicioStr: string,
  cuotasTotales: number,
  saldoPendiente: number
): PaymentScheduleItem[] {
  if (cuotasTotales <= 0 || saldoPendiente <= 0) return [];

  const schedule: PaymentScheduleItem[] = [];
  const startDate = fechaInicioStr ? new Date(fechaInicioStr + 'T00:00:00') : new Date();
  const validStartDate = isNaN(startDate.getTime()) ? new Date() : startDate;

  const baseMonto = Math.floor(saldoPendiente / cuotasTotales);
  let acumulado = 0;

  for (let i = 1; i <= cuotasTotales; i++) {
    const dueDate = new Date(validStartDate);
    dueDate.setMonth(validStartDate.getMonth() + i);

    const year = dueDate.getFullYear();
    const month = String(dueDate.getMonth() + 1).padStart(2, '0');
    const day = String(dueDate.getDate()).padStart(2, '0');
    const dateISO = `${year}-${month}-${day}`;
    const dateFormatted = `${day}/${month}/${year}`;

    let monto = baseMonto;
    if (i === cuotasTotales) {
      monto = Math.max(0, saldoPendiente - acumulado);
    } else {
      acumulado += monto;
    }

    schedule.push({
      numeroCuota: i,
      fechaVencimiento: dateISO,
      fechaFormateada: dateFormatted,
      montoCuota: monto
    });
  }

  return schedule;
}

/**
 * Función para Imprimir y Exportar a PDF la Ficha Completa del Paciente
 * Ajustado 100% al estilo gráfico de la Web App (Slate/Teal Dark Banner, Cards, Grids, Typography)
 */
export function printPatientFinancingPDF(paciente: Paciente, plan?: FinanciamientoCirugia | null) {
  const printWindow = window.open('', '_blank', 'width=950,height=1000');
  if (!printWindow) return;

  const config = getClinicConfig();

  const fechaHoy = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const comboItems = plan?.comboProcedimientos || [
    { id: '1', nombre: paciente.procedimiento || 'Procedimiento Quirúrgico', precio: plan?.costoTotalCirugia || 3500 }
  ];

  const subtotal = plan?.costoSubtotal || plan?.costoTotalCirugia || comboItems.reduce((acc, item) => acc + item.precio, 0);
  const descuento = plan?.descuentoMonto || 0;
  const totalNeto = plan?.costoTotalCirugia || (subtotal - descuento);
  const inicial = plan?.montoAbonado || 0;
  const saldo = plan?.saldoPendiente ?? (totalNeto - inicial);
  const cuotas = plan?.cuotasTotales || 1;
  const tipoPago = plan?.tipoPago || (cuotas <= 1 ? 'Contado' : 'Plan de Financiamiento');
  const cupon = plan?.cuponCodigo && plan.cuponCodigo !== 'NINGUNO' ? plan.cuponCodigo : 'Sin cupón';

  // Generación del cronograma de cuotas
  let cuotasHtml = '';
  if (cuotas > 1 && saldo > 0) {
    const schedule = calculatePaymentSchedule(plan?.fechaInicio || new Date().toISOString().split('T')[0], cuotas, saldo);
    schedule.forEach((item, index) => {
      const rowBg = index % 2 === 0 ? '#f8fafc' : '#ffffff';
      cuotasHtml += `
        <tr style="background-color: ${rowBg};">
          <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #0f172a;">Cuota #${item.numeroCuota}</td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #475569; font-weight: 500;">${item.fechaFormateada}</td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 800; color: #0f766e; font-size: 13px;">$${item.montoCuota.toLocaleString('en-US')} USD</td>
        </tr>
      `;
    });
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ficha Quirúrgica & Plan Financiero — ${paciente.nombre}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      <style>
        @page {
          size: letter;
          margin: 12mm;
        }
        * {
          box-sizing: border-box;
        }
        body {
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 24px;
          background-color: #ffffff;
          font-size: 12px;
          line-height: 1.5;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* HEADER BANNER DARK SLATE & TEAL */
        .brand-header {
          background-color: #0f172a;
          color: #ffffff;
          padding: 20px 24px;
          border-radius: 12px;
          border-bottom: 4px solid #0d9488;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 22px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .clinic-brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .clinic-logo-icon {
          width: 44px;
          height: 44px;
          background-color: #0d9488;
          color: #ffffff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 700;
          font-size: 20px;
          box-shadow: inset 0 0 10px rgba(0,0,0,0.15);
        }
        .clinic-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.3px;
          margin: 0;
        }
        .clinic-subtitle {
          font-size: 11px;
          color: #2dd4bf;
          font-weight: 600;
          margin-top: 2px;
        }
        .doc-badge {
          background-color: #1e293b;
          border: 1px solid #334155;
          color: #ffffff;
          padding: 8px 14px;
          border-radius: 10px;
          text-align: right;
        }
        .doc-badge-id {
          font-size: 11px;
          font-weight: 800;
          color: #2dd4bf;
          letter-spacing: 0.5px;
        }
        .doc-badge-date {
          font-size: 10px;
          color: #94a3b8;
          margin-top: 2px;
        }

        /* SECTION TITLES WITH TEAL ACCENT */
        .section-title {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #0f766e;
          background-color: #f0fdfa;
          padding: 8px 12px;
          border-left: 4px solid #0d9488;
          border-radius: 0 6px 6px 0;
          margin-top: 22px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* CARDS & GRIDS */
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .info-card {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px 16px;
        }
        .info-label {
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #64748b;
          display: block;
          margin-bottom: 2px;
        }
        .info-value {
          font-size: 12px;
          font-weight: 700;
          color: #0f172a;
        }

        /* TABLES */
        table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin-top: 8px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
        }
        th {
          background-color: #0f172a;
          color: #ffffff;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          text-align: left;
          padding: 10px 14px;
        }
        td {
          padding: 10px 14px;
          border-bottom: 1px solid #f1f5f9;
        }

        /* SUMMARY BOX */
        .summary-box {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #ffffff;
          padding: 16px 20px;
          border-radius: 12px;
          border: 1px solid #334155;
          margin-top: 14px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          font-size: 12px;
        }
        .summary-row.total {
          border-top: 1px solid #334155;
          padding-top: 10px;
          margin-top: 6px;
          font-size: 15px;
          font-weight: 800;
        }

        /* FIRMAS & FOOTER */
        .signatures {
          margin-top: 40px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          page-break-inside: avoid;
        }
        .sig-box {
          border-top: 2px solid #cbd5e1;
          text-align: center;
          padding-top: 10px;
          font-size: 11px;
          color: #475569;
        }
        .sig-title {
          font-weight: 800;
          color: #0f172a;
          font-size: 12px;
        }

        .footer-terms {
          margin-top: 30px;
          padding-top: 12px;
          border-top: 1px solid #e2e8f0;
          font-size: 9px;
          color: #94a3b8;
          text-align: center;
          line-height: 1.4;
        }

        @media print {
          body { padding: 0; background: #fff; }
          .no-print { display: none; }
          .brand-header { box-shadow: none; }
        }
      </style>
    </head>
    <body>

      <!-- HEADER BANNER BRANDING -->
      <div class="brand-header">
        <div class="clinic-brand">
          <div class="clinic-logo-icon">DB</div>
          <div>
            <h1 class="clinic-title">${config.nombreClinica}</h1>
            <div class="clinic-subtitle">${config.subtitulo}</div>
          </div>
        </div>
        <div class="doc-badge">
          <div class="doc-badge-id">REGISTRO #${paciente.id}</div>
          <div class="doc-badge-date">Fecha: ${fechaHoy}</div>
        </div>
      </div>

      <!-- 1. INFORMACIÓN PERSONAL Y MÉDICA -->
      <div class="section-title">
        <span>1. Información Personal del Paciente</span>
        <span style="color: #64748b; font-size: 10px; font-weight: 600;">Expediente Médico CRM</span>
      </div>

      <div class="grid-2">
        <div class="info-card">
          <span class="info-label">Nombre y Apellidos</span>
          <div class="info-value" style="font-size: 14px; color: #0f766e;">${paciente.nombre}</div>

          <div style="margin-top: 10px;">
            <span class="info-label">Cédula / Documento de Identidad</span>
            <div class="info-value">${paciente.cedula}</div>
          </div>

          <div style="margin-top: 10px;">
            <span class="info-label">Teléfono de Contacto</span>
            <div class="info-value">${paciente.telefono}</div>
          </div>
        </div>

        <div class="info-card">
          <span class="info-label">Correo Electrónico</span>
          <div class="info-value">${paciente.correo}</div>

          <div style="margin-top: 10px;">
            <span class="info-label">Campaña / Promoción de Origen</span>
            <div class="info-value" style="color: #6b21a8;">${paciente.promocion}</div>
          </div>

          <div style="margin-top: 10px;">
            <span class="info-label">Dirección de Residencia</span>
            <div class="info-value">${paciente.direccion}</div>
          </div>
        </div>
      </div>

      <!-- 2. COMBO QUIRÚRGICO SELECCIONADO -->
      <div class="section-title">
        <span>2. Combo Quirúrgico & Procedimientos</span>
        <span style="color: #64748b; font-size: 10px; font-weight: 600;">Intervención Programada</span>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 40px;">#</th>
            <th>Procedimiento Quirúrgico Estético</th>
            <th style="text-align: right; width: 160px;">Costo Base ($ USD)</th>
          </tr>
        </thead>
        <tbody>
          ${comboItems.map((item, index) => {
            const rowBg = index % 2 === 0 ? '#ffffff' : '#f8fafc';
            return `
              <tr style="background-color: ${rowBg};">
                <td style="font-weight: 800; color: #64748b;">${index + 1}</td>
                <td style="font-weight: 700; color: #0f172a;">${item.nombre}</td>
                <td style="text-align: right; font-weight: 800; color: #0d9488; font-size: 13px;">$${item.precio.toLocaleString()} USD</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <!-- 3. DESGLOSE DEL PLAN FINANCIERO Y FORMA DE PAGO -->
      <div class="section-title">
        <span>3. Desglose del Plan Financiero y Forma de Pago</span>
        <span style="color: #64748b; font-size: 10px; font-weight: 600;">Acuerdo Comercial</span>
      </div>

      <div class="grid-2">
        <div class="info-card">
          <span class="info-label">Tipo de Modalidad de Pago</span>
          <div class="info-value" style="font-size: 14px; font-weight: 800; color: #0f766e;">
            ${tipoPago.toUpperCase()}
          </div>

          <div style="margin-top: 10px;">
            <span class="info-label">Cupón de Descuento Aplicado</span>
            <div class="info-value" style="color: #7e22ce;">
              ${cupon} ${descuento > 0 ? `(-$${descuento.toLocaleString()} USD)` : ''}
            </div>
          </div>

          <div style="margin-top: 10px;">
            <span class="info-label">Plazo & Número de Cuotas</span>
            <div class="info-value">${cuotas} cuota(s) programada(s)</div>
          </div>
        </div>

        <div class="summary-box">
          <div class="summary-row">
            <span style="color: #94a3b8;">Subtotal Combo Quirúrgico:</span>
            <strong style="color: #e2e8f0;">$${subtotal.toLocaleString()} USD</strong>
          </div>

          <div class="summary-row">
            <span style="color: #4ade80;">Descuento por Cupón:</span>
            <strong style="color: #4ade80;">-$${descuento.toLocaleString()} USD</strong>
          </div>

          <div class="summary-row total">
            <span style="color: #2dd4bf;">TOTAL NETO CIRUGÍA:</span>
            <span style="color: #2dd4bf;">$${totalNeto.toLocaleString()} USD</span>
          </div>

          <div class="summary-row" style="margin-top: 8px; border-top: 1px dashed #334155; padding-top: 6px;">
            <span style="color: #38bdf8;">Abono / Inicial Pagada:</span>
            <strong style="color: #38bdf8;">$${inicial.toLocaleString()} USD</strong>
          </div>

          <div class="summary-row" style="font-size: 13px; font-weight: 800; color: #f59e0b;">
            <span>SALDO PENDIENTE A FINANCIAR:</span>
            <span>$${saldo.toLocaleString()} USD</span>
          </div>
        </div>
      </div>

      <!-- 4. CRONOGRAMA ESTIMADO DE CUOTAS -->
      ${cuotasHtml ? `
        <div class="section-title">
          <span>4. Cronograma Estimado de Cuotas Mensuales</span>
          <span style="color: #64748b; font-size: 10px; font-weight: 600;">Calendario de Pagos</span>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 120px;">N° Cuota</th>
              <th>Fecha de Vencimiento Estimada</th>
              <th style="text-align: right; width: 180px;">Monto Cuota ($ USD)</th>
            </tr>
          </thead>
          <tbody>
            ${cuotasHtml}
          </tbody>
        </table>
      ` : ''}

      <!-- 5. FIRMAS DE CONFORMIDAD -->
      <div class="signatures">
        <div class="sig-box">
          <div class="sig-title">Firma de la Paciente</div>
          <div style="font-weight: 700; color: #0f172a; margin-top: 4px;">${paciente.nombre}</div>
          <div style="font-size: 10px; color: #64748b;">C.I / Doc: ${paciente.cedula}</div>
          <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">Conforme con el Plan Quirúrgico y Financiero</div>
        </div>

        <div class="sig-box">
          <div class="sig-title">Cirujano Plástico / Representante Médico</div>
          <div style="font-weight: 700; color: #0f172a; margin-top: 4px;">${config.doctorRepresentante}</div>
          <div style="font-size: 10px; color: #64748b;">${config.nombreClinica}</div>
          <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">Dirección Médica & Unidad Quirúrgica</div>
        </div>
      </div>

      <!-- FOOTER TERMINOS -->
      <div class="footer-terms">
        <strong>${config.nombreClinica}</strong> — ${config.direccion} — Tel: ${config.telefono} — ${config.email}<br>
        ${config.terminosReporte}
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>

    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

/**
 * Función para Imprimir y Exportar a PDF el Recibo Oficial de Pago / Abono
 * Cumple 100% con el mismo diseño y estilo gráfico del registro de paciente.
 */
export function printPaymentReceiptPDF(
  pago: Pago,
  paciente?: Paciente | null,
  financiamiento?: FinanciamientoCirugia | null
) {
  const printWindow = window.open('', '_blank', 'width=950,height=1000');
  if (!printWindow) return;

  const config = getClinicConfig();

  const fechaImpresion = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const abonoFormateado = (pago.abono || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const cargoTotal = (pago.cargo || financiamiento?.costoTotalCirugia || 0);
  const abonosAcumulados = (financiamiento?.montoAbonado || pago.abono || 0);
  const saldoRestante = financiamiento?.saldoPendiente ?? Math.max(0, cargoTotal - abonosAcumulados);

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recibo Oficial de Pago — ${pago.cod} — ${pago.nombre}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      <style>
        @page {
          size: letter;
          margin: 12mm;
        }
        * {
          box-sizing: border-box;
        }
        body {
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 24px;
          background-color: #ffffff;
          font-size: 12px;
          line-height: 1.5;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* HEADER BANNER DARK SLATE & TEAL */
        .brand-header {
          background-color: #0f172a;
          color: #ffffff;
          padding: 20px 24px;
          border-radius: 12px;
          border-bottom: 4px solid #0d9488;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 22px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .clinic-brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .clinic-logo-icon {
          width: 44px;
          height: 44px;
          background-color: #0d9488;
          color: #ffffff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 700;
          font-size: 20px;
          box-shadow: inset 0 0 10px rgba(0,0,0,0.15);
        }
        .clinic-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.3px;
          margin: 0;
        }
        .clinic-subtitle {
          font-size: 11px;
          color: #2dd4bf;
          font-weight: 600;
          margin-top: 2px;
        }
        .doc-badge {
          background-color: #1e293b;
          border: 1px solid #334155;
          color: #ffffff;
          padding: 8px 14px;
          border-radius: 10px;
          text-align: right;
        }
        .doc-badge-id {
          font-size: 11px;
          font-weight: 800;
          color: #2dd4bf;
          letter-spacing: 0.5px;
        }
        .doc-badge-date {
          font-size: 10px;
          color: #94a3b8;
          margin-top: 2px;
        }

        /* SECTION TITLES WITH TEAL ACCENT */
        .section-title {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #0f766e;
          background-color: #f0fdfa;
          padding: 8px 12px;
          border-left: 4px solid #0d9488;
          border-radius: 0 6px 6px 0;
          margin-top: 22px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* CARDS & GRIDS */
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .info-card {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px 16px;
        }
        .info-label {
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #64748b;
          display: block;
          margin-bottom: 2px;
        }
        .info-value {
          font-size: 12px;
          font-weight: 700;
          color: #0f172a;
        }

        /* TABLES */
        table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin-top: 8px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
        }
        th {
          background-color: #0f172a;
          color: #ffffff;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          text-align: left;
          padding: 10px 14px;
        }
        td {
          padding: 10px 14px;
          border-bottom: 1px solid #f1f5f9;
        }

        /* SUMMARY BOX */
        .summary-box {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #ffffff;
          padding: 16px 20px;
          border-radius: 12px;
          border: 1px solid #334155;
          margin-top: 14px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          font-size: 12px;
        }
        .summary-row.total {
          border-top: 1px solid #334155;
          padding-top: 10px;
          margin-top: 6px;
          font-size: 15px;
          font-weight: 800;
        }

        /* FIRMAS & FOOTER */
        .signatures {
          margin-top: 40px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          page-break-inside: avoid;
        }
        .sig-box {
          border-top: 2px solid #cbd5e1;
          text-align: center;
          padding-top: 10px;
          font-size: 11px;
          color: #475569;
        }
        .sig-title {
          font-weight: 800;
          color: #0f172a;
          font-size: 12px;
        }

        .footer-terms {
          margin-top: 30px;
          padding-top: 12px;
          border-top: 1px solid #e2e8f0;
          font-size: 9px;
          color: #94a3b8;
          text-align: center;
          line-height: 1.4;
        }

        @media print {
          body { padding: 0; background: #fff; }
          .no-print { display: none; }
          .brand-header { box-shadow: none; }
        }
      </style>
    </head>
    <body>

      <!-- HEADER BANNER BRANDING -->
      <div class="brand-header">
        <div class="clinic-brand">
          <div class="clinic-logo-icon">DB</div>
          <div>
            <h1 class="clinic-title">${config.nombreClinica}</h1>
            <div class="clinic-subtitle">${config.subtitulo}</div>
          </div>
        </div>
        <div class="doc-badge">
          <div class="doc-badge-id">RECIBO #${pago.cod}</div>
          <div class="doc-badge-date">Fecha de Emisión: ${pago.fecha}</div>
        </div>
      </div>

      <!-- 1. INFORMACIÓN DEL PACIENTE & TRANSACCIÓN -->
      <div class="section-title">
        <span>1. Información del Paciente & Estado del Pago</span>
        <span style="color: #64748b; font-size: 10px; font-weight: 600;">Comprobante Digital Oficial</span>
      </div>

      <div class="grid-2">
        <div class="info-card">
          <span class="info-label">Paciente Titular</span>
          <div class="info-value" style="font-size: 14px; color: #0f766e;">${pago.nombre}</div>

          <div style="margin-top: 10px;">
            <span class="info-label">Código de Paciente</span>
            <div class="info-value">${pago.id}</div>
          </div>

          <div style="margin-top: 10px;">
            <span class="info-label">Cédula / Documento de Identidad</span>
            <div class="info-value">${paciente?.cedula || 'N/A'}</div>
          </div>
        </div>

        <div class="info-card">
          <span class="info-label">Estado de la Transacción</span>
          <div style="margin-top: 4px;">
            <span style="background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 4px 10px; border-radius: 6px; font-weight: 800; font-size: 11px; text-transform: uppercase;">
              ✓ CONFIRMADO & REGISTRADO
            </span>
          </div>

          <div style="margin-top: 14px;">
            <span class="info-label">Teléfono / Contacto</span>
            <div class="info-value">${paciente?.telefono || 'N/A'}</div>
          </div>

          <div style="margin-top: 10px;">
            <span class="info-label">Correo Electrónico</span>
            <div class="info-value">${paciente?.correo || 'N/A'}</div>
          </div>
        </div>
      </div>

      <!-- 2. DESGLOSE DEL ABONO RECIBIDO -->
      <div class="section-title">
        <span>2. Detalle del Abono y Método de Pago</span>
        <span style="color: #64748b; font-size: 10px; font-weight: 600;">Transacción Financiera</span>
      </div>

      <table>
        <thead>
          <tr>
            <th>Concepto / Descripción del Pago</th>
            <th>Método de Pago</th>
            <th>Referencia Bancaria</th>
            <th style="text-align: right; width: 170px;">Monto Cancelado ($ USD)</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background-color: #ffffff;">
            <td style="font-weight: 700; color: #0f172a;">${pago.descripcion}</td>
            <td style="font-weight: 700; color: #0f766e;">${pago.metodoDePago}</td>
            <td style="font-family: monospace; font-weight: 700; color: #475569;">${pago.referencia || 'N/A'}</td>
            <td style="text-align: right; font-weight: 800; color: #0d9488; font-size: 14px;">$${abonoFormateado} USD</td>
          </tr>
        </tbody>
      </table>

      <!-- 3. RESUMEN DEL ESTADO DEL PLAN QUIRÚRGICO -->
      <div class="section-title">
        <span>3. Estado Actual del Plan Quirúrgico & Saldo</span>
        <span style="color: #64748b; font-size: 10px; font-weight: 600;">Balance del Paciente</span>
      </div>

      <div class="summary-box">
        <div class="summary-row">
          <span style="color: #94a3b8;">Procedimiento Quirúrgico:</span>
          <strong style="color: #ffffff;">${financiamiento?.procedimiento || 'Evaluación & Tratamiento Quirúrgico'}</strong>
        </div>

        ${cargoTotal > 0 ? `
          <div class="summary-row" style="margin-top: 4px;">
            <span style="color: #94a3b8;">Costo Total Cirugía:</span>
            <strong style="color: #e2e8f0;">$${cargoTotal.toLocaleString()} USD</strong>
          </div>
        ` : ''}

        <div class="summary-row" style="margin-top: 4px;">
          <span style="color: #38bdf8;">Monto de este Abono:</span>
          <strong style="color: #38bdf8;">+$${abonoFormateado} USD</strong>
        </div>

        ${abonosAcumulados > 0 ? `
          <div class="summary-row">
            <span style="color: #4ade80;">Total Abonado Acumulado:</span>
            <strong style="color: #4ade80;">$${abonosAcumulados.toLocaleString()} USD</strong>
          </div>
        ` : ''}

        <div class="summary-row total">
          <span style="color: #2dd4bf;">SALDO PENDIENTE RESTANTE:</span>
          <span style="color: #2dd4bf;">$${saldoRestante.toLocaleString()} USD</span>
        </div>
      </div>

      <!-- 4. FIRMAS & VALIDACIÓN OFICIAL -->
      <div class="signatures">
        <div class="sig-box">
          <div class="sig-title">Firma del Paciente</div>
          <div style="font-weight: 700; color: #0f172a; margin-top: 4px;">${pago.nombre}</div>
          <div style="font-size: 10px; color: #64748b;">ID: ${pago.id} ${paciente?.cedula ? `| C.I: ${paciente.cedula}` : ''}</div>
          <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">Conforme con el Abono Registrado</div>
        </div>

        <div class="sig-box">
          <div class="sig-title">Caja & Administración Médica</div>
          <div style="font-weight: 700; color: #0f172a; margin-top: 4px;">${config.doctorRepresentante}</div>
          <div style="font-size: 10px; color: #64748b;">${config.nombreClinica}</div>
          <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">Validación Electrónica de Pago</div>
        </div>
      </div>

      <!-- FOOTER TERMINOS -->
      <div class="footer-terms">
        <strong>${config.nombreClinica}</strong> — ${config.direccion} — Tel: ${config.telefono} — ${config.email}<br>
        Este recibo electrónico certifica el pago recibido por el concepto arriba descrito. Conservar como comprobante oficial. ${config.terminosReporte}
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>

    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

/**
 * Función para Imprimir y Exportar a PDF el Recibo Oficial de Egreso / Devolución de Reintegro
 */
export function printRefundReceiptPDF(
  pago: Pago,
  reintegro?: Reintegro | null,
  paciente?: Paciente | null
) {
  const printWindow = window.open('', '_blank', 'width=950,height=1000');
  if (!printWindow) return;

  const config = getClinicConfig();

  const fechaImpresion = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const montoDevuelto = pago.cargo || pago.abono || 0;
  const montoDevueltoFormateado = montoDevuelto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  const totalAbonado = reintegro?.totalAbonado || 0;
  const gastosAdmin = reintegro?.gastosAdmin20 || 0;
  const totalReintegroNeto = reintegro?.montoNetoReintegro || montoDevuelto;
  const totalDevueltoAcumulado = reintegro?.montoEfectivamentePagado || montoDevuelto;
  const saldoPendienteRestante = reintegro?.saldoPendiente ?? Math.max(0, totalReintegroNeto - totalDevueltoAcumulado);
  const porcentajeAvance = totalReintegroNeto > 0 
    ? Math.min(100, Math.round((totalDevueltoAcumulado / totalReintegroNeto) * 100))
    : 100;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recibo Oficial de Devolución / Reintegro — ${pago.cod} — ${pago.nombre}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      <style>
        @page {
          size: letter;
          margin: 12mm;
        }
        * {
          box-sizing: border-box;
        }
        body {
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 24px;
          background-color: #ffffff;
          font-size: 12px;
          line-height: 1.5;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* HEADER BANNER DARK SLATE & AMBER */
        .brand-header {
          background-color: #0f172a;
          color: #ffffff;
          padding: 20px 24px;
          border-radius: 12px;
          border-bottom: 4px solid #d97706;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 22px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .clinic-brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .clinic-logo-icon {
          width: 44px;
          height: 44px;
          background-color: #d97706;
          color: #ffffff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 700;
          font-size: 20px;
          box-shadow: inset 0 0 10px rgba(0,0,0,0.15);
        }
        .clinic-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.3px;
          margin: 0;
        }
        .clinic-subtitle {
          font-size: 11px;
          color: #fcd34d;
          font-weight: 600;
          margin-top: 2px;
        }
        .doc-badge {
          background-color: #1e293b;
          border: 1px solid #334155;
          color: #ffffff;
          padding: 8px 14px;
          border-radius: 10px;
          text-align: right;
        }
        .doc-badge-id {
          font-size: 11px;
          font-weight: 800;
          color: #fcd34d;
          letter-spacing: 0.5px;
        }
        .doc-badge-date {
          font-size: 10px;
          color: #94a3b8;
          margin-top: 2px;
        }

        .section-title {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #b45309;
          background-color: #fffbe2;
          padding: 8px 12px;
          border-left: 4px solid #d97706;
          border-radius: 0 6px 6px 0;
          margin-top: 22px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .info-card {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px 16px;
        }
        .info-label {
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #64748b;
          display: block;
          margin-bottom: 2px;
        }
        .info-value {
          font-size: 12px;
          font-weight: 700;
          color: #0f172a;
        }

        table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin-top: 8px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
        }
        th {
          background-color: #0f172a;
          color: #ffffff;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          text-align: left;
          padding: 10px 14px;
        }
        td {
          padding: 10px 14px;
          border-bottom: 1px solid #f1f5f9;
        }

        .summary-box {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #ffffff;
          padding: 16px 20px;
          border-radius: 12px;
          border: 1px solid #334155;
          margin-top: 14px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          font-size: 12px;
        }
        .summary-row.total {
          border-top: 1px solid #334155;
          padding-top: 10px;
          margin-top: 6px;
          font-size: 15px;
          font-weight: 800;
        }

        .progress-bar-bg {
          background-color: #334155;
          height: 10px;
          border-radius: 9999px;
          overflow: hidden;
          margin-top: 8px;
        }
        .progress-bar-fill {
          background: linear-gradient(90deg, #f59e0b 0%, #10b981 100%);
          height: 100%;
          border-radius: 9999px;
        }

        .signatures {
          margin-top: 40px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          page-break-inside: avoid;
        }
        .sig-box {
          border-top: 2px solid #cbd5e1;
          text-align: center;
          padding-top: 10px;
          font-size: 11px;
          color: #475569;
        }
        .sig-title {
          font-weight: 800;
          color: #0f172a;
          font-size: 12px;
        }

        .footer-terms {
          margin-top: 30px;
          padding-top: 12px;
          border-top: 1px solid #e2e8f0;
          font-size: 9px;
          color: #94a3b8;
          text-align: center;
          line-height: 1.4;
        }

        @media print {
          body { padding: 0; background: #fff; }
          .no-print { display: none; }
          .brand-header { box-shadow: none; }
        }
      </style>
    </head>
    <body>

      <!-- HEADER BANNER BRANDING -->
      <div class="brand-header">
        <div class="clinic-brand">
          <div class="clinic-logo-icon">DB</div>
          <div>
            <h1 class="clinic-title">${config.nombreClinica}</h1>
            <div class="clinic-subtitle">${config.subtitulo}</div>
          </div>
        </div>
        <div class="doc-badge">
          <div class="doc-badge-id">RECIBO DE REINTEGRO #${pago.cod}</div>
          <div class="doc-badge-date">Fecha de Emisión: ${pago.fecha}</div>
        </div>
      </div>

      <!-- 1. INFORMACIÓN DEL PACIENTE & TRANSACCIÓN -->
      <div class="section-title">
        <span>1. Información del Paciente & Solicitud de Reintegro</span>
        <span style="color: #64748b; font-size: 10px; font-weight: 600;">Comprobante Digital Oficial</span>
      </div>

      <div class="grid-2">
        <div class="info-card">
          <span class="info-label">Paciente Titular</span>
          <div class="info-value" style="font-size: 14px; color: #b45309;">${pago.nombre}</div>

          <div style="margin-top: 10px;">
            <span class="info-label">Código de Paciente / Reintegro</span>
            <div class="info-value">${pago.id} ${reintegro ? `[${reintegro.reintegroId}]` : ''}</div>
          </div>

          <div style="margin-top: 10px;">
            <span class="info-label">Cédula / Documento de Identidad</span>
            <div class="info-value">${paciente?.cedula || 'N/A'}</div>
          </div>
        </div>

        <div class="info-card">
          <span class="info-label">Estado del Reintegro</span>
          <div style="margin-top: 4px;">
            <span style="background-color: #fffbe2; color: #92400e; border: 1px solid #fde68a; padding: 4px 10px; border-radius: 6px; font-weight: 800; font-size: 11px; text-transform: uppercase;">
              ✓ DEVOLUCIÓN DE EGRESO REGISTRADA
            </span>
          </div>

          <div style="margin-top: 14px;">
            <span class="info-label">Teléfono / Contacto</span>
            <div class="info-value">${paciente?.telefono || 'N/A'}</div>
          </div>

          <div style="margin-top: 10px;">
            <span class="info-label">Correo Electrónico</span>
            <div class="info-value">${paciente?.correo || 'N/A'}</div>
          </div>
        </div>
      </div>

      <!-- 2. DESGLOSE DEL EGRESO DEVOLUCIÓN -->
      <div class="section-title">
        <span>2. Detalle del Desembolso / Pago de Reintegro</span>
        <span style="color: #64748b; font-size: 10px; font-weight: 600;">Transacción de Salida de Caja</span>
      </div>

      <table>
        <thead>
          <tr>
            <th>Concepto / Descripción del Egreso</th>
            <th>Método de Pago</th>
            <th>Referencia Bancaria</th>
            <th style="text-align: right; width: 170px;">Monto Devuelto ($ USD)</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background-color: #ffffff;">
            <td style="font-weight: 700; color: #0f172a;">${pago.descripcion}</td>
            <td style="font-weight: 700; color: #d97706;">${pago.metodoDePago}</td>
            <td style="font-family: monospace; font-weight: 700; color: #475569;">${pago.referencia || 'N/A'}</td>
            <td style="text-align: right; font-weight: 800; color: #dc2626; font-size: 14px;">-$${montoDevueltoFormateado} USD</td>
          </tr>
        </tbody>
      </table>

      <!-- 3. RESUMEN Y BARRA DE PROGRESO DEL REINTEGRO -->
      <div class="section-title">
        <span>3. Balance General & Progreso del Reintegro</span>
        <span style="color: #64748b; font-size: 10px; font-weight: 600;">Estatus Financiero</span>
      </div>

      <div class="summary-box">
        ${totalAbonado > 0 ? `
          <div class="summary-row">
            <span style="color: #94a3b8;">Total Abonado Inicialmente (A):</span>
            <strong style="color: #ffffff;">$${totalAbonado.toLocaleString()} USD</strong>
          </div>
          <div class="summary-row">
            <span style="color: #f87171;">Gastos Administrativos (20% - G):</span>
            <strong style="color: #f87171;">-$${gastosAdmin.toLocaleString()} USD</strong>
          </div>
        ` : ''}

        <div class="summary-row" style="margin-top: 4px; border-top: 1px dashed #334155; padding-top: 6px;">
          <span style="color: #fcd34d;">Monto Neto Reintegro Aprobado (R):</span>
          <strong style="color: #fcd34d;">$${totalReintegroNeto.toLocaleString()} USD</strong>
        </div>

        <div class="summary-row">
          <span style="color: #38bdf8;">Monto Devolución Registrada en este Recibo:</span>
          <strong style="color: #38bdf8;">$${montoDevueltoFormateado} USD</strong>
        </div>

        <div class="summary-row">
          <span style="color: #4ade80;">Total Efectivamente Reintegrado a la Fecha:</span>
          <strong style="color: #4ade80;">$${totalDevueltoAcumulado.toLocaleString()} USD (${porcentajeAvance}%)</strong>
        </div>

        <div class="summary-row total">
          <span style="color: #fbbf24;">SALDO PENDIENTE POR REINTEGRAR:</span>
          <span style="color: #fbbf24;">$${saldoPendienteRestante.toLocaleString()} USD</span>
        </div>

        <!-- BARRA DE PROGRESO DE DEVOLUCIÓN -->
        <div style="margin-top: 12px;">
          <div style="display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; color: #94a3b8;">
            <span>Progreso de Devolución</span>
            <span style="color: #4ade80;">${porcentajeAvance}% Completado</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${porcentajeAvance}%;"></div>
          </div>
        </div>
      </div>

      <!-- 4. FIRMAS DE CONFORMIDAD -->
      <div class="signatures">
        <div class="sig-box">
          <div class="sig-title">Firma del Paciente / Beneficiario</div>
          <div style="font-weight: 700; color: #0f172a; margin-top: 4px;">${pago.nombre}</div>
          <div style="font-size: 10px; color: #64748b;">ID: ${pago.id} ${paciente?.cedula ? `| C.I: ${paciente.cedula}` : ''}</div>
          <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">Recibí Conforme la Devolución Indicada</div>
        </div>

        <div class="sig-box">
          <div class="sig-title">Caja & Dirección Administrativa</div>
          <div style="font-weight: 700; color: #0f172a; margin-top: 4px;">${config.doctorRepresentante}</div>
          <div style="font-size: 10px; color: #64748b;">${config.nombreClinica}</div>
          <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">Comprobante de Egreso Autorizado</div>
        </div>
      </div>

      <!-- FOOTER TERMINOS -->
      <div class="footer-terms">
        <strong>${config.nombreClinica}</strong> — ${config.direccion} — Tel: ${config.telefono} — ${config.email}<br>
        Este comprobante de egreso certifica la entrega parcial o total del reintegro aprobado bajo las políticas vigentes de la clínica. ${config.terminosReporte}
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>

    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
