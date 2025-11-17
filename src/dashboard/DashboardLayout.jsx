import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-yellow-100 relative overflow-hidden">
      {/* Shiny Glass Background Effects */}
      <div className="absolute inset-0 opacity-30">
        {/* Main gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-orange-50/60 to-yellow-200/40"></div>
        
        {/* Glass shine effects */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute top-32 right-20 w-80 h-80 bg-gradient-to-br from-yellow-100/50 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 left-32 w-72 h-72 bg-gradient-to-br from-orange-100/40 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-gradient-to-br from-white/50 to-transparent rounded-full blur-xl"></div>
        </div>
        
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-yellow-50/20"></div>
      </div>
      
      <Navbar />
      <div className="flex pt-16 relative z-10">
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className={`${isCollapsed ? 'ml-16' : 'ml-72'} p-6 w-full transition-all duration-300 ease-in-out`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
