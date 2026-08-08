import React, { useRef, useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  X,
  CheckCircle2,
  Shield,
  Users,
  Activity,
  DollarSign,
  Smartphone,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Server
} from 'lucide-react';
import jsPDF from 'jspdf';

interface ExecutivePresentationModalProps {
  onClose: () => void;
}

export const ExecutivePresentationModal: React.FC<ExecutivePresentationModalProps> = ({ onClose }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generador nativo vectorial con jsPDF - 100% fiable y sin errores de canvas/iframe
  const handleDownloadPDF = () => {
    setIsGenerating(true);

    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let y = 16;

      // Encabezado corporativo
      doc.setFillColor(13, 148, 136); // Teal 600
      doc.rect(margin, y, contentWidth, 12, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('Dr. Belleza - Salud & Estetica', margin + 5, y + 8);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, pageWidth - margin - 5, y + 8, { align: 'right' });

      y += 20;

      // Título principal
      doc.setTextColor(15, 23, 42); // Slate 900
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORME EJECUTIVO DE AVANCES & ARQUITECTURA', margin, y);

      y += 6;
      doc.setTextColor(13, 148, 136);
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.text('Sistema Web de Gestion Clinica, Expedientes 360 y Sincronizacion Google Sheets', margin, y);

      y += 8;

      // Caza de metadatos
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, y, contentWidth, 16, 'FD');

      doc.setTextColor(71, 85, 105);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('DIRIGIDO A: Direccion General y Gerencia Medica', margin + 4, y + 6);
      doc.text('ESTADO DEL PROYECTO: Version 1.0 (Completado y Verificado)', margin + 4, y + 11);
      doc.text('COMPATIBILIDAD: Smartphones, Tablets y PC', margin + 105, y + 6);

      y += 22;

      // Sección 1: Resumen
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Resumen Ejecutivo', margin, y);
      doc.setLineWidth(0.5);
      doc.setDrawColor(13, 148, 136);
      doc.line(margin, y + 1.5, margin + 45, y + 1.5);

      y += 7;
      doc.setTextColor(51, 65, 85);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      const resLines = doc.splitTextToSize(
        'Se ha completado satisfactoriamente el desarrollo de la Plataforma Web de Gestion Integral para la Clinica Dr. Belleza. Este sistema moderno permite digitalizar de punta a punta los procesos operativos, medicos y financieros de la clinica. Su principal ventaja competitiva es la sincronizacion en tiempo real y bidireccional con Google Sheets, eliminando por completo costos recurrentes de bases de datos tradicionales y ofreciendo acceso seguro a la informacion desde cualquier lugar y dispositivo.',
        contentWidth
      );
      doc.text(resLines, margin, y);
      y += resLines.length * 4.2 + 5;

      // Sección 2: Módulos
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('2. Desglose de Modulos y Pantallas de la Aplicacion', margin, y);
      doc.line(margin, y + 1.5, margin + 85, y + 1.5);

      y += 7;

      const modulos = [
        { title: '1. Dashboard de Metricasy KPIs', desc: 'Muestra paneles con total de pacientes registrados, recaudacion mensual, pacientes en financiamiento activo y citas del dia. Incluye graficos interactivos.' },
        { title: '2. Expedientes 360° Pacientes', desc: 'Directorio inteligente con busqueda por cedula o nombre. Permite consultar historia medica, tratamientos realizados, diagnosticos y estado financiero.' },
        { title: '3. CRM Operativo & Citas', desc: 'Gestion de agenda, recordatorios de cobro y llamadas de seguimiento. Incluye sistema de alarmas automaticas en la barra superior.' },
        { title: '4. Financiamiento Quirurgico', desc: 'Cotizador automatico de procedimientos esteticos. Calcula pago inicial y cuotas mensuales. Monitorea financiamientos activos y morosidad.' },
        { title: '5. Pagos & Recibos Digitales', desc: 'Registro de abonos con soporte para Zelle, Pago Movil, Efectivo y Transferencias. Genera recibos digitales formateados en PDF.' },
        { title: '6. Control de Usuarios (RBAC)', desc: 'Restriccion de accesos por roles (Administrador, Medico, Financiero, Asistente) e incluye un Gestor de Roles Personalizado.' }
      ];

      modulos.forEach((mod) => {
        if (y > 260) {
          doc.addPage();
          y = 16;
        }
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.rect(margin, y, contentWidth, 14, 'FD');

        doc.setTextColor(13, 148, 136);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.text(mod.title, margin + 3, y + 5);

        doc.setTextColor(71, 85, 105);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const descLines = doc.splitTextToSize(mod.desc, contentWidth - 6);
        doc.text(descLines, margin + 3, y + 9.5);

        y += 16;
      });

      if (y > 235) {
        doc.addPage();
        y = 16;
      } else {
        y += 4;
      }

      // Sección 3: Flujo de Usuario
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('3. Flujo de Trabajo Operativo (User Journey)', margin, y);
      doc.line(margin, y + 1.5, margin + 75, y + 1.5);

      y += 7;

      const flujo = [
        { paso: '1', titulo: 'Ingreso y Apertura de Expediente', desc: 'El recepcionista registra los datos del paciente desde su laptop o smartphone. Se genera automaticamente un ID unico y la ficha se guarda de inmediato.' },
        { paso: '2', titulo: 'Evaluacion Medica y Cotizacion', desc: 'El medico consulta el expediente 360°, registra el diagnostico, selecciona el procedimiento del catalogo y genera un plan de financiamiento.' },
        { paso: '3', titulo: 'Cobro de Abono y Recibo de Caja', desc: 'El area Financiera registra el pago inicial o cuota, emite el recibo oficial en PDF para entregar al paciente y actualiza el saldo deudor.' },
        { paso: '4', titulo: 'Seguimiento CRM y Sincronizacion', desc: 'Se agendan citas post-operatorias con alarmas automaticas y todas las transacciones e historial se respaldan en Google Sheets.' }
      ];

      flujo.forEach((item) => {
        if (y > 260) {
          doc.addPage();
          y = 16;
        }
        doc.setFillColor(13, 148, 136);
        doc.circle(margin + 3.5, y + 3.5, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.text(item.paso, margin + 2.5, y + 4.5);

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.text(item.titulo, margin + 9, y + 4);

        doc.setTextColor(71, 85, 105);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const fLines = doc.splitTextToSize(item.desc, contentWidth - 10);
        doc.text(fLines, margin + 9, y + 8);

        y += fLines.length * 3.8 + 8;
      });

      if (y > 245) {
        doc.addPage();
        y = 16;
      } else {
        y += 4;
      }

      // Sección 4: Ficha Técnica
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('4. Ficha Tecnica y Despliegue en Servidores', margin, y);
      doc.line(margin, y + 1.5, margin + 65, y + 1.5);

      y += 7;
      doc.setFillColor(240, 253, 250);
      doc.setDrawColor(204, 251, 241);
      doc.rect(margin, y, contentWidth, 22, 'FD');

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(8);

      doc.setFont('helvetica', 'bold');
      doc.text('• Frontend:', margin + 4, y + 6);
      doc.setFont('helvetica', 'normal');
      doc.text('React 19 + TypeScript + Tailwind CSS (Adaptado para Moviles y PC)', margin + 24, y + 6);

      doc.setFont('helvetica', 'bold');
      doc.text('• Backend:', margin + 4, y + 11);
      doc.setFont('helvetica', 'normal');
      doc.text('Google Apps Script Webhook API (Code.gs) integrado con Google Sheets', margin + 24, y + 11);

      doc.setFont('helvetica', 'bold');
      doc.text('• Publicacion:', margin + 4, y + 16);
      doc.setFont('helvetica', 'normal');
      doc.text('Compatible para desplegar en Vercel, GitHub Pages y Google Cloud Run', margin + 24, y + 16);

      // Pie de página numerado
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, 283, pageWidth - margin, 283);
        doc.setTextColor(148, 163, 184);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.text('Dr. Belleza Management System - Documento de Presentacion Ejecutiva', margin, 288);
        doc.text(`Pagina ${i} de ${totalPages}`, pageWidth - margin, 288, { align: 'right' });
      }

      // Descarga directa del archivo PDF
      doc.save('Informe_Ejecutivo_DrBelleza_WebApp_2026.pdf');
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Por favor utiliza la opción de Imprimir / Guardar.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Función para abrir la ventana del administrador de impresiones del navegador
  const handlePrint = () => {
    try {
      window.print();
    } catch (error) {
      console.error('Error invocando ventana de impresión:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex justify-center p-2 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      
      {/* ESTILOS DE IMPRESIÓN PARA EL ADMINISTRADOR DE IMPRESORAS DEL NAVEGADOR */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-report-area, #printable-report-area * {
            visibility: visible !important;
          }
          #printable-report-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 10mm !important;
            background: white !important;
            color: black !important;
            overflow: visible !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col my-auto overflow-hidden">
        
        {/* BARRA SUPERIOR DE ACCIONES */}
        <div className="bg-slate-900 text-white px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-20 shadow-md no-print">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif italic font-bold text-lg text-white">Informe Ejecutivo & Flujo de Trabajo</h2>
              <p className="text-xs text-teal-300">Documento de Presentación para Dirección General</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center space-x-2 disabled:opacity-50 relative z-30"
              title="Descargar archivo .pdf inmediatamente"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>{isGenerating ? 'Generando PDF...' : 'Descargar PDF'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 relative z-30"
              title="Activar ventana de administración de impresoras / Guardar como PDF"
            >
              <Printer className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Imprimir / Guardar</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer relative z-30"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CUERPO DEL INFORME IMPRIMIBLE */}
        <div id="printable-report-area" className="p-6 sm:p-10 space-y-8 overflow-y-auto bg-white text-slate-800 font-sans" ref={reportRef}>
          
          {/* PORTADA EJECUTIVA */}
          <div className="border-b-2 border-teal-700 pb-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="font-serif italic font-bold text-teal-800 text-3xl tracking-tight">Dr. Belleza</span>
                <span className="text-xs font-bold uppercase tracking-widest bg-teal-100 text-teal-800 px-3 py-1 rounded-full border border-teal-200">
                  Salud & Estética
                </span>
              </div>
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                Fecha: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>

            <div className="pt-4 space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                INFORME EJECUTIVO DE AVANCES & ARQUITECTURA TÉCNICA
              </h1>
              <p className="text-sm font-semibold text-teal-700">
                Sistema Web de Gestión Clínica, Expedientes 360°, Control Financiero y Sincronización Google Sheets
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Dirigido a:</span>
                <span className="font-bold text-slate-800">Dirección General & Gerencia Médica</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Estado del Proyecto:</span>
                <span className="font-bold text-emerald-700 flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Versión 1.0 (Completado)
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Compatibilidad Dispositivos:</span>
                <span className="font-bold text-teal-700 flex items-center">
                  <Smartphone className="w-3.5 h-3.5 mr-1" />
                  Smartphones, Tablets y PC
                </span>
              </div>
            </div>
          </div>

          {/* SECCIÓN 1: RESUMEN EJECUTIVO */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 border-l-4 border-teal-600 pl-3 flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-teal-600" />
              1. Resumen Ejecutivo
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed text-justify">
              Se ha completado satisfactoriamente el desarrollo de la <strong>Plataforma Web de Gestión Integral para la Clínica Dr. Belleza</strong>. Este sistema moderno permite digitalizar de punta a punta los procesos operativos, médicos y financieros de la clínica. Su principal ventaja competitiva es la <strong>sincronización en tiempo real y bidireccional con Google Sheets</strong>, eliminando por completo costos recurrentes de bases de datos tradicionales y ofreciendo acceso seguro a la información desde cualquier lugar y dispositivo.
            </p>
          </div>

          {/* SECCIÓN 2: PANTALLAS Y MÓDULOS DEL SISTEMA */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-l-4 border-teal-600 pl-3 flex items-center">
              <Layers className="w-4 h-4 mr-2 text-teal-600" />
              2. Desglose de Módulos y Pantallas de la Aplicación
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* MÓDULO 1 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between font-bold text-teal-800">
                  <span className="flex items-center"><Activity className="w-4 h-4 mr-1.5 text-teal-600" /> 1. Dashboard de Métricas</span>
                  <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded text-[10px]">KPIs</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-snug">
                  Muestra paneles con total de pacientes registrados, recaudación mensual, pacientes en financiamiento activo y citas del día. Incluye gráficos interactivos de ingresos y alertas médicas pendientes.
                </p>
              </div>

              {/* MÓDULO 2 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between font-bold text-teal-800">
                  <span className="flex items-center"><Users className="w-4 h-4 mr-1.5 text-teal-600" /> 2. Expedientes 360° Pacientes</span>
                  <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded text-[10px]">Clínico</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-snug">
                  Directorio inteligente con búsqueda por cédula o nombre. Permite consultar historia médica, tratamientos realizados, diagnósticos, estado financiero del paciente y subir fotografías/documentos.
                </p>
              </div>

              {/* MÓDULO 3 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between font-bold text-teal-800">
                  <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5 text-teal-600" /> 3. CRM Operativo & Citas</span>
                  <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded text-[10px]">Agenda</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-snug">
                  Gestión de agenda, recordatorios de cobro y llamadas de seguimiento. Incluye sistema de alarmas automáticas en la barra superior para avisar al personal de citas y cobros del día.
                </p>
              </div>

              {/* MÓDULO 4 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between font-bold text-teal-800">
                  <span className="flex items-center"><DollarSign className="w-4 h-4 mr-1.5 text-teal-600" /> 4. Financiamiento Quirúrgico</span>
                  <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded text-[10px]">Finanzas</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-snug">
                  Cotizador automático de procedimientos estéticos. Calcula pago inicial y cuotas mensuales. Monitorea financiamientos activos, saldos pendientes y estado de cuotas al día o en mora.
                </p>
              </div>

              {/* MÓDULO 5 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between font-bold text-teal-800">
                  <span className="flex items-center"><FileText className="w-4 h-4 mr-1.5 text-teal-600" /> 5. Pagos & Recibos Digitales</span>
                  <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded text-[10px]">Caja</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-snug">
                  Registro de abonos con soporte para Zelle, Pago Móvil, Efectivo y Transferencias. Genera recibos digitales formateados listos para imprimir o descargar en PDF para el paciente.
                </p>
              </div>

              {/* MÓDULO 6 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between font-bold text-teal-800">
                  <span className="flex items-center"><Shield className="w-4 h-4 mr-1.5 text-teal-600" /> 6. Control de Usuarios (RBAC)</span>
                  <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded text-[10px]">Seguridad</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-snug">
                  Restricción de accesos por roles (Administrador, Médico, Financiero, Asistente). Incluye un Gestor de Roles Personalizado para crear, modificar, renombrar y borrar roles según la clínica.
                </p>
              </div>

            </div>
          </div>

          {/* SECCIÓN 3: FLUJO DEL USUARIO (USER WORKFLOW) */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-l-4 border-teal-600 pl-3 flex items-center">
              <ArrowRight className="w-4 h-4 mr-2 text-teal-600" />
              3. Flujo de Trabajo Operativo (User Journey)
            </h2>

            <div className="space-y-3 text-xs">
              
              <div className="flex items-start space-x-3 bg-white p-3 border border-slate-200 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Ingreso y Apertura de Expediente</h4>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    El recepcionista o asistente registra los datos del paciente desde su laptop o smartphone. Se genera automáticamente un ID único y la ficha del paciente se guarda de inmediato.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-white p-3 border border-slate-200 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Evaluación Médica y Cotización de Tratamiento</h4>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    El médico o especialista consulta el expediente 360°, registra el diagnóstico, selecciona el procedimiento del catálogo y genera un plan de financiamiento personalizado.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-white p-3 border border-slate-200 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Cobro de Abono y Emisión de Recibo de Caja</h4>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    El área Financiera registra el pago inicial o cuota correspondiente, emite el recibo oficial en PDF para entregar al paciente y actualiza el saldo deudor en tiempo real.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-white p-3 border border-slate-200 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Seguimiento en CRM y Sincronización Automática</h4>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Se agendan citas de control post-operatorio con alarmas automáticas. Toda la transacción e historial se respaldan instantáneamente en las hojas de Google Sheets conectadas.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* SECCIÓN 4: ARQUITECTURA TÉCNICA Y DESPLIEGUE */}
          <div className="space-y-3 bg-teal-50/60 p-4 rounded-2xl border border-teal-200/80">
            <h2 className="text-base font-bold text-teal-900 flex items-center">
              <Server className="w-4 h-4 mr-2 text-teal-700" />
              4. Ficha Técnica y Despliegue en Servidores
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-700 block">Frontend & Diseño Responsive:</span>
                <span className="text-slate-600 text-[11px]">React 19 + TypeScript + Tailwind CSS. Adaptado para Móviles, Tabletas y PC.</span>
              </div>

              <div>
                <span className="font-bold text-slate-700 block">Sincronización Backend:</span>
                <span className="text-slate-600 text-[11px]">Google Apps Script Webhook API (`Code.gs`) integrado con Google Sheets.</span>
              </div>

              <div>
                <span className="font-bold text-slate-700 block">Hosting y Servidor:</span>
                <span className="text-slate-600 text-[11px]">Compatible para publicar en Vercel, GitHub Pages y Google Cloud Run.</span>
              </div>

              <div>
                <span className="font-bold text-slate-700 block">Seguridad y Permisos:</span>
                <span className="text-slate-600 text-[11px]">Mecanismo RBAC por roles y aislamiento de funciones administrativas.</span>
              </div>
            </div>
          </div>

          {/* FIRMA Y PIE DE PÁGINA */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <div>
              <strong>Dr. Belleza Management System</strong> — Documento Informativo de Avances
            </div>
            <div className="font-mono text-teal-700 font-bold">
              Versión 1.0 - Agosto 2026
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

