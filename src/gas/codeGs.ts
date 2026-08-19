/**
 * Google Apps Script (Code.gs) source code for Dr. Belleza Medical & Aesthetic Financing App.
 * This code should be copied into Google Apps Script connected to Google Sheets.
 */

export const CODE_GS_SCRIPT = `/**
 * DR. BELLEZA - BACKEND GOOGLE APPS SCRIPT (Code.gs)
 * Sistema de Gestión Médica, CRM y Financiamiento Estético
 * 
 * INSTRUCCIONES DE DESPLIEGUE:
 * 1. Crea un nuevo Google Sheet en Google Drive llamado "Dr. Belleza - BD Médica".
 * 2. Ve a Extensiones -> Apps Script.
 * 3. Borra el código existente y pega este archivo Code.gs por completo.
 * 4. Ejecuta la función 'setupSpreadsheet()' una vez para crear las 5 pestañas automáticamente.
 * 5. Haz clic en 'Desplegar' -> 'Nuevo Despliegue'.
 * 6. Selecciona Tipo: 'Aplicación Web'.
 * 7. Ejecutar como: 'Yo (tu cuenta)'.
 * 8. Quién tiene acceso: 'Cualquier persona' (Anyone).
 * 9. Haz clic en 'Desplegar', autoriza los permisos y copia la URL de la Web App generada.
 * 10. Pega esa URL en la configuración de la Web App Dr. Belleza.
 */

const SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();

// Nombres exactos de las pestañas requeridas
const SHEETS = {
  PACIENTES: 'Pacientes',
  PAGOS: 'Pagos',
  USUARIOS: 'Usuarios',
  ACTIVIDADES: 'Actividades_CRM',
  FINANCIAMIENTO: 'Financiamiento_Cirugias',
  REINTEGROS: 'Reintegros_Financiamiento'
};

/**
 * Función de inicialización automática de la estructura de tablas en Google Sheets
 */
function setupSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Pestaña Pacientes
  let sheetPacientes = ss.getSheetByName(SHEETS.PACIENTES);
  if (!sheetPacientes) {
    sheetPacientes = ss.insertSheet(SHEETS.PACIENTES);
  }
  sheetPacientes.getRange("A1:K1").setValues([[
    "ID", "cedula", "NOMBRE", "GENERO", "CORREO", "TELEFONO",
    "CONTACTADA", "FECHA", "promocion", "procedimiento", "DIRECCION"
  ]]).setFontWeight("bold").setBackground("#e2e8f0");
  sheetPacientes.getRange("B:B").setNumberFormat('@');
  sheetPacientes.getRange("F:F").setNumberFormat('@');

  // 2. Pestaña Pagos
  let sheetPagos = ss.getSheetByName(SHEETS.PAGOS);
  if (!sheetPagos) {
    sheetPagos = ss.insertSheet(SHEETS.PAGOS);
  }
  sheetPagos.getRange("A1:N1").setValues([[
    "FECHA", "COD", "ID", "NOMBRE", "DESCRIPCION", "METODO_DE_PAGO",
    "REFERENCIA", "CARGO", "ABONO", "DIAS_VCTO", "Estatus",
    "Mes_Proxima_Accion", "Fecha_Proxima_Accion", "Proxima_Accion"
  ]]).setFontWeight("bold").setBackground("#cbd5e1");

  // 3. Pestaña Usuarios
  let sheetUsuarios = ss.getSheetByName(SHEETS.USUARIOS);
  if (!sheetUsuarios) {
    sheetUsuarios = ss.insertSheet(SHEETS.USUARIOS);
  }
  sheetUsuarios.getRange("A1:H1").setValues([[
    "Usuario_ID", "Nombre", "Email", "Password_Hash", "Rol", "Estatus", "Fecha_Creacion", "Foto_Url"
  ]]).setFontWeight("bold").setBackground("#e2e8f0");

  // 4. Pestaña Actividades_CRM
  let sheetCRM = ss.getSheetByName(SHEETS.ACTIVIDADES);
  if (!sheetCRM) {
    sheetCRM = ss.insertSheet(SHEETS.ACTIVIDADES);
  }
  sheetCRM.getRange("A1:I1").setValues([[
    "Actividad_ID", "Paciente_ID", "Tipo_Actividad", "Descripcion",
    "Fecha_Programada", "Hora", "Estado", "Alarma", "Responsable_ID"
  ]]).setFontWeight("bold").setBackground("#cbd5e1");

  // 5. Pestaña Financiamiento_Cirugias
  let sheetFin = ss.getSheetByName(SHEETS.FINANCIAMIENTO);
  if (!sheetFin) {
    sheetFin = ss.insertSheet(SHEETS.FINANCIAMIENTO);
  }
  sheetFin.getRange("A1:J1").setValues([[
    "Plan_ID", "Paciente_ID", "Procedimiento", "Costo_Total_Cirugia",
    "Cuotas_Totales", "Monto_Abonado", "Saldo_Pendiente", "Estado_Financiero",
    "Fecha_Inicio", "Fecha_Estimada_Cirugia"
  ]]).setFontWeight("bold").setBackground("#e2e8f0");

  // 6. Pestaña Reintegros_Financiamiento
  let sheetReint = ss.getSheetByName(SHEETS.REINTEGROS);
  if (!sheetReint) {
    sheetReint = ss.insertSheet(SHEETS.REINTEGROS);
  }
  sheetReint.getRange("A1:O1").setValues([[
    "Reintegro_ID", "Plan_ID", "Paciente_ID", "Fecha_Solicitud", "Fecha_Aprobacion",
    "Total_Abonado", "Gastos_Admin_20", "Monto_Neto_Reintegro", "Plazo_Meses",
    "Es_Excepcion_10Dias", "Monto_Cuota_Mensual", "Monto_Efectivamente_Pagado",
    "Saldo_Pendiente", "Estado_Reintegro", "Fecha_Estimada_Culminacion"
  ]]).setFontWeight("bold").setBackground("#cbd5e1");

  return "Estructura de 6 pestañas verificada y creada exitosamente.";
}

/**
 * Handler HTTP GET para peticiones REST
 */
function doGet(e) {
  try {
    const action = e.parameter.action || 'ping';

    if (action === 'ping') {
      return responseJSON({ status: 'ok', message: 'API Dr. Belleza en Google Apps Script activa.' });
    }

    if (action === 'getPacientes') {
      return responseJSON({ success: true, data: getSheetData(SHEETS.PACIENTES) });
    }

    if (action === 'getPagos') {
      return responseJSON({ success: true, data: getSheetData(SHEETS.PAGOS) });
    }

    if (action === 'getUsuarios') {
      return responseJSON({ success: true, data: getSheetData(SHEETS.USUARIOS) });
    }

    if (action === 'getCRM') {
      return responseJSON({ success: true, data: getSheetData(SHEETS.ACTIVIDADES) });
    }

    if (action === 'getFinanciamiento') {
      return responseJSON({ success: true, data: getSheetData(SHEETS.FINANCIAMIENTO) });
    }

    if (action === 'getReintegros') {
      return responseJSON({ success: true, data: getSheetData(SHEETS.REINTEGROS) });
    }

    if (action === 'getAllData') {
      return responseJSON({
        success: true,
        pacientes: getSheetData(SHEETS.PACIENTES),
        pagos: getSheetData(SHEETS.PAGOS),
        usuarios: getSheetData(SHEETS.USUARIOS),
        actividades: getSheetData(SHEETS.ACTIVIDADES),
        financiamientos: getSheetData(SHEETS.FINANCIAMIENTO),
        reintegros: getSheetData(SHEETS.REINTEGROS)
      });
    }

    return responseJSON({ error: 'Acción GET desconocida: ' + action });
  } catch (err) {
    return responseJSON({ error: err.toString() });
  }
}

/**
 * Handler HTTP POST para inserciones, actualizaciones y sincronización
 */
function doPost(e) {
  try {
    let contents;
    if (e.postData && e.postData.contents) {
      contents = JSON.parse(e.postData.contents);
    } else {
      contents = e.parameter;
    }

    const action = contents.action;

    if (action === 'addPaciente') {
      const p = contents.paciente;
      appendRow(SHEETS.PACIENTES, [
        p.id, p.cedula, p.nombre, p.genero, p.correo, p.telefono,
        p.contactada, p.fecha, p.promocion, p.procedimiento, p.direccion
      ]);
      return responseJSON({ success: true, message: 'Paciente registrado exitosamente' });
    }

    if (action === 'updatePaciente') {
      const p = contents.paciente;
      updateRowById(SHEETS.PACIENTES, 0, p.id, [
        p.id, p.cedula, p.nombre, p.genero, p.correo, p.telefono,
        p.contactada, p.fecha, p.promocion, p.procedimiento, p.direccion
      ]);
      return responseJSON({ success: true, message: 'Paciente actualizado' });
    }

    if (action === 'addPago') {
      const pago = contents.pago;
      appendRow(SHEETS.PAGOS, [
        pago.fecha, pago.cod, pago.id, pago.nombre, pago.descripcion, pago.metodoDePago,
        pago.referencia, pago.cargo, pago.abono, pago.diasVcto, pago.estatus,
        pago.mesProximaAccion, pago.fechaProximaAccion, pago.proximaAccion
      ]);

      // Si incluye actualización de financiamiento
      if (contents.financiamiento) {
        const fin = contents.financiamiento;
        updateRowById(SHEETS.FINANCIAMIENTO, 0, fin.planId, [
          fin.planId, fin.pacienteId, fin.procedimiento, fin.costoTotalCirugia,
          fin.cuotasTotales, fin.montoAbonado, fin.saldoPendiente, fin.estadoFinanciero,
          fin.fechaInicio, fin.fechaEstimadaCirugia
        ]);
      }

      return responseJSON({ success: true, message: 'Pago registrado y saldo actualizado' });
    }

    if (action === 'addCRM') {
      const c = contents.actividad;
      appendRow(SHEETS.ACTIVIDADES, [
        c.actividadId, c.pacienteId, c.tipoActividad, c.descripcion,
        c.fechaProgramada, c.hora, c.estado, c.alarma ? 'Sí' : 'No', c.responsableId
      ]);
      return responseJSON({ success: true, message: 'Actividad CRM agregada' });
    }

    if (action === 'updateCRM') {
      const c = contents.actividad;
      updateRowById(SHEETS.ACTIVIDADES, 0, c.actividadId, [
        c.actividadId, c.pacienteId, c.tipoActividad, c.descripcion,
        c.fechaProgramada, c.hora, c.estado, c.alarma ? 'Sí' : 'No', c.responsableId
      ]);
      return responseJSON({ success: true, message: 'Actividad CRM actualizada' });
    }

    if (action === 'saveUsuario') {
      const u = contents.usuario;
      updateOrAppendUser(SHEETS.USUARIOS, u);
      return responseJSON({ success: true, message: 'Usuario guardado' });
    }

    if (action === 'saveFinanciamiento') {
      const fin = contents.financiamiento;
      updateRowById(SHEETS.FINANCIAMIENTO, 0, fin.planId, [
        fin.planId, fin.pacienteId, fin.procedimiento, fin.costoTotalCirugia,
        fin.cuotasTotales, fin.montoAbonado, fin.saldoPendiente, fin.estadoFinanciero,
        fin.fechaInicio, fin.fechaEstimadaCirugia
      ]);
      return responseJSON({ success: true, message: 'Plan de financiamiento guardado' });
    }

    if (action === 'deletePaciente') {
      const pId = String(contents.pacienteId || '').trim();
      const cedula = String(contents.cedula || '').trim();
      const searchTargets = [pId, cedula].filter(function(t) { return t.length > 0; });

      deleteRowsByMatchingValues(SHEETS.PACIENTES, [0, 1], searchTargets);
      deleteRowsByMatchingValues(SHEETS.PAGOS, [2], searchTargets);
      deleteRowsByMatchingValues(SHEETS.ACTIVIDADES, [1], searchTargets);
      deleteRowsByMatchingValues(SHEETS.FINANCIAMIENTO, [1], searchTargets);
      deleteRowsByMatchingValues(SHEETS.REINTEGROS, [2], searchTargets);
      return responseJSON({ success: true, message: 'Paciente y todos sus registros eliminados correctamente.' });
    }

    if (action === 'solicitarReintegro') {
      const r = contents.reintegro;
      appendRow(SHEETS.REINTEGROS, [
        r.reintegroId, r.planId, r.pacienteId, r.fechaSolicitud, r.fechaAprobacion || '',
        r.totalAbonado, r.gastosAdmin20, r.montoNetoReintegro, r.plazoMeses,
        r.esExcepcion10Dias ? 'Sí' : 'No', r.montoCuotaMensual, r.montoEfectivamentePagado,
        r.saldoPendiente, r.estadoReintegro, r.fechaEstimadaCulminacion
      ]);

      if (contents.financiamiento) {
        const fin = contents.financiamiento;
        updateRowById(SHEETS.FINANCIAMIENTO, 0, fin.planId, [
          fin.planId, fin.pacienteId, fin.procedimiento, fin.costoTotalCirugia,
          fin.cuotasTotales, fin.montoAbonado, fin.saldoPendiente, fin.estadoFinanciero,
          fin.fechaInicio, fin.fechaEstimadaCirugia
        ]);
      }

      return responseJSON({ success: true, message: 'Solicitud de reintegro procesada exitosamente' });
    }

    if (action === 'registrarPagoReintegro') {
      if (contents.pago) {
        const pago = contents.pago;
        appendRow(SHEETS.PAGOS, [
          pago.fecha, pago.cod, pago.id, pago.nombre, pago.descripcion, pago.metodoDePago,
          pago.referencia, pago.cargo, pago.abono, pago.diasVcto, pago.estatus,
          pago.mesProximaAccion, pago.fechaProximaAccion, pago.proximaAccion
        ]);
      }

      if (contents.reintegro) {
        const r = contents.reintegro;
        updateRowById(SHEETS.REINTEGROS, 0, r.reintegroId, [
          r.reintegroId, r.planId, r.pacienteId, r.fechaSolicitud, r.fechaAprobacion || '',
          r.totalAbonado, r.gastosAdmin20, r.montoNetoReintegro, r.plazoMeses,
          r.esExcepcion10Dias ? 'Sí' : 'No', r.montoCuotaMensual, r.montoEfectivamentePagado,
          r.saldoPendiente, r.estadoReintegro, r.fechaEstimadaCulminacion
        ]);
      }

      if (contents.financiamiento) {
        const fin = contents.financiamiento;
        updateRowById(SHEETS.FINANCIAMIENTO, 0, fin.planId, [
          fin.planId, fin.pacienteId, fin.procedimiento, fin.costoTotalCirugia,
          fin.cuotasTotales, fin.montoAbonado, fin.saldoPendiente, fin.estadoFinanciero,
          fin.fechaInicio, fin.fechaEstimadaCirugia
        ]);
      }

      return responseJSON({ success: true, message: 'Pago de reintegro registrado correctamente' });
    }

    if (action === 'syncFullDatabase') {
      // Reemplazar o volcar toda la base de datos local hacia Sheets
      const { pacientes, pagos, usuarios, actividades, financiamientos, reintegros } = contents;
      
      if (pacientes && Array.isArray(pacientes)) {
        replaceSheetData(SHEETS.PACIENTES, pacientes.map(p => [
          p.id, p.cedula, p.nombre, p.genero, p.correo, p.telefono,
          p.contactada, p.fecha, p.promocion, p.procedimiento, p.direccion
        ]));
      }

      if (pagos && Array.isArray(pagos)) {
        replaceSheetData(SHEETS.PAGOS, pagos.map(p => [
          p.fecha, p.cod, p.id, p.nombre, p.descripcion, p.metodoDePago,
          p.referencia, p.cargo, p.abono, p.diasVcto, p.estatus,
          p.mesProximaAccion, p.fechaProximaAccion, p.proximaAccion
        ]));
      }

      if (usuarios && Array.isArray(usuarios)) {
        replaceSheetData(SHEETS.USUARIOS, usuarios.map(u => [
          u.usuarioId, u.nombre, u.email, u.passwordHash, u.rol, u.estatus, u.fechaCreacion, u.fotoUrl || ''
        ]));
      }

      if (actividades && Array.isArray(actividades)) {
        replaceSheetData(SHEETS.ACTIVIDADES, actividades.map(c => [
          c.actividadId, c.pacienteId, c.tipoActividad, c.descripcion,
          c.fechaProgramada, c.hora, c.estado, c.alarma ? 'Sí' : 'No', c.responsableId
        ]));
      }

      if (financiamientos && Array.isArray(financiamientos)) {
        replaceSheetData(SHEETS.FINANCIAMIENTO, financiamientos.map(f => [
          f.planId, f.pacienteId, f.procedimiento, f.costoTotalCirugia,
          f.cuotasTotales, f.montoAbonado, f.saldoPendiente, f.estadoFinanciero,
          f.fechaInicio, f.fechaEstimadaCirugia
        ]));
      }

      if (reintegros && Array.isArray(reintegros)) {
        replaceSheetData(SHEETS.REINTEGROS, reintegros.map(r => [
          r.reintegroId, r.planId, r.pacienteId, r.fechaSolicitud, r.fechaAprobacion || '',
          r.totalAbonado, r.gastosAdmin20, r.montoNetoReintegro, r.plazoMeses,
          r.esExcepcion10Dias ? 'Sí' : 'No', r.montoCuotaMensual, r.montoEfectivamentePagado,
          r.saldoPendiente, r.estadoReintegro, r.fechaEstimadaCulminacion
        ]));
      }

      return responseJSON({ success: true, message: 'Sincronización completa con Google Sheets realizada.' });
    }

    return responseJSON({ error: 'Acción POST no reconocida: ' + action });
  } catch (err) {
    return responseJSON({ error: err.toString() });
  }
}

// FUNCIONES AUXILIARES DE BASE DE DATOS SHEET

function responseJSON(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function sanitizeVal(val) {
  if (val === undefined || val === null) return '';
  if (typeof val === 'string') {
    // Si empieza con +, =, @, -, anteponer comilla simple ' para que Google Sheets lo guarde como texto puro y no intente evaluarlo como fórmula
    if (/^[+=@\-]/.test(val)) {
      return "'" + val;
    }
    return val;
  }
  return val;
}

function sanitizeRow(rowArray) {
  return rowArray.map(function(v) { return sanitizeVal(v); });
}

function getOrCreateSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    setupSpreadsheet();
    sheet = ss.getSheetByName(sheetName);
  }
  return sheet;
}

function getSheetData(sheetName) {
  const sheet = getOrCreateSheet(sheetName);
  if (!sheet) return [];
  const range = sheet.getDataRange();
  const values = range.getValues();
  if (values.length <= 1) return [];
  
  const headers = values[0];
  const rows = values.slice(1);

  return rows.map(function(row) {
    const obj = {};
    headers.forEach(function(header, index) {
      let cell = row[index];
      if (typeof cell === 'string') {
        if (cell.indexOf("'") === 0) {
          cell = cell.substring(1);
        }
        if (cell === '#ERROR!' || cell === '#¡ERROR!' || cell === '#VALUE!' || cell === '#REF!' || cell === '#NAME?') {
          cell = '';
        }
      }
      obj[header] = cell;
    });
    return obj;
  });
}

function appendRow(sheetName, rowArray) {
  const sheet = getOrCreateSheet(sheetName);
  if (!sheet) return;
  const cleanRow = sanitizeRow(rowArray);
  const targetRow = sheet.getLastRow() + 1;
  if (sheetName === SHEETS.PACIENTES) {
    sheet.getRange(targetRow, 2).setNumberFormat('@');
    sheet.getRange(targetRow, 6).setNumberFormat('@');
  }
  sheet.getRange(targetRow, 1, 1, cleanRow.length).setValues([cleanRow]);
}

function updateRowById(sheetName, idColumnIndex, targetId, newRowArray) {
  const sheet = getOrCreateSheet(sheetName);
  if (!sheet) return;
  const values = sheet.getDataRange().getValues();
  const cleanRow = sanitizeRow(newRowArray);
  const targetIdStr = String(targetId || '').trim().toUpperCase();

  for (let i = 1; i < values.length; i++) {
    const rowIdStr = String(values[i][idColumnIndex] || '').trim().toUpperCase();
    if (rowIdStr === targetIdStr) {
      const targetRow = i + 1;
      if (sheetName === SHEETS.PACIENTES) {
        sheet.getRange(targetRow, 2).setNumberFormat('@');
        sheet.getRange(targetRow, 6).setNumberFormat('@');
      }
      sheet.getRange(targetRow, 1, 1, cleanRow.length).setValues([cleanRow]);
      return;
    }
  }
  // Si no se encuentra, append
  appendRow(sheetName, newRowArray);
}

function updateOrAppendRow(sheetName, idColumnIndex, targetId, newRowArray) {
  updateRowById(sheetName, idColumnIndex, targetId, newRowArray);
}

function updateOrAppendUser(sheetName, u) {
  const sheet = getOrCreateSheet(sheetName);
  if (!sheet) return;
  const values = sheet.getDataRange().getValues();
  const cleanRow = sanitizeRow([
    u.usuarioId, u.nombre, u.email, u.passwordHash, u.rol, u.estatus, u.fechaCreacion, u.fotoUrl || ''
  ]);
  const targetId = String(u.usuarioId || '').trim().toLowerCase();
  const targetEmail = String(u.email || '').trim().toLowerCase();

  for (let i = 1; i < values.length; i++) {
    const rowId = String(values[i][0] || '').trim().toLowerCase();
    const rowEmail = String(values[i][2] || '').trim().toLowerCase();
    if ((targetId && rowId === targetId) || (targetEmail && rowEmail === targetEmail)) {
      sheet.getRange(i + 1, 1, 1, cleanRow.length).setValues([cleanRow]);
      return;
    }
  }
  sheet.appendRow(cleanRow);
}

function replaceSheetData(sheetName, rowsData) {
  const sheet = getOrCreateSheet(sheetName);
  if (!sheet) return;
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow > 1 && lastCol > 0) {
    sheet.getRange(2, 1, lastRow - 1, lastCol).clearContent();
  }
  if (rowsData && rowsData.length > 0) {
    const cleanRows = rowsData.map(function(r) { return sanitizeRow(r); });
    sheet.getRange(2, 1, cleanRows.length, cleanRows[0].length).setValues(cleanRows);
  }
}

function deleteRowsByMatchingValues(sheetName, colIndices, targetValues) {
  const sheet = getOrCreateSheet(sheetName);
  if (!sheet) return;
  const values = sheet.getDataRange().getValues();
  const cleanTargets = targetValues
    .filter(function(t) { return t && String(t).trim().length > 0; })
    .map(function(t) { return String(t).trim().toLowerCase(); });
  
  if (cleanTargets.length === 0) return;

  for (let i = values.length - 1; i >= 1; i--) {
    let match = false;
    for (let c = 0; c < colIndices.length; c++) {
      const colIdx = colIndices[c];
      const cellVal = String(values[i][colIdx] || '').trim().toLowerCase();
      if (cellVal && cleanTargets.indexOf(cellVal) !== -1) {
        match = true;
        break;
      }
    }
    if (match) {
      sheet.deleteRow(i + 1);
    }
  }
}

function deleteRowsByColumnValue(sheetName, colIndex, targetVal) {
  deleteRowsByMatchingValues(sheetName, [colIndex], [targetVal]);
}
`;
