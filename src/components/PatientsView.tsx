import React, { useState } from 'react';
import {
  Users,
  Search,
  PlusCircle,
  Filter,
  Eye,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ChevronRight,
  UserCheck,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Paciente, getRolePermissions, RolUsuario } from '../types';
import { matchesSearch } from '../services/financingConfig';

interface PatientsViewProps {
  pacientes: Paciente[];
  userRole?: RolUsuario;
  onSelectPatient: (pacienteId: string) => void;
  onNewPatient: () => void;
  onDeletePatient?: (pacienteId: string) => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  pacientes,
  userRole,
  onSelectPatient,
  onNewPatient,
  onDeletePatient
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState<string>('Todos');
  const [patientToDelete, setPatientToDelete] = useState<Paciente | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const permissions = getRolePermissions(userRole);

  // Filtrado de pacientes por texto o género
  const filteredPatients = pacientes.filter(p => {
    if (!p) return false;
    const matchesQuery =
      matchesSearch(p.nombre, searchTerm) ||
      matchesSearch(p.cedula, searchTerm) ||
      matchesSearch(p.id, searchTerm) ||
      matchesSearch(p.procedimiento, searchTerm) ||
      matchesSearch(p.telefono, searchTerm) ||
      matchesSearch(p.correo, searchTerm);

    const matchesGender = selectedGender === 'Todos' || p.genero === selectedGender;

    return matchesQuery && matchesGender;
  });

  const handleConfirmDelete = async () => {
    if (patientToDelete && onDeletePatient) {
      setIsDeleting(true);
      try {
        await onDeletePatient(patientToDelete.id);
      } finally {
        setIsDeleting(false);
        setPatientToDelete(null);
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* CABECERA Y ACCIONES DE PACIENTES */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif italic font-bold text-teal-700 tracking-tight">Directorio de Pacientes</h1>
          <p className="text-xs text-slate-500 mt-1">
            {filteredPatients.length} paciente(s) registrado(s) en base de datos médica.
          </p>
        </div>

        {permissions.canAddPatient && (
          <button
            onClick={onNewPatient}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg shadow-2xs flex items-center justify-center space-x-2 transition-all cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Registrar Paciente</span>
          </button>
        )}
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Buscar por Nombre, Cédula, ID o Cirugía proyectada..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-100 border-none rounded-full focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 text-slate-800 placeholder-slate-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-700"
          >
            <option value="Todos">Todos los Géneros</option>
            <option value="Femenino">Femenino</option>
            <option value="Masculino">Masculino</option>
          </select>
        </div>
      </div>

      {/* LISTA DE PACIENTES: VISTA MÓVIL EN TARJETAS + TABLA EN ESCRITORIO */}
      
      {/* Vista Móvil (Tarjetas) */}
      <div className="block md:hidden space-y-3">
        {filteredPatients.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border border-slate-200 text-center text-slate-400 text-xs">
            No se encontraron pacientes que coincidan con la búsqueda.
          </div>
        ) : (
          filteredPatients.map((p) => (
            <div key={p.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 px-2 py-0.5 rounded-md border border-teal-100">
                    {p.id}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{p.nombre || 'Paciente sin nombre'}</h3>
                  <span className="text-xs text-slate-500">Cédula: {p.cedula || 'N/A'}</span>
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-600 shrink-0">
                  {p.contactada || 'Activo'}
                </span>
              </div>

              <div className="text-xs space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div className="font-semibold text-teal-800">{p.procedimiento || 'Consulta General'}</div>
                <div className="flex items-center text-slate-600 pt-1">
                  <Phone className="w-3.5 h-3.5 text-teal-600 mr-1.5 shrink-0" />
                  <span>{p.telefono || 'Sin teléfono'}</span>
                </div>
                {p.correo && (
                  <div className="flex items-center text-slate-500">
                    <Mail className="w-3.5 h-3.5 text-teal-600 mr-1.5 shrink-0" />
                    <span className="truncate">{p.correo}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => onSelectPatient(p.id)}
                  className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg transition-all flex items-center justify-center space-x-2 shadow-2xs cursor-pointer active:scale-98"
                >
                  <Eye className="w-4 h-4" />
                  <span>Ver Ficha 360°</span>
                </button>

                {permissions.canDeleteAnything && (
                  <button
                    onClick={() => setPatientToDelete(p)}
                    className="p-2 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 rounded-lg transition-all cursor-pointer shrink-0"
                    title="Eliminar paciente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Vista Escritorio (Tabla) */}
      <div className="hidden md:block bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-6">ID / Cédula</th>
                <th className="py-3.5 px-6">Nombre y Apellido</th>
                <th className="py-3.5 px-6">Cirugía Proyectada</th>
                <th className="py-3.5 px-6">Contacto</th>
                <th className="py-3.5 px-6">Estatus</th>
                <th className="py-3.5 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No se encontraron pacientes que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-6">
                      <span className="font-semibold text-slate-900 block">{p.id}</span>
                      <span className="text-[11px] text-slate-400">{p.cedula}</span>
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-800">
                      <div>{p.nombre}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{p.genero}</span>
                    </td>
                    <td className="py-3.5 px-6 font-medium text-teal-700">
                      {p.procedimiento}
                    </td>
                    <td className="py-3.5 px-6 space-y-0.5">
                      <div className="flex items-center text-slate-600">
                        <Phone className="w-3 h-3 text-slate-400 mr-1" />
                        {p.telefono}
                      </div>
                      <div className="flex items-center text-slate-400 text-[11px]">
                        <Mail className="w-3 h-3 text-slate-400 mr-1" />
                        {p.correo}
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-600">
                        {p.contactada || 'Activo'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onSelectPatient(p.id)}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-teal-600 hover:text-white text-slate-700 font-semibold rounded-lg transition-all text-xs flex items-center space-x-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ficha 360°</span>
                        </button>

                        {permissions.canDeleteAnything && (
                          <button
                            onClick={() => setPatientToDelete(p)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 rounded-lg transition-all cursor-pointer"
                            title="Eliminar paciente"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {patientToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Confirmar Eliminación de Paciente</h3>
                <span className="text-xs text-rose-600 font-semibold uppercase tracking-wider">Acción Exclusiva de Administrador</span>
              </div>
            </div>

            <div className="bg-rose-50/70 border border-rose-200 p-3.5 rounded-xl text-xs text-slate-700 space-y-2">
              <p>
                Estás a punto de borrar definitivamente a la paciente:
              </p>
              <div className="font-bold text-slate-900 text-sm bg-white p-2 rounded-lg border border-rose-200">
                {patientToDelete.nombre} <span className="font-normal text-slate-500 text-xs">({patientToDelete.id} - C.I. {patientToDelete.cedula})</span>
              </div>
              <p className="text-rose-700 font-semibold pt-1">
                ⚠️ Se eliminará de forma irreversible:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-600">
                <li>Expediente clínico y datos personales</li>
                <li>Historial completo de abonos y recibos</li>
                <li>Plan de financiamiento quirúrgico</li>
                <li>Alarmas de cobro y eventos en el Calendario CRM</li>
              </ul>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setPatientToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Trash2 className={`w-4 h-4 ${isDeleting ? 'animate-spin' : ''}`} />
                <span>{isDeleting ? 'Eliminando...' : 'Sí, Eliminar Todo'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
