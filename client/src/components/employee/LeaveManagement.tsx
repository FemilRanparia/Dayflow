import { useState, useEffect } from 'react';
import { Calendar, Plus, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { db, LeaveRequest } from '../../services/database';
import { toISODate, fromISODate, parseDate } from '../../utils/dateUtils';

interface LeaveManagementProps {
  userId: string;
  userName: string;
}

export function LeaveManagement({ userId, userName }: LeaveManagementProps) {
  const [showModal, setShowModal] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [formData, setFormData] = useState({
    leaveType: 'paid' as LeaveRequest['leaveType'],
    startDate: '',
    endDate: '',
    remarks: '',
  });

  useEffect(() => {
    loadLeaveRequests();
  }, [userId]);

  const loadLeaveRequests = async () => {
    try {
      const requests = await db.getLeavesByUserId(userId);
      setLeaveRequests(requests.sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      ));
    } catch (error) {
      console.error('Error loading leave requests:', error);
      toast.error('Failed to load leave requests');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error('End date cannot be before start date');
      return;
    }

    try {
      await db.createLeave({
        employeeId: userId,
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.remarks,
        status: 'pending',
      });

      toast.success('Leave request submitted successfully');
      setShowModal(false);
      setFormData({
        leaveType: 'paid',
        startDate: '',
        endDate: '',
        remarks: '',
      });
      loadLeaveRequests();
    } catch (error: any) {
      console.error('Error submitting leave request:', error);
      toast.error(error.message || 'Failed to submit leave request');
    }
  };

  const getStatusBadge = (status: LeaveRequest['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getLeaveTypeBadge = (type: LeaveRequest['leaveType']) => {
    const styles = {
      paid: 'bg-blue-100 text-blue-800',
      sick: 'bg-purple-100 text-purple-800',
      unpaid: 'bg-gray-100 text-gray-800',
      casual: 'bg-green-100 text-green-800',
    };
    const labels = {
      paid: 'Paid Leave',
      sick: 'Sick Leave',
      unpaid: 'Unpaid Leave',
      casual: 'Casual Leave',
    };
    return (
      <span className={`px-3 py-1 rounded-full ${styles[type]}`}>
        {labels[type]}
      </span>
    );
  };

  const calculateDays = (start: string, end: string) => {
    const startDate = parseDate(start);
    const endDate = parseDate(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Calculate leave balances
  const approvedLeaves = leaveRequests.filter(r => r.status === 'approved');
  const usedPaidLeaves = approvedLeaves.filter(r => r.leaveType === 'paid').reduce((sum, r) => sum + calculateDays(r.startDate, r.endDate), 0);
  const usedSickLeaves = approvedLeaves.filter(r => r.leaveType === 'sick').reduce((sum, r) => sum + calculateDays(r.startDate, r.endDate), 0);
  const usedCasualLeaves = approvedLeaves.filter(r => r.leaveType === 'casual').reduce((sum, r) => sum + calculateDays(r.startDate, r.endDate), 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-gray-900">Leave Requests</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Apply for Leave
        </button>
      </div>

      {/* Leave Balance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-gray-600 mb-1">Paid Leave</p>
          <p className="text-gray-900">{18 - usedPaidLeaves} / 18 days</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-gray-600 mb-1">Sick Leave</p>
          <p className="text-gray-900">{12 - usedSickLeaves} / 12 days</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-gray-600 mb-1">Casual Leave</p>
          <p className="text-gray-900">{10 - usedCasualLeaves} / 10 days</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-gray-600 mb-1">Total Used</p>
          <p className="text-gray-900">{usedPaidLeaves + usedSickLeaves + usedCasualLeaves} days</p>
        </div>
      </div>

      {/* Leave Requests List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-gray-900">My Leave History</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {leaveRequests.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No leave requests yet</p>
              <p className="text-gray-500">Click "Apply for Leave" to submit your first request</p>
            </div>
          ) : (
            leaveRequests.map((request) => (
              <div key={request.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getLeaveTypeBadge(request.leaveType)}
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-gray-900 mb-1">
                      {request.startDate} - {request.endDate}
                    </p>
                    <p className="text-gray-600">
                      Duration: {calculateDays(request.startDate, request.endDate)} day(s)
                    </p>
                  </div>
                </div>
                
                {request.remarks && (
                  <div className="mb-3">
                    <p className="text-gray-600 mb-1">Remarks:</p>
                    <p className="text-gray-900">{request.remarks}</p>
                  </div>
                )}

                {request.adminComment && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-1">Admin Comment:</p>
                    <p className="text-gray-900">{request.adminComment}</p>
                  </div>
                )}

                <p className="text-gray-500 mt-3">
                  Submitted on {new Date(request.createdAt).toLocaleDateString('en-IN')}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900">Apply for Leave</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Leave Type</label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value as LeaveRequest['leaveType'] })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="paid">Paid Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="casual">Casual Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  rows={3}
                  placeholder="Add any additional information..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
