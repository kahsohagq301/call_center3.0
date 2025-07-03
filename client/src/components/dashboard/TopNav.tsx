import { User } from "@/types";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/PNG Logo - Call Center_1751536798946.png";

interface TopNavProps {
  user: User;
  onMenuToggle?: () => void;
}

export default function TopNav({ user, onMenuToggle }: TopNavProps) {
  const getRoleLabel = (role: string) => {
    switch (role) {
      case "cc_agent":
        return "CC Agent";
      case "cro_agent":
        return "CRO Agent";
      case "super_admin":
        return "Super Admin";
      default:
        return role;
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="lg:hidden p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
          
          <div className="flex items-center space-x-3">
            <img 
              src={logoImage} 
              alt="Call Center Logo" 
              className="w-10 h-10 object-contain"
            />
            <span className="text-xl font-bold text-gray-800">Call Center CRM</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-800">{user.name}</div>
            <div className="text-xs text-gray-500">{getRoleLabel(user.role)}</div>
          </div>
          <img 
            src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=ffffff`}
            alt="User Profile" 
            className="w-10 h-10 rounded-full object-cover border-2 border-blue-200"
          />
        </div>
      </div>
    </nav>
  );
}
