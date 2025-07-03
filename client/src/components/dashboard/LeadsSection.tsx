import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Search, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Lead, User } from "@/types";
import AddLeadModal from "@/components/modals/AddLeadModal";

export default function LeadsSection() {
  const { user } = useAuth();
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showLeadDetailModal, setShowLeadDetailModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedTransferAgent, setSelectedTransferAgent] = useState("");
  
  // Filter states
  const [selectedAgent, setSelectedAgent] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Determine which leads to fetch based on user role
  const leadsEndpoint = user?.role === "cro_agent" ? "/api/leads/transferred" : "/api/leads";
  const { data: leads, isLoading } = useQuery<Lead[]>({
    queryKey: [leadsEndpoint],
  });

  const { data: allLeads } = useQuery<Lead[]>({
    queryKey: ["/api/admin/leads"],
    enabled: user?.role === "super_admin",
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: user?.role === "cc_agent" || user?.role === "super_admin",
  });

  const transferLeadMutation = useMutation({
    mutationFn: async ({ leadId, transferredTo }: { leadId: number; transferredTo: number }) => {
      const response = await apiRequest("POST", `/api/leads/${leadId}/transfer`, { transferredTo });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-tasks"] });
      toast({
        title: "Success",
        description: "Lead transferred successfully",
      });
      setShowTransferModal(false);
      setSelectedLead(null);
      setSelectedTransferAgent("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to transfer lead",
        variant: "destructive",
      });
    },
  });

  const handleTransferLead = () => {
    if (selectedLead && selectedTransferAgent) {
      transferLeadMutation.mutate({
        leadId: selectedLead.id,
        transferredTo: parseInt(selectedTransferAgent)
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "transferred":
        return <Badge className="bg-blue-100 text-blue-800">Transferred</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPageTitle = () => {
    switch (user?.role) {
      case "cro_agent":
        return "Received Leads";
      case "super_admin":
        return "Lead Analysis";
      default:
        return "Lead Management";
    }
  };

  const getPageDescription = () => {
    switch (user?.role) {
      case "cro_agent":
        return "View and manage leads transferred to you";
      case "super_admin":
        return "Analyze lead performance and transfers across all agents";
      default:
        return "Add, manage and transfer leads efficiently";
    }
  };

  // Filter and search logic
  const ccAgents = users?.filter(u => u.role === "cc_agent") || [];
  const croAgents = users?.filter(u => u.role === "cro_agent") || [];
  
  const filteredLeads = useMemo(() => {
    let leadsToFilter = user?.role === "super_admin" ? allLeads : leads;
    if (!leadsToFilter) return [];

    // Apply filters
    let filtered = leadsToFilter;

    // Agent filter
    if (selectedAgent !== "all") {
      filtered = filtered.filter(lead => lead.agentId === parseInt(selectedAgent));
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(lead => 
        lead.customerName.toLowerCase().includes(query) ||
        lead.customerNumber.toLowerCase().includes(query) ||
        lead.description?.toLowerCase().includes(query) ||
        users?.find(u => u.id === lead.agentId)?.name.toLowerCase().includes(query)
      );
    }

    // Date filter
    if (dateFrom) {
      filtered = filtered.filter(lead => new Date(lead.createdAt) >= dateFrom);
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999); // Include the entire end date
      filtered = filtered.filter(lead => new Date(lead.createdAt) <= endDate);
    }

    return filtered;
  }, [allLeads, leads, user?.role, selectedAgent, searchQuery, dateFrom, dateTo, users]);

  const displayLeads = filteredLeads;

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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{getPageTitle()}</h1>
          <p className="text-gray-600">{getPageDescription()}</p>
        </div>
        {user?.role === "cc_agent" && (
          <Button 
            onClick={() => setShowAddLeadModal(true)}
            className="btn-gradient"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Lead
          </Button>
        )}
      </div>

      {/* Filter Controls - Only for Super Admin */}
      {user?.role === "super_admin" && (
        <Card className="shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter & Search Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Agent Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Filter by Agent</label>
                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Agents</SelectItem>
                    {ccAgents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id.toString()}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name, phone, notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Date Range</label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, "MMM dd") : "From"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, "MMM dd") : "To"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Active Filters & Clear All */}
            {(selectedAgent !== "all" || searchQuery || dateFrom || dateTo) && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        Agent: {ccAgents.find(a => a.id.toString() === selectedAgent)?.name}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedAgent("all")}
                          className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    )}
                    {searchQuery && (
                      <Badge variant="secondary" className="gap-1">
                        Search: "{searchQuery}"
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSearchQuery("")}
                          className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    )}
                    {(dateFrom || dateTo) && (
                      <Badge variant="secondary" className="gap-1">
                        Date: {dateFrom ? format(dateFrom, "MMM dd") : "..."} - {dateTo ? format(dateTo, "MMM dd") : "..."}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDateFrom(undefined);
                            setDateTo(undefined);
                          }}
                          className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedAgent("all");
                      setSearchQuery("");
                      setDateFrom(undefined);
                      setDateTo(undefined);
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Leads Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {user?.role === "super_admin" ? "All Leads" : 
               user?.role === "cro_agent" ? "Transferred Leads" : "My Leads"}
            </span>
            {user?.role === "super_admin" && (
              <Badge variant="outline" className="text-sm">
                {displayLeads?.length || 0} of {(allLeads?.length || 0)} leads
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No.</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                  {user?.role === "super_admin" && <TableHead>Agent</TableHead>}
                  {user?.role === "cro_agent" && <TableHead>From Agent</TableHead>}
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayLeads?.map((lead, index) => (
                  <TableRow key={lead.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{new Date(lead.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{lead.customerName}</TableCell>
                    <TableCell>{lead.customerNumber}</TableCell>
                    {(user?.role === "super_admin" || user?.role === "cro_agent") && (
                      <TableCell>
                        {users?.find(u => u.id === lead.agentId)?.name || "Unknown"}
                      </TableCell>
                    )}
                    <TableCell>{getStatusBadge(lead.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedLead(lead);
                              setShowLeadDetailModal(true);
                            }}
                          >
                            {user?.role === "cro_agent" ? "Open" : "View Details"}
                          </DropdownMenuItem>
                          {user?.role === "cc_agent" && lead.status === "active" && (
                            <>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedLead(lead);
                                  setShowTransferModal(true);
                                }}
                              >
                                Transfer
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {(!displayLeads || displayLeads.length === 0) && (
            <div className="text-center py-8">
              <p className="text-gray-500">No leads found.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Lead Modal */}
      <AddLeadModal 
        isOpen={showAddLeadModal} 
        onClose={() => setShowAddLeadModal(false)} 
      />

      {/* Transfer Lead Modal */}
      <Dialog open={showTransferModal} onOpenChange={setShowTransferModal}>
        <DialogContent className="modal-content w-full max-w-md mx-4">
          <DialogHeader className="text-center mb-6">
            <DialogTitle className="text-2xl font-bold text-gray-800">Transfer Lead</DialogTitle>
            <p className="text-gray-600 mt-2">Select a CRO Agent to transfer this lead</p>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer: {selectedLead?.customerName}
              </label>
              <p className="text-sm text-gray-600">{selectedLead?.customerNumber}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select CRO Agent
              </label>
              <Select value={selectedTransferAgent} onValueChange={setSelectedTransferAgent}>
                <SelectTrigger className="form-select">
                  <SelectValue placeholder="Choose CRO Agent" />
                </SelectTrigger>
                <SelectContent>
                  {croAgents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id.toString()}>
                      {agent.name} ({agent.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button
              onClick={handleTransferLead}
              disabled={!selectedTransferAgent || transferLeadMutation.isPending}
              className="btn-gradient w-full"
            >
              {transferLeadMutation.isPending ? (
                <div className="loading-spinner h-5 w-5 mr-2" />
              ) : (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              )}
              Transfer Lead
            </Button>
          </div>
          
          <div className="bg-gray-50 px-8 py-4 rounded-b-2xl -mx-6 -mb-6 mt-6">
            <Button 
              variant="ghost" 
              onClick={() => {
                setShowTransferModal(false);
                setSelectedLead(null);
                setSelectedTransferAgent("");
              }}
              className="w-full text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lead Detail Modal (for CRO agents) */}
      <Dialog open={showLeadDetailModal} onOpenChange={setShowLeadDetailModal}>
        <DialogContent className="modal-content w-full max-w-lg mx-4">
          <DialogHeader className="text-center mb-6">
            <DialogTitle className="text-2xl font-bold text-gray-800">Lead Details</DialogTitle>
          </DialogHeader>
          
          {selectedLead && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <p className="text-gray-800 font-medium">{selectedLead.customerName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Number</label>
                <p className="text-gray-800">{selectedLead.customerNumber}</p>
              </div>

              {selectedLead.biodata && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Biodata</label>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(selectedLead.biodata, '_blank')}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download
                  </Button>
                </div>
              )}

              {selectedLead.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{selectedLead.description}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Added</label>
                <p className="text-gray-800">{new Date(selectedLead.createdAt).toLocaleString()}</p>
              </div>
            </div>
          )}
          
          <div className="bg-gray-50 px-8 py-4 rounded-b-2xl -mx-6 -mb-6 mt-6">
            <Button 
              variant="ghost" 
              onClick={() => {
                setShowLeadDetailModal(false);
                setSelectedLead(null);
              }}
              className="w-full text-gray-600 hover:text-gray-800 font-medium"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
