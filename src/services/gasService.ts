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
   * Envía una petición POST a Google Apps Script Web App.
   * Utiliza mode: 'cors' y formato JSON con Content-Type text/plain para evitar preflight CORS.
   */
  static async sendPost(gasUrl: string, payload: any): Promise<any> {
    const cleanUrl = this.normalizeUrl(gasUrl);
    if (!cleanUrl) {
      throw new Error('URL de Google Apps Script no configurada.');
    }

    try {
      const response = await fetch(cleanUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      return data;
    } catch (err: any) {
      console.error('Error enviando petición a Apps Script:', err);
      throw new Error(
        'No se pudo conectar con Google Apps Script. Verifica que la URL termine en /exec y que el despliegue en Google Apps Script tenga "Quién tiene acceso" en "Cualquier persona" (Anyone).'
      );
    }
  }

  /**
   * Obtiene datos desde Google Apps Script vía GET
   */
  static async sendGet(gasUrl: string, action: string): Promise<any> {
    const cleanUrl = this.normalizeUrl(gasUrl);
    if (!cleanUrl) {
      throw new Error('URL de Google Apps Script no configurada.');
    }

    const separator = cleanUrl.includes('?') ? '&' : '?';
    const url = `${cleanUrl}${separator}action=${encodeURIComponent(action)}&t=${Date.now()}`;

    try {
      const response = await fetch(url, { method: 'GET' });
      const data = await response.json();
      return data;
    } catch (err: any) {
      console.error('Error consultando Apps Script:', err);
      throw new Error(
        'No se pudo obtener información de Google Apps Script. Revisa que el despliegue permita el acceso a "Cualquier persona" (Anyone) y que la URL termine en /exec.'
      );
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

