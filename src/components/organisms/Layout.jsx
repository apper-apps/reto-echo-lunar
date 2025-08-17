import React from "react";
import { Outlet } from "react-router-dom";
import NavigationTabs from "@/components/molecules/NavigationTabs";

const Layout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-emerald-50">
      {/* Desktop layout */}
      <div className="hidden lg:flex">
        {/* Desktop sidebar */}
        <aside className="w-64 h-screen bg-white shadow-xl border-r border-purple-100 p-6">
          <div className="mb-8">
            <h1 className="font-display font-bold text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Reto 21D
            </h1>
            <p className="text-sm text-gray-600 mt-1">Transformación 80/20</p>
          </div>
          
          <NavigationTabs />
        </aside>
        
        {/* Desktop main content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Mobile layout */}
      <div className="lg:hidden">
        {/* Mobile header */}
        <header className="bg-white shadow-sm border-b border-purple-100 px-4 py-4 sticky top-0 z-40">
          <h1 className="font-display font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Reto 21D
          </h1>
          <p className="text-xs text-gray-600">Transformación 80/20</p>
        </header>
        
        {/* Mobile main content */}
        <main className="pb-20">
          <div className="p-4">
            <Outlet />
          </div>
        </main>
        
        {/* Mobile bottom navigation */}
        <NavigationTabs />
      </div>
    </div>
  );
};

export default Layout;