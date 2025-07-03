import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LoginModal from "@/components/modals/LoginModal";
import RegistrationModal from "@/components/modals/RegistrationModal";
import ForgotPasswordModal from "@/components/modals/ForgotPasswordModal";
import backgroundImage from "@assets/Picsart_25-06-24_22-28-16-611_1751536780644.jpg";
import logoImage from "@assets/PNG Logo - Call Center_1751536798946.png";

export default function LoginPage() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background without overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
      </div>

      {/* Title - Top Left */}
      <div className="absolute top-8 left-8 z-10">
        <h1 className="text-lg font-semibold text-white bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg">
          Call Center Management System
        </h1>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Achievement badges */}
          <div className="text-white space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-cyan-300 text-2xl font-bold">500+</div>
                <div className="text-blue-200 text-sm">Active Agents</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-cyan-300 text-2xl font-bold">10K+</div>
                <div className="text-blue-200 text-sm">Daily Calls</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-cyan-300 text-2xl font-bold">95%</div>
                <div className="text-blue-200 text-sm">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Right Side - Access Panel */}
          <div className="flex justify-center lg:justify-end">
            <Card className="card-glass rounded-3xl shadow-custom p-8 w-full max-w-md animate-fade-in">
              <div className="text-center space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <img 
                      src={logoImage} 
                      alt="Call Center Logo" 
                      className="w-20 h-20 object-contain"
                    />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-gray-800">Call Center</h2>
                    <p className="text-gray-600 font-medium">Access Panel</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button 
                    onClick={() => setShowLoginModal(true)}
                    className="btn-gradient w-full"
                    size="lg"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Login
                  </Button>

                  <Button 
                    onClick={() => setShowRegistrationModal(true)}
                    className="btn-gradient-secondary w-full"
                    size="lg"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                    </svg>
                    Registration
                  </Button>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Secure access to your call center dashboard
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onForgotPassword={() => {
          setShowLoginModal(false);
          setShowForgotPasswordModal(true);
        }}
      />
      
      <RegistrationModal 
        isOpen={showRegistrationModal} 
        onClose={() => setShowRegistrationModal(false)} 
      />
      
      <ForgotPasswordModal 
        isOpen={showForgotPasswordModal} 
        onClose={() => setShowForgotPasswordModal(false)} 
      />
    </div>
  );
}
