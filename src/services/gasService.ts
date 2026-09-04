import { Paciente, Pago, Usuario, ActividadCRM, FinanciamientoCirugia } from '../types';

export class GasService {
  /**
   * Normaliza y limpia la URL de Google Apps Script para asegurar que termine en /exec
   */
  static normalizeUrl(url: string): string {
    if (!url) return '';
    let cleaned = url.trim().replace(/^["']|["']$/g, '');
    
    // Si copiaron una URL de edición
    if (cleaned.includes('/edit')) {
      cleaned = cleaned.replace(/\/edit.*$/, '/exec');
    }
    // Si copiaron una URL de desarrollo
    if (cleaned.endsWith('/dev')) {
      cleaned = cleaned.replace(/\/dev$/, '/exec');
    }
    // Si falta /exec al final
    if (!cleaned.endsWith('/exec') && !cleaned.includes('?')) {
      cleaned = cleaned.replace(/\/+$/, '') + '/exec';
    }
    return cleaned;
  }

  /**
   * Sanitiza el payload para garantizar que ningún usuario eliminado o conflictivo sea enviado a Google Sheets
   */
  static sanitizePayload(payload: any): any {
    if (!payload || typeof payload !== 'object') return payload;
    const copy = { ...payload };
    const deleted = new Set<string>([
      'USR-973', 'USR-706', 'USR-617', 'USR-305', 'USR-421', 'USR-923', 'USR-893',
      'YOLY@BECERRA.COM', 'GERANINCHIQUI@GMAIL.COM', 'GERALDINE@RINCON.COM',
      'GERALDINE@PRUEBAS.COM', 'PRUEBA@PRUEBA1.COM',
      'DRA.ISABELLA@DRBELLEZA.COM', 'MARIA.CRM@DRBELLEZA.COM', 'DR.MENDOZA@DRBELLEZA.COM',
      'CARLOS.FINANZAS@DRBELLEZA.COM', 'MENDOZA@DRBELLEZA.COM', 'VALERIA@DRBELLEZA.COM'
    ]);

    try {
      const raw = localStorage.getItem('drb_deleted_usuarios_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((id: string) => {
            if (id && typeof id === 'string') deleted.add(id.trim().toUpperCase());
          });
        }
      }
    } catch {
      // ignore
    }

    if (copy.action === 'saveUsuario' && copy.usuario) {
      const uId = String(copy.usuario.usuarioId || '').trim().toUpperCase();
      const uEmail = String(copy.usuario.email || '').trim().toUpperCase();
      if (deleted.has(uId) || deleted.has(uEmail)) {
        return null; // Operación bloqueada
      }
    }

    if (Array.isArray(copy.usuarios)) {
      copy.usuarios = copy.usuarios.filter((u: any) => {
        const uId = String(u.usuarioId || u.Usuario_ID || '').trim().toUpperCase();
        const uEmail = String(u.email || u.Email || '').trim().toUpperCase();
        return !deleted.has(uId) && !deleted.has(uEmail);
      });
    }

    return copy;
  }

  private static postQueue: Promise<any> = Promise.resolve();

  /**
   * Envía una petición POST a Google Apps Script Web App.
   * Utiliza prioritariamente el proxy del backend (/api/gas-proxy) para aplicar validaciones y evitar CORS.
   * Encola secuencialmente las llamadas para evitar saturar Google Sheets con peticiones simultáneas.
   */
  static async sendPost(gasUrl: string, rawPayload: any): Promise<any> {
    return (this.postQueue = this.postQueue.then(
      () => this.doSendPost(gasUrl, rawPayload),
      () => this.doSendPost(gasUrl, rawPayload)
    ));
  }

  private static async doSendPost(gasUrl: string, rawPayload: any): Promise<any> {
    const cleanUrl = this.normalizeUrl(gasUrl);
    if (!cleanUrl) {
      return { success: false, message: 'URL de Google Apps Script no configurada.' };
    }

    const payload = this.sanitizePayload(rawPayload);
    if (!payload) {
      return { success: true, message: 'Operación cancelada: usuario marcado para eliminación permanente.' };
    }

    // 1. Intentar prioritariamente a través del proxy backend (seguro, sin CORS, con filtrado)
    try {
      const proxyRes = await fetch('/api/gas-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gasUrl: cleanUrl, payload })
      });
      const proxyText = await proxyRes.text();
      try {
        return JSON.parse(proxyText);
      } catch {
        return {
          success: proxyRes.ok,
          message: proxyText.startsWith('<') ? 'Respuesta procesada por el servidor' : proxyText
        };
      }
    } catch (proxyErr) {
      console.warn('Aviso vía proxy backend, intentando directo a Apps Script...', proxyErr);
    }

    // 2. Fallback directo a Google Apps Script
    try {
      const response = await fetch(cleanUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return {
          success: response.ok,
          message: text.startsWith('<') ? 'Respuesta procesada por Google Apps Script' : text
        };
      }
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to fetch',
        message: 'No se pudo conectar con Google Apps Script. Verifica que la URL termine en /exec y que el despliegue tenga acceso "Cualquier persona" (Anyone).'
      };
    }
  }

  /**
   * Obtiene datos desde Google Apps Script vía GET
   */
  static async sendGet(gasUrl: string, action: string): Promise<any> {
    const cleanUrl = this.normalizeUrl(gasUrl);
    if (!cleanUrl) {
      return { success: false, message: 'URL de Google Apps Script no configurada.' };
    }

    const separator = cleanUrl.includes('?') ? '&' : '?';
    const url = `${cleanUrl}${separator}action=${encodeURIComponent(action)}&t=${Date.now()}`;

    try {
      const response = await fetch(url, { method: 'GET' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return { success: false, error: 'Respuesta no válida de Apps Script' };
      }
    } catch (err: any) {
      console.warn('Aviso consultando Apps Script:', err?.message || err);
      return {
        success: false,
        error: err?.message || 'Failed to fetch',
        message: 'No se pudo obtener información de Google Apps Script. Revisa que el despliegue permita acceso a "Cualquier persona" (Anyone).'
      };
    }
  }

  /**
   * Verifica si la URL de Google Apps Script responde correctamente
   */
  static async testConnection(gasUrl: string): Promise<{ success: boolean; message: string }> {
    try {
      const cleanUrl = this.normalizeUrl(gasUrl);
      const result = await this.sendGet(cleanUrl, 'ping');
      if (result && (result.status === 'ok' || result.message)) {
        return { success: true, message: '¡Conexión exitosa con Google Apps Script y Google Sheets!' };
      }
      return { success: false, message: result.error || 'La respuesta de la Web App no fue válida.' };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'No se pudo conectar a la URL introducida.'
      };
    }
  }
}

