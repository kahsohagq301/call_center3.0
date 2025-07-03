export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  phone?: string;
  profileImage?: string;
}

export interface CallNumber {
  id: number;
  phoneNumber: string;
  assignedAgentId: number;
  category?: string;
  createdAt: string;
  categorizedAt?: string;
}

export interface Lead {
  id: number;
  customerName: string;
  customerNumber: string;
  biodata?: string;
  description?: string;
  agentId: number;
  status: string;
  transferredTo?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: number;
  agentId: number;
  onlineCalls: number;
  offlineCalls: number;
  totalLeads: number;
  reportDate: string;
  createdAt: string;
}

export interface DailyTask {
  id: number;
  agentId: number;
  taskDate: string;
  leadsAdded: number;
  leadsTransferred: number;
  reportSubmitted: boolean;
}

export interface Stats {
  totalCalls: number;
  totalLeads: number;
  totalUsers: number;
  transferredLeads: number;
}

export interface NumberUpload {
  id: number;
  uploadedBy: number;
  assignedAgentId: number;
  fileName: string;
  numbersCount: number;
  uploadDate: string;
}
