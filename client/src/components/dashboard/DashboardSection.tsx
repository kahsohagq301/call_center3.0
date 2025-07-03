import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardSection() {
  const { user } = useAuth();
  
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    staleTime: 60000, // 1 minute
  });

  const { data: dailyTasks } = useQuery({
    queryKey: ["/api/daily-tasks"],
    staleTime: 30000, // 30 seconds
  });

  if (!user) return null;

  const getTaskStatus = (current: number, required: number) => {
    if (current >= required) return "success";
    return "pending";
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your performance overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Calls</p>
                <p className="text-3xl font-bold">{stats?.totalCalls || 0}</p>
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
                <p className="text-3xl font-bold">{stats?.totalLeads || 0}</p>
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
                <p className="text-purple-100 text-sm">Transferred</p>
                <p className="text-3xl font-bold">{stats?.transferredLeads || 0}</p>
              </div>
              <svg className="w-8 h-8 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Success Rate</p>
                <p className="text-3xl font-bold">92%</p>
              </div>
              <svg className="w-8 h-8 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Tasks - Only for CC Agents */}
      {user.role === "cc_agent" && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">Today's Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`flex items-center justify-between p-4 rounded-lg border ${
              getTaskStatus(dailyTasks?.leadsAdded || 0, 5) === "success" 
                ? "bg-green-50 border-green-200" 
                : "bg-red-50 border-red-200"
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${
                  getTaskStatus(dailyTasks?.leadsAdded || 0, 5) === "success" 
                    ? "bg-green-500" 
                    : "bg-red-500"
                }`}></div>
                <span className="font-medium text-gray-800">Add Leads (Min 5)</span>
              </div>
              <span className={`text-sm font-medium ${
                getTaskStatus(dailyTasks?.leadsAdded || 0, 5) === "success" 
                  ? "text-green-600" 
                  : "text-red-600"
              }`}>
                {dailyTasks?.leadsAdded || 0}/5 Completed
              </span>
            </div>

            <div className={`flex items-center justify-between p-4 rounded-lg border ${
              getTaskStatus(dailyTasks?.leadsTransferred || 0, 3) === "success" 
                ? "bg-green-50 border-green-200" 
                : "bg-red-50 border-red-200"
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${
                  getTaskStatus(dailyTasks?.leadsTransferred || 0, 3) === "success" 
                    ? "bg-green-500" 
                    : "bg-red-500"
                }`}></div>
                <span className="font-medium text-gray-800">Transfer Leads (Min 3)</span>
              </div>
              <span className={`text-sm font-medium ${
                getTaskStatus(dailyTasks?.leadsTransferred || 0, 3) === "success" 
                  ? "text-green-600" 
                  : "text-red-600"
              }`}>
                {dailyTasks?.leadsTransferred || 0}/3 Completed
              </span>
            </div>

            <div className={`flex items-center justify-between p-4 rounded-lg border ${
              dailyTasks?.reportSubmitted 
                ? "bg-green-50 border-green-200" 
                : "bg-yellow-50 border-yellow-200"
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${
                  dailyTasks?.reportSubmitted 
                    ? "bg-green-500" 
                    : "bg-yellow-500"
                }`}></div>
                <span className="font-medium text-gray-800">Submit Report (Once)</span>
              </div>
              <span className={`text-sm font-medium ${
                dailyTasks?.reportSubmitted 
                  ? "text-green-600" 
                  : "text-yellow-600"
              }`}>
                {dailyTasks?.reportSubmitted ? "Completed" : "Pending"}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
