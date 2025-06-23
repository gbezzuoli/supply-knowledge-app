// Arquivo: src/App.tsx (MODO DE DEPURAÇÃO)

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importa os componentes
import LoginComponent from './pages/Login/Login';
import SignupComponent from './pages/Signup/Signup';
import DashboardLayout from './pages/DashboardLayout/DashboardLayout';
import ChatbotComponent from './pages/Chatbot/Chatbot';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import ViewBaseComponent from './pages/ViewBase/ViewBase'; // <-- 1. IMPORTE A NOVA PÁGINA
import DebugSearchComponent from './pages/DebugSearch/DebugSearch';

// Um componente de log para nos ajudar
const RouteLogger = ({ pathName }: { pathName: string }) => {
  console.log(`%c RENDERIZANDO ROTA: ${pathName}`, 'color: lime; font-weight: bold;');
  return null; // Este componente não renderiza nada visualmente
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas (sem sidebar/header) */}
        <Route path="/login" element={<LoginComponent />} />
        <Route path="/signup" element={<SignupComponent />} />

        {/* --- ESTA É A PARTE MÁGICA --- */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              {/* O DashboardLayout é o nosso layout comum com Sidebar e Header */}
              <DashboardLayout /> 
            </ProtectedRoute>
          }
        >
          {/* Todas as rotas AQUI DENTRO serão renderizadas DENTRO do DashboardLayout */}
          <Route path="chatbot" element={<ChatbotComponent />} />
          <Route path="view-base" element={<ViewBaseComponent />} />
          <Route path="debug-search" element={<DebugSearchComponent />} />
          {/* Futuras rotas, como /reports, virão aqui */}
          
          <Route index element={<Navigate to="/chatbot" />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;