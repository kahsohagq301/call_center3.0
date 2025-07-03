import { Button } from "@/components/ui/button";
import logoImage from "@assets/PNG Logo - Call Center_1751536798946.png";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userRole: string;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ activeSection, onSectionChange, userRole, isOpen, onToggle }: SidebarProps) {
  const getMenuItems = () => {
    const commonItems = [
      { id: "dashboard", label: "Dashboard", icon: "chart-line" },
      { id: "settings", label: "Settings", icon: "cog" },
    ];

    switch (userRole) {
      case "cc_agent":
        return [
          ...commonItems.slice(0, 1),
          { id: "calls", label: "Calls", icon: "phone" },
          { id: "leads", label: "Leads", icon: "users" },
          { id: "reports", label: "Reports", icon: "chart-bar" },
          ...commonItems.slice(1),
        ];
      case "cro_agent":
        return [
          ...commonItems.slice(0, 1),
          { id: "leads", label: "Received Leads", icon: "users" },
          ...commonItems.slice(1),
        ];
      case "super_admin":
        return [
          ...commonItems.slice(0, 1),
          { id: "leads", label: "Lead Analysis", icon: "users" },
          { id: "reports", label: "Report Analysis", icon: "chart-bar" },
          { id: "calls", label: "Number Upload", icon: "upload" },
          { id: "accounts", label: "Account Management", icon: "user-group" },
          ...commonItems.slice(1),
        ];
      default:
        return commonItems;
    }
  };

  const getIcon = (iconName: string) => {
    const iconMap: { [key: string]: string } = {
      "chart-line": "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      "phone": "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
      "users": "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z",
      "chart-bar": "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      "cog": "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
      "upload": "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12",
      "user-group": "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    };

    return iconMap[iconName] || iconMap["chart-line"];
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-0
        w-64 bg-white shadow-lg border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Close button for mobile */}
        <div className="lg:hidden absolute top-4 right-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="p-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        <div className="p-6">
          <nav className="space-y-2">
            {getMenuItems().map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={`nav-item w-full justify-start ${
                  activeSection === item.id ? "active" : ""
                }`}
                onClick={() => {
                  onSectionChange(item.id);
                  // Close mobile menu when item is selected
                  if (window.innerWidth < 1024) {
                    onToggle();
                  }
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getIcon(item.icon)} />
                </svg>
                <span>{item.label}</span>
              </Button>
            ))}
          </nav>
        </div>

        {/* Bottom Logo & Settings */}
        <div className="absolute bottom-0 left-0 w-64 p-6 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img 
                src={logoImage} 
                alt="Call Center Logo" 
                className="w-8 h-8 object-contain"
              />
              <span className="text-sm font-medium text-gray-700">Call Center</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              onClick={() => onSectionChange("settings")}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getIcon("cog")} />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
