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
  FINANCIAMIENTO: 'Financiamiento_Cirugias'
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

  return "Estructura de pestañas verificada y creada exitosamente.";
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

    if (action === 'getAllData') {
      return responseJSON({
        success: true,
        pacientes: getSheetData(SHEETS.PACIENTES),
        pagos: getSheetData(SHEETS.PAGOS),
        usuarios: getSheetData(SHEETS.USUARIOS),
        actividades: getSheetData(SHEETS.ACTIVIDADES),
        financiamientos: getSheetData(SHEETS.FINANCIAMIENTO)
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
      updateOrAppendRow(SHEETS.USUARIOS, 0, u.usuarioId, [
        u.usuarioId, u.nombre, u.email, u.passwordHash, u.rol, u.estatus, u.fechaCreacion, u.fotoUrl || ''
      ]);
      return responseJSON({ success: true, message: 'Usuario guardado' });
    }

    if (action === 'deletePaciente') {
      const pId = contents.pacienteId;
      deleteRowsByColumnValue(SHEETS.PACIENTES, 0, pId);
      deleteRowsByColumnValue(SHEETS.PAGOS, 2, pId);
      deleteRowsByColumnValue(SHEETS.ACTIVIDADES, 1, pId);
      deleteRowsByColumnValue(SHEETS.FINANCIAMIENTO, 1, pId);
      return responseJSON({ success: true, message: 'Paciente y todos sus registros eliminados correctamente.' });
    }

    if (action === 'syncFullDatabase') {
      // Reemplazar o volcar toda la base de datos local hacia Sheets
      const { pacientes, pagos, usuarios, actividades, financiamientos } = contents;
      
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
      obj[header] = row[index];
    });
    return obj;
  });
}

function appendRow(sheetName, rowArray) {
  const sheet = getOrCreateSheet(sheetName);
  sheet.appendRow(sanitizeRow(rowArray));
}

function updateRowById(sheetName, idColumnIndex, targetId, newRowArray) {
  const sheet = getOrCreateSheet(sheetName);
  if (!sheet) return;
  const values = sheet.getDataRange().getValues();
  const cleanRow = sanitizeRow(newRowArray);
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idColumnIndex]) === String(targetId)) {
      sheet.getRange(i + 1, 1, 1, cleanRow.length).setValues([cleanRow]);
      return;
    }
  }
  // Si no se encuentra, append
  sheet.appendRow(cleanRow);
}

function updateOrAppendRow(sheetName, idColumnIndex, targetId, newRowArray) {
  updateRowById(sheetName, idColumnIndex, targetId, newRowArray);
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

function deleteRowsByColumnValue(sheetName, colIndex, targetVal) {
  const sheet = getOrCreateSheet(sheetName);
  if (!sheet) return;
  const values = sheet.getDataRange().getValues();
  for (let i = values.length - 1; i >= 1; i--) {
    if (String(values[i][colIndex]) === String(targetVal)) {
      sheet.deleteRow(i + 1);
    }
  }
}
`;
