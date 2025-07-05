import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { CallNumber } from "@/types";

export default function CallsSection() {
  const [searchNumber, setSearchNumber] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 100;
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: calls, isLoading } = useQuery<CallNumber[]>({
    queryKey: ["/api/calls"],
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, category }: { id: number; category: string }) => {
      const response = await apiRequest("POST", `/api/calls/${id}/category`, { category });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calls"] });
      toast({
        title: "Success",
        description: "Call category updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update category",
        variant: "destructive",
      });
    },
  });

  const handleCategoryChange = (callId: number, category: string) => {
    // Don't update if user selects "uncategorized" - it's just a placeholder
    if (category === "uncategorized") {
      return;
    }
    updateCategoryMutation.mutate({ id: callId, category });
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/calls"] });
    setCurrentPage(1); // Reset to first page on refresh
  };

  // Filter and pagination logic
  const filteredCalls = useMemo(() => {
    if (!calls) return [];

    let filtered = calls;

    // Search filter
    if (searchNumber.trim()) {
      filtered = filtered.filter(call => 
        call.phoneNumber.includes(searchNumber.trim())
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      if (categoryFilter === "uncategorized") {
        filtered = filtered.filter(call => !call.category);
      } else {
        filtered = filtered.filter(call => call.category === categoryFilter);
      }
    }

    // Sort: uncategorized first, then by creation date
    filtered.sort((a, b) => {
      // Uncategorized calls first
      if (!a.category && b.category) return -1;
      if (a.category && !b.category) return 1;
      
      // Then by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return filtered;
  }, [calls, searchNumber, categoryFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredCalls.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentCalls = filteredCalls.slice(startIndex, endIndex);

  const handleCall = (phoneNumber: string) => {
    // Open dialer with the phone number
    window.open(`tel:${phoneNumber}`);
  };

  const getCategoryBadge = (category: string | null) => {
    if (!category) {
      return <Badge variant="outline">Uncategorized</Badge>;
    }

    const categoryStyles = {
      switched_off: "bg-gray-100 text-gray-800",
      busy: "bg-yellow-100 text-yellow-800",
      no_answer: "bg-blue-100 text-blue-800",
      not_interested: "bg-red-100 text-red-800",
      interested: "bg-green-100 text-green-800",
    };

    const categoryLabels = {
      switched_off: "Switched Off",
      busy: "Busy",
      no_answer: "No Answer",
      not_interested: "Not Interested",
      interested: "Interested",
    };

    return (
      <Badge className={categoryStyles[category as keyof typeof categoryStyles] || "bg-gray-100 text-gray-800"}>
        {categoryLabels[category as keyof typeof categoryLabels] || category}
      </Badge>
    );
  };





  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Call Management</h1>
        <p className="text-gray-600">Manage and track all your customer calls.</p>
      </div>

      {/* Search and Filter */}
      <Card className="shadow-sm mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by phone number..."
                value={searchNumber}
                onChange={(e) => setSearchNumber(e.target.value)}
                className="form-input"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="form-select md:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="uncategorized">Uncategorized</SelectItem>
                <SelectItem value="interested">Interested</SelectItem>
                <SelectItem value="not_interested">Not Interested</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="no_answer">No Answer</SelectItem>
                <SelectItem value="switched_off">Switched Off</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleRefresh} className="bg-blue-600 hover:bg-blue-700">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calls Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Call Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No.</TableHead>
                  <TableHead>Customer Number</TableHead>
                  <TableHead>Call</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCalls.map((call, index) => (
                  <TableRow key={call.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{call.phoneNumber}</TableCell>
                    <TableCell>
                      <Button 
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white"
                        onClick={() => window.open(`tel:${call.phoneNumber}`, '_self')}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Call
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={call.category || "uncategorized"} 
                        onValueChange={(value) => handleCategoryChange(call.id, value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="uncategorized">Select Category</SelectItem>
                          <SelectItem value="interested">Interested</SelectItem>
                          <SelectItem value="not_interested">Not Interested</SelectItem>
                          <SelectItem value="busy">Busy</SelectItem>
                          <SelectItem value="no_answer">No Answer</SelectItem>
                          <SelectItem value="switched_off">Switched Off</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {getCategoryBadge(call.category || null)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredCalls.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No call records found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
