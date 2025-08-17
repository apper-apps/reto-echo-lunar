import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Progress from "@/components/pages/Progress";
import DayPlan from "@/components/pages/DayPlan";
import Dashboard from "@/components/pages/Dashboard";
import Habits from "@/components/pages/Habits";
import DayZero from "@/components/pages/DayZero";
import FinalMetrics from "@/components/pages/FinalMetrics";
import Profile from "@/components/pages/Profile";
import Onboarding from "@/components/pages/Onboarding";
import Calendar from "@/components/pages/Calendar";
import Layout from "@/components/organisms/Layout";

// Layout

// Pages

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
<Route path="progreso" element={<Progress />} />
<Route path="perfil" element={<Profile />} />
<Route path="onboarding" element={<Onboarding />} />
<Route path="metricas-finales" element={<FinalMetrics />} />
<Route path="dia-21" element={<FinalMetrics />} />
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