import { useState } from 'react';
import { User } from '../App';
import { 
  Users, 
  Calendar, 
  Clock, 
  DollarSign, 
  LogOut,
  FileText,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { EmployeeList } from './admin/EmployeeList';
import { AttendanceManagement } from './admin/AttendanceManagement';
import { LeaveApprovals } from './admin/LeaveApprovals';
import { PayrollManagement } from './admin/PayrollManagement';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

type ActiveView = 'dashboard' | 'employees' | 'attendance' | 'leave' | 'payroll';

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');

  // Mock stats
  const stats = [
    { label: 'Total Employees', value: '24', icon: Users, color: 'bg-blue-500' },
    { label: 'Present Today', value: '20', icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Pending Leaves', value: '3', icon: Calendar, color: 'bg-yellow-500' },
    { label: 'On Leave', value: '4', icon: XCircle, color: 'bg-red-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900">Dayflow</h1>
                <p className="text-gray-600">Admin Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-gray-900">{user.name}</p>
                <p className="text-gray-500">Administrator</p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeView === 'dashboard'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveView('employees')}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeView === 'employees'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Employees
            </button>
            <button
              onClick={() => setActiveView('attendance')}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeView === 'attendance'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Attendance
            </button>
            <button
              onClick={() => setActiveView('leave')}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeView === 'leave'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Leave Requests
            </button>
            <button
              onClick={() => setActiveView('payroll')}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeView === 'payroll'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Payroll
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'dashboard' && (
          <div>
            <div className="mb-8">
              <h2 className="text-gray-900 mb-2">Admin Dashboard</h2>
              <p className="text-gray-600">Overview of your organization</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveView('leave')}
                    className="w-full text-left p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-yellow-600" />
                      <span className="text-gray-900">Review Pending Leaves</span>
                    </div>
                    <span className="bg-yellow-600 text-white px-2 py-1 rounded">3</span>
                  </button>
                  <button
                    onClick={() => setActiveView('attendance')}
                    className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-3"
                  >
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-900">View Today's Attendance</span>
                  </button>
                  <button
                    onClick={() => setActiveView('payroll')}
                    className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors flex items-center gap-3"
                  >
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-gray-900">Manage Payroll</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-900">Sarah Johnson applied for leave</p>
                    <p className="text-gray-500">5 minutes ago</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-900">John Doe checked in</p>
                    <p className="text-gray-500">1 hour ago</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-900">New employee added</p>
                    <p className="text-gray-500">2 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'employees' && <EmployeeList />}
        {activeView === 'attendance' && <AttendanceManagement />}
        {activeView === 'leave' && <LeaveApprovals />}
        {activeView === 'payroll' && <PayrollManagement />}
      </main>
    </div>
  );
}
