import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Header from "@/components/organisms/Header";
import Sidebar from "@/components/organisms/Sidebar";
import Dashboard from "@/components/pages/Dashboard";
import Agencies from "@/components/pages/Agencies";
import VirtualAssistants from "@/components/pages/VirtualAssistants";

function App() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
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
                <Route path="/" element={<Dashboard />} />
                <Route path="/agencies" element={<Agencies />} />
                <Route path="/virtual-assistants" element={<VirtualAssistants />} />
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
  );
}

export default App;