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
  UserCheck
} from 'lucide-react';
import { Paciente } from '../types';

interface PatientsViewProps {
  pacientes: Paciente[];
  onSelectPatient: (pacienteId: string) => void;
  onNewPatient: () => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  pacientes,
  onSelectPatient,
  onNewPatient
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState<string>('Todos');

  // Filtrado de pacientes por texto o género
  const filteredPatients = pacientes.filter(p => {
    if (!p) return false;
    const term = (searchTerm || '').toLowerCase();
    const matchesSearch =
      (p.nombre || '').toLowerCase().includes(term) ||
      (p.cedula || '').toLowerCase().includes(term) ||
      (p.id || '').toLowerCase().includes(term) ||
      (p.procedimiento || '').toLowerCase().includes(term);

    const matchesGender = selectedGender === 'Todos' || p.genero === selectedGender;

    return matchesSearch && matchesGender;
  });

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

        <button
          onClick={onNewPatient}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg shadow-2xs flex items-center justify-center space-x-2 transition-all cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Registrar Paciente</span>
        </button>
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

      {/* TABLA DE PACIENTES */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-6">ID / Cédula</th>
                <th className="py-3.5 px-6">Nombre y Apellido</th>
                <th className="py-3.5 px-6">Cirugía Proyectada</th>
                <th className="py-3.5 px-6">Contacto</th>
                <th className="py-3.5 px-6">Estatus</th>
                <th className="py-3.5 px-6 text-right">Acción 360°</th>
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
                      <button
                        onClick={() => onSelectPatient(p.id)}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-teal-600 hover:text-white text-slate-700 font-semibold rounded-lg transition-all text-xs flex items-center justify-end space-x-1 ml-auto cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ficha 360°</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
