import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNav from "@/components/dashboard/TopNav";
import DashboardSection from "@/components/dashboard/DashboardSection";
import CallsSection from "@/components/dashboard/CallsSection";
import LeadsSection from "@/components/dashboard/LeadsSection";
import ReportsSection from "@/components/dashboard/ReportsSection";
import SettingsSection from "@/components/dashboard/SettingsSection";
import AccountsSection from "@/components/dashboard/AccountsSection";

export default function Dashboard() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return null;

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardSection />;
      case "calls":
        return <CallsSection />;
      case "leads":
        return <LeadsSection />;
      case "reports":
        return <ReportsSection />;
      case "accounts":
        return <AccountsSection />;
      case "settings":
        return <SettingsSection />;
      default:
        return <DashboardSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav user={user} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex h-screen bg-gray-50">
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
          userRole={user.role}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <div className="flex-1 overflow-hidden lg:ml-0">
          <div className="h-full overflow-y-auto">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
}
