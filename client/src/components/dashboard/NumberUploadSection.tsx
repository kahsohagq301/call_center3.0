import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User, NumberUpload } from "@/types";
import * as XLSX from 'xlsx';

export default function NumberUploadSection() {
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all CC agents
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  // Get upload history
  const { data: uploads, isLoading } = useQuery<NumberUpload[]>({
    queryKey: ["/api/admin/number-uploads"],
  });

  const ccAgents = users?.filter(u => u.role === "cc_agent") || [];

  const uploadNumbersMutation = useMutation({
    mutationFn: async ({ agentId, phoneNumbers, fileName }: { agentId: string; phoneNumbers: string[]; fileName: string }) => {
      const response = await apiRequest("POST", "/api/admin/upload-numbers", {
        assignedAgentId: agentId,
        phoneNumbers,
        fileName,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/number-uploads"] });
      toast({
        title: "Success",
        description: "Numbers uploaded successfully",
      });
      setSelectedAgent("");
      setExcelFile(null);
      setIsUploading(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload numbers",
        variant: "destructive",
      });
      setIsUploading(false);
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || file.name.endsWith('.xlsx')) {
        setExcelFile(file);
      } else {
        toast({
          title: "Invalid File",
          description: "Please select an Excel (.xlsx) file",
          variant: "destructive",
        });
      }
    }
  };

  const parseExcelFile = (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result as ArrayBuffer;
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first worksheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert worksheet to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          const phoneNumbers: string[] = [];
          
          // Process each row
          jsonData.forEach((row: any) => {
            if (Array.isArray(row) && row.length > 0) {
              // Check each cell in the row for phone numbers
              row.forEach((cell: any) => {
                if (cell) {
                  const cellValue = cell.toString().trim();
                  
                  // Validate Bangladeshi phone number format
                  if (isValidBangladeshiNumber(cellValue)) {
                    phoneNumbers.push(cellValue);
                  }
                }
              });
            }
          });
          
          if (phoneNumbers.length === 0) {
            reject(new Error("No valid Bangladeshi phone numbers found in file"));
            return;
          }
          
          resolve(phoneNumbers);
        } catch (error) {
          console.error("Excel parsing error:", error);
          reject(new Error("Failed to parse Excel file. Please ensure it's a valid .xlsx file"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      
      // Read as ArrayBuffer for proper Excel parsing
      reader.readAsArrayBuffer(file);
    });
  };

  const isValidBangladeshiNumber = (number: string): boolean => {
    // Remove any spaces or dashes
    const cleaned = number.replace(/[\s-]/g, '');
    
    // Check for Bangladeshi phone number patterns:
    // +8801XXXXXXXXX (11 digits after +880)
    // 8801XXXXXXXXX (13 digits starting with 880)
    // 01XXXXXXXXX (11 digits starting with 01)
    const patterns = [
      /^\+8801[0-9]{8,9}$/,  // +8801XXXXXXXX or +8801XXXXXXXXX
      /^8801[0-9]{8,9}$/,    // 8801XXXXXXXX or 8801XXXXXXXXX  
      /^01[0-9]{8,9}$/       // 01XXXXXXXX or 01XXXXXXXXX
    ];
    
    return patterns.some(pattern => pattern.test(cleaned));
  };

  const handleUpload = async () => {
    if (!selectedAgent || !excelFile) {
      toast({
        title: "Missing Information",
        description: "Please select an agent and upload an Excel file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const phoneNumbers = await parseExcelFile(excelFile);
      
      if (phoneNumbers.length === 0) {
        toast({
          title: "No Numbers Found",
          description: "No valid phone numbers found in the uploaded file",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }

      uploadNumbersMutation.mutate({
        agentId: selectedAgent,
        phoneNumbers,
        fileName: excelFile.name,
      });
    } catch (error) {
      toast({
        title: "File Error",
        description: "Failed to process the Excel file",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAgentName = (agentId: number) => {
    const agent = users?.find(u => u.id === agentId);
    return agent ? agent.name : 'Unknown Agent';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Number Upload</h1>
          <p className="text-gray-600 mt-2">Upload phone numbers for CC agents to call</p>
        </div>
      </div>

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Numbers</CardTitle>
          <p className="text-sm text-gray-600">Select a CC agent and upload an Excel file containing Bangladeshi phone numbers</p>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900">Supported Number Formats:</p>
            <ul className="text-sm text-blue-800 mt-1 space-y-1">
              <li>• +8801XXXXXXXXX (with country code)</li>
              <li>• 8801XXXXXXXXX (without + symbol)</li>
              <li>• 01XXXXXXXXX (local format)</li>
            </ul>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Agent Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select CC Agent
              </label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose CC Agent" />
                </SelectTrigger>
                <SelectContent>
                  {ccAgents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id.toString()}>
                      {agent.name} ({agent.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Excel File
              </label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {excelFile && (
                <p className="text-sm text-green-600 mt-1">
                  Selected: {excelFile.name}
                </p>
              )}
            </div>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!selectedAgent || !excelFile || isUploading}
            className="btn-gradient"
          >
            {isUploading ? (
              <div className="loading-spinner h-5 w-5 mr-2" />
            ) : (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
            {isUploading ? "Uploading..." : "Upload Numbers"}
          </Button>
        </CardContent>
      </Card>

      {/* Upload History */}
      <Card>
        <CardHeader>
          <CardTitle>Upload History</CardTitle>
          <p className="text-sm text-gray-600">Recent number uploads by date and agent</p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="loading-spinner h-8 w-8" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Agent Assigned</TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead>Numbers Count</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uploads && uploads.length > 0 ? (
                    uploads.map((upload) => (
                      <TableRow key={upload.id}>
                        <TableCell>{formatDate(upload.uploadDate)}</TableCell>
                        <TableCell>{getAgentName(upload.assignedAgentId)}</TableCell>
                        <TableCell>{upload.fileName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {upload.numbersCount} numbers
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">
                            Completed
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No uploads found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}