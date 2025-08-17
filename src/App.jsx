import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

// Layout
import Layout from "@/components/organisms/Layout";

// Pages
import Dashboard from "@/components/pages/Dashboard";
import Calendar from "@/components/pages/Calendar";
import DayPlan from "@/components/pages/DayPlan";
import Habits from "@/components/pages/Habits";
import Progress from "@/components/pages/Progress";
import Profile from "@/components/pages/Profile";
import Onboarding from "@/components/pages/Onboarding";
import FinalMetrics from "@/components/pages/FinalMetrics";
import DayZero from "@/components/pages/DayZero";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-emerald-50">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
<Route path="dashboard" element={<Dashboard />} />
<Route path="calendario" element={<Calendar />} />
<Route path="dia-0" element={<DayZero />} />
<Route path="dia/:dayNumber" element={<DayPlan />} />
<Route path="habitos" element={<Habits />} />
<Route path="progreso" element={<Progress />} />
<Route path="perfil" element={<Profile />} />
<Route path="onboarding" element={<Onboarding />} />
<Route path="metricas-finales" element={<FinalMetrics />} />
          </Route>
        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          style={{ zIndex: 9999 }}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;