import {
  Paciente,
  Pago,
  Usuario,
  ActividadCRM,
  FinanciamientoCirugia,
  SyncStatus
} from '../types';
import {
  INITIAL_PACIENTES,
  INITIAL_PAGOS,
  INITIAL_USUARIOS,
  INITIAL_ACTIVIDADES,
  INITIAL_FINANCIAMIENTOS
} from './mockData';
import { GasService } from './gasService';

const KEYS = {
  PACIENTES: 'drb_pacientes_v1',
  PAGOS: 'drb_pagos_v1',
  USUARIOS: 'drb_usuarios_v1',
  ACTIVIDADES: 'drb_actividades_v1',
  FINANCIAMIENTOS: 'drb_financiamientos_v1',
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

export class StorageService {
  // --- INICIALIZACIÓN ---
  static getPacientes(): Paciente[] {
    const data = localStorage.getItem(KEYS.PACIENTES);
    if (data !== null) return JSON.parse(data);
    return localStorage.getItem('drb_clean_mode') === 'true' ? [] : INITIAL_PACIENTES;
  }

  static savePacientes(list: Paciente[]): void {
    localStorage.setItem(KEYS.PACIENTES, JSON.stringify(list));
    window.dispatchEvent(new Event('storage'));
  }

  static getPagos(): Pago[] {
    const data = localStorage.getItem(KEYS.PAGOS);
    if (data !== null) return JSON.parse(data);
    return localStorage.getItem('drb_clean_mode') === 'true' ? [] : INITIAL_PAGOS;
  }

  static savePagos(list: Pago[]): void {
    localStorage.setItem(KEYS.PAGOS, JSON.stringify(list));
    window.dispatchEvent(new Event('storage'));
  }

  static getUsuarios(): Usuario[] {
    const data = localStorage.getItem(KEYS.USUARIOS);
    let list: Usuario[] = data ? JSON.parse(data) : INITIAL_USUARIOS;
    
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
    localStorage.setItem(KEYS.USUARIOS, JSON.stringify(list));
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
    const data = localStorage.getItem(KEYS.ACTIVIDADES);
    if (data !== null) return JSON.parse(data);
    return localStorage.getItem('drb_clean_mode') === 'true' ? [] : INITIAL_ACTIVIDADES;
  }

  static saveActividades(list: ActividadCRM[]): void {
    localStorage.setItem(KEYS.ACTIVIDADES, JSON.stringify(list));
    window.dispatchEvent(new Event('storage'));
  }

  static getFinanciamientos(): FinanciamientoCirugia[] {
    const data = localStorage.getItem(KEYS.FINANCIAMIENTOS);
    if (data !== null) return JSON.parse(data);
    return localStorage.getItem('drb_clean_mode') === 'true' ? [] : INITIAL_FINANCIAMIENTOS;
  }

  static saveFinanciamientos(list: FinanciamientoCirugia[]): void {
    localStorage.setItem(KEYS.FINANCIAMIENTOS, JSON.stringify(list));
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
        if (data.pacientes && Array.isArray(data.pacientes)) {
          this.savePacientes(data.pacientes);
        }
        if (data.pagos && Array.isArray(data.pagos)) {
          this.savePagos(data.pagos);
        }
        if (data.usuarios && Array.isArray(data.usuarios)) {
          this.saveUsuarios(data.usuarios);
        }
        if (data.actividades && Array.isArray(data.actividades)) {
          this.saveActividades(data.actividades);
        }
        if (data.financiamientos && Array.isArray(data.financiamientos)) {
          this.saveFinanciamientos(data.financiamientos);
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
        financiamientos: this.getFinanciamientos()
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
            financiamientos: []
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
  }
}
