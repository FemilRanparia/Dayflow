import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, Eye } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { db, EmployeeProfile, User } from '../../services/database';
import { formatINR } from '../../utils/currencyUtils';
import { toISODate, fromISODate } from '../../utils/dateUtils';

export function EmployeeList() {
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeProfile | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<EmployeeProfile | null>(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    password: 'employee123',
    role: 'employee' as 'employee' | 'admin',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: 'Male',
    jobTitle: '',
    department: '',
    joinDate: '',
    salary: 0,
    bankAccountNumber: '',
    bankIFSC: '',
    panNumber: '',
    aadhaarNumber: '',
    emergencyContact: '',
    emergencyContactNumber: '',
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const profiles = await db.getAllProfiles();
      const allUsers = await db.getAllUsers();
      setEmployees(profiles || []);
      setUsers(allUsers || []);
    } catch (error: any) {
      console.error('Error loading employees:', error);
      toast.error(error.message || 'Failed to load employees');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingEmployee) {
        // Update existing employee
        const user = users.find(u => u.id === editingEmployee.id);
        if (user) {
          await db.updateUser(user.id, {
            fullName: formData.name,
            email: formData.email,
            role: formData.role,
          });
        }

        await db.updateProfile(editingEmployee.id, {
          fullName: formData.name,
          phone: formData.phone,
          address: formData.address,
          department: formData.department,
          designation: formData.jobTitle,
          joiningDate: formData.joinDate,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          salary: formData.salary,
          bankAccountNumber: formData.bankAccountNumber,
          bankIFSC: formData.bankIFSC,
          panNumber: formData.panNumber,
          aadhaarNumber: formData.aadhaarNumber,
          emergencyContact: formData.emergencyContact,
          emergencyContactNumber: formData.emergencyContactNumber,
        });

        toast.success('Employee updated successfully');
      } else {
        // Check if employee ID or email already exists
        if (users.some(u => u.employeeId === formData.employeeId)) {
          toast.error('Employee ID already exists');
          return;
        }
        if (users.some(u => u.email === formData.email)) {
          toast.error('Email already exists');
          return;
        }

        // Create new user
        const newUser = await db.createUser({
          employeeId: formData.employeeId,
          fullName: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          isEmailVerified: true,
        });

        // Create profile
        await db.createProfile({
          userId: newUser.id,
          fullName: formData.name,
          phone: formData.phone,
          address: formData.address,
          department: formData.department,
          designation: formData.jobTitle,
          joiningDate: formData.joinDate,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          salary: formData.salary,
          bankAccountNumber: formData.bankAccountNumber,
          bankIFSC: formData.bankIFSC,
          panNumber: formData.panNumber,
          aadhaarNumber: formData.aadhaarNumber,
          emergencyContact: formData.emergencyContact,
          emergencyContactNumber: formData.emergencyContactNumber,
        });

        toast.success('Employee added successfully');
      }

      setShowModal(false);
      setEditingEmployee(null);
      resetForm();
      await loadEmployees();
    } catch (error: any) {
      console.error('Error saving employee:', error);
      toast.error(error.message || 'Failed to save employee');
    }
  };

  const handleEdit = (employee: EmployeeProfile) => {
    setEditingEmployee(employee);
    setFormData({
      employeeId: employee.employeeId || '',
      name: employee.fullName || '',
      email: employee.email || '',
      password: '',
      role: users.find(u => u.id === employee.id)?.role || 'employee',
      phone: employee.phone || '',
      address: employee.address || '',
      dateOfBirth: employee.dateOfBirth || '',
      gender: employee.gender || 'Male',
      jobTitle: employee.designation || '',
      department: employee.department || '',
      joinDate: employee.joiningDate || '',
      salary: employee.salary || 0,
      bankAccountNumber: employee.bankAccountNumber || '',
      bankIFSC: employee.bankIFSC || '',
      panNumber: employee.panNumber || '',
      aadhaarNumber: employee.aadhaarNumber || '',
      emergencyContact: employee.emergencyContact || '',
      emergencyContactNumber: employee.emergencyContactNumber || '',
    });
    setShowModal(true);
  };

  const handleView = (employee: EmployeeProfile) => {
    setViewingEmployee(employee);
    setShowViewModal(true);
  };

  const handleDelete = async (employee: EmployeeProfile) => {
    if (confirm(`Are you sure you want to delete ${employee.fullName}?`)) {
      try {
        await db.deleteUser(employee.id);
        await db.deleteProfile(employee.id);
        toast.success('Employee deleted successfully');
        await loadEmployees();
      } catch (error: any) {
        console.error('Error deleting employee:', error);
        toast.error(error.message || 'Failed to delete employee');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      name: '',
      email: '',
      password: 'employee123',
      role: 'employee',
      phone: '',
      address: '',
      dateOfBirth: '',
      gender: 'Male',
      jobTitle: '',
      department: '',
      joinDate: '',
      salary: 0,
      bankAccountNumber: '',
      bankIFSC: '',
      panNumber: '',
      aadhaarNumber: '',
      emergencyContact: '',
      emergencyContactNumber: '',
    });
  };

  const filteredEmployees = employees.filter(emp =>
    (emp.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (emp.employeeId?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (emp.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (emp.department?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-gray-900">Employee Management</h2>
        <button
          onClick={() => {
            setEditingEmployee(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Employee
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, ID, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-gray-600">Employee</th>
                <th className="px-6 py-3 text-left text-gray-600">Job Title</th>
                <th className="px-6 py-3 text-left text-gray-600">Department</th>
                <th className="px-6 py-3 text-left text-gray-600">Join Date</th>
                <th className="px-6 py-3 text-left text-gray-600">Salary</th>
                <th className="px-6 py-3 text-left text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-gray-900">{employee.fullName || 'N/A'}</p>
                      <p className="text-gray-600">{employee.employeeId || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{employee.designation || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-900">{employee.department || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-900">{employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-900">--</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(employee)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(employee)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(employee)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEmployees.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No employees found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal - Continue in next message due to length */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900">
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingEmployee(null);
                  resetForm();
                }}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-gray-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Employee ID *</label>
                    <input
                      type="text"
                      required
                      disabled={!!editingEmployee}
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Date of Birth (DD/MM/YYYY) *</label>
                    <input
                      type="text"
                      required
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="15/01/1990"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Gender *</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-700 mb-2">Address *</label>
                    <textarea
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Complete address with city and state"
                    />
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div>
                <h4 className="text-gray-900 mb-4">Job Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Job Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Department *</label>
                    <input
                      type="text"
                      required
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Join Date (DD/MM/YYYY) *</label>
                    <input
                      type="text"
                      required
                      value={formData.joinDate}
                      onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="01/01/2024"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Annual Salary (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="900000"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Role *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'employee' | 'admin' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="employee">Employee</option>
                      <option value="admin">Admin / HR Officer</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bank & Government IDs */}
              <div>
                <h4 className="text-gray-900 mb-4">Bank & Government IDs</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Bank Account Number</label>
                    <input
                      type="text"
                      value={formData.bankAccountNumber}
                      onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Bank IFSC Code</label>
                    <input
                      type="text"
                      value={formData.bankIFSC}
                      onChange={(e) => setFormData({ ...formData, bankIFSC: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="HDFC0001234"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">PAN Number</label>
                    <input
                      type="text"
                      value={formData.panNumber}
                      onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="ABCDE1234F"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Aadhaar Number</label>
                    <input
                      type="text"
                      value={formData.aadhaarNumber}
                      onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="XXXX XXXX XXXX"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h4 className="text-gray-900 mb-4">Emergency Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Contact Name</label>
                    <input
                      type="text"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Contact Number</label>
                    <input
                      type="tel"
                      value={formData.emergencyContactNumber}
                      onChange={(e) => setFormData({ ...formData, emergencyContactNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingEmployee(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingEmployee ? 'Update Employee' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900">Employee Details</h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewingEmployee(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-gray-900 mb-3">Basic Information</h4>
                <div className="grid grid-cols-2 gap-3 text-gray-700">
                  <div><span className="text-gray-600">Name:</span> {viewingEmployee.fullName || 'N/A'}</div>
                  <div><span className="text-gray-600">Employee ID:</span> {viewingEmployee.employeeId || 'N/A'}</div>
                  <div><span className="text-gray-600">Email:</span> {viewingEmployee.email || 'N/A'}</div>
                  <div><span className="text-gray-600">Phone:</span> {viewingEmployee.phone || 'N/A'}</div>
                  <div><span className="text-gray-600">DOB:</span> {viewingEmployee.dateOfBirth || 'N/A'}</div>
                  <div><span className="text-gray-600">Gender:</span> {viewingEmployee.gender || 'N/A'}</div>
                  <div className="col-span-2"><span className="text-gray-600">Address:</span> {viewingEmployee.address || 'N/A'}</div>
                </div>
              </div>

              <div>
                <h4 className="text-gray-900 mb-3">Job Information</h4>
                <div className="grid grid-cols-2 gap-3 text-gray-700">
                  <div><span className="text-gray-600">Job Title:</span> {viewingEmployee.designation || 'N/A'}</div>
                  <div><span className="text-gray-600">Department:</span> {viewingEmployee.department || 'N/A'}</div>
                  <div><span className="text-gray-600">Join Date:</span> {viewingEmployee.joiningDate || 'N/A'}</div>
                  <div><span className="text-gray-600">Annual Salary:</span> {viewingEmployee.salary ? formatINR(viewingEmployee.salary) : 'N/A'}</div>
                </div>
              </div>

              {viewingEmployee.bankAccountNumber && (
                <div>
                  <h4 className="text-gray-900 mb-3">Bank & IDs</h4>
                  <div className="grid grid-cols-2 gap-3 text-gray-700">
                    <div><span className="text-gray-600">Bank Account:</span> {viewingEmployee.bankAccountNumber}</div>
                    <div><span className="text-gray-600">IFSC:</span> {viewingEmployee.bankIFSC}</div>
                    <div><span className="text-gray-600">PAN:</span> {viewingEmployee.panNumber}</div>
                    <div><span className="text-gray-600">Aadhaar:</span> {viewingEmployee.aadhaarNumber}</div>
                  </div>
                </div>
              )}

              {viewingEmployee.emergencyContact && (
                <div>
                  <h4 className="text-gray-900 mb-3">Emergency Contact</h4>
                  <div className="grid grid-cols-2 gap-3 text-gray-700">
                    <div><span className="text-gray-600">Name:</span> {viewingEmployee.emergencyContact}</div>
                    <div><span className="text-gray-600">Number:</span> {viewingEmployee.emergencyContactNumber}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
