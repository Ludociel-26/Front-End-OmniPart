import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "@cloudscape-design/global-styles/index.css";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/auth/SignIn";
import Home from "./pages/Home";
import Verify from "./pages/auth/VerifyEmail";
import ResetPassword from "./pages/auth/ResetPassword";
import NotFound from "./pages/auth/NotFound";
import Dashboard from './pages/auth/dashboard/index'; // Descomenta esto cuando crees el componente Dashboard
import Inventory from "./pages/auth/table-inventory-items/index"

function App() {
  return (
    <BrowserRouter>
      {" "}
      {/* 2. El Router debe envolver TODO el contenido */}
      <div>
        <ToastContainer />
        <Routes>
          {/* 📌 Rutas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email" element={<Verify />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />

          <Route path='*' element={<NotFound />} />
          {/* 📌 Ruta protegida para Dashboard */}
          {/* He añadido un elemento temporal para que no te de error visual al entrar */}
          <Route
            path="/test"
            element={<h1>Panel de Dashboard (Próximamente)</h1>}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
