import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { RegistrarDashboard } from './pages/RegistrarDashboard';
import { PropertyView } from './pages/PropertyView';
import { Transfer } from './pages/Transfer';
import { Audit } from './pages/Audit';
import { RoleGuard } from './components/RoleGuard';
import { Layout } from './components/Layout';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={
            <RoleGuard allowedRoles={['citizen']} userRole="citizen">
              <CitizenDashboard />
            </RoleGuard>
          } />

          <Route path="/registrar" element={
            <RoleGuard allowedRoles={['registrar']} userRole="registrar">
              <RegistrarDashboard />
            </RoleGuard>
          } />

          <Route path="/property/:id" element={<PropertyView />} />
          <Route path="/transfer/:id" element={<Transfer />} />
          <Route path="/audit" element={<Audit />} />

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
