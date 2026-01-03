import { useState, useEffect } from 'react';
import { Calendar, Search, Filter } from 'lucide-react';
import { db, AttendanceRecord } from '../../services/database';
import { getTodayDDMMYYYY, formatDate, parseDate } from '../../utils/dateUtils';

export function AttendanceManagement() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Array<{ id: string; name: string; employeeId: string }>>([]);
  const [selectedDate, setSelectedDate] = useState(getTodayDDMMYYYY());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    try {
      // Load employees
      const profiles = await db.getAllProfiles();
      const employeeList = (profiles || []).map(p => ({
        id: p.id,
        name: p.name,
        employeeId: p.employeeId,
      }));
      setEmployees(employeeList);

      // Load attendance for selected date
      const allRecords = await db.getAllAttendance();
      const dateRecords = (allRecords || []).filter(r => r.date === selectedDate);
      setAttendanceRecords(dateRecords);
    } catch (error: any) {
      console.error('Error loading attendance data:', error);
    }
  };

  const getEmployeeName = (userId: string) => {
    const emp = employees.find(e => e.id === userId);
    return emp?.name || 'Unknown';
  };

  const getEmployeeId = (userId: string) => {
    const emp = employees.find(e => e.id === userId);
    return emp?.employeeId || 'N/A';
  };

  const getStatusBadge = (status: AttendanceRecord['status']) => {
    const styles = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      'half-day': 'bg-yellow-100 text-yellow-800',
      leave: 'bg-blue-100 text-blue-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full ${styles[status]}`}>
        {status === 'half-day' ? 'Half Day' : status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Get stats
  const totalEmployees = employees.length;
  const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
  const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
  const leaveCount = attendanceRecords.filter(r => r.status === 'leave').length;

  // Filter records
  let filteredRecords = attendanceRecords;
  
  if (searchTerm) {
    filteredRecords = filteredRecords.filter(record => {
      const name = getEmployeeName(record.userId).toLowerCase();
      const empId = getEmployeeId(record.userId).toLowerCase();
      return name.includes(searchTerm.toLowerCase()) || empId.includes(searchTerm.toLowerCase());
    });
  }

  if (filterStatus !== 'all') {
    filteredRecords = filteredRecords.filter(r => r.status === filterStatus);
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-gray-900 mb-2">Attendance Management</h2>
        <p className="text-gray-600">Track and manage employee attendance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-gray-600 mb-1">Total Employees</p>
          <p className="text-gray-900">{totalEmployees}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-gray-600 mb-1">Present</p>
          <p className="text-green-600">{presentCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-gray-600 mb-1">Absent</p>
          <p className="text-red-600">{absentCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-gray-600 mb-1">On Leave</p>
          <p className="text-blue-600">{leaveCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Select Date</label>
            <input
              type="text"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              placeholder="DD/MM/YYYY"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Search Employee</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Filter by Status</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="half-day">Half Day</option>
                <option value="leave">On Leave</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-gray-600">Employee</th>
                <th className="px-6 py-3 text-left text-gray-600">Check In</th>
                <th className="px-6 py-3 text-left text-gray-600">Check Out</th>
                <th className="px-6 py-3 text-left text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-gray-900">{getEmployeeName(record.userId)}</p>
                      <p className="text-gray-600">{getEmployeeId(record.userId)}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    {record.checkIn || '--'}
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    {record.checkOut || '--'}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(record.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRecords.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No attendance records found for this date</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
