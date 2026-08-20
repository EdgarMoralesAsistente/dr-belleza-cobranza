import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, TabType } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { PatientsView } from './components/PatientsView';
import { CrmView } from './components/CrmView';
import { FinancingView } from './components/FinancingView';
import { PaymentsView } from './components/PaymentsView';
import { UsersView } from './components/UsersView';
import { GasView } from './components/GasView';
import { SettingsView } from './components/SettingsView';
import { RefundsView } from './components/RefundsView';

import { Patient360Modal } from './components/Patient360Modal';
import { ReceiptModal } from './components/ReceiptModal';
import { NewPatientModal } from './components/NewPatientModal';
import { NewPaymentModal } from './components/NewPaymentModal';
import { NewActivityModal } from './components/NewActivityModal';
import { NewFinancingPlanModal } from './components/NewFinancingPlanModal';
import { NewUserModal } from './components/NewUserModal';
import { ExecutivePresentationModal } from './components/ExecutivePresentationModal';
import { UserProfileModal } from './components/UserProfileModal';
import { LoginView } from './components/LoginView';
import { ErrorBoundary } from './components/common/ErrorBoundary';

import { Paciente, Pago, Usuario, ActividadCRM, FinanciamientoCirugia, Reintegro } from './types';
import { StorageService } from './services/storageService';

export default function App() {
  const [currentUser, setCurrentUser] = useState<Usuario | null>(StorageService.getAuthenticatedUser());
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Estados de datos
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [actividades, setActividades] = useState<ActividadCRM[]>([]);
  const [financiamientos, setFinanciamientos] = useState<FinanciamientoCirugia[]>([]);
  const [reintegros, setReintegros] = useState<Reintegro[]>([]);

  // Modales
  const [selectedPatient360, setSelectedPatient360] = useState<Paciente | null>(null);
  const [selectedReceiptForPrint, setSelectedReceiptForPrint] = useState<Pago | null>(null);

  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [showNewPaymentModal, setShowNewPaymentModal] = useState(false);
  const [showNewActivityModal, setShowNewActivityModal] = useState(false);
  const [showNewFinancingModal, setShowNewFinancingModal] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showPresentationModal, setShowPresentationModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [preselectedPatientForPayment, setPreselectedPatientForPayment] = useState<Paciente | null>(null);
  const [preselectedPatientForActivity, setPreselectedPatientForActivity] = useState<Paciente | null>(null);
  const [preselectedPatientForFinancing, setPreselectedPatientForFinancing] = useState<Paciente | null>(null);

  // Cargar datos al inicio
  const refreshData = () => {
    const freshPacientes = StorageService.getPacientes();
    setPacientes(freshPacientes);
    setPagos(StorageService.getPagos());
    setUsuarios(StorageService.getUsuarios());
    setActividades(StorageService.getActividades());
    setFinanciamientos(StorageService.getFinanciamientos());
    setReintegros(StorageService.getReintegros());

    setSelectedPatient360(prev => {
      if (!prev) return null;
      const found = freshPacientes.find(p => p.id === prev.id || (prev.cedula && p.cedula === prev.cedula));
      return found || prev;
    });
  };

  useEffect(() => {
    refreshData();

    // Carga inicial limpia desde Google Sheets si existe URL configurada
    const gasUrl = StorageService.getGasUrl();
    if (gasUrl) {
      StorageService.syncFromGas()
        .then((res) => {
          if (res && res.success) {
            refreshData();
          }
        })
        .catch((err) => {
          console.warn('Aviso sincronización inicial:', err?.message || err);
        });
    }

    // Escuchar eventos de cambios en LocalStorage para mantener reactividad entre pestañas
    const handleStorageChange = () => {
      refreshData();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Handler de inicio de sesión exitoso
  const handleLoginSuccess = (user: Usuario) => {
    setCurrentUser(user);
    refreshData();
  };

  // Handler de cierre de sesión
  const handleLogout = () => {
    StorageService.logout();
    setCurrentUser(null);
  };

  // Handler cambio de perfil RBAC
  const handleUserChange = (user: Usuario) => {
    setCurrentUser(user);
    StorageService.setCurrentUser(user);
  };

  // Handler búsqueda rápida de paciente por Query
  const handleSelectPatientByQuery = (query: string) => {
    if (!query) return;
    const q = query.toLowerCase();
    const found = pacientes.find(
      p => p && (
        (p.id && p.id.toLowerCase() === q) ||
        (p.cedula && p.cedula.toLowerCase() === q) ||
        (p.nombre && p.nombre.toLowerCase().includes(q))
      )
    );

    if (found) {
      setSelectedPatient360(found);
    } else {
      setActiveTab('pacientes');
    }
  };

  const handleOpen360ByPatientId = (patientId: string) => {
    const found = pacientes.find(p => p.id === patientId);
    if (found) setSelectedPatient360(found);
  };

  // HANDLERS DE GUARDADO
  const handleSavePatient = (p: Paciente, plan?: FinanciamientoCirugia) => {
    StorageService.addPaciente(p);
    if (plan) {
      StorageService.saveFinanciamiento(plan);
      StorageService.generateAndSavePaymentAlarms(p, plan);
    }
    refreshData();
    setSelectedPatient360(p);
  };

  const handleSavePayment = (pago: Pago, updatePlanId?: string) => {
    StorageService.addPago(pago, updatePlanId);
    refreshData();
    setSelectedReceiptForPrint(pago);
  };

  const handleSaveActivity = (act: ActividadCRM) => {
    StorageService.addActividad(act);
    refreshData();
  };

  const handleUpdateActivity = (act: ActividadCRM) => {
    StorageService.updateActividad(act);
    refreshData();
  };

  const handleSaveFinancingPlan = (plan: FinanciamientoCirugia) => {
    StorageService.saveFinanciamiento(plan);
    const patient = pacientes.find(p => p.id === plan.pacienteId);
    if (patient) {
      StorageService.generateAndSavePaymentAlarms(patient, plan);
    }
    refreshData();
  };

  const handleSaveUser = (u: Usuario) => {
    StorageService.saveUsuario(u);
    refreshData();
  };

  const handleUpdateUser = (u: Usuario) => {
    StorageService.saveUsuario(u);
    refreshData();
  };

  const handleUpdatePatient = (p: Paciente) => {
    StorageService.updatePaciente(p);
    refreshData();
  };

  const handleDeletePatient = async (patientId: string) => {
    if (selectedPatient360?.id === patientId) {
      setSelectedPatient360(null);
    }
    await StorageService.deletePaciente(patientId);
    refreshData();
  };

  // Conteo de alarmas activas para hoy o vencidas
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingAlarmsCount = actividades.filter(
    a => a.alarma && a.estado === 'Pendiente' && a.fechaProgramada <= todayStr
  ).length;

  // Si no hay ningún usuario autenticado, mostrar la pantalla de Login
  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="h-screen min-h-[100dvh] bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-teal-500 selection:text-white overflow-hidden">
      
      {/* HEADER PRINCIPAL */}
      <Header
        currentUser={currentUser}
        onUserChange={handleUserChange}
        onLogout={handleLogout}
        onOpenProfileModal={() => setShowProfileModal(true)}
        onOpenGasConfig={() => setActiveTab('google-sheets')}
        onSelectPatientByQuery={handleSelectPatientByQuery}
        actividades={actividades}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        onOpenPresentationModal={() => setShowPresentationModal(true)}
      />

      <div className="flex-1 flex overflow-hidden w-full relative">
        
        {/* SIDEBAR NAVEGACIÓN */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          userRole={currentUser.rol}
          onNewPatient={() => setShowNewPatientModal(true)}
          onNewPayment={() => {
            setPreselectedPatientForPayment(null);
            setShowNewPaymentModal(true);
          }}
          onNewActivity={() => {
            setPreselectedPatientForActivity(null);
            setShowNewActivityModal(true);
          }}
          alarmsCount={pendingAlarmsCount}
          isMobileOpen={mobileMenuOpen}
          onCloseMobileMenu={() => setMobileMenuOpen(false)}
        />

        {/* CONTENIDO PRINCIPAL POR PESTAÑA */}
        <main className="flex-1 w-full min-w-0 overflow-y-auto">
          <ErrorBoundary key={activeTab} fallbackTitle="Surgió un inconveniente al cargar esta sección">
            {activeTab === 'dashboard' && (
              <DashboardView
                pacientes={pacientes}
                pagos={pagos}
                actividades={actividades}
                financiamientos={financiamientos}
                reintegros={reintegros}
                onSelectPatient={handleOpen360ByPatientId}
                onNavigateToTab={setActiveTab}
              />
            )}

            {activeTab === 'pacientes' && (
              <PatientsView
                pacientes={pacientes}
                userRole={currentUser.rol}
                onSelectPatient={handleOpen360ByPatientId}
                onNewPatient={() => setShowNewPatientModal(true)}
                onDeletePatient={handleDeletePatient}
              />
            )}

            {activeTab === 'crm' && (
              <CrmView
                actividades={actividades}
                pacientes={pacientes}
                financiamientos={financiamientos}
                pagos={pagos}
                onNewActivity={() => {
                  setPreselectedPatientForActivity(null);
                  setShowNewActivityModal(true);
                }}
                onUpdateActivity={handleUpdateActivity}
                onUpdatePatient={handleUpdatePatient}
                onSelectPatient={handleOpen360ByPatientId}
                onNewPatient={() => setShowNewPatientModal(true)}
                onNewActivityForPatient={(p) => {
                  setPreselectedPatientForActivity(p);
                  setShowNewActivityModal(true);
                }}
                onNewPaymentForPatient={(p) => {
                  setPreselectedPatientForPayment(p);
                  setShowNewPaymentModal(true);
                }}
              />
            )}

            {activeTab === 'financiamiento' && (
              <FinancingView
                financiamientos={financiamientos}
                pacientes={pacientes}
                onNewFinancingPlan={() => {
                  setPreselectedPatientForFinancing(null);
                  setShowNewFinancingModal(true);
                }}
                onOpenNewPaymentForPatient={(p) => {
                  setPreselectedPatientForPayment(p);
                  setShowNewPaymentModal(true);
                }}
                onSelectPatient={handleOpen360ByPatientId}
              />
            )}

            {activeTab === 'reintegros' && (
              <RefundsView
                reintegros={reintegros}
                pacientes={pacientes}
                userRole={currentUser.rol}
                onRefresh={refreshData}
                onSelectPatient={(p) => setSelectedPatient360(p)}
              />
            )}

            {activeTab === 'pagos' && (
              <PaymentsView
                pagos={pagos}
                onNewPayment={() => {
                  setPreselectedPatientForPayment(null);
                  setShowNewPaymentModal(true);
                }}
                onPrintReceipt={setSelectedReceiptForPrint}
              />
            )}

            {activeTab === 'usuarios' && (
              <UsersView
                usuarios={usuarios}
                currentUser={currentUser}
                onNewUser={() => setShowNewUserModal(true)}
                onUpdateUser={handleUpdateUser}
              />
            )}

            {activeTab === 'google-sheets' && (
              <GasView onDataSyncSuccess={refreshData} />
            )}

            {activeTab === 'configuracion' && (
              <SettingsView />
            )}
          </ErrorBoundary>
        </main>

      </div>

      {/* MODAL FICHA 360° PACIENTE */}
      {selectedPatient360 && (
        <Patient360Modal
          paciente={selectedPatient360}
          pagos={pagos}
          actividades={actividades}
          financiamientos={financiamientos}
          reintegros={reintegros}
          userRole={currentUser.rol}
          onClose={() => setSelectedPatient360(null)}
          onOpenNewPaymentForPatient={(p) => {
            setPreselectedPatientForPayment(p);
            setShowNewPaymentModal(true);
          }}
          onOpenNewActivityForPatient={(p) => {
            setPreselectedPatientForActivity(p);
            setShowNewActivityModal(true);
          }}
          onOpenNewFinancingPlanForPatient={(p) => {
            setPreselectedPatientForFinancing(p);
            setShowNewFinancingModal(true);
          }}
          onPrintReceipt={setSelectedReceiptForPrint}
          onDeletePatient={handleDeletePatient}
          onRefreshData={refreshData}
        />
      )}

      {/* MODAL RECIBO DIGITAL E IMPRIMIBLE */}
      {selectedReceiptForPrint && (
        <ReceiptModal
          pago={selectedReceiptForPrint}
          paciente={pacientes.find(p => p && selectedReceiptForPrint && (
            p.id === selectedReceiptForPrint.id ||
            ((p.nombre || '').toLowerCase() === (selectedReceiptForPrint.nombre || '').toLowerCase() && p.nombre)
          ))}
          financiamiento={financiamientos.find(f => f.pacienteId === selectedReceiptForPrint.id)}
          reintegro={reintegros.find(r => r && selectedReceiptForPrint && (
            r.pacienteId === selectedReceiptForPrint.id ||
            r.reintegroId === selectedReceiptForPrint.referencia
          ))}
          onClose={() => setSelectedReceiptForPrint(null)}
        />
      )}

      {/* MODAL NUEVO PACIENTE */}
      {showNewPatientModal && (
        <NewPatientModal
          onClose={() => setShowNewPatientModal(false)}
          onSave={handleSavePatient}
        />
      )}

      {/* MODAL NUEVO PAGO */}
      {showNewPaymentModal && (
        <NewPaymentModal
          pacientes={pacientes}
          financiamientos={financiamientos}
          preselectedPatient={preselectedPatientForPayment}
          onClose={() => {
            setShowNewPaymentModal(false);
            setPreselectedPatientForPayment(null);
          }}
          onSave={handleSavePayment}
        />
      )}

      {/* MODAL NUEVA ACTIVIDAD CRM */}
      {showNewActivityModal && (
        <NewActivityModal
          pacientes={pacientes}
          currentUser={currentUser}
          preselectedPatient={preselectedPatientForActivity}
          onClose={() => {
            setShowNewActivityModal(false);
            setPreselectedPatientForActivity(null);
          }}
          onSave={handleSaveActivity}
        />
      )}

      {/* MODAL NUEVO PLAN DE FINANCIAMIENTO */}
      {showNewFinancingModal && (
        <NewFinancingPlanModal
          pacientes={pacientes}
          preselectedPatient={preselectedPatientForFinancing}
          onClose={() => {
            setShowNewFinancingModal(false);
            setPreselectedPatientForFinancing(null);
          }}
          onSave={handleSaveFinancingPlan}
        />
      )}

      {/* MODAL NUEVO USUARIO */}
      {showNewUserModal && (
        <NewUserModal
          onClose={() => setShowNewUserModal(false)}
          onSave={handleSaveUser}
        />
      )}

      {/* MODAL INFORME EJECUTIVO Y FLUJO PARA LA DIRECCIÓN */}
      {showPresentationModal && (
        <ExecutivePresentationModal
          onClose={() => setShowPresentationModal(false)}
        />
      )}

      {/* MODAL EDITAR MI PERFIL */}
      {showProfileModal && currentUser && (
        <UserProfileModal
          currentUser={currentUser}
          onClose={() => setShowProfileModal(false)}
          onSave={(updatedUser) => {
            setCurrentUser(updatedUser);
            refreshData();
          }}
        />
      )}

    </div>
  );
}
