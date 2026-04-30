export type UserRole   = 'admin' | 'doctor' | 'agent';
export type UserStatus = 'active' | 'inactive' | 'blocked';
export type LogType    = 'success' | 'info' | 'warning' | 'danger';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string | null;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string | null;
  userName: string;
  action: string;
  type: LogType;
  createdAt: string;
}

export interface AdminStats {
  activeUsers: number;
  logins24h: number;
  securityAlerts: number;
}

export interface ServiceStatus {
  name: string;
  status: 'online' | 'active' | 'offline';
}