import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { Report, User } from "@/types";
import AddReportModal from "@/components/modals/AddReportModal";

export default function ReportsSection() {
  const { user } = useAuth();
  const [showAddReportModal, setShowAddReportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const { data: reports, isLoading } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: user?.role === "super_admin",
  });

  const getPageTitle = () => {
    switch (user?.role) {
      case "super_admin":
        return "Report Analysis";
      default:
        return "Reports";
    }
  };

  const getPageDescription = () => {
    switch (user?.role) {
      case "super_admin":
        return "Analyze performance reports from all agents with data visualization";
      default:
        return "Track and submit your daily performance reports";
    }
  };

  const filteredReports = reports?.filter(report => {
    const agentName = users?.find(u => u.id === report.agentId)?.name || "";
    const reportDate = new Date(report.reportDate).toLocaleDateString();
    
    const matchesSearch = !searchTerm || 
      agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reportDate.includes(searchTerm);
    
    const matchesDate = !dateFilter || 
      new Date(report.reportDate).toDateString() === new Date(dateFilter).toDateString();
    
    return matchesSearch && matchesDate;
  }) || [];

  const getTotalStats = () => {
    if (!filteredReports.length) return { totalCalls: 0, totalLeads: 0, avgCallsPerDay: 0 };
    
    const totalCalls = filteredReports.reduce((sum, report) => 
      sum + report.onlineCalls + report.offlineCalls, 0);
    const totalLeads = filteredReports.reduce((sum, report) => 
      sum + report.totalLeads, 0);
    const avgCallsPerDay = Math.round(totalCalls / filteredReports.length);
    
    return { totalCalls, totalLeads, avgCallsPerDay };
  };

  const stats = getTotalStats();

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
            onClick={() => setShowAddReportModal(true)}
            className="btn-gradient"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Report
          </Button>
        )}
      </div>

      {/* Summary Cards for Super Admin */}
      {user?.role === "super_admin" && reports && reports.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Calls</p>
                  <p className="text-3xl font-bold">{stats.totalCalls}</p>
                </div>
                <svg className="w-8 h-8 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Leads</p>
                  <p className="text-3xl font-bold">{stats.totalLeads}</p>
                </div>
                <svg className="w-8 h-8 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Avg Calls/Day</p>
                  <p className="text-3xl font-bold">{stats.avgCallsPerDay}</p>
                </div>
                <svg className="w-8 h-8 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filter */}
      <Card className="shadow-sm mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder={user?.role === "super_admin" ? "Search by agent name or date..." : "Search reports..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="md:w-48">
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="form-input"
              />
            </div>
            {(searchTerm || dateFilter) && (
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setDateFilter("");
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Performance Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  {user?.role === "super_admin" && <TableHead>Agent Name</TableHead>}
                  <TableHead>Online Calls</TableHead>
                  <TableHead>Offline Calls</TableHead>
                  <TableHead>Total Calls</TableHead>
                  <TableHead>Total Leads</TableHead>
                  {user?.role === "super_admin" && <TableHead>Efficiency</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => {
                  const totalCalls = report.onlineCalls + report.offlineCalls;
                  const efficiency = totalCalls > 0 ? Math.round((report.totalLeads / totalCalls) * 100) : 0;
                  
                  return (
                    <TableRow key={report.id}>
                      <TableCell>{new Date(report.reportDate).toLocaleDateString()}</TableCell>
                      {user?.role === "super_admin" && (
                        <TableCell className="font-medium">
                          {users?.find(u => u.id === report.agentId)?.name || "Unknown Agent"}
                        </TableCell>
                      )}
                      <TableCell>{report.onlineCalls}</TableCell>
                      <TableCell>{report.offlineCalls}</TableCell>
                      <TableCell className="font-semibold">{totalCalls}</TableCell>
                      <TableCell>{report.totalLeads}</TableCell>
                      {user?.role === "super_admin" && (
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            efficiency >= 30 ? 'bg-green-100 text-green-800' :
                            efficiency >= 20 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {efficiency}%
                          </span>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {reports?.length === 0 ? "No reports found." : "No reports match your search criteria."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Report Modal */}
      <AddReportModal 
        isOpen={showAddReportModal} 
        onClose={() => setShowAddReportModal(false)} 
      />
    </div>
  );
}
