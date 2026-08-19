import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Phone, Check } from 'lucide-react';

export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  format: string;
}

export const COUNTRIES: Country[] = [
  { code: 'VE', name: 'Venezuela', dialCode: '+58', flag: '🇻🇪', format: '412 123 4567' },
  { code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴', format: '300 123 4567' },
  { code: 'US', name: 'Estados Unidos', dialCode: '+1', flag: '🇺🇸', format: '202 555 0123' },
  { code: 'ES', name: 'España', dialCode: '+34', flag: '🇪🇸', format: '612 345 678' },
  { code: 'MX', name: 'México', dialCode: '+52', flag: '🇲🇽', format: '55 1234 5678' },
  { code: 'PA', name: 'Panamá', dialCode: '+507', flag: '🇵🇦', format: '6123 4567' },
  { code: 'EC', name: 'Ecuador', dialCode: '+593', flag: '🇪🇨', format: '99 123 4567' },
  { code: 'PE', name: 'Perú', dialCode: '+51', flag: '🇵🇪', format: '912 345 678' },
  { code: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱', format: '9 1234 5678' },
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷', format: '11 1234 5678' },
  { code: 'DO', name: 'República Dominicana', dialCode: '+1-809', flag: '🇩🇴', format: '809 123 4567' },
  { code: 'CR', name: 'Costa Rica', dialCode: '+506', flag: '🇨🇷', format: '8123 4567' },
  { code: 'GT', name: 'Guatemala', dialCode: '+502', flag: '🇬🇹', format: '5123 4567' },
  { code: 'SV', name: 'El Salvador', dialCode: '+503', flag: '🇸🇻', format: '7123 4567' },
  { code: 'HN', name: 'Honduras', dialCode: '+504', flag: '🇭🇳', format: '9123 4567' },
  { code: 'NI', name: 'Nicaragua', dialCode: '+505', flag: '🇳🇮', format: '8123 4567' },
  { code: 'BO', name: 'Bolivia', dialCode: '+591', flag: '🇧🇴', format: '7123 4567' },
  { code: 'PY', name: 'Paraguay', dialCode: '+595', flag: '🇵🇾', format: '981 123 456' },
  { code: 'UY', name: 'Uruguay', dialCode: '+598', flag: '🇺🇾', format: '99 123 456' },
  { code: 'BR', name: 'Brasil', dialCode: '+55', flag: '🇧🇷', format: '11 91234 5678' },
  { code: 'PR', name: 'Puerto Rico', dialCode: '+1-787', flag: '🇵🇷', format: '787 123 4567' },
  { code: 'CA', name: 'Canadá', dialCode: '+1', flag: '🇨🇦', format: '416 123 4567' },
  { code: 'IT', name: 'Italia', dialCode: '+39', flag: '🇮🇹', format: '312 345 6789' },
  { code: 'PT', name: 'Portugal', dialCode: '+351', flag: '🇵🇹', format: '912 345 678' },
  { code: 'GB', name: 'Reino Unido', dialCode: '+44', flag: '🇬🇧', format: '7123 456789' },
  { code: 'DE', name: 'Alemania', dialCode: '+49', flag: '🇩🇪', format: '151 12345678' },
  { code: 'FR', name: 'Francia', dialCode: '+33', flag: '🇫🇷', format: '6 12 34 56 78' },
  { code: 'CH', name: 'Suiza', dialCode: '+41', flag: '🇨🇭', format: '79 123 45 67' },
  { code: 'NL', name: 'Países Bajos', dialCode: '+31', flag: '🇳🇱', format: '6 12345678' },
  { code: 'AW', name: 'Aruba', dialCode: '+297', flag: '🇦🇼', format: '591 2345' },
  { code: 'CW', name: 'Curazao', dialCode: '+599', flag: '🇨🇼', format: '9 512 3456' },
  { code: 'TT', name: 'Trinidad y Tobago', dialCode: '+1-868', flag: '🇹🇹', format: '868 123 4567' }
];

interface CountryPhoneInputProps {
  value: string;
  onChange: (fullFormattedPhone: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  hasError?: boolean;
}

export const CountryPhoneInput: React.FC<CountryPhoneInputProps> = ({
  value,
  onChange,
  placeholder,
  className = '',
  required = false,
  hasError = false
}) => {
  // Parse initial country and number from `value` string
  const parsePhoneValue = (val: string) => {
    if (!val) return { selectedCountry: COUNTRIES[0], numberPart: '' };

    let cleaned = val.trim();
    if (cleaned.startsWith("'")) {
      cleaned = cleaned.substring(1).trim();
    }

    // Find country matching the dialCode prefix
    const matched = COUNTRIES.find(c => cleaned.startsWith(c.dialCode));
    if (matched) {
      const rest = cleaned.substring(matched.dialCode.length).trim();
      return { selectedCountry: matched, numberPart: rest };
    }

    // Check if it starts with + but didn't match directly
    if (cleaned.startsWith('+')) {
      const withoutPlus = cleaned.substring(1).trim();
      return { selectedCountry: COUNTRIES[0], numberPart: withoutPlus };
    }

    return { selectedCountry: COUNTRIES[0], numberPart: cleaned };
  };

  const initialParsed = parsePhoneValue(value);
  const [selectedCountry, setSelectedCountry] = useState<Country>(initialParsed.selectedCountry);
  const [phoneNumber, setPhoneNumber] = useState<string>(initialParsed.numberPart);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync internal state when value prop changes externally
  useEffect(() => {
    if (value !== undefined) {
      const parsed = parsePhoneValue(value);
      setSelectedCountry(parsed.selectedCountry);
      setPhoneNumber(parsed.numberPart);
    }
  }, [value]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelectCountry = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery('');
    
    // Construct new full phone string
    const full = phoneNumber.trim()
      ? `${country.dialCode} ${phoneNumber.trim()}`
      : '';
    onChange(full);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputVal = e.target.value;
    
    // Si pegan un texto con prefijo internacional o +, limpiarlo
    if (inputVal.startsWith('+')) {
      const parsed = parsePhoneValue(inputVal);
      setSelectedCountry(parsed.selectedCountry);
      inputVal = parsed.numberPart;
    }

    setPhoneNumber(inputVal);
    const full = inputVal.trim()
      ? `${selectedCountry.dialCode} ${inputVal.trim()}`
      : '';
    onChange(full);
  };

  const filteredCountries = COUNTRIES.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.dialCode.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q)
    );
  });

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center space-x-2 relative" ref={dropdownRef}>
        
        {/* BOTÓN SELECTOR DE PAÍS / BANDERA */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between space-x-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-900 font-bold cursor-pointer transition-all shrink-0 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30"
          title="Seleccionar país y código de área"
        >
          <span className="text-base leading-none">{selectedCountry.flag}</span>
          <span className="text-xs font-mono font-extrabold text-teal-800">{selectedCountry.dialCode}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* INPUT DEL NÚMERO DE TELÉFONO LOCAL */}
        <div className="relative flex-1">
          <input
            type="tel"
            required={required}
            placeholder={placeholder || selectedCountry.format}
            value={phoneNumber}
            onChange={handleNumberChange}
            className={`w-full px-3 py-2 bg-slate-50 border rounded-lg focus:outline-hidden focus:ring-2 font-bold text-slate-900 text-xs tracking-wide ${
              hasError
                ? 'border-rose-400 bg-rose-50/50 focus:ring-rose-500/30 focus:border-rose-500'
                : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-600'
            }`}
          />
        </div>

        {/* DROPDOWN POPUP CON BÚSQUEDA DE PAÍS */}
        {isOpen && (
          <div className="absolute left-0 top-full mt-1.5 w-72 max-w-[90vw] bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* INPUT DE BÚSQUEDA */}
            <div className="p-2.5 bg-slate-50 border-b border-slate-200 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-5 top-4 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar país o prefijo (+58, Colombia...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* LISTA DE PAÍSES FILTRADOS */}
            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 text-xs">
              {filteredCountries.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs">
                  No se encontró el país "{searchQuery}"
                </div>
              ) : (
                filteredCountries.map((c) => {
                  const isSelected = c.code === selectedCountry.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleSelectCountry(c)}
                      className={`w-full px-3 py-2 flex items-center justify-between text-left transition-colors cursor-pointer hover:bg-teal-50/50 ${
                        isSelected ? 'bg-teal-50 font-bold text-teal-900' : 'text-slate-800 font-medium'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <span className="text-base leading-none">{c.flag}</span>
                        <span className="truncate text-xs">{c.name}</span>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="font-mono text-xs font-bold text-teal-700 bg-slate-100 px-1.5 py-0.5 rounded-md">
                          {c.dialCode}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-teal-600" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            
            <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 text-center font-medium">
              Seleccione el país para asignar el prefijo internacional automáticamente
            </div>

          </div>
        )}

      </div>

      {/* MUESTRA EL NÚMERO COMPLETO FORMATEADO */}
      <div className="text-[10px] text-slate-500 flex items-center space-x-1.5 font-medium pl-0.5">
        <Phone className="w-3 h-3 text-teal-600" />
        <span>Contacto WhatsApp / SMS:</span>
        <strong className="text-teal-800 font-mono font-bold">
          {phoneNumber.trim() ? `${selectedCountry.dialCode} ${phoneNumber.trim()}` : `${selectedCountry.dialCode} [número...]`}
        </strong>
      </div>
    </div>
  );
};
