import React, { useState } from 'react';
import {
  FileCode2,
  Copy,
  Check,
  Database,
  ExternalLink,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { CODE_GS_SCRIPT } from '../gas/codeGs';
import { StorageService } from '../services/storageService';
import { GasService } from '../services/gasService';

interface GasViewProps {
  onDataSyncSuccess: () => void;
}

export const GasView: React.FC<GasViewProps> = ({ onDataSyncSuccess }) => {
  const [gasUrl, setGasUrl] = useState(StorageService.getGasUrl());
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(CODE_GS_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveUrl = () => {
    const cleaned = GasService.normalizeUrl(gasUrl);
    setGasUrl(cleaned);
    StorageService.saveGasUrl(cleaned);
    setTestResult({ success: true, message: 'URL normalizada y guardada localmente.' });
  };

  const handleTestConnection = async () => {
    if (!gasUrl.trim()) {
      setTestResult({ success: false, message: 'Ingresa primero la URL de tu Web App en Apps Script.' });
      return;
    }

    const cleaned = GasService.normalizeUrl(gasUrl);
    setGasUrl(cleaned);

    setIsTesting(true);
    setTestResult(null);

    const res = await GasService.testConnection(cleaned);
    setIsTesting(false);
    setTestResult(res);

    if (res.success) {
      StorageService.saveGasUrl(cleaned);
    }
  };

  const handleSyncFromGas = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    const res = await StorageService.syncFromGas();
    setIsSyncing(false);
    setSyncMessage(res.message);
    if (res.success) {
      onDataSyncSuccess();
    }
  };

  const handlePushToGas = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    const res = await StorageService.pushFullDatabaseToGas();
    setIsSyncing(false);
    setSyncMessage(res.message);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif italic font-bold text-teal-700 tracking-tight">Backend Serverless Google Sheets</h1>
          <p className="text-xs text-slate-500 mt-1">
            Conecta tu propia hoja de cálculo en Google Drive para persistir todos los datos en la nube sin costos de servidor.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyCode}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-2xs flex items-center space-x-2 transition-all cursor-pointer shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '¡Código Copiado!' : 'Copiar Code.gs'}</span>
          </button>
        </div>
      </div>

      {/* CONFIGURACIÓN DE URL Y PRUEBAS */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span>Configurar URL de Google Apps Script Web App</span>
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            placeholder="Pega la URL de tu Web App desplegada (https://script.google.com/macros/s/.../exec)"
            value={gasUrl}
            onChange={(e) => setGasUrl(e.target.value)}
            className="flex-1 w-full px-4 py-2 text-xs bg-slate-100 border-none rounded-full focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 text-slate-800 font-mono placeholder-slate-400"
          />

          <button
            onClick={handleSaveUrl}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
          >
            Guardar URL
          </button>

          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors flex items-center space-x-1.5 cursor-pointer shrink-0 disabled:opacity-50"
          >
            {isTesting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>{isTesting ? 'Probando...' : 'Probar Conexión'}</span>
          </button>
        </div>

        {/* MENSAJE RESULTADO DE PRUEBA */}
        {testResult && (
          <div className="space-y-3">
            <div className={`p-3.5 rounded-lg border text-xs flex items-start space-x-2.5 ${
              testResult.success ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
              <div>
                <p className="font-semibold">{testResult.message}</p>
              </div>
            </div>

            {!testResult.success && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-2 text-amber-900">
                <p className="font-bold flex items-center space-x-1.5">
                  <span>⚠️ Solución para el error "No se pudo obtener" en Google Apps Script:</span>
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-700 font-sans pl-1">
                  <li>
                    <strong>Asegúrate de que la URL termine en <code className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-mono font-bold">/exec</code></strong> (Ejemplo: <span className="font-mono text-[11px] text-slate-600">https://script.google.com/macros/s/AKfycb.../exec</span>). La aplicación ya corrigió la URL automáticamente si le faltaba.
                  </li>
                  <li>
                    <strong>Configuración de Permisos en Google Apps Script:</strong> Ve a tu pestaña de Apps Script, haz clic en <strong className="text-amber-900">Desplegar → Gestionar despliegues</strong> (o Nuevo Despliegue), y asegúrate de configurar:
                    <ul className="list-disc list-inside pl-4 mt-1 space-y-0.5 font-medium">
                      <li>Ejecutar como: <strong>Yo (tu correo)</strong></li>
                      <li>Quién tiene acceso: <strong className="text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded">Cualquier persona (Anyone)</strong></li>
                    </ul>
                    <span className="text-[11px] text-slate-500 block mt-0.5">*(Si dice "Solo yo" o "Usuarios con cuenta de Google", Google bloqueará la conexión y saldrá error).*</span>
                  </li>
                  <li>
                    <strong>Nueva versión:</strong> Al hacer cualquier cambio en Apps Script, debes ir a <strong>Desplegar → Gestionar despliegues → Editar (icono lápiz) → Versión: "Nueva versión" → Desplegar</strong>.
                  </li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* ACCIONES DE SINCRONIZACIÓN */}
        {gasUrl && (
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Acciones de Sincronización Manual entre la Web App y tu Google Sheet:
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={handleSyncFromGas}
                disabled={isSyncing}
                className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-teal-600" />
                <span>Descargar de Sheets</span>
              </button>

              <button
                onClick={handlePushToGas}
                disabled={isSyncing}
                className="flex-1 sm:flex-none px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Subir Local a Sheets</span>
              </button>
            </div>
          </div>
        )}

        {syncMessage && (
          <div className="text-xs font-semibold text-teal-800 bg-teal-50 p-2.5 rounded-lg border border-teal-200">
            {syncMessage}
          </div>
        )}
      </div>

      {/* GUÍA DE PASOS PARA DESPLIEGUE */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-teal-600" />
          <span>Guía Paso a Paso para Crear la Base de Datos en Google Sheets (5 Pestañas)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
            <span className="font-bold text-teal-700">Paso 1</span>
            <h4 className="font-semibold text-slate-800">Crear Google Sheet</h4>
            <p className="text-slate-500 text-[11px]">En tu Google Drive, crea una Hoja de Cálculo nueva llamada "Dr. Belleza - BD".</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
            <span className="font-bold text-teal-700">Paso 2</span>
            <h4 className="font-semibold text-slate-800">Abrir Apps Script</h4>
            <p className="text-slate-500 text-[11px]">En el menú de Google Sheets, ve a Extensiones → Apps Script.</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
            <span className="font-bold text-teal-700">Paso 3</span>
            <h4 className="font-semibold text-slate-800">Pegar Code.gs</h4>
            <p className="text-slate-500 text-[11px]">Copia el código fuente de abajo y reemplaza todo el contenido de Code.gs.</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
            <span className="font-bold text-teal-700">Paso 4</span>
            <h4 className="font-semibold text-slate-800">Ejecutar Setup</h4>
            <p className="text-slate-500 text-[11px]">Selecciona la función 'setupSpreadsheet' y haz clic en Ejecutar para crear las 5 pestañas automáticamente.</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1">
            <span className="font-bold text-teal-700">Paso 5</span>
            <h4 className="font-semibold text-slate-800">Desplegar Web App</h4>
            <p className="text-slate-500 text-[11px]">Desplegar → Nuevo Despliegue → Aplicación Web → Acceso: Cualquier Persona → Copiar URL.</p>
          </div>
        </div>
      </div>

      {/* VISOR DE CÓDIGO FUENTE CODE.GS */}
      <div className="bg-slate-900 rounded-lg p-5 text-slate-300 font-mono text-xs space-y-3 overflow-hidden shadow-2xs border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <FileCode2 className="w-4 h-4 text-teal-400" />
            <span className="font-bold text-slate-200">Code.gs (Backend Google Apps Script)</span>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href="/Code.gs"
              download="Code.gs"
              className="px-3 py-1 bg-teal-800 hover:bg-teal-700 text-teal-100 text-xs rounded-lg transition-colors flex items-center space-x-1 cursor-pointer font-sans no-underline"
            >
              <Download className="w-3.5 h-3.5 text-teal-300" />
              <span>Descargar Code.gs</span>
            </a>

            <button
              onClick={handleCopyCode}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs rounded-lg transition-colors flex items-center space-x-1 cursor-pointer font-sans"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        <pre className="max-h-96 overflow-y-auto p-3 bg-slate-950 rounded-lg text-emerald-400/90 leading-relaxed select-all">
          {CODE_GS_SCRIPT}
        </pre>
      </div>

    </div>
  );
};
