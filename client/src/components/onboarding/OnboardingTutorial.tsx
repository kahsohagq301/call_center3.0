import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ArrowRight, ArrowLeft, Check, Play } from "lucide-react";

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  content: string;
  actionButton?: string;
  targetElement?: string;
  image?: string;
}

interface OnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
}

export default function OnboardingTutorial({ isOpen, onClose, userRole }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const ccAgentSteps: OnboardingStep[] = [
    {
      id: 1,
      title: "Welcome to Call Center CRM",
      description: "Your complete guide to managing calls and leads effectively",
      content: "As a CC Agent, you'll be making calls, categorizing leads, and managing customer relationships. This tutorial will walk you through all the essential features you need to succeed.",
      actionButton: "Get Started"
    },
    {
      id: 2,
      title: "Dashboard Overview",
      description: "Your daily performance at a glance",
      content: "The dashboard shows your key metrics: Total Calls made today, Active Leads, Transfers completed, and Success Rate. Use this to track your daily progress and goals.",
      targetElement: "dashboard"
    },
    {
      id: 3,
      title: "Calls Section",
      description: "Your assigned phone numbers",
      content: "Here you'll find all phone numbers assigned to you by the Super Admin. Click the 'Call' button to initiate calls, then categorize each call result using the dropdown menu.",
      targetElement: "calls"
    },
    {
      id: 4,
      title: "Call Categories",
      description: "Proper categorization is crucial",
      content: "After each call, select the appropriate category:\n• Interested - Customer shows genuine interest\n• Not Interested - Customer declined politely\n• Busy - Customer was busy, try again later\n• No Answer - No response to call\n• Switched Off - Phone was turned off",
      targetElement: "calls"
    },
    {
      id: 5,
      title: "Lead Management",
      description: "Converting calls into valuable leads",
      content: "When a customer shows interest, create a lead with their details. Fill in customer name, phone number, and any additional information. You can also transfer leads to CRO agents for follow-up.",
      targetElement: "leads"
    },
    {
      id: 6,
      title: "Daily Reports",
      description: "Track your performance",
      content: "Submit your daily report showing online calls, offline calls, and total leads generated. This helps management track team performance and plan better strategies.",
      targetElement: "reports"
    },
    {
      id: 7,
      title: "Best Practices",
      description: "Tips for success",
      content: "• Be polite and professional in all calls\n• Listen actively to customer needs\n• Update call categories immediately after each call\n• Submit daily reports on time\n• Transfer quality leads to CRO agents promptly",
      actionButton: "Complete Tutorial"
    }
  ];

  const croAgentSteps: OnboardingStep[] = [
    {
      id: 1,
      title: "Welcome to CRO Agent Portal",
      description: "Your guide to managing transferred leads effectively",
      content: "As a CRO Agent, you'll receive high-quality leads transferred from CC Agents. Your role is to convert these warm leads into customers through skilled follow-up and relationship building.",
      actionButton: "Get Started"
    },
    {
      id: 2,
      title: "Received Leads Section",
      description: "All transferred leads in one place",
      content: "Here you'll find all leads transferred to you by CC Agents. Each lead contains customer information, call history, and notes from the original agent. Review these carefully before making contact.",
      targetElement: "leads"
    },
    {
      id: 3,
      title: "Lead Follow-up Strategy",
      description: "Converting warm leads to customers",
      content: "• Review the lead's history and notes thoroughly\n• Call within 24 hours of receiving the transfer\n• Focus on building rapport and understanding needs\n• Use consultative selling techniques\n• Update lead status after each interaction",
      actionButton: "Complete Tutorial"
    }
  ];

  const superAdminSteps: OnboardingStep[] = [
    {
      id: 1,
      title: "Super Admin Dashboard",
      description: "Complete system oversight and management",
      content: "As Super Admin, you have full access to all system features including user management, number uploads, performance analytics, and system configuration.",
      actionButton: "Get Started"
    },
    {
      id: 2,
      title: "Number Upload Management",
      description: "Distribute phone numbers to CC agents",
      content: "Upload Excel files containing Bangladeshi phone numbers and assign them to specific CC agents. Monitor upload history and ensure fair distribution of leads across your team.",
      targetElement: "calls"
    },
    {
      id: 3,
      title: "Account Management",
      description: "Manage users and permissions",
      content: "Create, edit, and manage user accounts for CC agents and CRO agents. Set appropriate roles and monitor user activity across the system.",
      targetElement: "accounts"
    },
    {
      id: 4,
      title: "Analytics & Reporting",
      description: "Monitor team performance",
      content: "Track overall system performance, lead conversion rates, and individual agent metrics. Use this data to optimize operations and identify training needs.",
      actionButton: "Complete Tutorial"
    }
  ];

  const getSteps = () => {
    switch (userRole) {
      case "cc_agent":
        return ccAgentSteps;
      case "cro_agent":
        return croAgentSteps;
      case "super_admin":
        return superAdminSteps;
      default:
        return ccAgentSteps;
    }
  };

  const steps = getSteps();

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(`onboarding_completed_${userRole}`, 'true');
    onClose();
  };

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4 p-2"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              Step {step.id} of {steps.length}
            </Badge>
            <div className="flex space-x-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
            {step.title}
          </CardTitle>
          <p className="text-blue-600 font-medium">
            {step.description}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="prose prose-sm max-w-none">
              {step.content.split('\n').map((line, index) => (
                <p key={index} className="text-gray-700 leading-relaxed mb-2 last:mb-0">
                  {line}
                </p>
              ))}
            </div>
          </div>

          {step.id === 1 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Play className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="font-medium text-blue-900">Quick Start</h4>
                  <p className="text-sm text-blue-700">
                    This tutorial will take about 5 minutes and covers everything you need to know.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step.id === 3 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Pro Tip</h4>
              <p className="text-sm text-green-700">
                Numbers assigned to you are exclusively yours. Only you can see and work with these numbers.
              </p>
            </div>
          )}

          {step.id === 5 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-medium text-orange-900 mb-2">Important</h4>
              <p className="text-sm text-orange-700">
                Always transfer high-quality leads to CRO agents. This helps maintain conversion rates and team performance.
              </p>
            </div>
          )}

          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleComplete}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Complete Tutorial</span>
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
              >
                <span>{step.actionButton || "Next"}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}