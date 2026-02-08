import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { RegistrarDashboard } from './pages/RegistrarDashboard';
import { PropertyView } from './pages/PropertyView';
import { Documents } from './pages/Documents';
import { Transfer } from './pages/Transfer';
import { TransferSelect } from './pages/TransferSelect';
import { KYCVerification } from './pages/KYCVerification';
import { RegistrarLogin } from './pages/RegistrarLogin';
import { RegistrarCallback } from './pages/RegistrarCallback';
import { Audit } from './pages/Audit';
import { Evaluation } from './pages/Evaluation';
import { RoleGuard } from './components/RoleGuard';
import { Layout } from './components/Layout';
import { AuthProvider } from './contexts/AuthContext';
import { SplashScreen } from './components/SplashScreen';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <AuthProvider>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/evaluation" element={<Evaluation />} />
            <Route path="/audit" element={<Audit />} />
            <Route path="/registrar/login" element={<RegistrarLogin />} />
            <Route path="/registrar/callback" element={<RegistrarCallback />} />

            <Route path="/dashboard" element={
              <RoleGuard allowedRoles={['citizen']}>
                <CitizenDashboard />
              </RoleGuard>
            } />

            <Route path="/documents" element={
              <RoleGuard allowedRoles={['citizen']}>
                <Documents />
              </RoleGuard>
            } />

            <Route path="/registrar" element={
              <RoleGuard allowedRoles={['registrar']}>
                <RegistrarDashboard />
              </RoleGuard>
            } />

            <Route path="/property/:id" element={<PropertyView />} />
            <Route path="/transfer/:id" element={<Transfer />} />
            <Route path="/transfer" element={<TransferSelect />} />
            <Route path="/kyc" element={
              <RoleGuard allowedRoles={['citizen', 'registrar']}>
                <KYCVerification />
              </RoleGuard>
            } />

            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
