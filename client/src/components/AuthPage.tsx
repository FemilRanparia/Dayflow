import { useState, useEffect } from 'react';
import { User, UserRole } from '../App';
import { Building2, Mail, Lock, IdCard, UserCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { db } from '../services/database';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

export function AuthPage({ onLogin }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee' as UserRole,
    fullName: '',
  });

  useEffect(() => {
    // Ensure database is initialized
    db.initialize();
  }, []);

  const handleResetDemoData = () => {
    if (confirm('This will reset all data to demo state. Continue?')) {
      db.clearAll();
      db.initialize();
      toast.success('Demo data reset successfully!');
      setFormData({
        employeeId: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'employee',
        fullName: '',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignUp) {
      // Sign Up Logic
      if (formData.password.length < 8) {
        toast.error('Password must be at least 8 characters long');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      try {
        // Generate employeeId if not provided
        const employeeId = formData.employeeId || `EMP${Date.now().toString().slice(-8)}`;
        
        // Call the register API
        const response = await db.register({
          employeeId: employeeId,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          fullName: formData.fullName,
          isEmailVerified: true,
        });

        toast.success('Account created successfully! Logging in...');
        
        // Auto-login after registration
        onLogin({
          id: response.user.id,
          employeeId: response.user.employeeId,
          email: response.user.email,
          role: response.user.role,
          fullName: response.user.fullName,
        });

        setFormData({
          employeeId: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'employee',
          fullName: '',
        });
      } catch (error: any) {
        toast.error(error.message || 'Registration failed');
        console.error('Registration error:', error);
      }
    } else {
      // Sign In Logic
      try {
        const response = await db.login(formData.email, formData.password);

        toast.success('Login successful!');
        onLogin({
          id: response.user.id,
          employeeId: response.user.employeeId,
          email: response.user.email,
          role: response.user.role,
          fullName: response.user.fullName,
        });

        setFormData({
          employeeId: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'employee',
          fullName: '',
        });
      } catch (error: any) {
        toast.error(error.message || 'Login failed');
        console.error('Login error:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-gray-900 mb-2">Dayflow</h1>
          <p className="text-gray-600">Every workday, perfectly aligned.</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-gray-900 mb-6 text-center">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Employee ID <span className="text-gray-500 text-sm">(optional - auto-generated if blank)</span></label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="EMP001 (or leave blank for auto-generation)"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {isSignUp && (
              <>
                <div>
                  <label className="block text-gray-700 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin / HR Officer</option>
                  </select>
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 hover:text-blue-700"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>

          {/* Demo Accounts Info */}
          {!isSignUp && (
            <div className="mt-6 space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-2">Demo Accounts:</p>
                <div className="space-y-1 text-gray-700">
                  <p>Admin: admin@dayflow.com / admin123</p>
                  <p>Employee: employee@dayflow.com / employee123</p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleResetDemoData}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4" />
                Reset Demo Data
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
