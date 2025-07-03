import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle, BookOpen } from "lucide-react";
import OnboardingTutorial from "./OnboardingTutorial";

interface OnboardingTriggerProps {
  userRole: string;
  isNewUser?: boolean;
}

export default function OnboardingTrigger({ userRole, isNewUser = false }: OnboardingTriggerProps) {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Auto-show tutorial for new users
    if (isNewUser && userRole) {
      const hasCompletedOnboarding = localStorage.getItem(`onboarding_completed_${userRole}`);
      if (!hasCompletedOnboarding) {
        setShowTutorial(true);
      }
    }

    // Listen for custom event from sidebar help button
    const handleOpenOnboarding = () => {
      setShowTutorial(true);
    };

    window.addEventListener('openOnboarding', handleOpenOnboarding);
    
    return () => {
      window.removeEventListener('openOnboarding', handleOpenOnboarding);
    };
  }, [isNewUser, userRole]);

  return (
    <>
      {/* Floating help button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setShowTutorial(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200"
          title="Need help? Start tutorial"
        >
          <HelpCircle className="w-6 h-6" />
        </Button>
      </div>

      {/* Tutorial banner for new users */}
      {isNewUser && !localStorage.getItem(`onboarding_completed_${userRole}`) && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">Welcome to Call Center CRM!</h3>
                <p className="text-blue-700 text-sm">
                  New to the system? Take our role-specific tutorial to get started quickly.
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowTutorial(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              Start Tutorial
            </Button>
          </div>
        </div>
      )}

      <OnboardingTutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        userRole={userRole}
      />
    </>
  );
}