import { useState, useEffect } from 'react';
import { AuthPage } from './components/AuthPage';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { AdminDashboard } from './components/AdminDashboard';

export type UserRole = 'employee' | 'admin';

export interface User {
  id: string;
  employeeId: string;
  email: string;
  role: UserRole;
  fullName: string;
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return currentUser.role === 'admin' ? (
    <AdminDashboard user={currentUser} onLogout={handleLogout} />
  ) : (
    <EmployeeDashboard user={currentUser} onLogout={handleLogout} />
  );
}

export default App;
