import React, { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import ProtectedRoute from "@/components/ProtectedRoute";
import AgencyDetails from "@/components/pages/AgencyDetails";
import Login from "@/components/pages/Login";
import CheckIns from "@/components/pages/CheckIns";
import Agencies from "@/components/pages/Agencies";
import VARequests from "@/components/pages/VARequests";
import Dashboard from "@/components/pages/Dashboard";
import VirtualAssistants from "@/components/pages/VirtualAssistants";
import RoleManagement from "@/components/pages/RoleManagement";
import Sidebar from "@/components/organisms/Sidebar";
import Header from "@/components/organisms/Header";
import { AuthProvider } from "@/contexts/AuthContext";
function App() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

return (
    <AuthProvider>
      <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <div className="flex">
          <Sidebar 
            isMobileOpen={isMobileSidebarOpen}
            closeMobileSidebar={closeMobileSidebar}
          />
          
          <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
            <Header toggleMobileSidebar={toggleMobileSidebar} />
            
            <main className="flex-1 p-6 lg:p-8">
<Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/agencies" element={<ProtectedRoute><Agencies /></ProtectedRoute>} />
                <Route path="/virtual-assistants" element={<ProtectedRoute><VirtualAssistants /></ProtectedRoute>} />
                <Route path="/check-ins" element={<ProtectedRoute><CheckIns /></ProtectedRoute>} />
                <Route path="/va-requests" element={<ProtectedRoute><VARequests /></ProtectedRoute>} />
                <Route path="/roles" element={<ProtectedRoute><RoleManagement /></ProtectedRoute>} />
                <Route path="/agencies/:id" element={<ProtectedRoute><AgencyDetails /></ProtectedRoute>} />
              </Routes>
            </main>
          </div>
        </div>

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
          style={{ zIndex: 9999 }}
        />
</div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;