import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface AddReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddReportModal({ isOpen, onClose }: AddReportModalProps) {
  const [formData, setFormData] = useState({
    onlineCalls: "",
    offlineCalls: "",
    totalLeads: "",
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addReportMutation = useMutation({
    mutationFn: async (reportData: any) => {
      const response = await apiRequest("POST", "/api/reports", reportData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-tasks"] });
      toast({
        title: "Success",
        description: "Report submitted successfully",
      });
      onClose();
      setFormData({ onlineCalls: "", offlineCalls: "", totalLeads: "" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit report",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const reportData = {
      onlineCalls: parseInt(formData.onlineCalls),
      offlineCalls: parseInt(formData.offlineCalls),
      totalLeads: parseInt(formData.totalLeads),
    };

    addReportMutation.mutate(reportData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="modal-content w-full max-w-md mx-4">
        <DialogHeader className="text-center mb-6">
          <DialogTitle className="text-2xl font-bold text-gray-800">Add Report</DialogTitle>
          <p className="text-gray-600 mt-2">Submit your daily performance</p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="onlineCalls" className="block text-sm font-medium text-gray-700 mb-2">
              Online Calls
            </Label>
            <Input
              id="onlineCalls"
              type="number"
              min="0"
              value={formData.onlineCalls}
              onChange={(e) => handleInputChange("onlineCalls", e.target.value)}
              className="form-input"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="offlineCalls" className="block text-sm font-medium text-gray-700 mb-2">
              Offline Calls
            </Label>
            <Input
              id="offlineCalls"
              type="number"
              min="0"
              value={formData.offlineCalls}
              onChange={(e) => handleInputChange("offlineCalls", e.target.value)}
              className="form-input"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="totalLeads" className="block text-sm font-medium text-gray-700 mb-2">
              Total Leads
            </Label>
            <Input
              id="totalLeads"
              type="number"
              min="0"
              value={formData.totalLeads}
              onChange={(e) => handleInputChange("totalLeads", e.target.value)}
              className="form-input"
              required
            />
          </div>
          
          <Button
            type="submit"
            disabled={addReportMutation.isPending}
            className="btn-gradient w-full"
          >
            {addReportMutation.isPending ? (
              <div className="loading-spinner h-5 w-5 mr-2" />
            ) : (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            )}
            Submit Report
          </Button>
        </form>
        
        <div className="bg-gray-50 px-8 py-4 rounded-b-2xl -mx-6 -mb-6 mt-6">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="w-full text-gray-600 hover:text-gray-800 font-medium"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
