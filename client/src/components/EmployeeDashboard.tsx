import { useState } from 'react';
import { User } from '../App';
import { 
  UserCircle, 
  Calendar, 
  Clock, 
  FileText, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { ProfileView } from './employee/ProfileView';
import { AttendanceView } from './employee/AttendanceView';
import { LeaveManagement } from './employee/LeaveManagement';

interface EmployeeDashboardProps {
  user: User;
  onLogout: () => void;
}

type ActiveView = 'dashboard' | 'profile' | 'attendance' | 'leave';

export function EmployeeDashboard({ user, onLogout }: EmployeeDashboardProps) {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');

  const menuItems = [
    { id: 'profile' as ActiveView, icon: UserCircle, label: 'My Profile', color: 'bg-blue-500' },
    { id: 'attendance' as ActiveView, icon: Clock, label: 'Attendance', color: 'bg-green-500' },
    { id: 'leave' as ActiveView, icon: Calendar, label: 'Leave Requests', color: 'bg-purple-500' },
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
                <p className="text-gray-600">Employee Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-gray-900">{user.name}</p>
                <p className="text-gray-500">{user.employeeId}</p>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'dashboard' && (
          <div>
            <div className="mb-8">
              <h2 className="text-gray-900 mb-2">Welcome back, {user.name}!</h2>
              <p className="text-gray-600">Here's your quick access menu</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className="bg-white rounded-xl p-6 hover:shadow-lg transition-all border border-gray-200 hover:border-blue-300 group text-left"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${item.color} p-3 rounded-lg`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-gray-900 mb-2">{item.label}</h3>
                  <p className="text-gray-600">
                    {item.id === 'profile' && 'View and edit your profile'}
                    {item.id === 'attendance' && 'Track your attendance'}
                    {item.id === 'leave' && 'Apply and manage leaves'}
                  </p>
                </button>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-gray-900">Checked in today</p>
                    <p className="text-gray-500">9:00 AM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <div className="flex-1">
                    <p className="text-gray-900">Leave request approved</p>
                    <p className="text-gray-500">2 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'profile' && (
          <div>
            <button
              onClick={() => setActiveView('dashboard')}
              className="mb-6 text-blue-600 hover:text-blue-700 flex items-center gap-2"
            >
              ← Back to Dashboard
            </button>
            <ProfileView user={user} />
          </div>
        )}

        {activeView === 'attendance' && (
          <div>
            <button
              onClick={() => setActiveView('dashboard')}
              className="mb-6 text-blue-600 hover:text-blue-700 flex items-center gap-2"
            >
              ← Back to Dashboard
            </button>
            <AttendanceView userId={user.id} />
          </div>
        )}

        {activeView === 'leave' && (
          <div>
            <button
              onClick={() => setActiveView('dashboard')}
              className="mb-6 text-blue-600 hover:text-blue-700 flex items-center gap-2"
            >
              ← Back to Dashboard
            </button>
            <LeaveManagement userId={user.id} userName={user.name} />
          </div>
        )}
      </main>
    </div>
  );
}
