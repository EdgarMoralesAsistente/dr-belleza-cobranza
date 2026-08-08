import { Paciente, Pago, Usuario, ActividadCRM, FinanciamientoCirugia } from '../types';

export class GasService {
  /**
   * Envía una petición POST a Google Apps Script Web App.
   * Utiliza mode: 'cors' y formato JSON.
   */
  static async sendPost(gasUrl: string, payload: any): Promise<any> {
    if (!gasUrl || !gasUrl.trim()) {
      throw new Error('URL de Google Apps Script no configurada.');
    }

    try {
      const response = await fetch(gasUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // Requerido por GAS para evitar preflight OPTIONS
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      return data;
    } catch (err: any) {
      console.error('Error enviando petición a Apps Script:', err);
      throw new Error(err.message || 'Error de conexión con Google Apps Script');
    }
  }

  /**
   * Obtiene datos desde Google Apps Script vía GET
   */
  static async sendGet(gasUrl: string, action: string): Promise<any> {
    if (!gasUrl || !gasUrl.trim()) {
      throw new Error('URL de Google Apps Script no configurada.');
    }

    const separator = gasUrl.includes('?') ? '&' : '?';
    const url = `${gasUrl}${separator}action=${encodeURIComponent(action)}&t=${Date.now()}`;

    try {
      const response = await fetch(url, { method: 'GET' });
      const data = await response.json();
      return data;
    } catch (err: any) {
      console.error('Error consultando Apps Script:', err);
      throw new Error(err.message || 'Error de lectura desde Google Apps Script');
    }
  }

  /**
   * Verifica si la URL de Google Apps Script responde correctamente
   */
  static async testConnection(gasUrl: string): Promise<{ success: boolean; message: string }> {
    try {
      const result = await this.sendGet(gasUrl, 'ping');
      if (result && (result.status === 'ok' || result.message)) {
        return { success: true, message: '¡Conexión exitosa con Google Apps Script y Google Sheets!' };
      }
      return { success: false, message: 'La respuesta no fue válida.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'No se pudo conectar a la URL introducida.' };
    }
  }
}
