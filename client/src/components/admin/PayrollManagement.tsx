import { useState, useEffect } from 'react';
import { DollarSign, Search, Edit, X, TrendingUp } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { db, EmployeeProfile } from '../../services/database';
import { formatINR, formatINRShort } from '../../utils/currencyUtils';

export function PayrollManagement() {
  const [payrollData, setPayrollData] = useState<EmployeeProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editModal, setEditModal] = useState<{ show: boolean; employee: EmployeeProfile | null }>({
    show: false,
    employee: null,
  });
  const [newSalary, setNewSalary] = useState(0);

  useEffect(() => {
    loadPayrollData();
  }, []);

  const loadPayrollData = async () => {
    try {
      const profiles = await db.getAllProfiles();
      setPayrollData(profiles || []);
    } catch (error: any) {
      console.error('Error loading payroll data:', error);
      toast.error(error.message || 'Failed to load payroll data');
    }
  };

  const openEditModal = (employee: EmployeeProfile) => {
    setEditModal({ show: true, employee });
    setNewSalary(employee.salary);
  };

  const closeEditModal = () => {
    setEditModal({ show: false, employee: null });
    setNewSalary(0);
  };

  const handleUpdateSalary = async () => {
    if (!editModal.employee) return;

    if (newSalary <= 0) {
      toast.error('Please enter a valid salary amount');
      return;
    }

    try {
      await db.updateProfile(editModal.employee.id, {
        salary: newSalary,
      });

      toast.success('Salary updated successfully');
      await loadPayrollData();
      closeEditModal();
    } catch (error: any) {
      console.error('Error updating salary:', error);
      toast.error(error.message || 'Failed to update salary');
    }
  };

  const filteredPayroll = payrollData.filter(emp =>
    (emp.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (emp.employeeId?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (emp.department?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const totalPayroll = payrollData.reduce((sum, emp) => sum + emp.salary, 0);
  const averageSalary = payrollData.length > 0 ? totalPayroll / payrollData.length : 0;
  const highestSalary = payrollData.length > 0 ? Math.max(...payrollData.map(e => e.salary)) : 0;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-gray-900 mb-2">Payroll Management</h2>
        <p className="text-gray-600">View and manage employee salary information</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-gray-600">Total Annual Payroll</p>
          </div>
          <p className="text-gray-900">{formatINRShort(totalPayroll)}</p>
          <p className="text-gray-600">{formatINR(totalPayroll)}</p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-gray-600">Average Salary</p>
          </div>
          <p className="text-gray-900">{formatINRShort(averageSalary)}</p>
          <p className="text-gray-600">{formatINR(Math.round(averageSalary))}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-gray-600">Highest Salary</p>
          </div>
          <p className="text-gray-900">{formatINRShort(highestSalary)}</p>
          <p className="text-gray-600">{formatINR(highestSalary)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, ID, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-gray-600">Employee</th>
                <th className="px-6 py-3 text-left text-gray-600">Job Title</th>
                <th className="px-6 py-3 text-left text-gray-600">Department</th>
                <th className="px-6 py-3 text-left text-gray-600">Annual Salary</th>
                <th className="px-6 py-3 text-left text-gray-600">Monthly</th>
                <th className="px-6 py-3 text-left text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPayroll.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-gray-900">{employee.name}</p>
                      <p className="text-gray-600">{employee.employeeId}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{employee.jobTitle}</td>
                  <td className="px-6 py-4 text-gray-900">{employee.department}</td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900">{formatINR(employee.salary)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-600">{formatINR(Math.round(employee.salary / 12))}</p>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => openEditModal(employee)}
                      className="flex items-center gap-2 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPayroll.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No payroll data found</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Salary Modal */}
      {editModal.show && editModal.employee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900">Update Salary</h3>
              <button
                onClick={closeEditModal}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <p className="text-gray-600 mb-1">Employee</p>
                <p className="text-gray-900">{editModal.employee.name}</p>
                <p className="text-gray-600">{editModal.employee.employeeId}</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg mb-4">
                <p className="text-gray-600 mb-1">Current Annual Salary (CTC)</p>
                <p className="text-gray-900">{formatINR(editModal.employee.salary)}</p>
                <p className="text-gray-600">Monthly: {formatINR(Math.round(editModal.employee.salary / 12))}</p>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">New Annual Salary (₹)</label>
                <input
                  type="number"
                  value={newSalary}
                  onChange={(e) => setNewSalary(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new salary"
                />
                {newSalary > 0 && (
                  <div className="mt-2 text-gray-600">
                    <p>Monthly: {formatINR(Math.round(newSalary / 12))}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeEditModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSalary}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Salary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
