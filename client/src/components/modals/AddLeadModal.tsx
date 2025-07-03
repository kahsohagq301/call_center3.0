import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddLeadModal({ isOpen, onClose }: AddLeadModalProps) {
  const [formData, setFormData] = useState({
    customerName: "",
    customerNumber: "",
    description: "",
  });
  const [biodata, setBiodata] = useState<File | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addLeadMutation = useMutation({
    mutationFn: async (leadData: any) => {
      const response = await apiRequest("POST", "/api/leads", leadData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-tasks"] });
      toast({
        title: "Success",
        description: "Lead added successfully",
      });
      onClose();
      setFormData({ customerName: "", customerNumber: "", description: "" });
      setBiodata(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add lead",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const leadData = {
      ...formData,
      biodata: biodata ? URL.createObjectURL(biodata) : undefined,
    };

    addLeadMutation.mutate(leadData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="modal-content w-full max-w-lg mx-4">
        <DialogHeader className="text-center mb-6">
          <DialogTitle className="text-2xl font-bold text-gray-800">Add New Lead</DialogTitle>
          <p className="text-gray-600 mt-2">Enter customer information</p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
              Customer Name
            </Label>
            <Input
              id="customerName"
              type="text"
              value={formData.customerName}
              onChange={(e) => handleInputChange("customerName", e.target.value)}
              className="form-input"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="customerNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Customer Number (with country code)
            </Label>
            <Input
              id="customerNumber"
              type="tel"
              value={formData.customerNumber}
              onChange={(e) => handleInputChange("customerNumber", e.target.value)}
              className="form-input"
              placeholder="+1-555-0123"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="biodata" className="block text-sm font-medium text-gray-700 mb-2">
              Customer Biodata (PDF/Word, 1-10MB)
            </Label>
            <Input
              id="biodata"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setBiodata(e.target.files?.[0] || null)}
              className="form-input"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description/Notes
            </Label>
            <Textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="form-input"
              placeholder="Additional notes about the customer..."
            />
          </div>
          
          <Button
            type="submit"
            disabled={addLeadMutation.isPending}
            className="btn-gradient w-full"
          >
            {addLeadMutation.isPending ? (
              <div className="loading-spinner h-5 w-5 mr-2" />
            ) : (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            )}
            Add Lead
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
