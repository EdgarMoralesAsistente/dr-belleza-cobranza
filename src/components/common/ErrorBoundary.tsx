import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export interface ErrorBoundaryProps {
  children?: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
  key?: React.Key;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[300px] w-full p-6 bg-rose-50/50 border border-rose-200 rounded-2xl flex flex-col items-center justify-center text-center my-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            {this.props.fallbackTitle || 'Ocurrió un error inesperado al cargar esta sección'}
          </h3>
          <p className="text-xs text-slate-600 max-w-md mb-4 leading-relaxed">
            Hemos protegido la aplicación para evitar cierres inesperados. Puedes intentar recuperar la vista o reiniciar la sección.
          </p>
          {this.state.error?.message && (
            <div className="bg-white border border-rose-200 text-rose-800 text-[11px] font-mono p-2.5 rounded-lg mb-4 max-w-lg overflow-x-auto text-left w-full">
              {this.state.error.message}
            </div>
          )}
          <div className="flex items-center space-x-3 flex-wrap gap-y-2 justify-center">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reintentar Cargar</span>
            </button>
            <button
              onClick={this.handleReload}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Recargar Aplicación</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
